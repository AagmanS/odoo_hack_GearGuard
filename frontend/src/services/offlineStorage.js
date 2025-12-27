// Offline storage service using IndexedDB
class OfflineStorage {
  constructor() {
    this.dbName = 'GearGuardDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('name', 'name', { unique: false });
          equipmentStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('requests')) {
          const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
          requestStore.createIndex('equipment_id', 'equipment_id', { unique: false });
          requestStore.createIndex('status', 'status', { unique: false });
          requestStore.createIndex('priority', 'priority', { unique: false });
        }

        if (!db.objectStoreNames.contains('technicians')) {
          const technicianStore = db.createObjectStore('technicians', { keyPath: 'id' });
          technicianStore.createIndex('name', 'name', { unique: false });
          technicianStore.createIndex('department_id', 'department_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('impact_logs')) {
          const impactStore = db.createObjectStore('impact_logs', { keyPath: 'id' });
          impactStore.createIndex('equipment_id', 'equipment_id', { unique: false });
          impactStore.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('table', 'table', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('IndexedDB object stores created');
      };
    });
  }

  // Generic method to add/update data
  async putData(storeName, data) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data by ID
  async getDataById(storeName, id) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data from a store
  async getAllData(storeName) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data by ID
  async deleteData(storeName, id) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Equipment methods
  async saveEquipment(equipment) {
    return this.putData('equipment', equipment);
  }

  async getEquipment() {
    return this.getAllData('equipment');
  }

  async getEquipmentById(id) {
    return this.getDataById('equipment', id);
  }

  async deleteEquipment(id) {
    return this.deleteData('equipment', id);
  }

  // Request methods
  async saveRequest(request) {
    return this.putData('requests', request);
  }

  async getRequests() {
    return this.getAllData('requests');
  }

  async getRequestById(id) {
    return this.getDataById('requests', id);
  }

  async deleteRequest(id) {
    return this.deleteData('requests', id);
  }

  // Technician methods
  async saveTechnician(technician) {
    return this.putData('technicians', technician);
  }

  async getTechnicians() {
    return this.getAllData('technicians');
  }

  async getTechnicianById(id) {
    return this.getDataById('technicians', id);
  }

  async deleteTechnician(id) {
    return this.deleteData('technicians', id);
  }

  // Impact log methods
  async saveImpactLog(impactLog) {
    return this.putData('impact_logs', impactLog);
  }

  async getImpactLogs() {
    return this.getAllData('impact_logs');
  }

  async getImpactLogById(id) {
    return this.getDataById('impact_logs', id);
  }

  async deleteImpactLog(id) {
    return this.deleteData('impact_logs', id);
  }

  // Sync queue methods
  async queueSyncOperation(operation) {
    // Add timestamp and unique ID to operation
    const syncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return this.putData('sync_queue', syncOperation);
  }

  async getSyncQueue() {
    return this.getAllData('sync_queue');
  }

  async removeSyncOperation(id) {
    return this.deleteData('sync_queue', id);
  }

  async clearSyncQueue() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data (for reset purposes)
  async clearAllData() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([
        'equipment', 
        'requests', 
        'technicians', 
        'impact_logs', 
        'sync_queue'
      ], 'readwrite');
      
      const stores = ['equipment', 'requests', 'technicians', 'impact_logs', 'sync_queue'];
      let completed = 0;
      let errors = [];

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            resolve();
          }
        };

        request.onerror = () => {
          errors.push(request.error);
          completed++;
          if (completed === stores.length) {
            if (errors.length > 0) {
              reject(errors);
            } else {
              resolve();
            }
          }
        };
      });
    });
  }
}

export default new OfflineStorage();