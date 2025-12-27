// Database sync utility for conflict resolution
const db = require('../config/database');

class DatabaseSync {
  constructor() {
    this.conflictResolvers = {
      'equipment': this.resolveEquipmentConflict,
      'maintenance_requests': this.resolveMaintenanceRequestConflict,
      'technicians': this.resolveTechnicianConflict,
      'departments': this.resolveDepartmentConflict,
      'impact_logs': this.resolveImpactLogConflict
    };
  }

  // Resolve conflicts between client and server data
  async resolveConflict(tableName, clientIdData, serverData) {
    const resolver = this.conflictResolvers[tableName];
    
    if (resolver) {
      return await resolver(clientIdData, serverData);
    } else {
      // Default conflict resolution: use the most recently updated
      const clientTime = new Date(clientIdData.updated_at || clientIdData.created_at);
      const serverTime = new Date(serverData.updated_at || serverData.created_at);
      
      return clientTime > serverTime ? clientIdData : serverData;
    }
  }

  // Resolve equipment conflicts
  async resolveEquipmentConflict(clientData, serverData) {
    // Merge fields that are different
    const resolvedData = { ...serverData };
    
    // Update fields that are different and more recent
    for (const field in clientData) {
      if (field !== 'id' && field !== 'created_at') {
        // If client data is more recent, update the field
        const clientTime = new Date(clientData.updated_at || clientData.created_at);
        const serverTime = new Date(serverData.updated_at || serverData.created_at);
        
        if (clientTime > serverTime && clientData[field] !== serverData[field]) {
          resolvedData[field] = clientData[field];
        }
      }
    }
    
    // Update the database with resolved data
    const columns = Object.keys(resolvedData).filter(col => col !== 'id');
    const values = columns.map(col => resolvedData[col]);
    values.push(resolvedData.id); // Add ID for WHERE clause
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE equipment SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;
    
    await db.query(query, values);
    
    return resolvedData;
  }

  // Resolve maintenance request conflicts
  async resolveMaintenanceRequestConflict(clientData, serverData) {
    // For maintenance requests, we prioritize status changes from the client
    const resolvedData = { ...serverData };
    
    // Check if client has a more recent status update
    const clientTime = new Date(clientData.updated_at || clientData.created_at);
    const serverTime = new Date(serverData.updated_at || serverData.created_at);
    
    if (clientTime > serverTime) {
      // Update status fields from client if they're different
      if (clientData.status && clientData.status !== serverData.status) {
        resolvedData.status = clientData.status;
      }
      
      if (clientData.assigned_technician_id !== serverData.assigned_technician_id) {
        resolvedData.assigned_technician_id = clientData.assigned_technician_id;
      }
      
      if (clientData.description !== serverData.description) {
        resolvedData.description = clientData.description;
      }
    }
    
    // Update the database with resolved data
    const columns = Object.keys(resolvedData).filter(col => col !== 'id');
    const values = columns.map(col => resolvedData[col]);
    values.push(resolvedData.id); // Add ID for WHERE clause
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE maintenance_requests SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;
    
    await db.query(query, values);
    
    return resolvedData;
  }

  // Resolve technician conflicts
  async resolveTechnicianConflict(clientData, serverData) {
    // For technicians, we merge changes but prioritize more recent updates
    const resolvedData = { ...serverData };
    
    const clientTime = new Date(clientData.updated_at || clientData.created_at);
    const serverTime = new Date(serverData.updated_at || serverData.created_at);
    
    if (clientTime > serverTime) {
      for (const field in clientData) {
        if (field !== 'id' && field !== 'created_at' && clientData[field] !== resolvedData[field]) {
          resolvedData[field] = clientData[field];
        }
      }
    }
    
    // Update the database with resolved data
    const columns = Object.keys(resolvedData).filter(col => col !== 'id');
    const values = columns.map(col => resolvedData[col]);
    values.push(resolvedData.id); // Add ID for WHERE clause
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE technicians SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;
    
    await db.query(query, values);
    
    return resolvedData;
  }

  // Resolve department conflicts
  async resolveDepartmentConflict(clientData, serverData) {
    // For departments, we use the most recently updated data
    const clientTime = new Date(clientData.updated_at || clientData.created_at);
    const serverTime = new Date(serverData.updated_at || serverData.created_at);
    
    const resolvedData = clientTime > serverTime ? { ...clientData } : { ...serverData };
    
    // Update the database with resolved data
    const columns = Object.keys(resolvedData).filter(col => col !== 'id');
    const values = columns.map(col => resolvedData[col]);
    values.push(resolvedData.id); // Add ID for WHERE clause
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE departments SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;
    
    await db.query(query, values);
    
    return resolvedData;
  }

  // Resolve impact log conflicts
  async resolveImpactLogConflict(clientData, serverData) {
    // For impact logs, we preserve the original data but update any changes
    const resolvedData = { ...serverData };
    
    const clientTime = new Date(clientData.updated_at || clientData.created_at);
    const serverTime = new Date(serverData.updated_at || serverData.created_at);
    
    if (clientTime > serverTime) {
      // Only update fields that can be modified after creation
      if (clientData.incident_description !== serverData.incident_description) {
        resolvedData.incident_description = clientData.incident_description;
      }
      
      if (clientData.cost_calculated !== serverData.cost_calculated) {
        resolvedData.cost_calculated = clientData.cost_calculated;
      }
    }
    
    // Update the database with resolved data
    const columns = Object.keys(resolvedData).filter(col => col !== 'id');
    const values = columns.map(col => resolvedData[col]);
    values.push(resolvedData.id); // Add ID for WHERE clause
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE impact_logs SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;
    
    await db.query(query, values);
    
    return resolvedData;
  }

  // Sync records with conflict detection
  async syncRecords(tableName, records, clientId) {
    const results = {
      updated: [],
      created: [],
      conflicts: [],
      errors: []
    };

    for (const record of records) {
      try {
        // Check if record exists
        const existingResult = await db.query(
          `SELECT * FROM ${tableName} WHERE id = $1`,
          [record.id]
        );

        if (existingResult.rows.length > 0) {
          // Record exists, check for conflicts
          const existingRecord = existingResult.rows[0];
          const clientTime = new Date(record.updated_at || record.created_at);
          const serverTime = new Date(existingRecord.updated_at || existingRecord.created_at);

          if (clientTime > serverTime) {
            // Client has newer data, update server
            const updatedRecord = await this.updateRecord(tableName, record);
            results.updated.push(updatedRecord);
          } else if (clientTime < serverTime) {
            // Server has newer data, check for conflicts
            const conflictResult = await this.resolveConflict(tableName, record, existingRecord);
            if (JSON.stringify(conflictResult) !== JSON.stringify(existingRecord)) {
              results.conflicts.push({
                original_server: existingRecord,
                client_version: record,
                resolved: conflictResult
              });
            }
          } else {
            // Same timestamp, no update needed
            results.updated.push(existingRecord);
          }
        } else {
          // Record doesn't exist, create it
          const createdRecord = await this.createRecord(tableName, record);
          results.created.push(createdRecord);
        }
      } catch (error) {
        results.errors.push({
          record,
          error: error.message
        });
      }
    }

    return results;
  }

  // Update a single record
  async updateRecord(tableName, record) {
    const columns = Object.keys(record).filter(col => col !== 'id');
    const values = columns.map(col => record[col]);
    values.push(record.id); // Add ID for WHERE clause

    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE ${tableName} SET ${setClause}, updated_at = $${columns.length + 1} WHERE id = $${columns.length + 2}`;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Create a new record
  async createRecord(tableName, record) {
    const columns = Object.keys(record);
    const values = columns.map(col => record[col]);

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = new DatabaseSync();