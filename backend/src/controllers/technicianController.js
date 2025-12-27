// Technician controller
const db = require('../config/database');

// Get all technicians
const getAllTechnicians = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM technicians ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get technician by ID
const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM technicians WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new technician
const createTechnician = async (req, res) => {
  try {
    const { name, email, phone, specialization, department_id, status } = req.body;
    
    const result = await db.query(
      'INSERT INTO technicians (name, email, phone, specialization, department_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, specialization, department_id, status]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, department_id, status } = req.body;
    
    const result = await db.query(
      'UPDATE technicians SET name = $1, email = $2, phone = $3, specialization = $4, department_id = $5, status = $6 WHERE id = $7 RETURNING *',
      [name, email, phone, specialization, department_id, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM technicians WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
};