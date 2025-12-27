import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const navigate = useNavigate();

  // Mock data initialization
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockEquipment = [
        {
          id: 1,
          name: 'Assembly Line A',
          category: 'Manufacturing',
          department: 'Production',
          status: 'operational',
          location: 'Production Floor A',
          purchase_date: '2022-01-15',
          warranty_expiry: '2025-01-15',
          criticality: 9,
          safety_risk: 7
        },
        {
          id: 2,
          name: 'CNC Machine 1',
          category: 'Manufacturing',
          department: 'Production',
          status: 'operational',
          location: 'Machining Area',
          purchase_date: '2021-06-20',
          warranty_expiry: '2024-06-20',
          criticality: 8,
          safety_risk: 6
        },
        {
          id: 3,
          name: 'Packing Station 3',
          category: 'Manufacturing',
          department: 'Production',
          status: 'maintenance',
          location: 'Packaging Area',
          purchase_date: '2020-03-10',
          warranty_expiry: '2023-03-10',
          criticality: 6,
          safety_risk: 4
        },
        {
          id: 4,
          name: 'HVAC Unit 1',
          category: 'HVAC',
          department: 'Facilities',
          status: 'operational',
          location: 'Building A Roof',
          purchase_date: '2019-08-05',
          warranty_expiry: '2024-08-05',
          criticality: 7,
          safety_risk: 5
        },
        {
          id: 5,
          name: 'Quality Testing Bench',
          category: 'Quality Control',
          department: 'Quality',
          status: 'operational',
          location: 'QC Lab',
          purchase_date: '2023-02-18',
          warranty_expiry: '2026-02-18',
          criticality: 5,
          safety_risk: 3
        }
      ];
      
      setEquipment(mockEquipment);
      setLoading(false);
    }, 500);
  }, [filter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'out_of_order': return 'status-out-of-order';
      case 'locked_down': return 'status-locked-down';
      default: return '';
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="form-row" style={{ marginBottom: '20px' }}>
          <div className="form-col">
            <select 
              className="form-control" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Out of Order</option>
              <option value="locked_down">Locked Down</option>
            </select>
          </div>
          <div className="form-col">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search equipment..." 
            />
          </div>
        </div>
      </div>

      <div className="equipment-grid">
        {filteredEquipment.map(item => (
          <div 
            key={item.id} 
            className={`equipment-card ${item.status}`}
            onClick={() => navigate(`/equipment/${item.id}`)}
          >
            <div className="equipment-card-header">
              <h3 className="equipment-card-title">{item.name}</h3>
              <span className={`equipment-card-status ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="equipment-card-category">{item.category}</div>
            <div className="equipment-card-details">
              <div className="equipment-card-detail">
                <span>Department:</span>
                <span>{item.department}</span>
              </div>
              <div className="equipment-card-detail">
                <span>Location:</span>
                <span>{item.location}</span>
              </div>
              <div className="equipment-card-detail">
                <span>Criticality:</span>
                <span>{item.criticality}/10</span>
              </div>
              <div className="equipment-card-detail">
                <span>Safety Risk:</span>
                <span>{item.safety_risk}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentList;