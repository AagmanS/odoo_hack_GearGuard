// Security service with audit trails and validation
const db = require('../config/database');
const crypto = require('crypto');

class SecurityService {
  constructor() {
    this.auditLog = [];
  }

  // Log audit event with cryptographic hash
  async logAuditEvent(userId, eventType, details, ipAddress = null) {
    try {
      const auditEntry = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        user_id: userId,
        event_type: eventType,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ip_address: ipAddress,
        user_agent: details.userAgent || null,
        session_id: details.sessionId || null
      };

      // Create cryptographic hash of the audit entry
      auditEntry.hash = await this.createAuditHash(auditEntry);

      // Insert into database
      const query = `
        INSERT INTO audit_logs (
          id, timestamp, user_id, event_type, details, ip_address, 
          user_agent, session_id, hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      await db.query(query, [
        auditEntry.id,
        auditEntry.timestamp,
        auditEntry.user_id,
        auditEntry.event_type,
        auditEntry.details,
        auditEntry.ip_address,
        auditEntry.user_agent,
        auditEntry.session_id,
        auditEntry.hash
      ]);

      return auditEntry;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  // Create cryptographic hash of audit entry
  async createAuditHash(auditEntry) {
    // Create a string representation of the audit entry
    const dataToHash = JSON.stringify({
      timestamp: auditEntry.timestamp,
      user_id: auditEntry.user_id,
      event_type: auditEntry.event_type,
      details: auditEntry.details
    });

    // Use crypto module to create SHA-256 hash
    return crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex');
  }

  // Verify audit log integrity
  async verifyAuditLogIntegrity(logId) {
    try {
      // Get audit log from database
      const query = 'SELECT * FROM audit_logs WHERE id = $1';
      const result = await db.query(query, [logId]);

      if (result.rows.length === 0) {
        throw new Error('Audit log not found');
      }

      const auditLog = result.rows[0];

      // Recreate hash
      const dataToHash = JSON.stringify({
        timestamp: auditLog.timestamp,
        user_id: auditLog.user_id,
        event_type: auditLog.event_type,
        details: auditLog.details
      });

      const recalculatedHash = crypto
        .createHash('sha256')
        .update(dataToHash)
        .digest('hex');

      return {
        id: auditLog.id,
        is_valid: recalculatedHash === auditLog.hash,
        original_hash: auditLog.hash,
        recalculated_hash: recalculatedHash
      };
    } catch (error) {
      console.error('Error verifying audit log integrity:', error);
      throw error;
    }
  }

  // Get audit trail for a specific user
  async getUserAuditTrail(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE user_id = $1 
        ORDER BY timestamp DESC 
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [userId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user audit trail:', error);
      throw error;
    }
  }

  // Get audit trail for a specific time period
  async getAuditTrailByTime(startDate, endDate, limit = 100) {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE timestamp BETWEEN $1 AND $2
        ORDER BY timestamp DESC 
        LIMIT $3
      `;

      const result = await db.query(query, [startDate, endDate, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting audit trail by time:', error);
      throw error;
    }
  }

  // Get security report
  async getSecurityReport(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    try {
      // Get total events
      const totalEventsQuery = `
        SELECT COUNT(*) as total 
        FROM audit_logs 
        WHERE timestamp BETWEEN $1 AND $2
      `;
      const totalEventsResult = await db.query(totalEventsQuery, [startDate, endDate]);
      const totalEvents = parseInt(totalEventsResult.rows[0].total);

      // Get event type counts
      const eventTypeQuery = `
        SELECT event_type, COUNT(*) as count
        FROM audit_logs 
        WHERE timestamp BETWEEN $1 AND $2
        GROUP BY event_type
        ORDER BY count DESC
      `;
      const eventTypeResult = await db.query(eventTypeQuery, [startDate, endDate]);
      const eventTypes = eventTypeResult.rows;

      // Get authentication failure counts
      const authFailuresQuery = `
        SELECT COUNT(*) as count
        FROM audit_logs 
        WHERE timestamp BETWEEN $1 AND $2
        AND (event_type ILIKE '%failed%' OR event_type ILIKE '%error%')
      `;
      const authFailuresResult = await db.query(authFailuresQuery, [startDate, endDate]);
      const authFailures = parseInt(authFailuresResult.rows[0].count);

      // Calculate security score
      const failureRate = totalEvents > 0 ? authFailures / totalEvents : 0;
      const securityScore = Math.max(0, Math.min(100, Math.round((1 - failureRate) * 100)));

      return {
        period: { start: startDate.toISOString(), end: endDate.toISOString() },
        total_events: totalEvents,
        event_type_counts: eventTypes,
        authentication_failures: authFailures,
        failure_rate: parseFloat(failureRate.toFixed(4)),
        security_score: securityScore,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting security report:', error);
      throw error;
    }
  }

  // Validate WebAuthn registration
  async validateWebAuthnRegistration(userId, credentialData) {
    try {
      // Log the registration attempt
      await this.logAuditEvent(
        userId,
        'webauthn_registration_attempt',
        { credentialId: credentialData.id, status: 'attempted' }
      );

      // In a real implementation, you would verify the attestation object
      // and register the credential with the user account
      const registrationRecord = {
        user_id: userId,
        credential_id: credentialData.id,
        public_key: credentialData.publicKey,
        sign_count: credentialData.signCount,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      // Store the credential in the database
      const query = `
        INSERT INTO user_credentials (
          user_id, credential_id, public_key, sign_count, created_at, last_used
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await db.query(query, [
        registrationRecord.user_id,
        registrationRecord.credential_id,
        registrationRecord.public_key,
        registrationRecord.sign_count,
        registrationRecord.created_at,
        registrationRecord.last_used
      ]);

      // Log successful registration
      await this.logAuditEvent(
        userId,
        'webauthn_registration_success',
        { credentialId: credentialData.id, status: 'registered' }
      );

      return {
        success: true,
        credentialId: credentialData.id,
        message: 'WebAuthn credential registered successfully'
      };
    } catch (error) {
      // Log failed registration
      await this.logAuditEvent(
        userId,
        'webauthn_registration_failed',
        { 
          error: error.message, 
          credentialId: credentialData?.id,
          status: 'failed' 
        }
      );

      throw error;
    }
  }

  // Validate WebAuthn authentication
  async validateWebAuthnAuthentication(userId, assertionData) {
    try {
      // Log the authentication attempt
      await this.logAuditEvent(
        userId,
        'webauthn_authentication_attempt',
        { credentialId: assertionData.id, status: 'attempted' }
      );

      // Get stored credential for this user
      const credentialQuery = `
        SELECT * FROM user_credentials 
        WHERE user_id = $1 AND credential_id = $2
      `;
      const credentialResult = await db.query(credentialQuery, [userId, assertionData.id]);

      if (credentialResult.rows.length === 0) {
        throw new Error('Credential not found for user');
      }

      const storedCredential = credentialResult.rows[0];

      // In a real implementation, you would verify the signature
      // and update the credential's sign count
      const newSignCount = assertionData.signCount || storedCredential.sign_count + 1;

      // Update the credential's last used timestamp and sign count
      const updateQuery = `
        UPDATE user_credentials 
        SET last_used = $1, sign_count = $2 
        WHERE user_id = $3 AND credential_id = $4
      `;
      await db.query(updateQuery, [
        new Date().toISOString(),
        newSignCount,
        userId,
        assertionData.id
      ]);

      // Log successful authentication
      await this.logAuditEvent(
        userId,
        'webauthn_authentication_success',
        { 
          credentialId: assertionData.id, 
          status: 'authenticated',
          signCount: newSignCount
        }
      );

      return {
        success: true,
        credentialId: assertionData.id,
        signCount: newSignCount,
        message: 'WebAuthn authentication successful'
      };
    } catch (error) {
      // Log failed authentication
      await this.logAuditEvent(
        userId,
        'webauthn_authentication_failed',
        { 
          error: error.message, 
          credentialId: assertionData?.id,
          status: 'failed' 
        }
      );

      throw error;
    }
  }

  // Generate unique ID
  generateId() {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  // Check for suspicious activities
  async detectSuspiciousActivity(userId, hours = 24) {
    const checkTime = new Date();
    checkTime.setHours(checkTime.getHours() - hours);

    try {
      // Check for multiple failed login attempts
      const failedLoginsQuery = `
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE user_id = $1
          AND event_type ILIKE '%failed%'
          AND timestamp > $2
      `;
      const failedLoginsResult = await db.query(failedLoginsQuery, [userId, checkTime]);
      const failedLoginCount = parseInt(failedLoginsResult.rows[0].count);

      // Check for unusual access patterns
      const unusualAccessQuery = `
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE user_id = $1
          AND EXTRACT(HOUR FROM timestamp) NOT BETWEEN 6 AND 22  -- Outside normal hours
          AND timestamp > $2
      `;
      const unusualAccessResult = await db.query(unusualAccessQuery, [userId, checkTime]);
      const unusualAccessCount = parseInt(unusualAccessResult.rows[0].count);

      // Check for access from multiple IP addresses
      const ipAddressesQuery = `
        SELECT COUNT(DISTINCT ip_address) as count
        FROM audit_logs
        WHERE user_id = $1
          AND ip_address IS NOT NULL
          AND timestamp > $2
      `;
      const ipAddressesResult = await db.query(ipAddressesQuery, [userId, checkTime]);
      const ipAddressesCount = parseInt(ipAddressesResult.rows[0].count);

      return {
        user_id: userId,
        period_hours: hours,
        failed_login_attempts: failedLoginCount,
        unusual_hour_accesses: unusualAccessCount,
        distinct_ip_addresses: ipAddressesCount,
        risk_level: this.calculateRiskLevel(failedLoginCount, unusualAccessCount, ipAddressesCount),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      throw error;
    }
  }

  // Calculate risk level based on activity indicators
  calculateRiskLevel(failedLogins, unusualAccess, ipAddresses) {
    let riskScore = 0;

    // Failed login attempts contribute significantly to risk
    riskScore += Math.min(failedLogins * 10, 50);

    // Unusual hour access
    riskScore += unusualAccess * 5;

    // Multiple IP addresses (if more than 2)
    if (ipAddresses > 2) {
      riskScore += (ipAddresses - 2) * 15;
    }

    if (riskScore >= 70) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = new SecurityService();