# Security and Audit Documentation

This document outlines the security features and audit trail system implemented in Gear-Guard.

## WebAuthn Biometric Validation

Gear-Guard implements WebAuthn for secure authentication with biometric validation. This provides:

- Passwordless authentication using hardware security keys
- Biometric verification (fingerprint, face recognition, etc.)
- Cryptographic proof of user identity
- Protection against phishing attacks

### Implementation

The WebAuthn system is implemented in both frontend and backend:

- Frontend: `frontend/src/services/security/securityService.js`
- Backend: `backend/src/security/securityService.js`

## Immutable Audit Trails

All user actions are logged with cryptographic hashing to ensure integrity:

- Every action is timestamped and associated with a user
- SHA-256 hashing ensures log integrity
- Audit logs cannot be modified without detection
- Complete trail of all system interactions

### Audit Log Structure

Each audit entry contains:

- Unique ID
- Timestamp
- User ID
- Event type
- Details (JSON format)
- IP address
- User agent
- Session ID
- Cryptographic hash

### Security Features

- **Cryptographic Hashing**: Each log entry is hashed using SHA-256
- **Integrity Verification**: Can verify log integrity by recalculating hashes
- **Suspicious Activity Detection**: Monitors for unusual access patterns
- **Access Controls**: Role-based permissions for audit log access

## API Endpoints

### Security Routes

- `POST /api/security/audit` - Log audit event
- `GET /api/security/audit/verify/:logId` - Verify audit log integrity
- `GET /api/security/audit/user/:userId` - Get user audit trail
- `GET /api/security/audit/time` - Get audit trail by time period
- `GET /api/security/report` - Get security report
- `POST /api/security/webauthn/register` - Register WebAuthn credential
- `POST /api/security/webauthn/authenticate` - Authenticate with WebAuthn
- `GET /api/security/suspicious/:userId` - Detect suspicious activity

## Database Schema

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES technicians(id),
  event_type VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  hash VARCHAR(64) NOT NULL -- SHA-256 hash for integrity
);
```

### User Credentials Table

```sql
CREATE TABLE user_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES technicians(id),
  credential_id VARCHAR(255) UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  sign_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, credential_id)
);
```

## Security Reports

The system generates comprehensive security reports including:

- Total audit events in time period
- Event type distribution
- Authentication failure counts
- Security score (0-100)
- Suspicious activity detection