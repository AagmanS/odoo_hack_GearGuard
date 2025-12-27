// Offline sync routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get offline sync data
router.get('/sync-data', async (req, res) => {
  try {
    // Return all data that needs to be synced to the client
    const equipment = await db.query('SELECT * FROM equipment ORDER BY updated_at DESC');
    const requests = await db.query('SELECT * FROM maintenance_requests ORDER BY updated_at DESC');
    const technicians = await db.query('SELECT * FROM technicians ORDER BY updated_at DESC');
    const impactLogs = await db.query('SELECT * FROM impact_logs ORDER BY updated_at DESC');

    res.json({
      equipment: equipment.rows,
      requests: requests.rows,
      technicians: technicians.rows,
      impactLogs: impactLogs.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting sync data:', error);
    res.status(500).json({ error: 'Failed to get sync data' });
  }
});

// Sync client changes to server
router.post('/sync', async (req, res) => {
  try {
    const { changes, deviceId } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes array is required' });
    }

    const results = [];

    for (const change of changes) {
      try {
        let result;
        
        switch (change.type) {
          case 'INSERT':
            result = await handleInsert(change);
            break;
          case 'UPDATE':
            result = await handleUpdate(change);
            break;
          case 'DELETE':
            result = await handleDelete(change);
            break;
          default:
            throw new Error(`Unknown change type: ${change.type}`);
        }

        results.push({
          id: change.id,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`Error processing change ${change.id}:`, error);
        results.push({
          id: change.id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during sync:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Handle INSERT operations
async function handleInsert(change) {
  const { table, data } = change;
  
  switch (table) {
    case 'equipment':
      const insertEquipmentQuery = `
        INSERT INTO equipment (name, category, department_id, status, location, purchase_date, 
                              warranty_expiry, value, criticality, production_priority, 
                              skill_dependency, safety_risk, maintenance_backlog, 
                              energy_consumption, emissions_rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`;
      
      const result = await db.query(insertEquipmentQuery, [
        data.name, data.category, data.department_id, data.status, data.location,
        data.purchase_date, data.warranty_expiry, data.value, data.criticality,
        data.production_priority, data.skill_dependency, data.safety_risk,
        data.maintenance_backlog, data.energy_consumption, data.emissions_rate
      ]);
      
      return result.rows[0];
      
    case 'maintenance_requests':
      const insertRequestQuery = `
        INSERT INTO maintenance_requests (equipment_id, title, description, priority, 
                                        status, assigned_technician_id, requested_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;
      
      const requestResult = await db.query(insertRequestQuery, [
        data.equipment_id, data.title, data.description, data.priority,
        data.status, data.assigned_technician_id, data.requested_by
      ]);
      
      return requestResult.rows[0];
      
    case 'impact_logs':
      const insertImpactQuery = `
        INSERT INTO impact_logs (equipment_id, downtime_hours, affected_employees, 
                               revenue_per_hour, incident_description, cost_calculated,
                               human_impact_score, operational_impact_score, 
                               environmental_impact_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`;
      
      const impactResult = await db.query(insertImpactQuery, [
        data.equipment_id, data.downtime_hours, data.affected_employees,
        data.revenue_per_hour, data.incident_description, data.cost_calculated,
        data.human_impact_score, data.operational_impact_score, 
        data.environmental_impact_score
      ]);
      
      return impactResult.rows[0];
      
    default:
      throw new Error(`Unsupported table for insert: ${table}`);
  }
}

// Handle UPDATE operations
async function handleUpdate(change) {
  const { table, id, data } = change;
  
  // Add updated_at timestamp
  data.updated_at = new Date().toISOString();
  
  let setClause = '';
  const values = [];
  let paramIndex = 2; // Start from 2 because $1 is the ID
  
  for (const [key, value] of Object.entries(data)) {
    setClause += `"${key}" = $${paramIndex}, `;
    values.push(value);
    paramIndex++;
  }
  
  setClause = setClause.slice(0, -2); // Remove trailing comma and space
  
  const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
  values.unshift(id); // Add ID as first parameter
  
  const result = await db.query(query, values);
  return result.rows[0];
}

// Handle DELETE operations
async function handleDelete(change) {
  const { table, id } = change;
  
  const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  
  return result.rows[0];
}

// Get sync status
router.get('/status', (req, res) => {
  res.json({
    status: 'sync_server_active',
    timestamp: new Date().toISOString(),
    capabilities: ['insert', 'update', 'delete', 'full_sync']
  });
});

// Get specific data by type and ID
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let query, result;
    
    switch (type) {
      case 'equipment':
        query = 'SELECT * FROM equipment WHERE id = $1';
        result = await db.query(query, [id]);
        break;
      case 'requests':
        query = 'SELECT * FROM maintenance_requests WHERE id = $1';
        result = await db.query(query, [id]);
        break;
      case 'technicians':
        query = 'SELECT * FROM technicians WHERE id = $1';
        result = await db.query(query, [id]);
        break;
      case 'impact':
        query = 'SELECT * FROM impact_logs WHERE id = $1';
        result = await db.query(query, [id]);
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `${type} not found` });
    }
    
    res.json({ [type.slice(0, -1)]: result.rows[0] }); // Remove 's' from type name
  } catch (error) {
    console.error('Error getting specific data:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

module.exports = router;