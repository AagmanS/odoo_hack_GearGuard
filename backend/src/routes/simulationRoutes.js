// Simulation routes
const express = require('express');
const router = express.Router();
const simulationService = require('../simulation/simulationService');

// Run Monte Carlo simulation for downtime cost
router.post('/simulate-downtime', async (req, res) => {
  try {
    const { downtimeHours, baseParams, customParams } = req.body;
    
    if (!downtimeHours || !baseParams) {
      return res.status(400).json({ error: 'downtimeHours and baseParams are required' });
    }
    
    const result = await simulationService.runDowntimeSimulation(downtimeHours, baseParams, customParams);
    res.json(result);
  } catch (error) {
    console.error('Error running downtime simulation:', error);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

// Run simulation for specific equipment
router.post('/simulate-equipment/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { downtimeHours } = req.body;
    
    if (!downtimeHours) {
      return res.status(400).json({ error: 'downtimeHours is required' });
    }
    
    const result = await simulationService.runEquipmentSimulation(equipmentId, downtimeHours);
    res.json(result);
  } catch (error) {
    console.error('Error running equipment simulation:', error);
    res.status(500).json({ error: 'Failed to run equipment simulation' });
  }
});

// Generate risk report
router.post('/risk-report/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { downtimeHours } = req.body;
    
    if (!downtimeHours) {
      return res.status(400).json({ error: 'downtimeHours is required' });
    }
    
    const result = await simulationService.generateRiskReport(equipmentId, downtimeHours);
    res.json(result);
  } catch (error) {
    console.error('Error generating risk report:', error);
    res.status(500).json({ error: 'Failed to generate risk report' });
  }
});

// Run sensitivity analysis
router.post('/sensitivity/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { downtimeHours, sensitivityParams } = req.body;
    
    if (!downtimeHours) {
      return res.status(400).json({ error: 'downtimeHours is required' });
    }
    
    const result = await simulationService.runSensitivityAnalysis(equipmentId, downtimeHours, sensitivityParams);
    res.json(result);
  } catch (error) {
    console.error('Error running sensitivity analysis:', error);
    res.status(500).json({ error: 'Failed to run sensitivity analysis' });
  }
});

module.exports = router;