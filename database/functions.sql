-- Stored procedures and functions for Gear-Guard application

-- Function to calculate downtime cost
CREATE OR REPLACE FUNCTION calculate_downtime_cost(
    p_downtime_hours DECIMAL,
    p_affected_employees INTEGER,
    p_revenue_per_hour DECIMAL,
    p_hourly_wage DECIMAL DEFAULT 50,
    p_equipment_value DECIMAL DEFAULT 0,
    p_production_loss DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
    revenue_loss DECIMAL;
    labor_cost DECIMAL;
    production_cost DECIMAL;
    depreciation_cost DECIMAL;
    total_cost DECIMAL;
BEGIN
    -- Calculate individual cost components
    revenue_loss := p_downtime_hours * p_revenue_per_hour;
    labor_cost := p_downtime_hours * p_affected_employees * p_hourly_wage;
    production_cost := p_production_loss * (p_downtime_hours / 24);
    depreciation_cost := p_equipment_value * 0.001 * (p_downtime_hours / 8760);
    
    -- Calculate total cost
    total_cost := revenue_loss + labor_cost + production_cost + depreciation_cost;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate human impact score
CREATE OR REPLACE FUNCTION calculate_human_impact(
    p_affected_employees INTEGER,
    p_downtime_hours DECIMAL,
    p_safety_risk INTEGER DEFAULT 0,
    p_skill_dependency DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
    employee_impact DECIMAL;
    safety_impact DECIMAL;
    skill_impact DECIMAL;
    human_impact_score DECIMAL;
BEGIN
    -- Calculate impact on employees
    employee_impact := p_affected_employees * p_downtime_hours;
    
    -- Calculate safety impact (0-1 scale converted to 0-100)
    safety_impact := LEAST(p_safety_risk, 10) * 10;
    
    -- Calculate skill dependency impact (0-1 scale converted to 0-100)
    skill_impact := LEAST(p_skill_dependency, 1) * 100;
    
    -- Calculate overall human impact score (0-100)
    human_impact_score := LEAST(
        (employee_impact * 0.3) + (safety_impact * 0.4) + (skill_impact * 0.3),
        100
    );
    
    RETURN human_impact_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate operational impact score
CREATE OR REPLACE FUNCTION calculate_operational_impact(
    p_downtime_hours DECIMAL,
    p_equipment_criticality INTEGER,
    p_production_priority INTEGER,
    p_maintenance_backlog INTEGER DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
    criticality_factor DECIMAL;
    priority_factor DECIMAL;
    operational_impact DECIMAL;
BEGIN
    -- Calculate factors (1-10 scale normalized to 0-1)
    criticality_factor := LEAST(p_equipment_criticality, 10) / 10.0;
    priority_factor := LEAST(p_production_priority, 10) / 10.0;
    
    -- Calculate operational impact score
    operational_impact := 
        (p_downtime_hours * criticality_factor * 30) + 
        (p_downtime_hours * priority_factor * 25) + 
        (p_maintenance_backlog * 15); -- Each backlog item adds impact
    
    RETURN LEAST(operational_impact, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get equipment risk level
CREATE OR REPLACE FUNCTION get_equipment_risk_level(
    p_equipment_id INTEGER
) RETURNS TABLE(
    risk_score DECIMAL,
    risk_level VARCHAR,
    risk_factors JSON
) AS $$
DECLARE
    equipment_record RECORD;
    recent_requests INTEGER;
    high_priority_requests INTEGER;
    open_requests INTEGER;
    years_old DECIMAL;
    risk_score_calc DECIMAL;
BEGIN
    -- Get equipment details
    SELECT * INTO equipment_record
    FROM equipment
    WHERE id = p_equipment_id;
    
    -- Calculate age in years
    IF equipment_record.purchase_date IS NOT NULL THEN
        years_old := EXTRACT(EPOCH FROM (CURRENT_DATE - equipment_record.purchase_date::timestamp)) / (365.25 * 24 * 3600);
    ELSE
        years_old := 0;
    END IF;
    
    -- Get recent maintenance requests (last 30 days)
    SELECT 
        COUNT(*) INTO recent_requests
    FROM maintenance_requests
    WHERE equipment_id = p_equipment_id
    AND created_at > CURRENT_DATE - INTERVAL '30 days';
    
    -- Get high priority requests
    SELECT 
        COUNT(*) INTO high_priority_requests
    FROM maintenance_requests
    WHERE equipment_id = p_equipment_id
    AND priority = 'high'
    AND created_at > CURRENT_DATE - INTERVAL '30 days';
    
    -- Get open requests
    SELECT 
        COUNT(*) INTO open_requests
    FROM maintenance_requests
    WHERE equipment_id = p_equipment_id
    AND status IN ('open', 'in_progress');
    
    -- Calculate risk score (base risk from category + additional factors)
    risk_score_calc := 25; -- Base risk
    
    -- Add category-specific risk
    CASE equipment_record.category
        WHEN 'HVAC' THEN risk_score_calc := risk_score_calc + 20;
        WHEN 'Manufacturing' THEN risk_score_calc := risk_score_calc + 40;
        WHEN 'Processing' THEN risk_score_calc := risk_score_calc + 35;
        WHEN 'Transportation' THEN risk_score_calc := risk_score_calc + 30;
        WHEN 'Power Generation' THEN risk_score_calc := risk_score_calc + 50;
        ELSE risk_score_calc := risk_score_calc + 25;
    END CASE;
    
    -- Add risk based on recent high priority requests
    risk_score_calc := risk_score_calc + (high_priority_requests * 15);
    
    -- Add risk based on open requests
    risk_score_calc := risk_score_calc + (open_requests * 10);
    
    -- Add risk based on equipment age (for equipment over 10 years)
    IF years_old > 10 THEN
        risk_score_calc := risk_score_calc + ((years_old - 10) * 3);
    END IF;
    
    -- Add risk if warranty has expired
    IF equipment_record.warranty_expiry IS NOT NULL AND equipment_record.warranty_expiry < CURRENT_DATE THEN
        risk_score_calc := risk_score_calc + 15;
    END IF;
    
    -- Cap the risk score at 100
    risk_score_calc := LEAST(risk_score_calc, 100);
    
    -- Determine risk level
    IF risk_score_calc >= 80 THEN
        RETURN QUERY SELECT risk_score_calc, 'critical'::VARCHAR, json_build_object(
            'category_risk', 
            CASE equipment_record.category
                WHEN 'HVAC' THEN 20
                WHEN 'Manufacturing' THEN 40
                WHEN 'Processing' THEN 35
                WHEN 'Transportation' THEN 30
                WHEN 'Power Generation' THEN 50
                ELSE 25
            END,
            'recent_high_priority_requests', high_priority_requests,
            'open_requests', open_requests,
            'equipment_age_factor', GREATEST((years_old - 10) * 3, 0),
            'warranty_expired', equipment_record.warranty_expiry IS NOT NULL AND equipment_record.warranty_expiry < CURRENT_DATE
        );
    ELSIF risk_score_calc >= 60 THEN
        RETURN QUERY SELECT risk_score_calc, 'high'::VARCHAR, json_build_object(
            'category_risk', 
            CASE equipment_record.category
                WHEN 'HVAC' THEN 20
                WHEN 'Manufacturing' THEN 40
                WHEN 'Processing' THEN 35
                WHEN 'Transportation' THEN 30
                WHEN 'Power Generation' THEN 50
                ELSE 25
            END,
            'recent_high_priority_requests', high_priority_requests,
            'open_requests', open_requests,
            'equipment_age_factor', GREATEST((years_old - 10) * 3, 0),
            'warranty_expired', equipment_record.warranty_expiry IS NOT NULL AND equipment_record.warranty_expiry < CURRENT_DATE
        );
    ELSIF risk_score_calc >= 40 THEN
        RETURN QUERY SELECT risk_score_calc, 'medium'::VARCHAR, json_build_object(
            'category_risk', 
            CASE equipment_record.category
                WHEN 'HVAC' THEN 20
                WHEN 'Manufacturing' THEN 40
                WHEN 'Processing' THEN 35
                WHEN 'Transportation' THEN 30
                WHEN 'Power Generation' THEN 50
                ELSE 25
            END,
            'recent_high_priority_requests', high_priority_requests,
            'open_requests', open_requests,
            'equipment_age_factor', GREATEST((years_old - 10) * 3, 0),
            'warranty_expired', equipment_record.warranty_expiry IS NOT NULL AND equipment_record.warranty_expiry < CURRENT_DATE
        );
    ELSE
        RETURN QUERY SELECT risk_score_calc, 'low'::VARCHAR, json_build_object(
            'category_risk', 
            CASE equipment_record.category
                WHEN 'HVAC' THEN 20
                WHEN 'Manufacturing' THEN 40
                WHEN 'Processing' THEN 35
                WHEN 'Transportation' THEN 30
                WHEN 'Power Generation' THEN 50
                ELSE 25
            END,
            'recent_high_priority_requests', high_priority_requests,
            'open_requests', open_requests,
            'equipment_age_factor', GREATEST((years_old - 10) * 3, 0),
            'warranty_expired', equipment_record.warranty_expiry IS NOT NULL AND equipment_record.warranty_expiry < CURRENT_DATE
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get maintenance summary for a date range
CREATE OR REPLACE FUNCTION get_maintenance_summary(
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE(
    total_requests INTEGER,
    completed_requests INTEGER,
    open_requests INTEGER,
    avg_response_time INTERVAL,
    total_cost DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_requests,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) AS completed_requests,
        COUNT(CASE WHEN status = 'open' THEN 1 END) AS open_requests,
        AVG(CASE WHEN status = 'closed' THEN updated_at - created_at END) AS avg_response_time,
        SUM(CASE WHEN il.cost_calculated IS NOT NULL THEN il.cost_calculated ELSE 0 END) AS total_cost
    FROM maintenance_requests mr
    LEFT JOIN impact_logs il ON mr.equipment_id = il.equipment_id
        AND il.created_at BETWEEN p_start_date AND p_end_date
    WHERE mr.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;