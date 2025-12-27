# Gear-Guard API Documentation

## Overview
The Gear-Guard API provides endpoints for managing equipment, maintenance requests, technicians, and impact logs. The API follows RESTful principles and returns JSON responses.

## Base URL
`http://localhost:5000/api` (for development)
`https://yourdomain.com/api` (for production)

## Authentication
Some endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Common Response Format
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

Or in case of error:
```json
{
  "status": "error",
  "message": "Error message"
}
```

## Endpoints

### Equipment

#### GET /equipment
Get all equipment

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Assembly Line A",
      "category": "Manufacturing",
      "department_id": 1,
      "status": "operational",
      "location": "Production Floor A",
      "purchase_date": "2022-01-15",
      "warranty_expiry": "2025-01-15",
      "value": 150000.00,
      "criticality": 9,
      "production_priority": 10,
      "skill_dependency": 0.8,
      "safety_risk": 7,
      "maintenance_backlog": 0,
      "energy_consumption": 250.00,
      "emissions_rate": 50.00,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /equipment/:id
Get equipment by ID

#### POST /equipment
Create new equipment

**Request Body:**
```json
{
  "name": "New Equipment",
  "category": "Manufacturing",
  "department_id": 1,
  "status": "operational",
  "location": "Production Floor B",
  "purchase_date": "2023-01-01",
  "warranty_expiry": "2026-01-01",
  "value": 50000.00,
  "criticality": 7,
  "production_priority": 8,
  "skill_dependency": 0.5,
  "safety_risk": 5,
  "maintenance_backlog": 0,
  "energy_consumption": 100.00,
  "emissions_rate": 20.00
}
```

#### PUT /equipment/:id
Update equipment

#### DELETE /equipment/:id
Delete equipment

### Maintenance Requests

#### GET /requests
Get all maintenance requests

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "equipment_id": 1,
      "title": "Monthly Lubrication Service",
      "description": "Perform scheduled lubrication...",
      "priority": "medium",
      "status": "open",
      "assigned_technician_id": 1,
      "requested_by": "Production Manager",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "equipment_name": "Assembly Line A",
      "technician_name": "John Smith"
    }
  ]
}
```

#### GET /requests/:id
Get maintenance request by ID

#### POST /requests
Create new maintenance request

**Request Body:**
```json
{
  "equipment_id": 1,
  "title": "New Maintenance Request",
  "description": "Detailed description of the issue",
  "priority": "high",
  "status": "open",
  "assigned_technician_id": 1,
  "requested_by": "Requestor Name"
}
```

#### PUT /requests/:id
Update maintenance request

#### DELETE /requests/:id
Delete maintenance request

### Technicians

#### GET /technicians
Get all technicians

#### GET /technicians/:id
Get technician by ID

#### POST /technicians
Create new technician

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "555-0000",
  "specialization": "Mechanical Systems",
  "department_id": 2,
  "status": "active"
}
```

#### PUT /technicians/:id
Update technician

#### DELETE /technicians/:id
Delete technician

### Impact Logs

#### GET /impact
Get all impact logs

#### GET /impact/:id
Get impact log by ID

#### POST /impact
Create new impact log

**Request Body:**
```json
{
  "equipment_id": 1,
  "downtime_hours": 2.5,
  "affected_employees": 5,
  "revenue_per_hour": 1000.00,
  "incident_description": "Description of the incident",
  "cost_calculated": 2500.00
}
```

#### PUT /impact/:id
Update impact log

#### DELETE /impact/:id
Delete impact log

#### POST /impact/calculate
Calculate downtime impact without saving

**Request Body:**
```json
{
  "downtime_hours": 2.5,
  "affected_employees": 5,
  "revenue_per_hour": 1000.00
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "downtime_hours": 2.5,
    "affected_employees": 5,
    "revenue_per_hour": 1000.00,
    "total_cost": 3750.00
  }
}
```

## Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting
The API implements rate limiting to prevent abuse. Default limits are 100 requests per minute per IP address.