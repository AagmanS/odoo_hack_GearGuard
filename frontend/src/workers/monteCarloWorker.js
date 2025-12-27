// Web Worker for Monte Carlo simulation calculations
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
  
  // Send results back to main thread
  self.postMessage({
    results: sortedResults,
    stats,
    iterations,
    timestamp: Date.now()
  });
};