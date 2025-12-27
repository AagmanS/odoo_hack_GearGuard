// AI-powered predictive analytics for equipment failure prediction
const db = require('../config/database');
const { calculateHumanImpact } = require('../utils/costCalculator');

class EquipmentPredictor {
  constructor() {
    this.model = null;
    this.isTraining = false;
  }

  // Analyze historical data to identify failure patterns
  async analyzeFailurePatterns(equipmentId) {
    try {
      // Get historical maintenance data for the equipment
      const historyQuery = `
        SELECT 
          mr.created_at,
          mr.status,
          mr.priority,
          il.downtime_hours,
          il.affected_employees,
          il.cost_calculated,
          e.criticality,
          e.age,
          e.maintenance_frequency
        FROM maintenance_requests mr
        LEFT JOIN impact_logs il ON mr.equipment_id = il.equipment_id
        JOIN equipment e ON mr.equipment_id = e.id
        WHERE mr.equipment_id = $1
        ORDER BY mr.created_at DESC
        LIMIT 100
      `;
      
      const result = await db.query(historyQuery, [equipmentId]);
      const historicalData = result.rows;
      
      if (historicalData.length === 0) {
        throw new Error('No historical data available for this equipment');
      }
      
      // Analyze patterns in the data
      const analysis = this.performPatternAnalysis(historicalData);
      
      return {
        equipment_id: equipmentId,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing failure patterns:', error);
      throw error;
    }
  }

  // Perform pattern analysis on historical data
  performPatternAnalysis(historicalData) {
    // Calculate failure frequency
    const totalRequests = historicalData.length;
    const completedRequests = historicalData.filter(r => r.status === 'closed').length;
    const highPriorityRequests = historicalData.filter(r => r.priority === 'high' || r.priority === 'critical').length;
    
    // Calculate average downtime
    const totalDowntime = historicalData.reduce((sum, record) => sum + (record.downtime_hours || 0), 0);
    const avgDowntime = totalDowntime / totalRequests;
    
    // Calculate cost impact
    const totalCost = historicalData.reduce((sum, record) => sum + (record.cost_calculated || 0), 0);
    const avgCost = totalCost / totalRequests;
    
    // Identify seasonal patterns or trends
    const monthlyPattern = this.analyzeMonthlyPattern(historicalData);
    
    // Determine risk factors
    const riskFactors = this.calculateRiskFactors(historicalData);
    
    return {
      total_requests: totalRequests,
      completion_rate: completedRequests / totalRequests,
      high_priority_ratio: highPriorityRequests / totalRequests,
      average_downtime: parseFloat(avgDowntime.toFixed(2)),
      average_cost: parseFloat(avgCost.toFixed(2)),
      monthly_pattern: monthlyPattern,
      risk_factors: riskFactors,
      prediction_confidence: this.calculateConfidence(historicalData)
    };
  }

  // Analyze monthly patterns in failures
  analyzeMonthlyPattern(historicalData) {
    const monthlyCounts = {};
    
    historicalData.forEach(record => {
      const month = new Date(record.created_at).getMonth();
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    
    // Find months with highest failure rates
    const maxFailures = Math.max(...Object.values(monthlyCounts));
    const peakMonths = Object.keys(monthlyCounts).filter(month => monthlyCounts[month] === maxFailures);
    
    return {
      monthly_distribution: monthlyCounts,
      peak_months: peakMonths.map(m => parseInt(m)),
      pattern_strength: Object.keys(monthlyCounts).length > 1 ? 'seasonal' : 'consistent'
    };
  }

  // Calculate risk factors for equipment
  calculateRiskFactors(historicalData) {
    // Calculate based on historical data
    const avgDowntime = historicalData.reduce((sum, record) => sum + (record.downtime_hours || 0), 0) / historicalData.length;
    const avgAffectedEmployees = historicalData.reduce((sum, record) => sum + (record.affected_employees || 0), 0) / historicalData.length;
    const avgCost = historicalData.reduce((sum, record) => sum + (record.cost_calculated || 0), 0) / historicalData.length;
    
    // Determine risk level
    let riskLevel = 'low';
    if (avgDowntime > 8 || avgAffectedEmployees > 10 || avgCost > 5000) {
      riskLevel = 'high';
    } else if (avgDowntime > 4 || avgAffectedEmployees > 5 || avgCost > 2000) {
      riskLevel = 'medium';
    }
    
    return {
      average_downtime: parseFloat(avgDowntime.toFixed(2)),
      average_affected_employees: parseFloat(avgAffectedEmployees.toFixed(2)),
      average_cost: parseFloat(avgCost.toFixed(2)),
      risk_level: riskLevel
    };
  }

  // Calculate prediction confidence
  calculateConfidence(historicalData) {
    // Confidence based on data completeness and recency
    const totalRecords = historicalData.length;
    const recentRecords = historicalData.filter(record => {
      const recordDate = new Date(record.created_at);
      const daysAgo = (Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 90; // Within last 3 months
    }).length;
    
    // Calculate confidence score (0-1)
    const recencyScore = recentRecords / totalRecords;
    const completenessScore = totalRecords > 10 ? 1 : totalRecords / 10;
    
    const confidence = Math.min(1, (recencyScore + completenessScore) / 2);
    
    return parseFloat(confidence.toFixed(2));
  }

  // Predict next likely failure date
  async predictNextFailure(equipmentId) {
    try {
      const analysis = await this.analyzeFailurePatterns(equipmentId);
      
      // Calculate based on historical frequency
      const historicalData = await this.getHistoricalData(equipmentId);
      const failureFrequency = this.calculateFailureFrequency(historicalData);
      
      // Predict next failure based on patterns
      const prediction = this.generateFailurePrediction(analysis, failureFrequency);
      
      return {
        equipment_id: equipmentId,
        prediction,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error predicting next failure:', error);
      throw error;
    }
  }

  // Get historical data for equipment
  async getHistoricalData(equipmentId) {
    const historyQuery = `
      SELECT 
        mr.created_at,
        mr.status,
        mr.priority,
        il.downtime_hours,
        il.affected_employees,
        il.cost_calculated
      FROM maintenance_requests mr
      LEFT JOIN impact_logs il ON mr.equipment_id = il.equipment_id
      WHERE mr.equipment_id = $1
      ORDER BY mr.created_at DESC
      LIMIT 50
    `;
    
    const result = await db.query(historyQuery, [equipmentId]);
    return result.rows;
  }

  // Calculate failure frequency
  calculateFailureFrequency(historicalData) {
    if (historicalData.length < 2) {
      return { avg_interval_days: null, trend: 'insufficient_data' };
    }
    
    // Calculate intervals between failures
    const intervals = [];
    for (let i = 1; i < historicalData.length; i++) {
      const prevDate = new Date(historicalData[i - 1].created_at);
      const currDate = new Date(historicalData[i].created_at);
      const intervalDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      intervals.push(intervalDays);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Determine trend
    let trend = 'stable';
    if (intervals.length >= 3) {
      const recentAvg = intervals.slice(0, 3).reduce((sum, interval) => sum + interval, 0) / 3;
      const olderAvg = intervals.slice(-3).reduce((sum, interval) => sum + interval, 0) / 3;
      
      if (recentAvg < olderAvg * 0.8) {
        trend = 'increasing_frequency';
      } else if (recentAvg > olderAvg * 1.2) {
        trend = 'decreasing_frequency';
      }
    }
    
    return {
      avg_interval_days: parseFloat(avgInterval.toFixed(2)),
      trend,
      intervals
    };
  }

  // Generate failure prediction
  generateFailurePrediction(analysis, frequencyData) {
    const { risk_factors, prediction_confidence } = analysis;
    const { avg_interval_days, trend } = frequencyData;
    
    // Calculate next likely failure date
    let daysToFailure;
    
    if (avg_interval_days) {
      // Adjust based on risk factors
      let riskAdjustment = 1.0;
      if (risk_factors.risk_level === 'high') riskAdjustment = 0.7;
      else if (risk_factors.risk_level === 'medium') riskAdjustment = 0.85;
      
      daysToFailure = avg_interval_days * riskAdjustment;
    } else {
      // Default prediction based on risk level
      switch (risk_factors.risk_level) {
        case 'high': daysToFailure = 30; break;
        case 'medium': daysToFailure = 90; break;
        default: daysToFailure = 180; break;
      }
    }
    
    // Adjust based on trend
    if (trend === 'increasing_frequency') {
      daysToFailure *= 0.7; // Fail sooner if frequency is increasing
    } else if (trend === 'decreasing_frequency') {
      daysToFailure *= 1.3; // Fail later if frequency is decreasing
    }
    
    const nextFailureDate = new Date();
    nextFailureDate.setDate(nextFailureDate.getDate() + Math.round(daysToFailure));
    
    return {
      predicted_failure_date: nextFailureDate.toISOString(),
      days_to_failure: Math.round(daysToFailure),
      confidence: prediction_confidence,
      risk_level: risk_factors.risk_level,
      recommendation: this.generateRecommendation(risk_factors.risk_level, Math.round(daysToFailure))
    };
  }

  // Generate maintenance recommendation
  generateRecommendation(riskLevel, daysToFailure) {
    let recommendation = '';
    
    switch (riskLevel) {
      case 'high':
        recommendation = 'Immediate maintenance required. Schedule within 7 days.';
        break;
      case 'medium':
        recommendation = 'Schedule preventive maintenance within 30 days.';
        break;
      default:
        recommendation = 'Continue monitoring. Schedule routine maintenance.';
    }
    
    if (daysToFailure < 7) {
      recommendation = 'URGENT: Schedule maintenance immediately.';
    } else if (daysToFailure < 30) {
      recommendation = `Schedule maintenance within ${daysToFailure} days.`;
    }
    
    return recommendation;
  }

  // Predict human impact of potential failures
  async predictHumanImpact(equipmentId, predictedDowntime) {
    try {
      // Get equipment details
      const equipmentQuery = 'SELECT * FROM equipment WHERE id = $1';
      const equipmentResult = await db.query(equipmentQuery, [equipmentId]);
      
      if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
      }
      
      const equipment = equipmentResult.rows[0];
      
      // Estimate human impact based on equipment criticality and location
      const affectedEmployees = Math.max(1, Math.round(equipment.criticality * 2));
      const revenuePerHour = equipment.value ? equipment.value * 0.0001 : 1000; // Estimate
      
      // Calculate impact using the existing cost calculator
      const impact = calculateHumanImpact(
        affectedEmployees,
        predictedDowntime,
        equipment.safety_risk / 10, // Normalize to 0-1 scale
        equipment.skill_dependency
      );
      
      return {
        equipment_id: equipmentId,
        predicted_downtime_hours: predictedDowntime,
        estimated_affected_employees: affectedEmployees,
        estimated_revenue_per_hour: revenuePerHour,
        human_impact_score: impact,
        potential_safety_risk: equipment.safety_risk,
        criticality_factor: equipment.criticality
      };
    } catch (error) {
      console.error('Error predicting human impact:', error);
      throw error;
    }
  }
}

module.exports = new EquipmentPredictor();