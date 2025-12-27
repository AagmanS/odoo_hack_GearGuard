import React, { useState, useEffect } from 'react';

const SafetyMonitor = () => {
  const [safetyData, setSafetyData] = useState({
    criticalRiskCount: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    totalRiskScore: 0
  });

  const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {
    // Mock data initialization
    setSafetyData({
      criticalRiskCount: 2,
      highRiskCount: 4,
      mediumRiskCount: 8,
      lowRiskCount: 15,
      totalRiskScore: 67
    });

    // Mock equipment list with risk levels
    setEquipmentList([
      { id: 1, name: 'Assembly Line A', riskLevel: 'critical', riskScore: 85 },
      { id: 2, name: 'CNC Machine 1', riskLevel: 'high', riskScore: 72 },
      { id: 3, name: 'HVAC Unit 1', riskLevel: 'medium', riskScore: 58 },
      { id: 4, name: 'Packing Station 3', riskLevel: 'low', riskScore: 32 },
      { id: 5, name: 'Server Room Cooling', riskLevel: 'critical', riskScore: 91 },
    ]);
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  return (
    <div className="safety-monitor">
      <div className="card">
        <h3>Safety Risk Monitor</h3>
        <div className="metrics-container" style={{ marginBottom: '20px' }}>
          <div className="metric-card" style={{ borderLeftColor: '#e74c3c' }}>
            <div className="metric-icon">🚨</div>
            <div className="metric-title">Critical Risks</div>
            <div className="metric-value" style={{ color: '#e74c3c' }}>{safetyData.criticalRiskCount}</div>
          </div>
          
          <div className="metric-card" style={{ borderLeftColor: '#e67e22' }}>
            <div className="metric-icon">⚠️</div>
            <div className="metric-title">High Risks</div>
            <div className="metric-value" style={{ color: '#e67e22' }}>{safetyData.highRiskCount}</div>
          </div>
          
          <div className="metric-card" style={{ borderLeftColor: '#f39c12' }}>
            <div className="metric-icon">🟡</div>
            <div className="metric-title">Medium Risks</div>
            <div className="metric-value" style={{ color: '#f39c12' }}>{safetyData.mediumRiskCount}</div>
          </div>
          
          <div className="metric-card" style={{ borderLeftColor: '#2ecc71' }}>
            <div className="metric-icon">✅</div>
            <div className="metric-title">Low Risks</div>
            <div className="metric-value" style={{ color: '#2ecc71' }}>{safetyData.lowRiskCount}</div>
          </div>
        </div>

        <div className="impact-meter" style={{ 
          height: '30px', 
          marginBottom: '20px',
          backgroundColor: '#e0e0e0',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              width: `${safetyData.totalRiskScore}%`, 
              height: '100%',
              backgroundColor: safetyData.totalRiskScore > 70 ? '#e74c3c' : 
                             safetyData.totalRiskScore > 50 ? '#e67e22' : 
                             safetyData.totalRiskScore > 30 ? '#f39c12' : '#2ecc71',
              transition: 'width 0.5s ease',
              borderRadius: '15px'
            }}
          ></div>
        </div>
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
          Overall Safety Risk Score: {safetyData.totalRiskScore}/100
        </p>
      </div>

      <div className="card">
        <h3>High-Risk Equipment</h3>
        <div className="table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList
                .filter(item => item.riskLevel === 'critical' || item.riskLevel === 'high')
                .map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: getRiskColor(item.riskLevel),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      >
                        {getRiskLabel(item.riskLevel)}
                      </span>
                    </td>
                    <td>{item.riskScore}/100</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Safety Recommendations</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Perform immediate safety inspection on Assembly Line A and Server Room Cooling</li>
          <li>Schedule maintenance for CNC Machine 1 to reduce operational risks</li>
          <li>Update safety protocols for high-risk equipment</li>
          <li>Conduct additional safety training for operators of critical equipment</li>
          <li>Review and update emergency procedures for high-risk scenarios</li>
        </ul>
      </div>
    </div>
  );
};

export default SafetyMonitor;