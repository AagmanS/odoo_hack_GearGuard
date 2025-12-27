# Gear-Guard Database Schema

## Overview
This document describes the database schema for the Gear-Guard application. The database is built using PostgreSQL and includes tables for equipment, maintenance requests, technicians, departments, and impact logs.

## Tables

### 1. departments
Stores information about departments in the organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for department |
| name | VARCHAR(100) | NOT NULL | Department name |
| description | TEXT | | Department description |
| manager_id | INTEGER | | ID of the department manager |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp |

### 2. technicians
Stores information about maintenance technicians.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for technician |
| name | VARCHAR(100) | NOT NULL | Technician's full name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Technician's email address |
| phone | VARCHAR(20) | | Technician's phone number |
| specialization | VARCHAR(100) | | Area of expertise |
| department_id | INTEGER | NOT NULL, FOREIGN KEY (departments.id) | Department technician belongs to |
| status | VARCHAR(20) | DEFAULT 'active' | Technician status: active, inactive, on_leave |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp |

### 3. equipment
Stores information about equipment in the facility.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for equipment |
| name | VARCHAR(100) | NOT NULL | Equipment name |
| category | VARCHAR(50) | NOT NULL | Equipment category (Manufacturing, HVAC, etc.) |
| department_id | INTEGER | NOT NULL, FOREIGN KEY (departments.id) | Department equipment belongs to |
| status | VARCHAR(20) | DEFAULT 'operational' | Equipment status: operational, maintenance, out_of_order, locked_down |
| location | VARCHAR(200) | | Physical location of equipment |
| purchase_date | DATE | | Date when equipment was purchased |
| warranty_expiry | DATE | | Date when warranty expires |
| value | DECIMAL(10,2) | | Equipment value in dollars |
| criticality | INTEGER | DEFAULT 5 | Criticality score (1-10) |
| production_priority | INTEGER | DEFAULT 5 | Production priority score (1-10) |
| skill_dependency | DECIMAL(3,2) | DEFAULT 0 | Skill dependency factor (0-1) |
| safety_risk | INTEGER | DEFAULT 0 | Safety risk score (0-10) |
| maintenance_backlog | INTEGER | DEFAULT 0 | Number of pending maintenance items |
| energy_consumption | DECIMAL(8,2) | DEFAULT 0 | Energy consumption in kWh |
| emissions_rate | DECIMAL(8,2) | DEFAULT 0 | Emissions rate in kg CO2/hour |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp |

### 4. maintenance_requests
Stores maintenance requests for equipment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for request |
| equipment_id | INTEGER | NOT NULL, FOREIGN KEY (equipment.id) ON DELETE CASCADE | Equipment associated with request |
| title | VARCHAR(200) | NOT NULL | Request title |
| description | TEXT | NOT NULL | Detailed description of the issue |
| priority | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | Priority level: low, medium, high, critical |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Request status: open, in_progress, closed, on_hold |
| assigned_technician_id | INTEGER | FOREIGN KEY (technicians.id) | Technician assigned to the request |
| requested_by | VARCHAR(100) | NOT NULL | Person who requested the maintenance |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp |

### 5. impact_logs
Stores impact logs for equipment downtime and incidents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for impact log |
| equipment_id | INTEGER | NOT NULL, FOREIGN KEY (equipment.id) ON DELETE CASCADE | Equipment associated with impact |
| downtime_hours | DECIMAL(8,2) | NOT NULL | Number of hours of downtime |
| affected_employees | INTEGER | NOT NULL, DEFAULT 0 | Number of employees affected |
| revenue_per_hour | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Revenue lost per hour of downtime |
| incident_description | TEXT | | Description of the incident |
| cost_calculated | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Calculated cost of the impact |
| human_impact_score | DECIMAL(5,2) | DEFAULT 0 | Human impact score (0-100) |
| operational_impact_score | DECIMAL(5,2) | DEFAULT 0 | Operational impact score (0-100) |
| environmental_impact_score | DECIMAL(5,2) | DEFAULT 0 | Environmental impact score (0-100) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp |

## Relationships

### Foreign Key Constraints

1. **equipment.department_id** → departments.id
2. **technicians.department_id** → departments.id
3. **maintenance_requests.equipment_id** → equipment.id (ON DELETE CASCADE)
4. **maintenance_requests.assigned_technician_id** → technicians.id
5. **impact_logs.equipment_id** → equipment.id (ON DELETE CASCADE)

## Indexes

The following indexes have been created to improve query performance:

- `idx_equipment_department` on equipment(department_id)
- `idx_equipment_status` on equipment(status)
- `idx_equipment_category` on equipment(category)
- `idx_requests_equipment` on maintenance_requests(equipment_id)
- `idx_requests_technician` on maintenance_requests(assigned_technician_id)
- `idx_requests_priority` on maintenance_requests(priority)
- `idx_requests_status` on maintenance_requests(status)
- `idx_requests_created_at` on maintenance_requests(created_at)
- `idx_impact_logs_equipment` on impact_logs(equipment_id)
- `idx_impact_logs_downtime` on impact_logs(downtime_hours)
- `idx_impact_logs_created_at` on impact_logs(created_at)
- `idx_technicians_department` on technicians(department_id)
- `idx_technicians_status` on technicians(status)
- `idx_technicians_email` on technicians(email)

## Triggers

The database includes the following triggers:

1. `update_equipment_updated_at` - Automatically updates the `updated_at` field before equipment records are updated
2. `update_requests_updated_at` - Automatically updates the `updated_at` field before maintenance request records are updated
3. `update_technicians_updated_at` - Automatically updates the `updated_at` field before technician records are updated
4. `update_departments_updated_at` - Automatically updates the `updated_at` field before department records are updated
5. `update_impact_logs_updated_at` - Automatically updates the `updated_at` field before impact log records are updated
6. `calculate_impact_on_request_close` - Automatically calculates and logs impact when maintenance requests are closed
7. `update_equipment_status_from_requests` - Automatically updates equipment status based on active maintenance requests

## Stored Functions

The database includes several stored functions for calculations:

1. `calculate_downtime_cost` - Calculates the cost of equipment downtime
2. `calculate_human_impact` - Calculates the human impact score
3. `calculate_operational_impact` - Calculates the operational impact score
4. `get_equipment_risk_level` - Determines the risk level of equipment
5. `get_maintenance_summary` - Gets a summary of maintenance activities for a date range