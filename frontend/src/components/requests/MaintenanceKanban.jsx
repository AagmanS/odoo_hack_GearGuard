import React, { useState, useEffect } from 'react';

const MaintenanceKanban = () => {
  const [requests, setRequests] = useState({
    open: [],
    in_progress: [],
    on_hold: [],
    closed: []
  });

  // Mock data initialization
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRequests = {
        open: [
          {
            id: 1,
            title: 'Monthly Lubrication Service',
            equipment: 'Assembly Line A',
            priority: 'medium',
            requestedBy: 'Production Manager',
            date: '2023-06-15'
          },
          {
            id: 3,
            title: 'Belt Replacement',
            equipment: 'Packing Station 3',
            priority: 'medium',
            requestedBy: 'Line Supervisor',
            date: '2023-06-16'
          }
        ],
        in_progress: [
          {
            id: 2,
            title: 'Calibration Required',
            equipment: 'CNC Machine 1',
            priority: 'high',
            assignedTo: 'John Smith',
            date: '2023-06-15'
          }
        ],
        on_hold: [
          {
            id: 4,
            title: 'Motor Replacement',
            equipment: 'HVAC Unit 1',
            priority: 'high',
            requestedBy: 'Facilities Manager',
            date: '2023-06-10'
          }
        ],
        closed: [
          {
            id: 5,
            title: 'Filter Change',
            equipment: 'HVAC Unit 1',
            priority: 'low',
            completedBy: 'Michael Chen',
            date: '2023-06-14'
          }
        ]
      };
      
      setRequests(mockRequests);
    }, 500);
  }, []);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return '';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'critical': return 'Critical';
      default: return priority;
    }
  };

  return (
    <div className="kanban-board">
      {Object.entries(requests).map(([status, items]) => (
        <div key={status} className="kanban-column">
          <div className="kanban-column-header">
            <h3 className="kanban-column-title">
              {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h3>
            <span className="kanban-column-count">{items.length}</span>
          </div>
          {items.map(request => (
            <div key={request.id} className="kanban-item">
              <div className="kanban-item-title">{request.title}</div>
              <div className="kanban-item-equipment">{request.equipment}</div>
              <div className="kanban-item-priority">
                <span className={`priority-${request.priority}`}>
                  {getPriorityLabel(request.priority)}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '8px' }}>
                {request.requestedBy ? `Requested: ${request.requestedBy}` : ''}
                {request.assignedTo ? `Assigned: ${request.assignedTo}` : ''}
                {request.completedBy ? `Completed: ${request.completedBy}` : ''}
                <br />
                <span style={{ color: '#95a5a6' }}>{request.date}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MaintenanceKanban;