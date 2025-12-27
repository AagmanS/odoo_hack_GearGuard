import React, { useState, useEffect } from 'react';

const HumanImpactDashboard = () => {
  const [impactData, setImpactData] = useState({
    humanImpactScore: 0,
    affectedEmployees: 0,
    safetyIncidents: 0,
    trainingHours: 0
  });

  useEffect(() => {
    // Mock data initialization
    setImpactData({
      humanImpactScore: 78,
      affectedEmployees: 24,
      safetyIncidents: 3,
      trainingHours: 120
    });
  }, []);

  // Determine impact level based on score
  const getImpactLevel = (score) => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const impactLevel = getImpactLevel(impactData.humanImpactScore);
  const levelColor = {
    critical: '#e74c3c',
    high: '#e67e22',
    medium: '#f39c12',
    low: '#2ecc71'
  }[impactLevel];

  return (
    <div className="impact-overview">
      <div className="impact-card">
        <div className="impact-header">
          <h3 className="impact-title">Human Impact Score</h3>
          <div className="impact-value" style={{ color: levelColor }}>
            {impactData.humanImpactScore}/100
          </div>
        </div>
        <div className="impact-meter" style={{ backgroundColor: '#e0e0e0', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
          <div 
            className="impact-meter-fill" 
            style={{ 
              width: `${impactData.humanImpactScore}%`, 
              backgroundColor: levelColor,
              height: '100%',
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }}
          ></div>
        </div>
        <p className="impact-description">
          {impactLevel.charAt(0).toUpperCase() + impactLevel.slice(1)} impact level based on current equipment status and maintenance activities.
        </p>
      </div>

      <div className="impact-card">
        <div className="impact-header">
          <h3 className="impact-title">Affected Employees</h3>
          <div className="impact-value">{impactData.affectedEmployees}</div>
        </div>
        <div className="impact-chart">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="impact-bar" 
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                backgroundColor: i < 3 ? '#3498db' : '#bdc3c7'
              }}
            ></div>
          ))}
        </div>
        <p className="impact-description">
          Employees potentially affected by equipment downtime or maintenance activities.
        </p>
      </div>

      <div className="impact-card">
        <div className="impact-header">
          <h3 className="impact-title">Safety Incidents</h3>
          <div className="impact-value" style={{ color: '#e74c3c' }}>{impactData.safetyIncidents}</div>
        </div>
        <div className="impact-chart">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="impact-bar" 
              style={{ 
                height: `${Math.random() * 60 + 10}%`,
                backgroundColor: i === 3 || i === 7 ? '#e74c3c' : '#bdc3c7'
              }}
            ></div>
          ))}
        </div>
        <p className="impact-description">
          Safety incidents in the last 12 months. Target: 0 incidents.
        </p>
      </div>

      <div className="impact-card">
        <div className="impact-header">
          <h3 className="impact-title">Training Hours</h3>
          <div className="impact-value" style={{ color: '#2ecc71' }}>{impactData.trainingHours}h</div>
        </div>
        <div className="impact-chart">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="impact-bar" 
              style={{ 
                height: `${Math.random() * 90 + 10}%`,
                backgroundColor: '#2ecc71'
              }}
            ></div>
          ))}
        </div>
        <p className="impact-description">
          Employee training hours focused on safety and equipment operation.
        </p>
      </div>
    </div>
  );
};

export default HumanImpactDashboard;