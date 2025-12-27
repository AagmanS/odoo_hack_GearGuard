const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const equipmentRoutes = require('./src/routes/equipmentRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const technicianRoutes = require('./src/routes/technicianRoutes');
const impactRoutes = require('./src/routes/impactRoutes');
const authRoutes = require('./src/routes/authRoutes');
const offlineRoutes = require('./src/routes/offlineRoutes');

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours, set to true if using HTTPS
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/offline', offlineRoutes);
app.use('/api/simulation', require('./src/routes/simulationRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/security', require('./src/routes/securityRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;