import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HumanImpactDashboard from '../components/dashboard/HumanImpactDashboard';
import CostCalculator from '../components/dashboard/CostCalculator';
import SafetyMonitor from '../components/dashboard/SafetyMonitor';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalEquipment: 0,
    activeRequests: 0,
    maintenanceCost: 0,
    downtimeHours: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);

  // Mock data initialization
  useEffect(() => {
    // Metrics
    setMetrics({
      totalEquipment: 42,
      activeRequests: 8,
      maintenanceCost: 12500,
      downtimeHours: 12.5
    });

    // Recent Activity
    setRecentActivity([
      {
        id: 1,
        action: 'Maintenance Completed',
        equipment: 'CNC Machine 1',
        technician: 'John Doe',
        timestamp: '2 hours ago',
        type: 'success'
      },
      {
        id: 2,
        action: 'New Request Created',
        equipment: 'Hydraulic Press 3',
        technician: 'Sarah Smith',
        timestamp: '4 hours ago',
        type: 'info'
      },
      {
        id: 3,
        action: 'Equipment Added',
        equipment: 'Assembly Line B',
        technician: 'Mike Johnson',
        timestamp: '6 hours ago',
        type: 'success'
      },
      {
        id: 4,
        action: 'Downtime Alert',
        equipment: 'Conveyor Belt 2',
        technician: 'System',
        timestamp: '8 hours ago',
        type: 'warning'
      },
      {
        id: 5,
        action: 'Safety Inspection',
        equipment: 'Welding Station 4',
        technician: 'Emily Brown',
        timestamp: '1 day ago',
        type: 'info'
      }
    ]);

    // Equipment Status
    setEquipmentStatus([
      { status: 'Operational', count: 35, percentage: 83, color: '#10b981' },
      { status: 'Maintenance', count: 5, percentage: 12, color: '#f59e0b' },
      { status: 'Offline', count: 2, percentage: 5, color: '#ef4444' }
    ]);

    // Upcoming Maintenance
    setUpcomingMaintenance([
      { id: 1, equipment: 'CNC Machine 3', date: '2025-12-29', priority: 'high' },
      { id: 2, equipment: 'Lathe Machine 2', date: '2025-12-30', priority: 'medium' },
      { id: 3, equipment: 'Milling Machine 1', date: '2026-01-02', priority: 'low' },
      { id: 4, equipment: 'Drill Press 5', date: '2026-01-05', priority: 'medium' }
    ]);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Overview of equipment and maintenance operations</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/requests" className="btn btn-primary">New Request</Link>
          <Link to="/equipment" className="btn btn-secondary">Add Equipment</Link>
        </div>
      </div>

      <div className="metrics-container">
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <div className="metric-title">Total Equipment</div>
              <div className="metric-icon-badge" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>⚙️</div>
            </div>
            <div className="metric-value">{metrics.totalEquipment}</div>
            <div className="metric-change metric-positive">+5 from last week</div>
          </div>
          <div className="metric-chart">
            <div className="mini-chart" style={{ background: 'linear-gradient(180deg, rgba(102,126,234,0.2) 0%, transparent 100%)', height: '40px' }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <div className="metric-title">Active Requests</div>
              <div className="metric-icon-badge" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>📋</div>
            </div>
            <div className="metric-value">{metrics.activeRequests}</div>
            <div className="metric-change metric-negative">+2 from yesterday</div>
          </div>
          <div className="metric-chart">
            <div className="mini-chart" style={{ background: 'linear-gradient(180deg, rgba(240,147,251,0.2) 0%, transparent 100%)', height: '50px' }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <div className="metric-title">Maintenance Cost</div>
              <div className="metric-icon-badge" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>💰</div>
            </div>
            <div className="metric-value">${metrics.maintenanceCost.toLocaleString()}</div>
            <div className="metric-change metric-positive">-12% from last month</div>
          </div>
          <div className="metric-chart">
            <div className="mini-chart" style={{ background: 'linear-gradient(180deg, rgba(79,172,254,0.2) 0%, transparent 100%)', height: '30px' }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-header">
              <div className="metric-title">Downtime Hours</div>
              <div className="metric-icon-badge" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>⏱️</div>
            </div>
            <div className="metric-value">{metrics.downtimeHours}h</div>
            <div className="metric-change metric-negative">+2.1 from last week</div>
          </div>
          <div className="metric-chart">
            <div className="mini-chart" style={{ background: 'linear-gradient(180deg, rgba(250,112,154,0.2) 0%, transparent 100%)', height: '45px' }}></div>
          </div>
        </div>
      </div>

      {/* Equipment Status Overview */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Equipment Status</h3>
            <span className="card-badge">{metrics.totalEquipment} Total</span>
          </div>
          <div className="equipment-status-container">
            {equipmentStatus.map((status, index) => (
              <div key={index} className="status-row">
                <div className="status-info">
                  <div className="status-dot" style={{ backgroundColor: status.color }}></div>
                  <span className="status-label">{status.status}</span>
                </div>
                <div className="status-stats">
                  <span className="status-count">{status.count}</span>
                  <span className="status-percentage">{status.percentage}%</span>
                </div>
                <div className="status-bar">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${status.percentage}%`,
                      backgroundColor: status.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Maintenance</h3>
            <Link to="/calendar" className="card-link">View All →</Link>
          </div>
          <div className="maintenance-list">
            {upcomingMaintenance.map((item) => (
              <div key={item.id} className="maintenance-item">
                <div className="maintenance-info">
                  <div className="maintenance-name">{item.equipment}</div>
                  <div className="maintenance-date">📅 {item.date}</div>
                </div>
                <div
                  className="maintenance-priority"
                  style={{
                    backgroundColor: `${getPriorityColor(item.priority)}20`,
                    color: getPriorityColor(item.priority)
                  }}
                >
                  {item.priority.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="dashboard-grid-3">
        <div className="dashboard-card dashboard-card-wide">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="card-badge">{recentActivity.length} activities</span>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">
                  <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                  <div className="activity-details">
                    <span className="activity-equipment">{activity.equipment}</span>
                    <span className="activity-separator">•</span>
                    <span className="activity-technician">{activity.technician}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <Link to="/equipment" className="quick-action-btn">
              <div className="quick-action-icon">⚙️</div>
              <div className="quick-action-label">View Equipment</div>
            </Link>
            <Link to="/requests" className="quick-action-btn">
              <div className="quick-action-icon">📋</div>
              <div className="quick-action-label">New Request</div>
            </Link>
            <Link to="/reports" className="quick-action-btn">
              <div className="quick-action-icon">📊</div>
              <div className="quick-action-label">Generate Report</div>
            </Link>
            <Link to="/calendar" className="quick-action-btn">
              <div className="quick-action-icon">📅</div>
              <div className="quick-action-label">Schedule</div>
            </Link>
          </div>
        </div>
      </div>

      <HumanImpactDashboard />
      <CostCalculator />
      <SafetyMonitor />
    </div>
  );
};

export default Dashboard;