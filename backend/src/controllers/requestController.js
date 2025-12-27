// Maintenance request controller
const db = require('../config/database');

// Get all maintenance requests
const getAllRequests = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT mr.*, e.name as equipment_name, t.name as technician_name 
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
      ORDER BY mr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT mr.*, e.name as equipment_name, t.name as technician_name 
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
      WHERE mr.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new maintenance request
const createRequest = async (req, res) => {
  try {
    const { equipment_id, title, description, priority, status, assigned_technician_id, requested_by } = req.body;
    
    const result = await db.query(
      'INSERT INTO maintenance_requests (equipment_id, title, description, priority, status, assigned_technician_id, requested_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [equipment_id, title, description, priority, status, assigned_technician_id, requested_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update maintenance request
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_id, title, description, priority, status, assigned_technician_id } = req.body;
    
    const result = await db.query(
      'UPDATE maintenance_requests SET equipment_id = $1, title = $2, description = $3, priority = $4, status = $5, assigned_technician_id = $6 WHERE id = $7 RETURNING *',
      [equipment_id, title, description, priority, status, assigned_technician_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete maintenance request
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM maintenance_requests WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
};