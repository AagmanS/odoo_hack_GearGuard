// Authentication routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Import security service for WebAuthn
const securityService = require('../security/securityService');

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get authentication challenge for WebAuthn
router.post('/challenge', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Generate a random challenge
    const crypto = require('crypto');
    const challenge = crypto.randomBytes(32).toString('base64');
    
    // For now, we'll store challenge in memory (in a real app, use Redis or database)
    // We'll just return the challenge directly
    res.json({ challenge });
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
});

// Register WebAuthn credential
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const credentialData = req.body;
    
    // Validate and register the credential using security service
    const result = await securityService.validateWebAuthnRegistration(userId, credentialData);
    res.json(result);
  } catch (error) {
    console.error('Error registering credential:', error);
    res.status(500).json({ error: 'Failed to register credential' });
  }
});

// Get authentication challenge for existing credential
router.post('/authenticate-challenge', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Find user by username
    const userQuery = 'SELECT id FROM technicians WHERE email = $1';
    const userResult = await db.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate a random challenge
    const crypto = require('crypto');
    const challenge = crypto.randomBytes(32).toString('base64');
    
    // For now, we'll return the challenge directly
    // In a real implementation, you'd store it securely with expiration
    res.json({ challenge, userId: userResult.rows[0].id });
  } catch (error) {
    console.error('Error generating auth challenge:', error);
    res.status(500).json({ error: 'Failed to generate authentication challenge' });
  }
});

// Verify WebAuthn assertion
router.post('/verify', async (req, res) => {
  try {
    const { userId, assertionData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Verify the assertion using security service
    const result = await securityService.validateWebAuthnAuthentication(userId, assertionData);
    
    if (result.success) {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );
      
      res.json({ 
        success: true, 
        token,
        message: 'Authentication successful',
        user: { id: userId }
      });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error verifying assertion:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
});

// Traditional login (fallback)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const userQuery = 'SELECT * FROM technicians WHERE email = $1';
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;

    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const insertQuery = `
      INSERT INTO technicians (name, email, password, department_id, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id, name, email, department_id, status, created_at
    `;
    const result = await db.query(insertQuery, [name, email, hashedPassword, department_id]);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userQuery = 'SELECT id, name, email, department_id, status FROM technicians WHERE id = $1';
    const result = await db.query(userQuery, [req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;