# Offline Sync System Documentation

## Overview
The Gear-Guard application implements an offline-first approach with automatic synchronization when connectivity is restored. This system allows users to continue working with the application even when offline, with changes automatically syncing when the connection is restored.

## Architecture

### Frontend Components
- **OfflineStorage Service**: Uses IndexedDB to store data locally
- **SyncManager Service**: Handles synchronization logic
- **useOffline Hook**: Provides offline status to components
- **useSync Hook**: Provides synchronization status and controls

### Backend Components
- **OfflineSync Middleware**: Handles sync requests from frontend
- **OfflineService**: Manages offline operations queue
- **SyncService**: Processes synchronization operations
- **DatabaseSync Utility**: Handles conflict resolution

## Data Storage

### IndexedDB Object Stores
The offline storage creates the following object stores:

1. **equipment**: Stores equipment records
2. **requests**: Stores maintenance request records
3. **technicians**: Stores technician records
4. **impact_logs**: Stores impact log records
5. **sync_queue**: Stores operations pending sync

### Sync Queue
When offline, operations are queued with the following structure:
```json
{
  "id": "sync_unique_id",
  "type": "CREATE|UPDATE|DELETE",
  "table": "equipment|requests|technicians|impact_logs",
  "data": { ... },
  "timestamp": "ISO timestamp"
}
```

## Synchronization Process

### Sync from Server to Client
When connectivity is restored:
1. The SyncManager fetches the latest data from the server
2. Updates the local IndexedDB storage
3. Applies any pending operations from the queue

### Sync from Client to Server
When connectivity is restored:
1. The SyncManager processes operations in the sync queue
2. Sends each operation to the server API
3. Removes successful operations from the queue
4. Keeps failed operations for retry

## Conflict Resolution

The system handles conflicts using a timestamp-based approach:
- Server data is considered authoritative
- Client changes are applied only if they are more recent than server data
- Conflicts are logged for manual review when necessary

### Conflict Detection
The system compares timestamps when processing updates:
- If client timestamp > server timestamp: client data is applied
- If server timestamp > client timestamp: conflict detected
- If timestamps are equal: no conflict, no update needed

## Offline Operations

### Supported Operations
- Create new equipment, requests, technicians, and impact logs
- Update existing records
- Delete records

### Limitations
- Complex queries may not be available offline
- Some calculations may require server-side processing
- Real-time collaboration features are not available offline

## Event Handling

### Online/Offline Detection
The system listens for browser online/offline events:
- `online` event: Triggers synchronization
- `offline` event: Switches to offline mode

### Sync Status
Components can access sync status through the `useSync` hook:
```javascript
const {
  isOnline,
  isSyncing,
  lastSync,
  queuedOperations,
  forceSync
} = useSync();
```

## Implementation Details

### Frontend Services

#### OfflineStorage Service
- Initializes IndexedDB with required object stores
- Provides CRUD operations for each entity type
- Manages the sync queue

#### SyncManager Service
- Periodically checks for connectivity
- Coordinates sync operations
- Handles error recovery and retry logic

### Backend Services

#### OfflineSync Middleware
- Processes sync requests from the frontend
- Validates operation data
- Logs sync attempts for debugging

#### SyncService
- Implements the synchronization logic
- Manages conflict resolution
- Tracks sync history

## Error Handling

### Network Errors
- Failed sync operations remain in the queue
- Automatic retry with exponential backoff
- User notification of sync failures

### Data Conflicts
- Conflicts are logged for review
- User notification of potential conflicts
- Manual resolution interface when needed

## Performance Considerations

### Sync Frequency
- Automatic sync every 30 seconds when online
- Immediate sync when coming online
- Configurable sync intervals for different data types

### Data Size Limits
- Limits on individual record sizes
- Batch processing for large datasets
- Efficient data compression where possible

## Security Considerations

### Data Encryption
- Sensitive data encrypted in local storage
- Secure transmission during sync
- Authentication required for sync operations

### Access Control
- Only authenticated users can sync data
- Role-based access to different data types
- Audit trail for all sync operations