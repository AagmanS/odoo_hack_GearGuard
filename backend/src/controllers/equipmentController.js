// Equipment controller
const db = require('../config/database');

// Get all equipment
const getAllEquipment = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM equipment ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM equipment WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new equipment
const createEquipment = async (req, res) => {
  try {
    const { name, category, department_id, status, location, purchase_date, warranty_expiry } = req.body;
    
    const result = await db.query(
      'INSERT INTO equipment (name, category, department_id, status, location, purchase_date, warranty_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, category, department_id, status, location, purchase_date, warranty_expiry]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update equipment
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, department_id, status, location, purchase_date, warranty_expiry } = req.body;
    
    const result = await db.query(
      'UPDATE equipment SET name = $1, category = $2, department_id = $3, status = $4, location = $5, purchase_date = $6, warranty_expiry = $7 WHERE id = $8 RETURNING *',
      [name, category, department_id, status, location, purchase_date, warranty_expiry, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete equipment
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};