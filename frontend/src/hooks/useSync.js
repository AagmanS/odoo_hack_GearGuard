import { useState, useEffect } from 'react';
import syncManager from '../services/syncManager';

const useSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    queuedOperations: 0
  });

  useEffect(() => {
    // Update sync status initially
    updateSyncStatus();

    // Set up interval to periodically update status
    const statusInterval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

    // Listen for online/offline events
    const handleOnline = () => updateSyncStatus();
    const handleOffline = () => updateSyncStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateSyncStatus = async () => {
    // For now, we'll just update the online status
    // In a real implementation, we would get more detailed sync status
    setSyncStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isSyncing: syncManager.isSyncing
    }));
  };

  const forceSync = async () => {
    if (navigator.onLine) {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      try {
        await syncManager.performSync();
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date().toISOString()
        }));
      } catch (error) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        throw error;
      }
    }
  };

  return {
    ...syncStatus,
    forceSync
  };
};

export default useSync;