-- SQL for creating the equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    department_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'operational',
    location VARCHAR(200),
    purchase_date DATE,
    warranty_expiry DATE,
    value DECIMAL(10, 2),
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

-- Create indexes for better performance
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);