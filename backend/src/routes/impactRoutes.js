// Impact routes
const express = require('express');
const router = express.Router();
const {
  getAllImpactLogs,
  getImpactLogById,
  createImpactLog,
  updateImpactLog,
  deleteImpactLog,
  calculateDowntimeImpact
} = require('../controllers/impactController');

// GET /api/impact - Get all impact logs
router.get('/', getAllImpactLogs);

// GET /api/impact/:id - Get impact log by ID
router.get('/:id', getImpactLogById);

// POST /api/impact - Create new impact log
router.post('/', createImpactLog);

// PUT /api/impact/:id - Update impact log
router.put('/:id', updateImpactLog);

// DELETE /api/impact/:id - Delete impact log
router.delete('/:id', deleteImpactLog);

// POST /api/impact/calculate - Calculate downtime impact
router.post('/calculate', calculateDowntimeImpact);

module.exports = router;