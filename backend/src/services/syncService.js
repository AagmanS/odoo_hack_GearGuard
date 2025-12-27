// Sync service for data synchronization
const db = require('../config/database');

class SyncService {
  constructor() {
    this.lastSyncTimestamp = new Map(); // Track last sync time per client
  }

  // Sync data from client to server
  async syncFromClient(clientId, syncData) {
    const results = {
      successful: [],
      failed: [],
      conflicts: []
    };

    // Track this sync operation
    this.lastSyncTimestamp.set(clientId, new Date().toISOString());

    for (const operation of syncData) {
      try {
        const result = await this.processSyncOperation(operation, clientId);
        results.successful.push(result);
      } catch (error) {
        // Check if it's a conflict
        if (this.isConflictError(error)) {
          results.conflicts.push({
            operation,
            error: error.message
          });
        } else {
          results.failed.push({
            operation,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  // Process individual sync operation
  async processSyncOperation(operation, clientId) {
    const { type, table, data, timestamp, operationId } = operation;

    // Check for conflicts by comparing timestamps
    const conflictCheck = await this.checkForConflicts(table, data.id, timestamp);
    
    if (conflictCheck.hasConflict) {
      throw new Error(`Conflict detected for ${table} ID ${data.id}: server has newer data`);
    }

    switch (type) {
      case 'INSERT':
        return await this.handleInsert(table, data, clientId);
      case 'UPDATE':
        return await this.handleUpdate(table, data, clientId);
      case 'DELETE':
        return await this.handleDelete(table, data, clientId);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Handle INSERT operations
  async handleInsert(table, data, clientId) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await db.query(query, values);
    
    return {
      operation: 'INSERT',
      table,
      id: result.rows[0].id,
      success: true,
      data: result.rows[0]
    };
  }

  // Handle UPDATE operations
  async handleUpdate(table, data, clientId) {
    const id = data.id;
    const updateData = { ...data };
    delete updateData.id;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    
    const result = await db.query(query, [...values, id]);
    
    return {
      operation: 'UPDATE',
      table,
      id: result.rows[0].id,
      success: true,
      data: result.rows[0]
    };
  }

  // Handle DELETE operations
  async handleDelete(table, data, clientId) {
    const { id } = data;
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    
    const result = await db.query(query, [id]);
    
    return {
      operation: 'DELETE',
      table,
      id,
      success: result.rows.length > 0,
      data: result.rows[0]
    };
  }

  // Check for conflicts based on timestamps
  async checkForConflicts(table, recordId, clientTimestamp) {
    if (!recordId) {
      return { hasConflict: false };
    }

    try {
      const query = `SELECT updated_at FROM ${table} WHERE id = $1`;
      const result = await db.query(query, [recordId]);
      
      if (result.rows.length === 0) {
        return { hasConflict: false }; // Record doesn't exist yet
      }

      const serverTimestamp = new Date(result.rows[0].updated_at).getTime();
      const clientTime = new Date(clientTimestamp).getTime();

      // If server timestamp is newer, there's a conflict
      return {
        hasConflict: serverTimestamp > clientTime,
        serverTimestamp: result.rows[0].updated_at,
        clientTimestamp
      };
    } catch (error) {
      console.error('Conflict check error:', error);
      return { hasConflict: false }; // Default to no conflict if check fails
    }
  }

  // Determine if error is a conflict error
  isConflictError(error) {
    return error.message.includes('Conflict detected');
  }

  // Get data to sync to client
  async getSyncDataForClient(clientId, lastSyncTime) {
    // Get all records modified since last sync
    const tablesToSync = ['equipment', 'maintenance_requests', 'technicians', 'departments', 'impact_logs'];
    const syncData = {};

    for (const table of tablesToSync) {
      const query = `
        SELECT * FROM ${table} 
        WHERE updated_at > $1 OR created_at > $1
        ORDER BY updated_at DESC
      `;
      const result = await db.query(query, [lastSyncTime]);
      syncData[table] = result.rows;
    }

    return {
      timestamp: new Date().toISOString(),
      data: syncData,
      clientId
    };
  }

  // Get last sync timestamp for a client
  getLastSyncTimestamp(clientId) {
    return this.lastSyncTimestamp.get(clientId) || null;
  }

  // Clear sync data for a client
  clearClientSyncData(clientId) {
    this.lastSyncTimestamp.delete(clientId);
  }
}

module.exports = new SyncService();