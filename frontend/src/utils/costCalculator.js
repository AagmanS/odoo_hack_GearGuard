// Frontend cost calculator
const calculateDowntimeCost = (downtimeHours, affectedEmployees, revenuePerHour, options = {}) => {
  const {
    hourlyWage = 50,           // Average hourly wage
    equipmentValue = 0,        // Value of equipment
    productionLoss = 0,        // Daily production loss value
    fixedCostsPerHour = 0      // Fixed costs that continue during downtime
  } = options;

  // Revenue loss during downtime
  const revenueLoss = downtimeHours * revenuePerHour;

  // Labor cost (employees still need to be paid)
  const laborCost = downtimeHours * affectedEmployees * hourlyWage;

  // Production loss during downtime
  const productionCost = productionLoss * (downtimeHours / 24);

  // Fixed operational costs that continue
  const fixedCost = downtimeHours * fixedCostsPerHour;

  // Equipment depreciation during downtime
  const depreciationCost = equipmentValue * 0.001 * (downtimeHours / 8760);

  // Total cost calculation
  const totalCost = revenueLoss + laborCost + productionCost + fixedCost + depreciationCost;

  return {
    total_cost: parseFloat(totalCost.toFixed(2)),
    breakdown: {
      revenue_loss: parseFloat(revenueLoss.toFixed(2)),
      labor_cost: parseFloat(laborCost.toFixed(2)),
      production_loss: parseFloat(productionCost.toFixed(2)),
      fixed_costs: parseFloat(fixedCost.toFixed(2)),
      depreciation: parseFloat(depreciationCost.toFixed(2))
    }
  };
};

// Calculate cost with risk multipliers
const calculateRiskAdjustedCost = (baseCost, riskFactors = {}) => {
  const {
    safetyRisk = 0,           // 0-1 scale
    complianceRisk = 0,       // 0-1 scale
    reputationRisk = 0,       // 0-1 scale
    customerSatisfaction = 0  // 0-1 scale (1 = low satisfaction/ high risk)
  } = riskFactors;

  // Calculate risk multiplier
  const riskMultiplier = 1 + 
    (safetyRisk * 0.3) + 
    (complianceRisk * 0.25) + 
    (reputationRisk * 0.2) + 
    (customerSatisfaction * 0.25);

  const riskAdjustedCost = baseCost.total_cost * riskMultiplier;

  return {
    ...baseCost,
    risk_adjusted_cost: parseFloat(riskAdjustedCost.toFixed(2)),
    risk_multiplier: parseFloat(riskMultiplier.toFixed(2)),
    risk_factors: riskFactors
  };
};

// Calculate cost per unit of production lost
const calculateCostPerUnit = (productionLossValue, unitsLost) => {
  if (unitsLost <= 0) {
    return 0;
  }

  const costPerUnit = productionLossValue / unitsLost;
  return parseFloat(costPerUnit.toFixed(2));
};

// Calculate cumulative cost over time
const calculateCumulativeCost = (downtimeHours, hourlyCost, hourlyIncreaseRate = 0) => {
  // If there's an hourly increase rate, calculate compound cost
  if (hourlyIncreaseRate > 0) {
    let cumulativeCost = 0;
    for (let hour = 1; hour <= downtimeHours; hour++) {
      const hourCost = hourlyCost * Math.pow(1 + hourlyIncreaseRate, hour - 1);
      cumulativeCost += hourCost;
    }
    return parseFloat(cumulativeCost.toFixed(2));
  } else {
    // Simple linear calculation
    return parseFloat((downtimeHours * hourlyCost).toFixed(2));
  }
};

// Calculate opportunity cost
const calculateOpportunityCost = (downtimeHours, potentialRevenuePerHour, marketGrowthRate = 0) => {
  // Potential revenue lost during downtime
  const directLoss = downtimeHours * potentialRevenuePerHour;

  // Opportunity cost from market growth
  const growthOpportunityCost = directLoss * marketGrowthRate;

  return {
    direct_loss: parseFloat(directLoss.toFixed(2)),
    growth_opportunity_cost: parseFloat(growthOpportunityCost.toFixed(2)),
    total_opportunity_cost: parseFloat((directLoss + growthOpportunityCost).toFixed(2))
  };
};

// Format cost for display
const formatCost = (cost) => {
  if (cost >= 1000000) {
    return `$${(cost / 1000000).toFixed(2)}M`;
  } else if (cost >= 1000) {
    return `$${(cost / 1000).toFixed(2)}K`;
  } else {
    return `$${cost.toFixed(2)}`;
  }
};

export {
  calculateDowntimeCost,
  calculateRiskAdjustedCost,
  calculateCostPerUnit,
  calculateCumulativeCost,
  calculateOpportunityCost,
  formatCost
};