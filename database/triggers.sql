-- Database triggers for Gear-Guard application

-- Trigger to update the updated_at timestamp for equipment
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_updated_at();

-- Trigger to update the updated_at timestamp for maintenance_requests
CREATE OR REPLACE FUNCTION update_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_requests_updated_at();

-- Trigger to update the updated_at timestamp for technicians
CREATE OR REPLACE FUNCTION update_technicians_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW
    EXECUTE FUNCTION update_technicians_updated_at();

-- Trigger to update the updated_at timestamp for departments
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_departments_updated_at();

-- Trigger to update the updated_at timestamp for impact_logs
CREATE OR REPLACE FUNCTION update_impact_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_impact_logs_updated_at
    BEFORE UPDATE ON impact_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_impact_logs_updated_at();

-- Trigger to automatically calculate impact when a maintenance request is closed
-- This is a simplified example - in a real application, this would be more complex
CREATE OR REPLACE FUNCTION calculate_impact_on_request_close()
RETURNS TRIGGER AS $$
DECLARE
    equipment_record RECORD;
    downtime_hours DECIMAL(8,2);
BEGIN
    -- Only calculate impact when request is being closed
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        -- Get equipment information
        SELECT * INTO equipment_record 
        FROM equipment 
        WHERE id = NEW.equipment_id;
        
        -- Calculate estimated downtime (this is a simplified calculation)
        -- In a real application, you would have more precise data about actual downtime
        downtime_hours := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.updated_at)) / 3600;
        
        -- Insert an impact log if the equipment was down for more than 1 hour
        IF downtime_hours > 1 THEN
            INSERT INTO impact_logs (
                equipment_id,
                downtime_hours,
                affected_employees,
                revenue_per_hour,
                incident_description,
                cost_calculated
            ) VALUES (
                NEW.equipment_id,
                downtime_hours,
                5, -- Default affected employees
                1000, -- Default revenue per hour
                'Maintenance request closed - estimated downtime impact',
                downtime_hours * 1000 -- Default cost calculation
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_impact_on_request_close
    AFTER UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION calculate_impact_on_request_close();

-- Trigger to update equipment status based on maintenance requests
CREATE OR REPLACE FUNCTION update_equipment_status_from_requests()
RETURNS TRIGGER AS $$
DECLARE
    active_requests_count INTEGER;
BEGIN
    -- Count active maintenance requests for this equipment
    SELECT COUNT(*) INTO active_requests_count
    FROM maintenance_requests
    WHERE equipment_id = NEW.equipment_id 
    AND status IN ('open', 'in_progress');
    
    -- Update equipment status based on active requests
    IF active_requests_count > 0 AND NEW.status != 'locked_down' THEN
        -- If there are active requests and equipment is operational, mark as maintenance
        UPDATE equipment 
        SET status = 'maintenance'
        WHERE id = NEW.equipment_id 
        AND status = 'operational';
    ELSIF active_requests_count = 0 THEN
        -- If no active requests and equipment was in maintenance, mark as operational
        UPDATE equipment 
        SET status = 'operational'
        WHERE id = NEW.equipment_id 
        AND status = 'maintenance';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_status_from_requests
    AFTER INSERT OR UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_status_from_requests();