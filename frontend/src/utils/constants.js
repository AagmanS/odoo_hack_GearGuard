// Application constants
const CONSTANTS = {
  EQUIPMENT_STATUS: {
    OPERATIONAL: 'operational',
    MAINTENANCE: 'maintenance',
    OUT_OF_ORDER: 'out_of_order',
    LOCKED_DOWN: 'locked_down'
  },
  
  REQUEST_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    CLOSED: 'closed'
  },
  
  REQUEST_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  TECHNICIAN_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave'
  },
  
  EQUIPMENT_CATEGORIES: [
    'Manufacturing',
    'HVAC',
    'Quality Control',
    'Transportation',
    'IT',
    'Power Generation'
  ],
  
  DEPARTMENTS: [
    'Production',
    'Maintenance',
    'Quality Control',
    'Logistics',
    'IT',
    'Facilities'
  ],
  
  TECHNICIAN_SPECIALIZATIONS: [
    'Mechanical Systems',
    'Electrical Systems',
    'HVAC Systems',
    'Quality Assurance',
    'IT Systems',
    'General Maintenance'
  ],
  
  COLORS: {
    PRIMARY: '#3498db',
    SECONDARY: '#2c3e50',
    SUCCESS: '#2ecc71',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#1abc9c',
    LIGHT: '#ecf0f1',
    DARK: '#34495e'
  },
  
  RISK_LEVELS: {
    LOW: { value: 0, label: 'Low', color: '#2ecc71' },
    MEDIUM: { value: 33, label: 'Medium', color: '#f39c12' },
    HIGH: { value: 66, label: 'High', color: '#e67e22' },
    CRITICAL: { value: 100, label: 'Critical', color: '#e74c3c' }
  },
  
  PRIORITY_COLORS: {
    low: '#2ecc71',
    medium: '#f39c12',
    high: '#e67e22',
    critical: '#e74c3c'
  },
  
  STATUS_COLORS: {
    operational: '#2ecc71',
    maintenance: '#f39c12',
    'out_of_order': '#e74c3c',
    locked_down: '#9b59b6'
  }
};

export default CONSTANTS;