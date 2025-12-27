// MaintenanceRequest model
const db = require('../config/database');

const MaintenanceRequest = {
  // Get all maintenance requests
  findAll: async () => {
    const result = await db.query(`
      SELECT mr.*, e.name as equipment_name, t.name as technician_name 
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
      ORDER BY mr.created_at DESC
    `);
    return result.rows;
  },

  // Find maintenance request by ID
  findById: async (id) => {
    const result = await db.query(`
      SELECT mr.*, e.name as equipment_name, t.name as technician_name 
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
      WHERE mr.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Create new maintenance request
  create: async (data) => {
    const { equipment_id, title, description, priority, status, assigned_technician_id, requested_by } = data;
    const result = await db.query(
      'INSERT INTO maintenance_requests (equipment_id, title, description, priority, status, assigned_technician_id, requested_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [equipment_id, title, description, priority, status, assigned_technician_id, requested_by]
    );
    return result.rows[0];
  },

  // Update maintenance request
  update: async (id, data) => {
    const { equipment_id, title, description, priority, status, assigned_technician_id } = data;
    const result = await db.query(
      'UPDATE maintenance_requests SET equipment_id = $1, title = $2, description = $3, priority = $4, status = $5, assigned_technician_id = $6 WHERE id = $7 RETURNING *',
      [equipment_id, title, description, priority, status, assigned_technician_id, id]
    );
    return result.rows[0];
  },

  // Delete maintenance request
  delete: async (id) => {
    const result = await db.query('DELETE FROM maintenance_requests WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = MaintenanceRequest;