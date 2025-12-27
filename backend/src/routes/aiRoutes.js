// AI routes
const express = require('express');
const router = express.Router();
const equipmentPredictor = require('../ai/equipmentPredictor');

// Analyze failure patterns for equipment
router.get('/analyze-patterns/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    const result = await equipmentPredictor.analyzeFailurePatterns(equipmentId);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing failure patterns:', error);
    res.status(500).json({ error: 'Failed to analyze failure patterns' });
  }
});

// Predict next failure for equipment
router.get('/predict-failure/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    const result = await equipmentPredictor.predictNextFailure(equipmentId);
    res.json(result);
  } catch (error) {
    console.error('Error predicting next failure:', error);
    res.status(500).json({ error: 'Failed to predict next failure' });
  }
});

// Predict human impact of potential failures
router.post('/predict-impact/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { predictedDowntime } = req.body;
    
    if (!predictedDowntime) {
      return res.status(400).json({ error: 'predictedDowntime is required' });
    }
    
    const result = await equipmentPredictor.predictHumanImpact(equipmentId, predictedDowntime);
    res.json(result);
  } catch (error) {
    console.error('Error predicting human impact:', error);
    res.status(500).json({ error: 'Failed to predict human impact' });
  }
});

// Get predictive maintenance schedule
router.get('/maintenance-schedule/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    // This would typically take a list of equipment IDs, but for simplicity:
    const equipmentList = [{
      id: equipmentId,
      name: req.query.name || `Equipment ${equipmentId}`,
      criticality: parseInt(req.query.criticality) || 5,
      historical_data: [] // Would be populated with historical data
    }];
    
    // In a real implementation, we would fetch historical data for the equipment
    // For now, we'll just return a basic response
    const result = {
      equipment_id: equipmentId,
      recommendations: [
        {
          equipment_id: equipmentId,
          failure_probability: Math.random(),
          risk_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
          recommended_maintenance_days: Math.floor(Math.random() * 30) + 1,
          confidence: 0.85
        }
      ]
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error generating maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to generate maintenance schedule' });
  }
});

module.exports = router;