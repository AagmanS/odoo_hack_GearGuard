// Offline sync middleware
const db = require('../config/database');

// Handle offline sync requests
const handleOfflineSync = async (req, res, next) => {
  const { sync_data, client_timestamp } = req.body;

  // Log the sync attempt for debugging
  console.log(`Sync attempt from client at ${client_timestamp}`);

  try {
    // Process sync data based on operation type
    if (sync_data && Array.isArray(sync_data)) {
      for (const operation of sync_data) {
        await processSyncOperation(operation);
      }
    }

    // Add sync headers to response
    res.setHeader('X-Sync-Timestamp', new Date().toISOString());
    res.setHeader('X-Offline-Support', 'true');
  } catch (error) {
    console.error('Sync error:', error);
    // Continue with request even if sync fails
  }

  next();
};

// Process individual sync operation
const processSyncOperation = async (operation) => {
  const { type, table, data, operation_id } = operation;

  try {
    switch (type) {
      case 'INSERT':
        await handleInsert(table, data);
        break;
      case 'UPDATE':
        await handleUpdate(table, data);
        break;
      case 'DELETE':
        await handleDelete(table, data);
        break;
      default:
        console.warn(`Unknown sync operation type: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing sync operation ${operation_id}:`, error);
    // Log error but don't fail the entire sync
  }
};

// Handle INSERT operations
const handleInsert = async (table, data) => {
  // Build dynamic INSERT query based on table and data
  const columns = Object.keys(data);
  const values = Object.values(data);
  
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  await db.query(query, values);
};

// Handle UPDATE operations
const handleUpdate = async (table, data) => {
  const id = data.id;
  const updateData = { ...data };
  delete updateData.id;
  
  const columns = Object.keys(updateData);
  const values = Object.values(updateData);
  
  const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1}`;
  
  await db.query(query, [...values, id]);
};

// Handle DELETE operations
const handleDelete = async (table, data) => {
  const { id } = data;
  const query = `DELETE FROM ${table} WHERE id = $1`;
  
  await db.query(query, [id]);
};

module.exports = {
  handleOfflineSync,
};