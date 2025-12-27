// Security routes
const express = require('express');
const router = express.Router();
const securityService = require('../security/securityService');

// Log audit event
router.post('/audit', async (req, res) => {
  try {
    const { userId, eventType, details, ipAddress } = req.body;
    
    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId and eventType are required' });
    }
    
    const result = await securityService.logAuditEvent(userId, eventType, details, ipAddress);
    res.json(result);
  } catch (error) {
    console.error('Error logging audit event:', error);
    res.status(500).json({ error: 'Failed to log audit event' });
  }
});

// Verify audit log integrity
router.get('/audit/verify/:logId', async (req, res) => {
  try {
    const { logId } = req.params;
    
    const result = await securityService.verifyAuditLogIntegrity(logId);
    res.json(result);
  } catch (error) {
    console.error('Error verifying audit log:', error);
    res.status(500).json({ error: 'Failed to verify audit log' });
  }
});

// Get user audit trail
router.get('/audit/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await securityService.getUserAuditTrail(userId, parseInt(limit), parseInt(offset));
    res.json(result);
  } catch (error) {
    console.error('Error getting user audit trail:', error);
    res.status(500).json({ error: 'Failed to get user audit trail' });
  }
});

// Get audit trail by time period
router.get('/audit/time', async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const result = await securityService.getAuditTrailByTime(new Date(startDate), new Date(endDate), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Error getting audit trail by time:', error);
    res.status(500).json({ error: 'Failed to get audit trail by time' });
  }
});

// Get security report
router.get('/report', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await securityService.getSecurityReport(parseInt(days));
    res.json(result);
  } catch (error) {
    console.error('Error getting security report:', error);
    res.status(500).json({ error: 'Failed to get security report' });
  }
});

// Validate WebAuthn registration
router.post('/webauthn/register', async (req, res) => {
  try {
    const { userId, credentialData } = req.body;
    
    if (!userId || !credentialData) {
      return res.status(400).json({ error: 'userId and credentialData are required' });
    }
    
    const result = await securityService.validateWebAuthnRegistration(userId, credentialData);
    res.json(result);
  } catch (error) {
    console.error('Error validating WebAuthn registration:', error);
    res.status(500).json({ error: 'Failed to validate WebAuthn registration' });
  }
});

// Validate WebAuthn authentication
router.post('/webauthn/authenticate', async (req, res) => {
  try {
    const { userId, assertionData } = req.body;
    
    if (!userId || !assertionData) {
      return res.status(400).json({ error: 'userId and assertionData are required' });
    }
    
    const result = await securityService.validateWebAuthnAuthentication(userId, assertionData);
    res.json(result);
  } catch (error) {
    console.error('Error validating WebAuthn authentication:', error);
    res.status(500).json({ error: 'Failed to validate WebAuthn authentication' });
  }
});

// Detect suspicious activity for user
router.get('/suspicious/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { hours = 24 } = req.query;
    
    const result = await securityService.detectSuspiciousActivity(userId, parseInt(hours));
    res.json(result);
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    res.status(500).json({ error: 'Failed to detect suspicious activity' });
  }
});

module.exports = router;