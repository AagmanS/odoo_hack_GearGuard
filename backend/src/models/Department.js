// Department model
const db = require('../config/database');

const Department = {
  // Get all departments
  findAll: async () => {
    const result = await db.query('SELECT * FROM departments ORDER BY created_at DESC');
    return result.rows;
  },

  // Find department by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create new department
  create: async (data) => {
    const { name, description, manager_id } = data;
    const result = await db.query(
      'INSERT INTO departments (name, description, manager_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, manager_id]
    );
    return result.rows[0];
  },

  // Update department
  update: async (id, data) => {
    const { name, description, manager_id } = data;
    const result = await db.query(
      'UPDATE departments SET name = $1, description = $2, manager_id = $3 WHERE id = $4 RETURNING *',
      [name, description, manager_id, id]
    );
    return result.rows[0];
  },

  // Delete department
  delete: async (id) => {
    const result = await db.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Department;