-- Seed data for Gear-Guard application

-- Insert sample departments
INSERT INTO departments (name, description, manager_id) VALUES
('Production', 'Manufacturing and production operations', 1),
('Maintenance', 'Equipment maintenance and repair', 2),
('Quality Control', 'Quality assurance and testing', 3),
('Logistics', 'Shipping, receiving, and inventory', 4),
('IT', 'Information technology and systems', 5)
ON CONFLICT DO NOTHING;

-- Insert sample technicians
INSERT INTO technicians (name, email, phone, specialization, department_id, status) VALUES
('John Smith', 'john.smith@company.com', '555-0101', 'Mechanical Systems', 2, 'active'),
('Sarah Johnson', 'sarah.j@company.com', '555-0102', 'Electrical Systems', 2, 'active'),
('Michael Chen', 'michael.c@company.com', '555-0103', 'HVAC Systems', 2, 'active'),
('Emily Rodriguez', 'emily.r@company.com', '555-0104', 'Quality Assurance', 3, 'active'),
('David Wilson', 'david.w@company.com', '555-0105', 'IT Systems', 5, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (name, category, department_id, status, location, purchase_date, warranty_expiry, value, criticality, production_priority, skill_dependency, safety_risk, maintenance_backlog, energy_consumption, emissions_rate) VALUES
('Assembly Line A', 'Manufacturing', 1, 'operational', 'Production Floor A', '2022-01-15', '2025-01-15', 150000.00, 9, 10, 0.8, 7, 0, 250.00, 50.00),
('CNC Machine 1', 'Manufacturing', 1, 'operational', 'Machining Area', '2021-06-20', '2024-06-20', 85000.00, 8, 8, 0.9, 6, 1, 180.00, 35.00),
('Packing Station 3', 'Manufacturing', 1, 'maintenance', 'Packaging Area', '2020-03-10', '2023-03-10', 25000.00, 6, 6, 0.3, 4, 0, 45.00, 10.00),
('HVAC Unit 1', 'HVAC', 1, 'operational', 'Building A Roof', '2019-08-05', '2024-08-05', 45000.00, 7, 5, 0.7, 5, 0, 320.00, 25.00),
('Quality Testing Bench', 'Quality Control', 3, 'operational', 'QC Lab', '2023-02-18', '2026-02-18', 35000.00, 5, 7, 0.6, 3, 0, 60.00, 15.00),
('Forklift A1', 'Transportation', 4, 'operational', 'Warehouse', '2022-11-30', '2025-11-30', 25000.00, 6, 4, 0.4, 8, 0, 15.00, 5.00),
('Server Room Cooling', 'IT', 5, 'operational', 'Server Room', '2021-09-12', '2024-09-12', 15000.00, 10, 9, 0.9, 9, 0, 200.00, 40.00)
ON CONFLICT DO NOTHING;

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (equipment_id, title, description, priority, status, assigned_technician_id, requested_by) VALUES
(1, 'Monthly Lubrication Service', 'Perform scheduled lubrication on assembly line components', 'medium', 'open', 1, 'Production Manager'),
(2, 'Calibration Required', 'CNC machine requires precision calibration after 1000 hours of operation', 'high', 'in_progress', 2, 'Quality Manager'),
(3, 'Belt Replacement', 'Packing station belt showing signs of wear, needs replacement', 'medium', 'open', 1, 'Line Supervisor'),
(4, 'Filter Change', 'HVAC unit air filters need replacement per schedule', 'low', 'closed', 3, 'Facilities Manager'),
(7, 'Cooling System Check', 'Server room cooling system needs inspection', 'critical', 'open', 5, 'IT Manager')
ON CONFLICT DO NOTHING;

-- Insert sample impact logs
INSERT INTO impact_logs (equipment_id, downtime_hours, affected_employees, revenue_per_hour, incident_description, cost_calculated, human_impact_score, operational_impact_score, environmental_impact_score) VALUES
(1, 4.5, 12, 2500.00, 'Emergency shutdown due to safety sensor activation', 14250.00, 75.00, 85.00, 30.00),
(2, 2.0, 3, 1200.00, 'CNC machine overheating, required immediate repair', 3600.00, 45.00, 60.00, 25.00),
(7, 0.5, 1, 5000.00, 'Brief server cooling system maintenance', 3750.00, 20.00, 90.00, 40.00)
ON CONFLICT DO NOTHING;