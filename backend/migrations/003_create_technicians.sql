-- SQL for creating the technicians table
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    department_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on_leave
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_technicians_department ON technicians(department_id);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_email ON technicians(email);