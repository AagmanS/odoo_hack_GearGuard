import { useState } from 'react';
import api from '../services/api';

const useImpact = () => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDowntimeImpact = async (downtimeHours, affectedEmployees, revenuePerHour) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.calculateDowntimeImpact({
        downtime_hours: downtimeHours,
        affected_employees: affectedEmployees,
        revenue_per_hour: revenuePerHour
      });

      setImpactData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

    const riskAdjustedCost = baseCost * riskMultiplier;

    return {
      base_cost: baseCost,
      risk_adjusted_cost: parseFloat(riskAdjustedCost.toFixed(2)),
      risk_multiplier: parseFloat(riskMultiplier.toFixed(2)),
      risk_factors: riskFactors
    };
  };

  const formatCost = (cost) => {
    if (cost >= 1000000) {
      return `$${(cost / 1000000).toFixed(2)}M`;
    } else if (cost >= 1000) {
      return `$${(cost / 1000).toFixed(2)}K`;
    } else {
      return `$${cost.toFixed(2)}`;
    }
  };

  const reset = () => {
    setImpactData(null);
    setError(null);
  };

  return {
    impactData,
    loading,
    error,
    calculateDowntimeImpact,
    calculateRiskAdjustedCost,
    formatCost,
    reset
  };
};

export default useImpact;