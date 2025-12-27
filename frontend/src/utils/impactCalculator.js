// Frontend impact calculator
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

// Calculate human impact score
const calculateHumanImpact = (affectedEmployees, downtimeHours, safetyRisk = 0, skillDependency = 0) => {
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
};

// Calculate operational impact
const calculateOperationalImpact = (downtimeHours, equipmentCriticality, productionPriority, maintenanceBacklog = 0) => {
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
  calculateHumanImpact,
  calculateOperationalImpact,
  formatCost
};