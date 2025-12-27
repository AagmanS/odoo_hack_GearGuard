import React, { useState } from 'react';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2025-12-01',
    endDate: '2025-12-27'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    {
      id: 'downtime',
      title: 'Downtime Cost Analysis',
      description: 'Comprehensive analysis of equipment downtime and associated costs',
      icon: '⏱️',
      color: '#ef4444'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Expense Tracking',
      description: 'Track and analyze maintenance costs across all equipment',
      icon: '💰',
      color: '#f59e0b'
    },
    {
      id: 'performance',
      title: 'Equipment Performance Metrics',
      description: 'Performance analytics and efficiency ratings',
      icon: '📊',
      color: '#3b82f6'
    },
    {
      id: 'human-impact',
      title: 'Human Impact Assessment',
      description: 'Analyze the impact on workforce productivity and morale',
      icon: '👥',
      color: '#8b5cf6'
    },
    {
      id: 'safety',
      title: 'Safety Incident Reports',
      description: 'Track safety incidents and compliance metrics',
      icon: '🛡️',
      color: '#10b981'
    },
    {
      id: 'technician',
      title: 'Technician Performance',
      description: 'Performance metrics for maintenance technicians',
      icon: '👨‍🔧',
      color: '#06b6d4'
    },
    {
      id: 'department',
      title: 'Department Utilization',
      description: 'Equipment utilization by department',
      icon: '🏢',
      color: '#ec4899'
    }
  ];

  const mockReportData = {
    downtime: {
      totalDowntime: 124.5,
      costOfDowntime: 45600,
      affectedEquipment: 12,
      averageDowntimePerEquipment: 10.4,
      breakdown: [
        { equipment: 'CNC Machine 1', downtime: 24.5, cost: 12500 },
        { equipment: 'Hydraulic Press 2', downtime: 18.2, cost: 9200 },
        { equipment: 'Assembly Line A', downtime: 32.0, cost: 15600 },
        { equipment: 'Conveyor Belt 3', downtime: 15.8, cost: 5800 },
        { equipment: 'Welding Station 2', downtime: 34.0, cost: 2500 }
      ]
    },
    maintenance: {
      totalCost: 125400,
      scheduledCost: 89600,
      emergencyCost: 35800,
      averageCostPerEquipment: 2986,
      breakdown: [
        { category: 'Preventive Maintenance', cost: 65400, percentage: 52 },
        { category: 'Repairs', cost: 35800, percentage: 29 },
        { category: 'Parts Replacement', cost: 18200, percentage: 15 },
        { category: 'Labor', cost: 6000, percentage: 4 }
      ]
    },
    performance: {
      averageEfficiency: 87.3,
      totalOperatingHours: 8450,
      utilizationRate: 78.5,
      topPerformers: [
        { equipment: 'CNC Machine 3', efficiency: 96.2, uptime: 99.1 },
        { equipment: 'Lathe Machine 1', efficiency: 94.8, uptime: 98.5 },
        { equipment: 'Milling Machine 2', efficiency: 92.3, uptime: 97.2 }
      ],
      needsAttention: [
        { equipment: 'Hydraulic Press 2', efficiency: 68.5, uptime: 75.3 },
        { equipment: 'Assembly Line B', efficiency: 71.2, uptime: 78.9 }
      ]
    }
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;

    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReport({
        type: selectedReport,
        dateRange: dateRange,
        data: mockReportData[selectedReport] || {},
        generatedAt: new Date().toLocaleString()
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleExportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const renderReportContent = () => {
    if (!generatedReport) return null;

    const { type, data } = generatedReport;

    if (type === 'downtime') {
      return (
        <div className="report-content">
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Total Downtime</div>
              <div className="summary-value">{data.totalDowntime}h</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Cost of Downtime</div>
              <div className="summary-value">${data.costOfDowntime.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Affected Equipment</div>
              <div className="summary-value">{data.affectedEquipment}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Per Equipment</div>
              <div className="summary-value">{data.averageDowntimePerEquipment}h</div>
            </div>
          </div>

          <h4 className="report-section-title">Downtime Breakdown</h4>
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Downtime (hours)</th>
                  <th>Cost</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.breakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.equipment}</td>
                    <td>{item.downtime}h</td>
                    <td>${item.cost.toLocaleString()}</td>
                    <td>{((item.cost / data.costOfDowntime) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (type === 'maintenance') {
      return (
        <div className="report-content">
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Total Cost</div>
              <div className="summary-value">${data.totalCost.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Scheduled</div>
              <div className="summary-value">${data.scheduledCost.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Emergency</div>
              <div className="summary-value">${data.emergencyCost.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Per Equipment</div>
              <div className="summary-value">${data.averageCostPerEquipment.toLocaleString()}</div>
            </div>
          </div>

          <h4 className="report-section-title">Cost Breakdown by Category</h4>
          <div className="report-breakdown">
            {data.breakdown.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-category">{item.category}</span>
                  <span className="breakdown-amount">${item.cost.toLocaleString()}</span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: `hsl(${200 + index * 30}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="breakdown-percentage">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'performance') {
      return (
        <div className="report-content">
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Average Efficiency</div>
              <div className="summary-value">{data.averageEfficiency}%</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Operating Hours</div>
              <div className="summary-value">{data.totalOperatingHours}h</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Utilization Rate</div>
              <div className="summary-value">{data.utilizationRate}%</div>
            </div>
          </div>

          <h4 className="report-section-title">Top Performers</h4>
          <div className="performance-list">
            {data.topPerformers.map((item, index) => (
              <div key={index} className="performance-item performance-good">
                <div className="performance-name">{item.equipment}</div>
                <div className="performance-metrics">
                  <span>Efficiency: {item.efficiency}%</span>
                  <span>Uptime: {item.uptime}%</span>
                </div>
              </div>
            ))}
          </div>

          <h4 className="report-section-title">Needs Attention</h4>
          <div className="performance-list">
            {data.needsAttention.map((item, index) => (
              <div key={index} className="performance-item performance-warning">
                <div className="performance-name">{item.equipment}</div>
                <div className="performance-metrics">
                  <span>Efficiency: {item.efficiency}%</span>
                  <span>Uptime: {item.uptime}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="report-content">
        <div className="report-placeholder">
          <p>Report data for {reportTypes.find(r => r.id === type)?.title}</p>
          <p className="report-placeholder-hint">Detailed analysis would be displayed here</p>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Reports & Analytics</h1>
          <p className="dashboard-subtitle">Generate comprehensive reports and analyze performance data</p>
        </div>
      </div>

      <div className="reports-container">
        {/* Report Types */}
        <div className="reports-sidebar">
          <div className="dashboard-card">
            <h3 className="card-title">Available Reports</h3>
            <div className="report-types-list">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  className={`report-type-item ${selectedReport === report.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="report-type-icon" style={{ backgroundColor: `${report.color}20`, color: report.color }}>
                    {report.icon}
                  </div>
                  <div className="report-type-content">
                    <div className="report-type-title">{report.title}</div>
                    <div className="report-type-description">{report.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Configuration and Results */}
        <div className="reports-main">
          {!selectedReport ? (
            <div className="dashboard-card reports-empty">
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Select a Report Type</h3>
                <p>Choose a report from the list to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Configuration */}
              <div className="dashboard-card">
                <h3 className="card-title">Report Configuration</h3>
                <div className="report-config">
                  <div className="config-group">
                    <label className="config-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="config-group">
                    <label className="config-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '⏳ Generating...' : '📊 Generate Report'}
                  </button>
                </div>
              </div>

              {/* Generated Report */}
              {generatedReport && (
                <div className="dashboard-card">
                  <div className="report-header">
                    <div>
                      <h3 className="card-title">
                        {reportTypes.find(r => r.id === generatedReport.type)?.title}
                      </h3>
                      <p className="report-meta">
                        Generated: {generatedReport.generatedAt} | Period: {generatedReport.dateRange.startDate} to {generatedReport.dateRange.endDate}
                      </p>
                    </div>
                    <div className="report-actions">
                      <button className="btn btn-secondary" onClick={() => handleExportReport('pdf')}>
                        📄 Export PDF
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleExportReport('csv')}>
                        📊 Export CSV
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleExportReport('excel')}>
                        📗 Export Excel
                      </button>
                    </div>
                  </div>

                  {renderReportContent()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;