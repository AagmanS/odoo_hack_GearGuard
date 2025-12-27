// Impact calculator service for human impact and cost calculations
const db = require('../config/database');

class ImpactCalculator {
  // Calculate downtime cost based on multiple factors
  calculateDowntimeCost(downtimeHours, affectedEmployees, revenuePerHour, equipmentValue = 0, productionLoss = 0) {
    // Base cost: lost revenue during downtime
    const revenueLoss = downtimeHours * revenuePerHour;
    
    // Labor cost: wages paid during downtime when equipment is not productive
    const laborCost = downtimeHours * affectedEmployees * 50; // Assuming $50/hour average labor cost
    
    // Production loss: value of products not manufactured during downtime
    const productionCost = productionLoss * (downtimeHours / 24); // Daily production loss
    
    // Equipment depreciation during downtime
    const depreciationCost = equipmentValue * 0.001 * (downtimeHours / 8760); // Annual depreciation spread over hours
    
    // Safety and compliance costs (potential fines, inspections)
    const safetyCost = equipmentValue * 0.0005;
    
    // Total cost calculation
    const totalCost = revenueLoss + laborCost + productionCost + depreciationCost + safetyCost;
    
    return parseFloat(totalCost.toFixed(2));
  }

  // Calculate human impact score
  calculateHumanImpact(affectedEmployees, downtimeHours, safetyRisk = 0, skillDependency = 0) {
    // Calculate impact on employees
    const employeeImpact = affectedEmployees * downtimeHours;
    
    // Calculate safety impact (0-1 scale)
    const safetyImpact = Math.min(safetyRisk, 1) * 100;
    
    // Calculate skill dependency impact (0-1 scale)
    const skillImpact = Math.min(skillDependency, 1) * 100;
    
    // Overall human impact score (0-100)
    const humanImpactScore = Math.min(
      (employeeImpact * 0.3) + (safetyImpact * 0.4) + (skillImpact * 0.3),
      100
    );
    
    return parseFloat(humanImpactScore.toFixed(2));
  }

  // Calculate operational impact
  calculateOperationalImpact(downtimeHours, equipmentCriticality, productionPriority, maintenanceBacklog = 0) {
    // Criticality factor (1-10 scale)
    const criticalityFactor = Math.min(equipmentCriticality, 10) / 10;
    
    // Production priority factor (1-10 scale)
    const priorityFactor = Math.min(productionPriority, 10) / 10;
    
    // Calculate operational impact score
    const operationalImpact = 
      (downtimeHours * criticalityFactor * 30) + 
      (downtimeHours * priorityFactor * 25) + 
      (maintenanceBacklog * 15); // Each backlog item adds impact
    
    return parseFloat(Math.min(operationalImpact, 100).toFixed(2));
  }

  // Calculate environmental impact
  calculateEnvironmentalImpact(equipmentType, downtimeHours, energyConsumption, emissionsRate) {
    // Different equipment types have different environmental impacts
    const equipmentTypeFactors = {
      'HVAC': 0.8,
      'Manufacturing': 1.2,
      'Processing': 1.0,
      'Transportation': 0.9,
      'Power Generation': 1.5,
      'default': 1.0
    };
    
    const typeFactor = equipmentTypeFactors[equipmentType] || equipmentTypeFactors['default'];
    
    // Environmental impact calculation
    const environmentalImpact = 
      (energyConsumption * downtimeHours * typeFactor) + 
      (emissionsRate * downtimeHours * typeFactor);
    
    return parseFloat(Math.min(environmentalImpact, 100).toFixed(2));
  }

  // Generate comprehensive impact report
  async generateImpactReport(equipmentId, downtimeHours, affectedEmployees, revenuePerHour) {
    // Get equipment details from database
    const equipmentResult = await db.query('SELECT * FROM equipment WHERE id = $1', [equipmentId]);
    const equipment = equipmentResult.rows[0];
    
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    
    // Calculate various impact metrics
    const cost = this.calculateDowntimeCost(
      downtimeHours, 
      affectedEmployees, 
      revenuePerHour, 
      equipment.value || 0,
      equipment.production_loss || 0
    );
    
    const humanImpact = this.calculateHumanImpact(
      affectedEmployees, 
      downtimeHours,
      equipment.safety_risk || 0,
      equipment.skill_dependency || 0
    );
    
    const operationalImpact = this.calculateOperationalImpact(
      downtimeHours,
      equipment.criticality || 5,
      equipment.production_priority || 5,
      equipment.maintenance_backlog || 0
    );
    
    const environmentalImpact = this.calculateEnvironmentalImpact(
      equipment.category || 'default',
      downtimeHours,
      equipment.energy_consumption || 0,
      equipment.emissions_rate || 0
    );
    
    // Overall impact score
    const overallImpact = 
      (cost / 1000) * 0.4 + // Normalize cost impact
      humanImpact * 0.2 +
      operationalImpact * 0.25 +
      environmentalImpact * 0.15;
    
    return {
      equipment_id: equipmentId,
      equipment_name: equipment.name,
      downtime_hours: downtimeHours,
      affected_employees: affectedEmployees,
      financial_impact: {
        total_cost: cost,
        revenue_loss: downtimeHours * revenuePerHour,
        labor_cost: downtimeHours * affectedEmployees * 50,
      },
      human_impact: {
        score: humanImpact,
        affected_employees: affectedEmployees,
        safety_risk: equipment.safety_risk || 0,
      },
      operational_impact: {
        score: operationalImpact,
        criticality: equipment.criticality || 5,
        production_priority: equipment.production_priority || 5,
      },
      environmental_impact: {
        score: environmentalImpact,
        equipment_type: equipment.category,
        energy_consumption: equipment.energy_consumption || 0,
      },
      overall_impact_score: parseFloat(Math.min(overallImpact, 100).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ImpactCalculator();