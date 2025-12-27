// Safety service for safety lockdown logic
const db = require('../config/database');

class SafetyService {
  constructor() {
    this.activeLockdowns = new Map(); // Track active safety lockdowns
  }

  // Assess safety risk for equipment
  async assessSafetyRisk(equipmentId) {
    // Get equipment details
    const equipmentResult = await db.query('SELECT * FROM equipment WHERE id = $1', [equipmentId]);
    const equipment = equipmentResult.rows[0];
    
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    // Get recent maintenance requests for this equipment
    const recentRequestsResult = await db.query(`
      SELECT * FROM maintenance_requests 
      WHERE equipment_id = $1 
      AND created_at > NOW() - INTERVAL '30 days'
    `, [equipmentId]);
    
    const recentRequests = recentRequestsResult.rows;
    
    // Calculate safety risk score (0-100)
    let riskScore = 0;
    
    // Base risk from equipment category
    const categoryRisk = {
      'HVAC': 20,
      'Manufacturing': 40,
      'Processing': 35,
      'Transportation': 30,
      'Power Generation': 50,
      'default': 25
    };
    
    riskScore += categoryRisk[equipment.category] || categoryRisk['default'];
    
    // Add risk based on recent maintenance requests
    const highPriorityRequests = recentRequests.filter(req => req.priority === 'high').length;
    riskScore += highPriorityRequests * 15;
    
    // Add risk based on request status (open requests increase risk)
    const openRequests = recentRequests.filter(req => req.status === 'open' || req.status === 'in_progress').length;
    riskScore += openRequests * 10;
    
    // Add risk based on equipment age (if purchase date is available)
    if (equipment.purchase_date) {
      const purchaseDate = new Date(equipment.purchase_date);
      const yearsOld = (new Date() - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOld > 10) {
        riskScore += (yearsOld - 10) * 3; // Additional risk for equipment over 10 years
      }
    }
    
    // Add risk if warranty has expired
    if (equipment.warranty_expiry && new Date(equipment.warranty_expiry) < new Date()) {
      riskScore += 15;
    }
    
    // Cap the risk score at 100
    riskScore = Math.min(riskScore, 100);
    
    return {
      equipment_id: equipmentId,
      equipment_name: equipment.name,
      risk_score: parseFloat(riskScore.toFixed(2)),
      risk_level: this.getRiskLevel(riskScore),
      risk_factors: {
        category_risk: categoryRisk[equipment.category] || categoryRisk['default'],
        recent_high_priority_requests: highPriorityRequests,
        open_requests: openRequests,
        equipment_age_factor: yearsOld ? parseFloat(((yearsOld > 10 ? yearsOld - 10 : 0) * 3).toFixed(2)) : 0,
        warranty_expired: equipment.warranty_expiry && new Date(equipment.warranty_expiry) < new Date()
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get risk level based on score
  getRiskLevel(riskScore) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'minimal';
  }

  // Trigger safety lockdown for equipment
  async triggerLockdown(equipmentId, reason, initiatedBy) {
    const assessment = await this.assessSafetyRisk(equipmentId);
    
    // Only trigger lockdown if risk is high or critical
    if (assessment.risk_level === 'high' || assessment.risk_level === 'critical') {
      // Update equipment status to locked down
      await db.query(
        'UPDATE equipment SET status = $1, updated_at = $2 WHERE id = $3',
        ['locked_down', new Date().toISOString(), equipmentId]
      );
      
      // Create a maintenance request for the safety issue
      const lockdownRequest = await db.query(
        `INSERT INTO maintenance_requests 
         (equipment_id, title, description, priority, status, requested_by) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          equipmentId,
          'Safety Lockdown',
          `Equipment locked down due to safety risk assessment. Risk score: ${assessment.risk_score}. Reason: ${reason}`,
          'critical',
          'open',
          initiatedBy
        ]
      );
      
      // Record the lockdown
      const lockdownRecord = {
        id: `lockdown_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        equipment_id: equipmentId,
        risk_score: assessment.risk_score,
        risk_level: assessment.risk_level,
        reason,
        initiated_by: initiatedBy,
        timestamp: new Date().toISOString(),
        maintenance_request_id: lockdownRequest.rows[0].id
      };
      
      this.activeLockdowns.set(lockdownRecord.id, lockdownRecord);
      
      return {
        success: true,
        lockdown: lockdownRecord,
        message: `Safety lockdown initiated for equipment ${equipmentId}. Risk level: ${assessment.risk_level}`
      };
    } else {
      return {
        success: false,
        message: `Safety lockdown not required. Risk level: ${assessment.risk_level} (score: ${assessment.risk_score})`
      };
    }
  }

  // Release safety lockdown
  async releaseLockdown(lockdownId, releasedBy, notes = '') {
    const lockdown = this.activeLockdowns.get(lockdownId);
    
    if (!lockdown) {
      throw new Error('Lockdown record not found');
    }
    
    // Update equipment status back to operational
    await db.query(
      'UPDATE equipment SET status = $1, updated_at = $2 WHERE id = $3',
      ['operational', new Date().toISOString(), lockdown.equipment_id]
    );
    
    // Update the maintenance request to closed
    await db.query(
      'UPDATE maintenance_requests SET status = $1, updated_at = $2 WHERE id = $3',
      ['closed', new Date().toISOString(), lockdown.maintenance_request_id]
    );
    
    // Record the release
    const releaseRecord = {
      ...lockdown,
      released_by: releasedBy,
      release_notes: notes,
      released_at: new Date().toISOString()
    };
    
    // Remove from active lockdowns
    this.activeLockdowns.delete(lockdownId);
    
    return {
      success: true,
      release: releaseRecord,
      message: `Safety lockdown released for equipment ${lockdown.equipment_id}`
    };
  }

  // Get all active lockdowns
  getActiveLockdowns() {
    return Array.from(this.activeLockdowns.values());
  }

  // Check if equipment is under lockdown
  isEquipmentLockedDown(equipmentId) {
    const activeLockdowns = Array.from(this.activeLockdowns.values());
    return activeLockdowns.some(lockdown => lockdown.equipment_id === equipmentId);
  }

  // Monitor equipment for safety issues
  async monitorEquipmentSafety(threshold = 60) {
    // Get all equipment
    const equipmentResult = await db.query('SELECT id FROM equipment');
    const equipmentList = equipmentResult.rows;
    
    const safetyAlerts = [];
    
    for (const equipment of equipmentList) {
      const assessment = await this.assessSafetyRisk(equipment.id);
      
      if (assessment.risk_score >= threshold) {
        safetyAlerts.push(assessment);
      }
    }
    
    return {
      alerts: safetyAlerts,
      total_assessed: equipmentList.length,
      high_risk_count: safetyAlerts.length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SafetyService();