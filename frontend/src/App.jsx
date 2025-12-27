import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { OfflineProvider } from './contexts/OfflineContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EquipmentPage from './pages/EquipmentPage';
import RequestsPage from './pages/RequestsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AdvancedVisualization from './components/visualization/AdvancedVisualization';
import './styles/main.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/responsive.css';
import './styles/enhanced.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <LandingPage />;
  }

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/visualization" element={<AdvancedVisualization />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <OfflineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </OfflineProvider>
  );
}

export default App;