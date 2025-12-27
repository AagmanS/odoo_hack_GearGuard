# Gear-Guard

Gear-Guard is a comprehensive equipment management system with downtime cost calculation and human impact assessment. The application helps organizations track equipment, manage maintenance requests, and understand the financial and human impact of equipment downtime.

## 🚀 Features

- **Equipment Management**: Track all equipment with detailed information
- **Maintenance Requests**: Create, assign, and track maintenance requests
- **Downtime Cost Calculation**: Calculate financial impact of equipment downtime
- **Human Impact Assessment**: Evaluate the human impact of equipment issues
- **Safety Monitoring**: Track and monitor safety risks
- **Offline-First**: Continue working even without internet connectivity
- **Real-time Sync**: Automatic synchronization when connectivity is restored
- **Risk Assessment**: Evaluate equipment risk levels and prioritize maintenance
- **Monte Carlo Simulation**: Probabilistic uncertainty modeling for downtime cost calculations
- **Predictive Analytics**: TensorFlow.js-powered forecasting of equipment failures
- **WebAuthn Security**: Biometric validation and immutable audit trails
- **Advanced Visualizations**: D3.js-powered human impact narratives
- **CRDT Synchronization**: Conflict-free offline operations
- **Operational Transformation**: Real-time collaborative editing

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Custom offline sync system

### Frontend
- React with Vite
- React Router for navigation
- IndexedDB for offline storage
- Custom hooks for offline/sync functionality

## Project Structure

```
gear-guard/
├── backend/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # DB connection config
│   │   │   └── env.js               # Environment variables
│   │   ├── controllers/
│   │   │   ├── equipmentController.js
│   │   │   ├── requestController.js
│   │   │   ├── technicianController.js
│   │   │   └── impactController.js  # Downtime cost calculator
│   │   ├── models/
│   │   │   ├── Equipment.js
│   │   │   ├── MaintenanceRequest.js
│   │   │   ├── Technician.js
│   │   │   ├── Department.js
│   │   │   └── ImpactLog.js         # Downtime cost logs
│   │   ├── routes/
│   │   │   ├── equipmentRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── technicianRoutes.js
│   │   │   ├── impactRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── offlineRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── simulationRoutes.js
│   │   │   └── securityRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # Authentication
│   │   │   ├── offlineSync.js       # Offline sync handling
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── offlineService.js    # Offline-first logic
│   │   │   ├── impactCalculator.js  # Human impact & cost calc
│   │   │   ├── syncService.js       # Data synchronization
│   │   │   ├── safetyService.js     # Safety lockdown logic
│   │   │   ├── ai/                  # AI and predictive services
│   │   │   │   └── equipmentPredictor.js
│   │   │   ├── simulation/          # Monte Carlo simulation
│   │   │   │   └── simulationService.js
│   │   │   └── security/            # Security and audit services
│   │   │       └── securityService.js
│   │   ├── utils/
│   │   │   ├── databaseSync.js      # Conflict resolution
│   │   │   ├── costCalculator.js    # Downtime cost formulas
│   │   │   └── validators.js
│   │   └── app.js                   # Express app setup
│   ├── migrations/                   # Database migrations
│   │   ├── 001_create_equipment.sql
│   │   ├── 002_create_requests.sql
│   │   ├── 003_create_technicians.sql
│   │   ├── 004_create_impact_logs.sql
│   │   └── 005_seed_data.sql
│   ├── docker/
│   │   └── docker-compose.yml       # PostgreSQL + Adminer
│   ├── package.json
│   ├── .env.example
│   └── server.js
├── frontend/                         # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── service-worker.js
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── HumanImpactDashboard.jsx
│   │   │   │   ├── CostCalculator.jsx      # NEW: Cost calculator UI
│   │   │   │   └── SafetyMonitor.jsx
│   │   │   ├── equipment/
│   │   │   │   ├── EquipmentList.jsx
│   │   │   │   ├── EquipmentForm.jsx
│   │   │   │   └── EquipmentDetail.jsx
│   │   │   ├── requests/
│   │   │   │   ├── MaintenanceKanban.jsx
│   │   │   │   ├── RequestForm.jsx
│   │   │   │   ├── RequestDetail.jsx
│   │   │   │   └── CalendarView.jsx
│   │   │   ├── technicians/
│   │   │   │   ├── TechnicianList.jsx
│   │   │   │   └── SkillMatrix.jsx
│   │   │   ├── visualization/            # NEW: Advanced visualizations
│   │   │   │   ├── HumanImpactVisualizer.js
│   │   │   │   └── AdvancedVisualization.jsx
│   │   │   ├── simulation/               # NEW: Monte Carlo simulation
│   │   │   │   └── monteCarloSimulator.js
│   │   │   ├── prediction/               # NEW: Predictive analytics
│   │   │   │   └── equipmentPredictor.js
│   │   │   ├── security/                 # NEW: Security services
│   │   │   │   └── securityService.js
│   │   │   ├── common/
│   │   │   │   ├── OfflineStatus.jsx
│   │   │   │   ├── SyncIndicator.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   └── layout/
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EquipmentPage.jsx
│   │   │   ├── RequestsPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── ReportsPage.jsx       # Cost analysis reports
│   │   │   └── SettingsPage.jsx
│   │   ├── services/
│   │   │   ├── api.js                # API calls
│   │   │   ├── offlineStorage.js     # IndexedDB/LocalStorage
│   │   │   └── syncManager.js        # Frontend sync logic
│   │   ├── hooks/
│   │   │   ├── useOffline.js         # Custom hook for offline
│   │   │   ├── useSync.js            # Sync status hook
│   │   │   └── useImpact.js          # Impact calculations hook
│   │   ├── utils/
│   │   │   ├── impactCalculator.js
│   │   │   ├── costCalculator.js     # Frontend cost calculations
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   ├── components.css
│   │   │   ├── dashboard.css
│   │   │   └── responsive.css
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── routes.jsx
│   ├── package.json
│   └── vite.config.js               # Using Vite for faster builds
├── database/                         # Database schemas & scripts
│   ├── schema.sql                   # Complete PostgreSQL schema with audit logs
│   ├── triggers.sql                 # Database triggers
│   ├── functions.sql                # Stored procedures
│   └── sample_data.sql              # Sample data for demo
├── docs/
│   ├── API_DOCS.md
│   ├── DATABASE_SCHEMA.md
│   ├── OFFLINE_SYNC.md
│   ├── COST_CALCULATION.md          # NEW: Cost calculator docs
│   ├── SECURITY_AUDIT.md            # NEW: Security and audit documentation
│   └── ADVANCED_VISUALIZATION.md    # NEW: Advanced visualization docs
├── docker-compose.yml               # Main docker compose
├── .gitignore
├── README.md
└── package.json                     # Root package.json for scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional, for database setup)

### Backend Setup
1. Navigate to the backend directory: `cd gear-guard/backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Set up the database:
   - Option 1: Use Docker: `docker-compose up -d`
   - Option 2: Set up PostgreSQL manually and run migrations
5. Run migrations: `npm run migrate`
6. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd gear-guard/frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Docker Setup
1. From the project root, run: `docker-compose up -d`
2. The application will be available at `http://localhost:3000`

## API Documentation
See [API_DOCS.md](docs/API_DOCS.md) for detailed API documentation.

## Database Schema
See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for the complete database schema.

## Offline Sync System
See [OFFLINE_SYNC.md](docs/OFFLINE_SYNC.md) for details about the offline-first approach.

## Cost Calculation System
See [COST_CALCULATION.md](docs/COST_CALCULATION.md) for information about the downtime cost calculation system.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License.
=======
# odoo_hack_GearGuard
>>>>>>> ca932bf726abda891038d53a58ee256e7eb6cfab
