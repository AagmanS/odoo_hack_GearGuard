# Cost Calculation System Documentation

## Overview
The Gear-Guard application includes a comprehensive cost calculation system that estimates the financial impact of equipment downtime. The system considers multiple factors including revenue loss, labor costs, production loss, and equipment depreciation.

## Cost Calculation Components

### 1. Revenue Loss
- **Formula**: `downtime_hours * revenue_per_hour`
- **Description**: The direct revenue lost during equipment downtime
- **Input**: Expected revenue per hour of operation

### 2. Labor Cost
- **Formula**: `downtime_hours * affected_employees * hourly_wage`
- **Description**: Cost of paying employees during downtime when equipment is not productive
- **Default**: $50/hour average wage (configurable)

### 3. Production Loss
- **Formula**: `production_loss * (downtime_hours / 24)`
- **Description**: Value of products not manufactured during downtime
- **Input**: Daily production loss value

### 4. Fixed Operational Costs
- **Formula**: `downtime_hours * fixed_costs_per_hour`
- **Description**: Costs that continue during downtime (utilities, insurance, etc.)
- **Default**: $0/hour (configurable)

### 5. Equipment Depreciation
- **Formula**: `equipment_value * 0.001 * (downtime_hours / 8760)`
- **Description**: Depreciation cost during downtime (annual depreciation spread over hours)
- **Rate**: 0.1% of equipment value annually

## Risk-Adjusted Cost Calculation

The system includes a risk adjustment feature that applies multipliers based on various risk factors:

### Risk Factors
- **Safety Risk**: 0-1 scale (weight: 30%)
- **Compliance Risk**: 0-1 scale (weight: 25%)
- **Reputation Risk**: 0-1 scale (weight: 20%)
- **Customer Satisfaction**: 0-1 scale (weight: 25%)

### Risk Multiplier Formula
```
risk_multiplier = 1 + (safety_risk * 0.3) + (compliance_risk * 0.25) + (reputation_risk * 0.2) + (customer_satisfaction * 0.25)
risk_adjusted_cost = base_cost * risk_multiplier
```

## Impact Calculations

### Human Impact Score
- **Formula**: `(employee_impact * 0.3) + (safety_impact * 0.4) + (skill_impact * 0.3)`
- **Components**:
  - Employee Impact: `affected_employees * downtime_hours`
  - Safety Impact: `min(safety_risk, 1) * 100`
  - Skill Impact: `min(skill_dependency, 1) * 100`
- **Scale**: 0-100

### Operational Impact Score
- **Formula**: `(downtime_hours * criticality_factor * 30) + (downtime_hours * priority_factor * 25) + (maintenance_backlog * 15)`
- **Components**:
  - Criticality Factor: `min(equipment_criticality, 10) / 10`
  - Priority Factor: `min(production_priority, 10) / 10`
  - Maintenance Backlog: Number of pending maintenance items
- **Scale**: 0-100

### Environmental Impact Score
- **Formula**: `(energy_consumption * downtime_hours * type_factor) + (emissions_rate * downtime_hours * type_factor)`
- **Equipment Type Factors**:
  - HVAC: 0.8
  - Manufacturing: 1.2
  - Processing: 1.0
  - Transportation: 0.9
  - Power Generation: 1.5
  - Default: 1.0
- **Scale**: 0-100

## Cost Calculation API

### Frontend Functions
- `calculateDowntimeCost(downtimeHours, affectedEmployees, revenuePerHour, options)`
- `calculateRiskAdjustedCost(baseCost, riskFactors)`
- `calculateHumanImpact(affectedEmployees, downtimeHours, safetyRisk, skillDependency)`
- `calculateOperationalImpact(downtimeHours, equipmentCriticality, productionPriority, maintenanceBacklog)`
- `formatCost(cost)`

### Backend Services
- `calculateDowntimeCost` in `src/utils/costCalculator.js`
- `calculateDowntimeImpact` in `src/services/impactCalculator.js`
- `/api/impact/calculate` endpoint

## Usage Examples

### Basic Cost Calculation
```javascript
const cost = calculateDowntimeCost(
  4,        // 4 hours of downtime
  10,       // 10 affected employees
  2000,     // $2000 revenue per hour
  {
    hourlyWage: 45,        // $45/hour average wage
    equipmentValue: 100000 // $100,000 equipment value
  }
);
```

### Risk-Adjusted Calculation
```javascript
const riskAdjusted = calculateRiskAdjustedCost(cost, {
  safetyRisk: 0.7,          // 70% safety risk
  complianceRisk: 0.3,      // 30% compliance risk
  reputationRisk: 0.5,      // 50% reputation risk
  customerSatisfaction: 0.8 // 80% customer dissatisfaction risk
});
```

## Cost Formatting

### Display Formatting
- Values under $1,000: Display as `$X.XX`
- Values between $1,000 and $999,999: Display as `$X.XXK`
- Values $1,000,000 and above: Display as `$X.XXM`

### Currency Formatting
- Uses USD by default
- Two decimal places
- Thousands separator

## Integration Points

### Frontend Integration
- Cost Calculator component in dashboard
- Maintenance request forms
- Equipment detail views
- Impact assessment reports

### Backend Integration
- Maintenance request processing
- Impact log creation
- Equipment risk assessment
- Report generation

## Configuration Options

### Default Values
- Average hourly wage: $50
- Equipment depreciation rate: 0.1% annually
- Risk factor weights: Configurable by component

### Customizable Parameters
- Revenue per hour (per equipment)
- Hourly wage (per department)
- Equipment value
- Risk factor weights
- Production loss values

## Performance Considerations

### Calculation Efficiency
- All calculations performed client-side for responsiveness
- Server-side calculations for validation and audit trails
- Caching of common calculations

### Data Storage
- Cost calculations stored in impact_logs table
- Historical cost data for trend analysis
- Comparison of estimated vs. actual costs