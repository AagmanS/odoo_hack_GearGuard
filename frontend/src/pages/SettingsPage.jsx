import React, { useState } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Acme Manufacturing',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    downtimeAlerts: true,
    costThresholdAlerts: true,
    thresholdAmount: 10000,

    // User Preferences
    theme: 'dark',
    language: 'en',
    itemsPerPage: 25,
    autoRefresh: true,
    refreshInterval: 30,

    // Department Settings
    departments: [
      { id: 1, name: 'Production', manager: 'John Doe', equipmentCount: 15 },
      { id: 2, name: 'Assembly', manager: 'Sarah Smith', equipmentCount: 12 },
      { id: 3, name: 'Quality Control', manager: 'Mike Johnson', equipmentCount: 8 },
      { id: 4, name: 'Maintenance', manager: 'Emily Brown', equipmentCount: 7 }
    ],

    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 60,
    passwordExpiry: 90,
    ipWhitelist: false
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    // Simulate save
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '🎨' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'security', label: 'Security', icon: '🔐' }
  ];

  return (
    <div className="settings-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Settings</h1>
          <p className="dashboard-subtitle">Manage your system configuration and preferences</p>
        </div>
        <div className="dashboard-actions">
          <button
            className={`btn ${isSaved ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
          >
            {isSaved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Settings Tabs */}
        <div className="settings-sidebar">
          <div className="dashboard-card">
            <div className="settings-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="dashboard-card">
              <h3 className="settings-section-title">General Settings</h3>
              <p className="settings-section-desc">Configure basic system settings</p>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    className="form-select"
                    value={settings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European (UTC+1)</option>
                    <option value="UTC+5:30">India (UTC+5:30)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select
                    className="form-select"
                    value={settings.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="dashboard-card">
              <h3 className="settings-section-title">Notification Settings</h3>
              <p className="settings-section-desc">Manage how you receive alerts and notifications</p>

              <div className="settings-form">
                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Email Notifications</label>
                    <p className="form-hint">Receive notifications via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">SMS Notifications</label>
                    <p className="form-hint">Receive critical alerts via SMS</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Maintenance Alerts</label>
                    <p className="form-hint">Get notified about upcoming maintenance</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceAlerts}
                      onChange={(e) => handleInputChange('maintenanceAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Downtime Alerts</label>
                    <p className="form-hint">Alert when equipment downtime exceeds threshold</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.downtimeAlerts}
                      onChange={(e) => handleInputChange('downtimeAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Cost Threshold Alerts</label>
                    <p className="form-hint">Alert when maintenance costs exceed limit</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.costThresholdAlerts}
                      onChange={(e) => handleInputChange('costThresholdAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {settings.costThresholdAlerts && (
                  <div className="form-group">
                    <label className="form-label">Cost Threshold Amount</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.thresholdAmount}
                      onChange={(e) => handleInputChange('thresholdAmount', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="dashboard-card">
              <h3 className="settings-section-title">User Preferences</h3>
              <p className="settings-section-desc">Customize your application experience</p>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-select"
                    value={settings.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={settings.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Items Per Page</label>
                  <select
                    className="form-select"
                    value={settings.itemsPerPage}
                    onChange={(e) => handleInputChange('itemsPerPage', e.target.value)}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Auto Refresh</label>
                    <p className="form-hint">Automatically refresh data</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => handleInputChange('autoRefresh', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {settings.autoRefresh && (
                  <div className="form-group">
                    <label className="form-label">Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.refreshInterval}
                      onChange={(e) => handleInputChange('refreshInterval', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Department Settings */}
          {activeTab === 'departments' && (
            <div className="dashboard-card">
              <h3 className="settings-section-title">Department Management</h3>
              <p className="settings-section-desc">Manage departments and their equipment allocation</p>

              <div className="departments-list">
                {settings.departments.map(dept => (
                  <div key={dept.id} className="department-item">
                    <div className="department-header">
                      <h4 className="department-name">{dept.name}</h4>
                      <button className="btn-icon">✏️</button>
                    </div>
                    <div className="department-details">
                      <div className="department-detail">
                        <span className="detail-label">Manager:</span>
                        <span className="detail-value">{dept.manager}</span>
                      </div>
                      <div className="department-detail">
                        <span className="detail-label">Equipment:</span>
                        <span className="detail-value">{dept.equipmentCount} items</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary" style={{ marginTop: '20px' }}>
                + Add Department
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="dashboard-card">
              <h3 className="settings-section-title">Security Settings</h3>
              <p className="settings-section-desc">Manage security and access control</p>

              <div className="settings-form">
                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">Two-Factor Authentication</label>
                    <p className="form-hint">Add an extra layer of security</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password Expiry (days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                  />
                </div>

                <div className="form-group-toggle">
                  <div>
                    <label className="form-label">IP Whitelist</label>
                    <p className="form-hint">Restrict access to specific IP addresses</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.ipWhitelist}
                      onChange={(e) => handleInputChange('ipWhitelist', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-actions">
                  <button className="btn btn-secondary">Change Password</button>
                  <button className="btn btn-outline">View Activity Log</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;