// Impact controller
const db = require('../config/database');
const { calculateDowntimeCost } = require('../utils/costCalculator');

// Get all impact logs
const getAllImpactLogs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT il.*, e.name as equipment_name 
      FROM impact_logs il
      LEFT JOIN equipment e ON il.equipment_id = e.id
      ORDER BY il.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get impact log by ID
const getImpactLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT il.*, e.name as equipment_name 
      FROM impact_logs il
      LEFT JOIN equipment e ON il.equipment_id = e.id
      WHERE il.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impact log not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new impact log
const createImpactLog = async (req, res) => {
  try {
    const { equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated } = req.body;
    
    // Calculate cost if not provided
    const calculated_cost = cost_calculated || calculateDowntimeCost(downtime_hours, affected_employees, revenue_per_hour);
    
    const result = await db.query(
      'INSERT INTO impact_logs (equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, calculated_cost]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update impact log
const updateImpactLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated } = req.body;
    
    const result = await db.query(
      'UPDATE impact_logs SET equipment_id = $1, downtime_hours = $2, affected_employees = $3, revenue_per_hour = $4, incident_description = $5, cost_calculated = $6 WHERE id = $7 RETURNING *',
      [equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impact log not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete impact log
const deleteImpactLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM impact_logs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impact log not found' });
    }
    
    res.json({ message: 'Impact log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate downtime cost
const calculateDowntimeImpact = async (req, res) => {
  try {
    const { downtime_hours, affected_employees, revenue_per_hour } = req.body;
    
    const cost = calculateDowntimeCost(downtime_hours, affected_employees, revenue_per_hour);
    
    res.json({ 
      downtime_hours,
      affected_employees,
      revenue_per_hour,
      total_cost: cost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllImpactLogs,
  getImpactLogById,
  createImpactLog,
  updateImpactLog,
  deleteImpactLog,
  calculateDowntimeImpact,
};