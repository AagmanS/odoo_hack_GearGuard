// Security service with WebAuthn biometric validation and audit trails
class SecurityService {
  constructor() {
    this.auditLog = [];
    this.cryptographicProvider = null;
  }

  // Initialize WebAuthn registration
  async registerCredential(username, displayName) {
    try {
      // Prepare challenge from server
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const { challenge } = await challengeResponse.json();
      
      // Prepare registration options
      const createCredentialOptions = {
        publicKey: {
          challenge: this.base64ToBuffer(challenge),
          rp: {
            name: 'Gear-Guard',
            id: window.location.hostname
          },
          user: {
            id: this.stringToBuffer(username),
            name: username,
            displayName: displayName
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          timeout: 60000,
          attestation: 'direct',
          authenticatorSelection: {
            requireResidentKey: false,
            userVerification: 'preferred'
          }
        }
      };
      
      // Create credential
      const credential = await navigator.credentials.create(createCredentialOptions);
      
      // Prepare response for server
      const registrationData = {
        id: credential.id,
        rawId: this.bufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: this.bufferToBase64(credential.response.attestationObject),
          clientDataJSON: this.bufferToBase64(credential.response.clientDataJSON)
        }
      };
      
      // Send to server for verification
      const verifyResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Registration failed');
      }
      
      return await verifyResponse.json();
    } catch (error) {
      this.logAuditEvent('biometric_registration_failed', { username, error: error.message });
      throw error;
    }
  }

  // Initialize WebAuthn authentication
  async authenticateCredential(username) {
    try {
      // Get challenge from server
      const challengeResponse = await fetch('/api/auth/authenticate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const { challenge } = await challengeResponse.json();
      
      // Prepare authentication options
      const getAssertionOptions = {
        publicKey: {
          challenge: this.base64ToBuffer(challenge),
          timeout: 60000,
          rpId: window.location.hostname,
          allowCredentials: [], // Server will provide allowed credentials
          userVerification: 'preferred'
        }
      };
      
      // Get assertion from authenticator
      const assertion = await navigator.credentials.get(getAssertionOptions);
      
      // Prepare response for server
      const authData = {
        id: assertion.id,
        rawId: this.bufferToBase64(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: this.bufferToBase64(assertion.response.authenticatorData),
          clientDataJSON: this.bufferToBase64(assertion.response.clientDataJSON),
          signature: this.bufferToBase64(assertion.response.signature),
          userHandle: assertion.response.userHandle ? this.bufferToBase64(assertion.response.userHandle) : null
        }
      };
      
      // Verify with server
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Authentication failed');
      }
      
      const result = await verifyResponse.json();
      
      // Log successful authentication
      this.logAuditEvent('biometric_authentication_success', { 
        username, 
        credentialId: assertion.id,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      this.logAuditEvent('biometric_authentication_failed', { 
        username, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Convert base64 string to ArrayBuffer
  base64ToBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Convert ArrayBuffer to base64 string
  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert string to ArrayBuffer
  stringToBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  // Log audit event with cryptographic hashing
  logAuditEvent(eventType, details) {
    const auditEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType,
      details,
      userId: this.getCurrentUserId(), // Would come from auth context
      ipAddress: this.getClientIP(), // Would need to be obtained differently
      userAgent: navigator.userAgent,
      hash: null // Will be calculated below
    };

    // Create cryptographic hash of the audit entry
    auditEntry.hash = this.createAuditHash(auditEntry);

    // Add to audit log
    this.auditLog.push(auditEntry);

    // Send to server for permanent storage
    this.sendAuditLogToServer(auditEntry);

    return auditEntry;
  }

  // Create cryptographic hash of audit entry
  async createAuditHash(auditEntry) {
    // Create a string representation of the audit entry
    const dataToHash = JSON.stringify({
      timestamp: auditEntry.timestamp,
      eventType: auditEntry.eventType,
      details: auditEntry.details,
      userId: auditEntry.userId
    });

    // Use SubtleCrypto API for hashing
    if (crypto && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(dataToHash);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return this.bufferToBase64(hashBuffer);
    } else {
      // Fallback to a simple hash function if crypto API is not available
      return this.simpleHash(dataToHash);
    }
  }

  // Simple hash function for fallback
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return this.bufferToBase64(new TextEncoder().encode(hash.toString()));
  }

  // Send audit log to server
  async sendAuditLogToServer(auditEntry) {
    try {
      await fetch('/api/security/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditEntry)
      });
    } catch (error) {
      console.error('Failed to send audit log to server:', error);
      // In a real implementation, you'd want to queue failed logs for later submission
    }
  }

  // Verify audit log integrity
  async verifyAuditLogIntegrity(auditLog) {
    const results = [];
    
    for (const entry of auditLog) {
      const recalculatedHash = await this.createAuditHash({
        timestamp: entry.timestamp,
        eventType: entry.eventType,
        details: entry.details,
        userId: entry.userId
      });
      
      results.push({
        id: entry.id,
        isValid: recalculatedHash === entry.hash,
        originalHash: entry.hash,
        recalculatedHash
      });
    }
    
    return results;
  }

  // Get current user ID (would come from auth context)
  getCurrentUserId() {
    // In a real implementation, this would come from the authentication context
    return localStorage.getItem('userId') || 'anonymous';
  }

  // Get client IP (would need server assistance in a real implementation)
  getClientIP() {
    // In a real implementation, this would be obtained from server headers
    return 'unknown';
  }

  // Generate unique ID
  generateId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize cryptographic provider
  async initializeCryptoProvider() {
    if (!crypto || !crypto.subtle) {
      throw new Error('Web Crypto API not supported');
    }
    
    this.cryptographicProvider = crypto.subtle;
  }

  // Encrypt sensitive data
  async encryptData(data, key) {
    if (!this.cryptographicProvider) {
      await this.initializeCryptoProvider();
    }
    
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    
    // In a real implementation, you would use the provided key for encryption
    // This is a simplified example
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // For this example, we'll just return the encoded data with IV
    // A real implementation would perform actual encryption
    return {
      encryptedData: Array.from(encodedData),
      iv: Array.from(iv)
    };
  }

  // Decrypt sensitive data
  async decryptData(encryptedData, key) {
    // A real implementation would perform actual decryption
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(new Uint8Array(encryptedData.encryptedData)));
  }

  // Generate security report
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalAuditEvents: this.auditLog.length,
      eventTypes: this.getEventTypeCounts(),
      recentEvents: this.auditLog.slice(-10), // Last 10 events
      securityScore: this.calculateSecurityScore()
    };
    
    return report;
  }

  // Get event type counts
  getEventTypeCounts() {
    const counts = {};
    
    for (const event of this.auditLog) {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    }
    
    return counts;
  }

  // Calculate security score
  calculateSecurityScore() {
    // Simple security score calculation based on audit log activity
    const totalEvents = this.auditLog.length;
    if (totalEvents === 0) return 100;
    
    const authFailures = this.auditLog.filter(
      event => event.eventType.includes('failed')
    ).length;
    
    const failureRate = authFailures / totalEvents;
    
    // Score from 0-100, where 100 is most secure
    return Math.max(0, Math.min(100, 100 - (failureRate * 100)));
  }

  // Get recent audit events
  getRecentAuditEvents(limit = 50) {
    return this.auditLog.slice(-limit).reverse();
  }
}

// Export the security service
export default new SecurityService();