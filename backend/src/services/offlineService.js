// Offline service for handling offline-first logic
const db = require('../config/database');

class OfflineService {
  constructor() {
    this.offlineData = new Map(); // In-memory storage for offline operations
  }

  // Store operation for later sync when online
  queueOperation(operation) {
    const operationId = this.generateOperationId();
    const operationData = {
      id: operationId,
      timestamp: new Date().toISOString(),
      ...operation
    };

    this.offlineData.set(operationId, operationData);
    return operationId;
  }

  // Process queued operations when connection is restored
  async processQueuedOperations() {
    const operations = Array.from(this.offlineData.values());
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        this.offlineData.delete(operation.id);
        console.log(`Successfully processed offline operation: ${operation.id}`);
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        // Keep operation in queue for retry
      }
    }
  }

  // Execute a single operation based on type
  async executeOperation(operation) {
    const { type, table, data } = operation;

    switch (type) {
      case 'INSERT':
        return await this.insertData(table, data);
      case 'UPDATE':
        return await this.updateData(table, data);
      case 'DELETE':
        return await this.deleteData(table, data);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Insert data into database
  async insertData(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Update data in database
  async updateData(table, data) {
    const id = data.id;
    const updateData = { ...data };
    delete updateData.id;
    
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  // Delete data from database
  async deleteData(table, data) {
    const { id } = data;
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get all queued operations
  getQueuedOperations() {
    return Array.from(this.offlineData.values());
  }

  // Clear all queued operations
  clearQueuedOperations() {
    this.offlineData.clear();
  }

  // Generate unique operation ID
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if there are pending operations
  hasPendingOperations() {
    return this.offlineData.size > 0;
  }
}

module.exports = new OfflineService();