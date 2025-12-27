// Simulation service for Monte Carlo analysis of downtime costs
const db = require('../config/database');

class SimulationService {
  constructor() {
    this.defaultParams = {
      iterations: 10000,
      revenueVariation: 0.1,      // 10% standard deviation in revenue
      employeeVariation: 0.15,    // 15% standard deviation in affected employees
      wageVariation: 0.05,        // 5% standard deviation in wages
      equipmentValueVariation: 0.2 // 20% standard deviation in equipment value
    };
  }

  // Generate a random value based on normal distribution
  randomNormal(mean, stdDev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }

  // Run Monte Carlo simulation for downtime cost
  async runDowntimeSimulation(downtimeHours, baseParams, customParams = {}) {
    const params = { ...this.defaultParams, ...customParams };
    const results = [];
    
    for (let i = 0; i < params.iterations; i++) {
      // Apply random variations to base parameters
      const revenuePerHour = Math.max(0, this.randomNormal(
        baseParams.revenuePerHour, 
        baseParams.revenuePerHour * params.revenueVariation
      ));
      
      const affectedEmployees = Math.max(0, Math.round(this.randomNormal(
        baseParams.affectedEmployees, 
        baseParams.affectedEmployees * params.employeeVariation
      )));
      
      const hourlyWage = Math.max(0, this.randomNormal(
        baseParams.hourlyWage || 50, 
        (baseParams.hourlyWage || 50) * params.wageVariation
      ));
      
      const equipmentValue = Math.max(0, this.randomNormal(
        baseParams.equipmentValue || 0, 
        (baseParams.equipmentValue || 0) * params.equipmentValueVariation
      ));
      
      // Calculate cost components with uncertainty
      const revenueLoss = downtimeHours * revenuePerHour;
      const laborCost = downtimeHours * affectedEmployees * hourlyWage;
      const depreciationCost = equipmentValue * 0.001 * (downtimeHours / 8760);
      
      // Total cost calculation
      const totalCost = revenueLoss + laborCost + depreciationCost;
      
      results.push({
        revenue_loss: revenueLoss,
        labor_cost: laborCost,
        depreciation: depreciationCost,
        total_cost: totalCost,
        iteration: i
      });
    }
    
    // Calculate statistics
    const sortedResults = results.sort((a, b) => a.total_cost - b.total_cost);
    const totalCosts = sortedResults.map(r => r.total_cost);
    
    // Calculate mean
    const mean = totalCosts.reduce((a, b) => a + b, 0) / totalCosts.length;
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(
      totalCosts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / totalCosts.length
    );
    
    // Calculate percentiles
    const percentiles = {
      p10: sortedResults[Math.floor(totalCosts.length * 0.1)]?.total_cost || 0,
      p25: sortedResults[Math.floor(totalCosts.length * 0.25)]?.total_cost || 0,
      p50: sortedResults[Math.floor(totalCosts.length * 0.5)]?.total_cost || 0,
      p75: sortedResults[Math.floor(totalCosts.length * 0.75)]?.total_cost || 0,
      p90: sortedResults[Math.floor(totalCosts.length * 0.9)]?.total_cost || 0,
      p95: sortedResults[Math.floor(totalCosts.length * 0.95)]?.total_cost || 0,
      p99: sortedResults[Math.floor(totalCosts.length * 0.99)]?.total_cost || 0
    };
    
    const stats = {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(percentiles.p50.toFixed(2)),
      min: parseFloat(Math.min(...totalCosts).toFixed(2)),
      max: parseFloat(Math.max(...totalCosts).toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      percentiles
    };
    
    return {
      results: sortedResults,
      stats,
      iterations: params.iterations,
      parameters: params,
      timestamp: new Date().toISOString()
    };
  }

  // Run simulation for specific equipment downtime
  async runEquipmentSimulation(equipmentId, downtimeHours) {
    try {
      // Get equipment data from database
      const equipmentQuery = 'SELECT * FROM equipment WHERE id = $1';
      const equipmentResult = await db.query(equipmentQuery, [equipmentId]);
      
      if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
      }
      
      const equipment = equipmentResult.rows[0];
      
      // Get department data to estimate revenue impact
      const deptQuery = 'SELECT * FROM departments WHERE id = $1';
      const deptResult = await db.query(deptQuery, [equipment.department_id]);
      const department = deptResult.rows[0] || {};
      
      // Estimate base parameters based on equipment and department data
      const baseParams = {
        revenuePerHour: department.estimated_revenue_hourly || equipment.value * 0.0001,
        affectedEmployees: Math.max(1, Math.round(equipment.criticality * 2)),
        hourlyWage: 50, // Default hourly wage
        equipmentValue: equipment.value || 0
      };
      
      // Run the simulation
      const simulationResult = await this.runDowntimeSimulation(downtimeHours, baseParams);
      
      // Enhance with equipment information
      return {
        ...simulationResult,
        equipment: {
          id: equipment.id,
          name: equipment.name,
          type: equipment.type,
          criticality: equipment.criticality,
          value: equipment.value
        },
        downtime_hours: downtimeHours
      };
    } catch (error) {
      console.error('Error running equipment simulation:', error);
      throw error;
    }
  }

  // Calculate confidence intervals
  calculateConfidenceIntervals(stats, confidenceLevel = 0.95) {
    const alpha = 1 - confidenceLevel;
    const lowerPercentile = alpha / 2;
    const upperPercentile = 1 - alpha / 2;
    
    const lower = stats.percentiles[`p${Math.floor(lowerPercentile * 100)}`] || stats.percentiles.p10;
    const upper = stats.percentiles[`p${Math.floor(upperPercentile * 100)}`] || stats.percentiles.p90;
    
    return {
      lower: parseFloat(lower.toFixed(2)),
      upper: parseFloat(upper.toFixed(2)),
      confidenceLevel,
      interval: parseFloat((upper - lower).toFixed(2))
    };
  }

  // Generate risk assessment based on simulation results
  generateRiskAssessment(simulationResults) {
    const { stats } = simulationResults;
    
    // Calculate risk score based on uncertainty
    const uncertaintyRatio = stats.stdDev / stats.mean;
    const riskScore = Math.min(100, Math.max(0, uncertaintyRatio * 100));
    
    // Determine risk level
    let riskLevel;
    if (riskScore < 20) riskLevel = 'LOW';
    else if (riskScore < 50) riskLevel = 'MEDIUM';
    else if (riskScore < 80) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';
    
    const confidenceIntervals = this.calculateConfidenceIntervals(stats);
    
    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      uncertaintyRatio: parseFloat(uncertaintyRatio.toFixed(3)),
      confidenceIntervals,
      value_at_risk: {
        worst_case: stats.max,
        expected: stats.mean,
        best_case: stats.min
      }
    };
  }

  // Run sensitivity analysis
  async runSensitivityAnalysis(equipmentId, downtimeHours, sensitivityParams = {}) {
    const defaultSensitivity = {
      revenuePerHour: [-0.5, -0.25, 0.25, 0.5],  // -50%, -25%, +25%, +50%
      affectedEmployees: [-0.5, -0.25, 0.25, 0.5],
      hourlyWage: [-0.2, -0.1, 0.1, 0.2],
      equipmentValue: [-0.5, -0.25, 0.25, 0.5]
    };
    
    const sensitivity = { ...defaultSensitivity, ...sensitivityParams };
    
    // Get base parameters
    const baseSimulation = await this.runEquipmentSimulation(equipmentId, downtimeHours);
    const baseParams = {
      revenuePerHour: baseSimulation.equipment.value * 0.0001,
      affectedEmployees: Math.max(1, Math.round(baseSimulation.equipment.criticality * 2)),
      hourlyWage: 50,
      equipmentValue: baseSimulation.equipment.value
    };
    
    const results = {};
    
    for (const [param, variations] of Object.entries(sensitivity)) {
      results[param] = {};
      
      for (const variation of variations) {
        const modifiedParams = { ...baseParams };
        modifiedParams[param] = baseParams[param] * (1 + variation);
        
        const simulation = await this.runDowntimeSimulation(downtimeHours, modifiedParams, { iterations: 1000 });
        results[param][variation] = parseFloat(simulation.stats.mean.toFixed(2));
      }
    }
    
    return {
      equipment_id: equipmentId,
      downtime_hours: downtimeHours,
      sensitivity_analysis: results,
      base_case: parseFloat(baseSimulation.stats.mean.toFixed(2)),
      timestamp: new Date().toISOString()
    };
  }

  // Generate comprehensive risk report
  async generateRiskReport(equipmentId, downtimeHours) {
    try {
      // Run the main simulation
      const simulation = await this.runEquipmentSimulation(equipmentId, downtimeHours);
      
      // Generate risk assessment
      const riskAssessment = this.generateRiskAssessment(simulation);
      
      // Run sensitivity analysis
      const sensitivityAnalysis = await this.runSensitivityAnalysis(equipmentId, downtimeHours);
      
      // Create comprehensive report
      return {
        equipment_id: equipmentId,
        downtime_hours: downtimeHours,
        simulation_summary: {
          mean_cost: simulation.stats.mean,
          median_cost: simulation.stats.median,
          min_cost: simulation.stats.min,
          max_cost: simulation.stats.max,
          std_deviation: simulation.stats.stdDev
        },
        risk_assessment: riskAssessment,
        sensitivity_analysis: sensitivityAnalysis,
        recommendations: this.generateRecommendations(riskAssessment, simulation.stats),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating risk report:', error);
      throw error;
    }
  }

  // Generate risk-based recommendations
  generateRecommendations(riskAssessment, stats) {
    const recommendations = [];
    
    if (riskAssessment.riskLevel === 'CRITICAL' || riskAssessment.riskLevel === 'HIGH') {
      recommendations.push('Implement immediate mitigation measures');
      recommendations.push('Consider equipment redundancy or backup systems');
      recommendations.push('Review and update maintenance schedules');
    }
    
    if (riskAssessment.uncertaintyRatio > 0.5) {
      recommendations.push('Gather more data to reduce uncertainty in cost estimates');
      recommendations.push('Implement more frequent monitoring of this equipment');
    }
    
    if (stats.max / stats.mean > 3) { // If worst case is 3x expected
      recommendations.push('Plan for worst-case scenarios in budgeting');
      recommendations.push('Develop contingency plans for high-impact events');
    }
    
    return recommendations;
  }
}

module.exports = new SimulationService();