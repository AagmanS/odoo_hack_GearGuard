// Monte Carlo simulation engine for downtime cost calculation with probabilistic uncertainty modeling
class MonteCarloDowntimeSimulator {
  constructor() {
    this.defaultParams = {
      iterations: 10000,
      revenueVariation: 0.1,      // 10% standard deviation in revenue
      employeeVariation: 0.15,    // 15% standard deviation in affected employees
      wageVariation: 0.05,        // 5% standard deviation in wages
      equipmentValueVariation: 0.2 // 20% standard deviation in equipment value
    };
  }

  // Generate a random value based on mean and standard deviation using Box-Muller transform
  randomNormal(mean, stdDev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }

  // Run Monte Carlo simulation for downtime cost
  async runSimulation(downtimeHours, baseParams, customParams = {}) {
    const params = { ...this.defaultParams, ...customParams };
    const results = [];
    
    // Create a worker to run the simulation in a separate thread
    const workerCode = `
      self.onmessage = function(e) {
        const { iterations, downtimeHours, baseParams, params } = e.data;
        const results = [];
        
        // Box-Muller transform for normal distribution
        function randomNormal(mean, stdDev) {
          let u = 0, v = 0;
          while(u === 0) u = Math.random();
          while(v === 0) v = Math.random();
          const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
          return mean + z * stdDev;
        }
        
        for (let i = 0; i < iterations; i++) {
          // Apply random variations to base parameters
          const revenuePerHour = Math.max(0, randomNormal(
            baseParams.revenuePerHour, 
            baseParams.revenuePerHour * params.revenueVariation
          ));
          
          const affectedEmployees = Math.max(0, Math.round(randomNormal(
            baseParams.affectedEmployees, 
            baseParams.affectedEmployees * params.employeeVariation
          )));
          
          const hourlyWage = Math.max(0, randomNormal(
            baseParams.hourlyWage || 50, 
            (baseParams.hourlyWage || 50) * params.wageVariation
          ));
          
          const equipmentValue = Math.max(0, randomNormal(
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
        
        const stats = {
          mean: totalCosts.reduce((a, b) => a + b, 0) / totalCosts.length,
          median: totalCosts[Math.floor(totalCosts.length / 2)],
          min: Math.min(...totalCosts),
          max: Math.max(...totalCosts),
          stdDev: Math.sqrt(
            totalCosts.reduce((sq, n) => sq + Math.pow(n - (stats.mean || totalCosts.reduce((a, b) => a + b, 0) / totalCosts.length), 2), 0) / totalCosts.length
          ),
          percentiles: {
            p10: sortedResults[Math.floor(totalCosts.length * 0.1)].total_cost,
            p50: sortedResults[Math.floor(totalCosts.length * 0.5)].total_cost,
            p90: sortedResults[Math.floor(totalCosts.length * 0.9)].total_cost,
            p95: sortedResults[Math.floor(totalCosts.length * 0.95)].total_cost,
            p99: sortedResults[Math.floor(totalCosts.length * 0.99)].total_cost
          }
        };
        
        // Recalculate mean for stats
        stats.mean = totalCosts.reduce((a, b) => a + b, 0) / totalCosts.length;
        
        // Calculate standard deviation
        const mean = stats.mean;
        stats.stdDev = Math.sqrt(
          totalCosts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / totalCosts.length
        );
        
        self.postMessage({
          results: sortedResults,
          stats,
          iterations
        });
      };
    `;
    
    // Create blob and worker
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Return a promise that resolves when the worker completes
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data);
        URL.revokeObjectURL(blob);
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      // Send data to worker
      worker.postMessage({
        iterations: params.iterations,
        downtimeHours,
        baseParams,
        params
      });
    });
  }

  // Calculate confidence intervals
  calculateConfidenceIntervals(stats, confidenceLevel = 0.95) {
    const alpha = 1 - confidenceLevel;
    const lowerPercentile = alpha / 2;
    const upperPercentile = 1 - alpha / 2;
    
    return {
      lower: stats.percentiles[`p${Math.floor(lowerPercentile * 100)}`] || stats.percentiles.p10,
      upper: stats.percentiles[`p${Math.floor(upperPercentile * 100)}`] || stats.percentiles.p90,
      confidenceLevel
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
    
    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      uncertaintyRatio: parseFloat(uncertaintyRatio.toFixed(3)),
      confidenceIntervals: {
        '68%': [stats.mean - stats.stdDev, stats.mean + stats.stdDev],
        '95%': [stats.percentiles.p2_5 || stats.mean - 1.96 * stats.stdDev, stats.percentiles.p97_5 || stats.mean + 1.96 * stats.stdDev],
        '99%': [stats.percentiles.p0_5 || stats.mean - 2.58 * stats.stdDev, stats.percentiles.p99_5 || stats.mean + 2.58 * stats.stdDev]
      }
    };
  }

  // Run sensitivity analysis
  async runSensitivityAnalysis(downtimeHours, baseParams, sensitivityParams = {}) {
    const defaultSensitivity = {
      revenuePerHour: [-0.5, -0.25, 0.25, 0.5],  // -50%, -25%, +25%, +50%
      affectedEmployees: [-0.5, -0.25, 0.25, 0.5],
      hourlyWage: [-0.2, -0.1, 0.1, 0.2],
      equipmentValue: [-0.5, -0.25, 0.25, 0.5]
    };
    
    const sensitivity = { ...defaultSensitivity, ...sensitivityParams };
    const results = {};
    
    for (const [param, variations] of Object.entries(sensitivity)) {
      results[param] = {};
      
      for (const variation of variations) {
        const modifiedParams = { ...baseParams };
        modifiedParams[param] = baseParams[param] * (1 + variation);
        
        const simulation = await this.runSimulation(downtimeHours, modifiedParams, { iterations: 1000 });
        results[param][variation] = simulation.stats.mean;
      }
    }
    
    return results;
  }
}

// Export the simulator
export default new MonteCarloDowntimeSimulator();