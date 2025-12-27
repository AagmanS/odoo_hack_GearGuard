// Request routes
const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controllers/requestController');

// GET /api/requests - Get all maintenance requests
router.get('/', getAllRequests);

// GET /api/requests/:id - Get request by ID
router.get('/:id', getRequestById);

// POST /api/requests - Create new maintenance request
router.post('/', createRequest);

// PUT /api/requests/:id - Update maintenance request
router.put('/:id', updateRequest);

// DELETE /api/requests/:id - Delete maintenance request
router.delete('/:id', deleteRequest);

module.exports = router;