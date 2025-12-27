// Technician routes
const express = require('express');
const router = express.Router();
const {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician
} = require('../controllers/technicianController');

// GET /api/technicians - Get all technicians
router.get('/', getAllTechnicians);

// GET /api/technicians/:id - Get technician by ID
router.get('/:id', getTechnicianById);

// POST /api/technicians - Create new technician
router.post('/', createTechnician);

// PUT /api/technicians/:id - Update technician
router.put('/:id', updateTechnician);

// DELETE /api/technicians/:id - Delete technician
router.delete('/:id', deleteTechnician);

module.exports = router;