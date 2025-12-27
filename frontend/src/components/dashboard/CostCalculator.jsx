import React, { useState } from 'react';

const CostCalculator = () => {
  const [formData, setFormData] = useState({
    downtimeHours: 0,
    affectedEmployees: 0,
    revenuePerHour: 0,
    hourlyWage: 50,
    equipmentValue: 0,
    productionLoss: 0
  });

  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateCost = () => {
    const { 
      downtimeHours, 
      affectedEmployees, 
      revenuePerHour, 
      hourlyWage, 
      equipmentValue, 
      productionLoss 
    } = formData;

    // Calculate base costs
    const revenueLoss = downtimeHours * revenuePerHour;
    const laborCost = downtimeHours * affectedEmployees * hourlyWage;
    const productionCost = productionLoss * (downtimeHours / 24);
    const depreciationCost = equipmentValue * 0.001 * (downtimeHours / 8760);

    // Total cost calculation
    const totalCost = revenueLoss + laborCost + productionCost + depreciationCost;

    setResults({
      total_cost: parseFloat(totalCost.toFixed(2)),
      breakdown: {
        revenue_loss: parseFloat(revenueLoss.toFixed(2)),
        labor_cost: parseFloat(laborCost.toFixed(2)),
        production_loss: parseFloat(productionCost.toFixed(2)),
        depreciation: parseFloat(depreciationCost.toFixed(2))
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="cost-breakdown">
      <div className="cost-breakdown-header">
        <h3 className="cost-breakdown-title">Downtime Cost Calculator</h3>
      </div>
      
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Downtime Hours</label>
            <input
              type="number"
              name="downtimeHours"
              value={formData.downtimeHours}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.1"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Affected Employees</label>
            <input
              type="number"
              name="affectedEmployees"
              value={formData.affectedEmployees}
              onChange={handleChange}
              className="form-control"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Revenue Per Hour ($)</label>
            <input
              type="number"
              name="revenuePerHour"
              value={formData.revenuePerHour}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Average Hourly Wage ($)</label>
            <input
              type="number"
              name="hourlyWage"
              value={formData.hourlyWage}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Equipment Value ($)</label>
            <input
              type="number"
              name="equipmentValue"
              value={formData.equipmentValue}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Daily Production Loss ($)</label>
            <input
              type="number"
              name="productionLoss"
              value={formData.productionLoss}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
      
      <button className="btn btn-primary" onClick={calculateCost}>
        Calculate Cost
      </button>
      
      {results && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h4>Total Estimated Cost: <strong>{formatCurrency(results.total_cost)}</strong></h4>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="cost-item-label">Revenue Loss</span>
              <span className="cost-item-value">{formatCurrency(results.breakdown.revenue_loss)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-item-label">Labor Cost</span>
              <span className="cost-item-value">{formatCurrency(results.breakdown.labor_cost)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-item-label">Production Loss</span>
              <span className="cost-item-value">{formatCurrency(results.breakdown.production_loss)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-item-label">Depreciation Cost</span>
              <span className="cost-item-value">{formatCurrency(results.breakdown.depreciation)}</span>
            </div>
            <div className="cost-item">
              <span>Total Cost</span>
              <span>{formatCurrency(results.total_cost)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculator;