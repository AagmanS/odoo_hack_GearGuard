// ImpactLog model
const db = require('../config/database');

const ImpactLog = {
  // Get all impact logs
  findAll: async () => {
    const result = await db.query(`
      SELECT il.*, e.name as equipment_name 
      FROM impact_logs il
      LEFT JOIN equipment e ON il.equipment_id = e.id
      ORDER BY il.created_at DESC
    `);
    return result.rows;
  },

  // Find impact log by ID
  findById: async (id) => {
    const result = await db.query(`
      SELECT il.*, e.name as equipment_name 
      FROM impact_logs il
      LEFT JOIN equipment e ON il.equipment_id = e.id
      WHERE il.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Create new impact log
  create: async (data) => {
    const { equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated } = data;
    const result = await db.query(
      'INSERT INTO impact_logs (equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated]
    );
    return result.rows[0];
  },

  // Update impact log
  update: async (id, data) => {
    const { equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated } = data;
    const result = await db.query(
      'UPDATE impact_logs SET equipment_id = $1, downtime_hours = $2, affected_employees = $3, revenue_per_hour = $4, incident_description = $5, cost_calculated = $6 WHERE id = $7 RETURNING *',
      [equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated, id]
    );
    return result.rows[0];
  },

  // Delete impact log
  delete: async (id) => {
    const result = await db.query('DELETE FROM impact_logs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = ImpactLog;