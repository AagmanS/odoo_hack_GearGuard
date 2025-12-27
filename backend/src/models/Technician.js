// Technician model
const db = require('../config/database');

const Technician = {
  // Get all technicians
  findAll: async () => {
    const result = await db.query('SELECT * FROM technicians ORDER BY created_at DESC');
    return result.rows;
  },

  // Find technician by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM technicians WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create new technician
  create: async (data) => {
    const { name, email, phone, specialization, department_id, status } = data;
    const result = await db.query(
      'INSERT INTO technicians (name, email, phone, specialization, department_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, specialization, department_id, status]
    );
    return result.rows[0];
  },

  // Update technician
  update: async (id, data) => {
    const { name, email, phone, specialization, department_id, status } = data;
    const result = await db.query(
      'UPDATE technicians SET name = $1, email = $2, phone = $3, specialization = $4, department_id = $5, status = $6 WHERE id = $7 RETURNING *',
      [name, email, phone, specialization, department_id, status, id]
    );
    return result.rows[0];
  },

  // Delete technician
  delete: async (id) => {
    const result = await db.query('DELETE FROM technicians WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Technician;