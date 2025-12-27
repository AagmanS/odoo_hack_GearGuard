// Sync manager for frontend sync logic
import api from './api';
import offlineStorage from './offlineStorage';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.syncIntervalTime = 30000; // 30 seconds
  }

  // Initialize sync manager
  init() {
    // Start periodic sync if online
    this.startPeriodicSync();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  // Handle online event
  handleOnline = async () => {
    console.log('Device is online, starting sync...');
    await this.performSync();
  }

  // Handle offline event
  handleOffline = () => {
    console.log('Device is offline, working in offline mode...');
  }

  // Start periodic sync
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        await this.performSync();
      }
    }, this.syncIntervalTime);
  }

  // Perform sync operation
  async performSync() {
    if (this.isSyncing) {
      return; // Already syncing
    }

    this.isSyncing = true;
    console.log('Starting sync operation...');

    try {
      // Sync data from server to client
      await this.syncFromServer();
      
      // Sync queued operations to server
      await this.syncToServer();
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync data from server to client
  async syncFromServer() {
    try {
      // Get latest data from server
      const [equipment, requests, technicians, impactLogs] = await Promise.all([
        api.getEquipment(),
        api.getRequests(),
        api.getTechnicians(),
        api.getImpactLogs()
      ]);

      // Update local storage with server data
      for (const item of equipment) {
        await offlineStorage.saveEquipment(item);
      }

      for (const item of requests) {
        await offlineStorage.saveRequest(item);
      }

      for (const item of technicians) {
        await offlineStorage.saveTechnician(item);
      }

      for (const item of impactLogs) {
        await offlineStorage.saveImpactLog(item);
      }

      console.log('Data synced from server to client');
    } catch (error) {
      console.error('Error syncing from server:', error);
      throw error;
    }
  }

  // Sync queued operations to server
  async syncToServer() {
    try {
      // Get queued operations from offline storage
      const queuedOperations = await offlineStorage.getSyncQueue();
      
      if (queuedOperations.length === 0) {
        console.log('No queued operations to sync');
        return;
      }

      console.log(`Syncing ${queuedOperations.length} queued operations to server`);

      // Process each queued operation
      for (const operation of queuedOperations) {
        try {
          await this.executeOperation(operation);
          // Remove successful operation from queue
          await offlineStorage.removeSyncOperation(operation.id);
          console.log(`Successfully synced operation: ${operation.id}`);
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          // Keep failed operation in queue for retry
        }
      }
    } catch (error) {
      console.error('Error syncing to server:', error);
      throw error;
    }
  }

  // Execute a single operation
  async executeOperation(operation) {
    const { type, table, data } = operation;

    switch (type) {
      case 'CREATE':
        return await this.createRemote(table, data);
      case 'UPDATE':
        return await this.updateRemote(table, data);
      case 'DELETE':
        return await this.deleteRemote(table, data);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Create operation on remote server
  async createRemote(table, data) {
    switch (table) {
      case 'equipment':
        return await api.createEquipment(data);
      case 'requests':
        return await api.createRequest(data);
      case 'technicians':
        return await api.createTechnician(data);
      case 'impact_logs':
        return await api.createImpactLog(data);
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  // Update operation on remote server
  async updateRemote(table, data) {
    const id = data.id;
    const updateData = { ...data };
    delete updateData.id;

    switch (table) {
      case 'equipment':
        return await api.updateEquipment(id, updateData);
      case 'requests':
        return await api.updateRequest(id, updateData);
      case 'technicians':
        return await api.updateTechnician(id, updateData);
      case 'impact_logs':
        return await api.updateImpactLog(id, updateData);
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  // Delete operation on remote server
  async deleteRemote(table, data) {
    const id = data.id;

    switch (table) {
      case 'equipment':
        return await api.deleteEquipment(id);
      case 'requests':
        return await api.deleteRequest(id);
      case 'technicians':
        return await api.deleteTechnician(id);
      case 'impact_logs':
        return await api.deleteImpactLog(id);
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  // Queue an operation for later sync
  async queueOperation(type, table, data) {
    const operation = {
      type,
      table,
      data,
      timestamp: new Date().toISOString()
    };

    await offlineStorage.queueSyncOperation(operation);
    console.log(`Queued operation: ${type} ${table}`, operation);

    // Try to sync immediately if online
    if (navigator.onLine && !this.isSyncing) {
      await this.performSync();
    }
  }

  // Check if device is online
  isOnline() {
    return navigator.onLine;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      queuedOperations: offlineStorage.getSyncQueue ? 'pending' : 'unknown' // We'll implement this properly below
    };
  }

  // Cleanup method to remove event listeners
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Export a single instance
export default new SyncManager();