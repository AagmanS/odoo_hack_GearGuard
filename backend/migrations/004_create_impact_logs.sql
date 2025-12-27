-- SQL for creating the impact_logs table
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
CREATE INDEX idx_impact_logs_equipment ON impact_logs(equipment_id);
CREATE INDEX idx_impact_logs_downtime ON impact_logs(downtime_hours);
CREATE INDEX idx_impact_logs_created_at ON impact_logs(created_at);