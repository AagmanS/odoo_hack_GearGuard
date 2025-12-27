-- Complete PostgreSQL schema for Gear-Guard application

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on_leave
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'operational', -- operational, maintenance, out_of_order, locked_down
    location VARCHAR(200),
    purchase_date DATE,
    warranty_expiry DATE,
    value DECIMAL(10, 2), -- Equipment value in dollars
    criticality INTEGER DEFAULT 5, -- 1-10 scale
    production_priority INTEGER DEFAULT 5, -- 1-10 scale
    skill_dependency DECIMAL(3, 2) DEFAULT 0, -- 0-1 scale
    safety_risk INTEGER DEFAULT 0, -- 0-10 scale
    maintenance_backlog INTEGER DEFAULT 0,
    energy_consumption DECIMAL(8, 2) DEFAULT 0, -- kWh
    emissions_rate DECIMAL(8, 2) DEFAULT 0, -- kg CO2/hour
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, in_progress, closed, on_hold
    assigned_technician_id INTEGER REFERENCES technicians(id),
    requested_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create impact_logs table
CREATE TABLE IF NOT EXISTS impact_logs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    downtime_hours DECIMAL(8, 2) NOT NULL,
    affected_employees INTEGER NOT NULL DEFAULT 0,
    revenue_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 0,
    incident_description TEXT,
    cost_calculated DECIMAL(12, 2) NOT NULL DEFAULT 0,
    human_impact_score DECIMAL(5, 2) DEFAULT 0, -- 0-100 scale
    operational_impact_score DECIMAL(5, 2) DEFAULT 0, -- 0-100 scale
    environmental_impact_score DECIMAL(5, 2) DEFAULT 0, -- 0-100 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_technician ON maintenance_requests(assigned_technician_id);
CREATE INDEX idx_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_created_at ON maintenance_requests(created_at);
CREATE INDEX idx_impact_logs_equipment ON impact_logs(equipment_id);
CREATE INDEX idx_impact_logs_downtime ON impact_logs(downtime_hours);
CREATE INDEX idx_impact_logs_created_at ON impact_logs(created_at);
CREATE INDEX idx_technicians_department ON technicians(department_id);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_email ON technicians(email);

-- Insert default departments
INSERT INTO departments (name, description, manager_id) VALUES
('Production', 'Manufacturing and production operations', 1),
('Maintenance', 'Equipment maintenance and repair', 2),
('Quality Control', 'Quality assurance and testing', 3),
('Logistics', 'Shipping, receiving, and inventory', 4),
('IT', 'Information technology and systems', 5)
ON CONFLICT DO NOTHING;

-- Security and audit tables
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES technicians(id),
  event_type VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  hash VARCHAR(64) NOT NULL -- SHA-256 hash for integrity
);

CREATE TABLE IF NOT EXISTS user_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES technicians(id),
  credential_id VARCHAR(255) UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  sign_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, credential_id)
);

-- Insert default technicians
INSERT INTO technicians (name, email, phone, specialization, department_id, status) VALUES
('John Smith', 'john.smith@company.com', '555-0101', 'Mechanical Systems', 2, 'active'),
('Sarah Johnson', 'sarah.j@company.com', '555-0102', 'Electrical Systems', 2, 'active'),
('Michael Chen', 'michael.c@company.com', '555-0103', 'HVAC Systems', 2, 'active'),
('Emily Rodriguez', 'emily.r@company.com', '555-0104', 'Quality Assurance', 3, 'active'),
('David Wilson', 'david.w@company.com', '555-0105', 'IT Systems', 5, 'active')
ON CONFLICT DO NOTHING;

-- Sample audit log entries
INSERT INTO audit_logs (id, user_id, event_type, details, ip_address, hash) VALUES
  ('audit_1703697600_a1b2c3d4e5f6', 1, 'user_login', '{"method": "password"}', '127.0.0.1', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2'),
  ('audit_1703697601_f6e5d4c3b2a1', 2, 'equipment_update', '{"equipment_id": 1, "field": "status", "old_value": "operational", "new_value": "maintenance"}', '127.0.0.1', 'f6e5d4c3b2a1z0y9x8w7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5')
ON CONFLICT (id) DO NOTHING;