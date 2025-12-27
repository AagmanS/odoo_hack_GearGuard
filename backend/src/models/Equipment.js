// Equipment model
const db = require('../config/database');

const Equipment = {
  // Get all equipment
  findAll: async () => {
    const result = await db.query('SELECT * FROM equipment ORDER BY created_at DESC');
    return result.rows;
  },

  // Find equipment by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM equipment WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create new equipment
  create: async (data) => {
    const { name, category, department_id, status, location, purchase_date, warranty_expiry } = data;
    const result = await db.query(
      'INSERT INTO equipment (name, category, department_id, status, location, purchase_date, warranty_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, category, department_id, status, location, purchase_date, warranty_expiry]
    );
    return result.rows[0];
  },

  // Update equipment
  update: async (id, data) => {
    const { name, category, department_id, status, location, purchase_date, warranty_expiry } = data;
    const result = await db.query(
      'UPDATE equipment SET name = $1, category = $2, department_id = $3, status = $4, location = $5, purchase_date = $6, warranty_expiry = $7 WHERE id = $8 RETURNING *',
      [name, category, department_id, status, location, purchase_date, warranty_expiry, id]
    );
    return result.rows[0];
  },

  // Delete equipment
  delete: async (id) => {
    const result = await db.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Equipment;