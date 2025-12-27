// Validation utilities
class Validators {
  // Validate equipment data
  validateEquipment(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Equipment name is required');
    } else if (data.name.length > 100) {
      errors.push('Equipment name must be 100 characters or less');
    }

    if (!data.category || data.category.trim().length === 0) {
      errors.push('Equipment category is required');
    }

    if (!data.department_id) {
      errors.push('Department ID is required');
    }

    if (!data.status || !['operational', 'maintenance', 'out_of_order', 'locked_down'].includes(data.status)) {
      errors.push('Status must be one of: operational, maintenance, out_of_order, locked_down');
    }

    if (data.location && data.location.length > 200) {
      errors.push('Location must be 200 characters or less');
    }

    if (data.purchase_date && isNaN(Date.parse(data.purchase_date))) {
      errors.push('Purchase date must be a valid date');
    }

    if (data.warranty_expiry && isNaN(Date.parse(data.warranty_expiry))) {
      errors.push('Warranty expiry must be a valid date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate maintenance request data
  validateMaintenanceRequest(data) {
    const errors = [];

    if (!data.equipment_id) {
      errors.push('Equipment ID is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Request title is required');
    } else if (data.title.length > 200) {
      errors.push('Request title must be 200 characters or less');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Request description is required');
    }

    if (!data.priority || !['low', 'medium', 'high', 'critical'].includes(data.priority)) {
      errors.push('Priority must be one of: low, medium, high, critical');
    }

    if (!data.status || !['open', 'in_progress', 'closed', 'on_hold'].includes(data.status)) {
      errors.push('Status must be one of: open, in_progress, closed, on_hold');
    }

    if (data.assigned_technician_id && typeof data.assigned_technician_id !== 'number' && typeof data.assigned_technician_id !== 'string') {
      errors.push('Assigned technician ID must be a number or string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate technician data
  validateTechnician(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Technician name is required');
    } else if (data.name.length > 100) {
      errors.push('Technician name must be 100 characters or less');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email must be valid');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Phone number format is invalid');
    }

    if (data.specialization && data.specialization.length > 100) {
      errors.push('Specialization must be 100 characters or less');
    }

    if (!data.department_id) {
      errors.push('Department ID is required');
    }

    if (data.status && !['active', 'inactive', 'on_leave'].includes(data.status)) {
      errors.push('Status must be one of: active, inactive, on_leave');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate department data
  validateDepartment(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Department name is required');
    } else if (data.name.length > 100) {
      errors.push('Department name must be 100 characters or less');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate impact log data
  validateImpactLog(data) {
    const errors = [];

    if (!data.equipment_id) {
      errors.push('Equipment ID is required');
    }

    if (typeof data.downtime_hours !== 'number' || data.downtime_hours < 0) {
      errors.push('Downtime hours must be a non-negative number');
    }

    if (typeof data.affected_employees !== 'number' || data.affected_employees < 0) {
      errors.push('Affected employees must be a non-negative number');
    }

    if (typeof data.revenue_per_hour !== 'number' || data.revenue_per_hour < 0) {
      errors.push('Revenue per hour must be a non-negative number');
    }

    if (data.incident_description && data.incident_description.length > 1000) {
      errors.push('Incident description must be 1000 characters or less');
    }

    if (data.cost_calculated && typeof data.cost_calculated !== 'number') {
      errors.push('Calculated cost must be a number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user data
  validateUser(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email must be valid');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper: Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper: Validate phone number format
  isValidPhone(phone) {
    // Simple phone validation - allows numbers, spaces, hyphens, parentheses, and plus sign
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Helper: Validate date format
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Validate general numeric range
  validateNumericRange(value, min, max, fieldName) {
    const errors = [];

    if (typeof value !== 'number') {
      errors.push(`${fieldName} must be a number`);
    } else if (value < min || value > max) {
      errors.push(`${fieldName} must be between ${min} and ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate array of items using a specific validator
  validateArray(items, itemValidator) {
    if (!Array.isArray(items)) {
      return {
        isValid: false,
        errors: ['Expected an array of items']
      };
    }

    const results = items.map((item, index) => {
      const validation = itemValidator(item);
      return {
        index,
        ...validation
      };
    });

    const allValid = results.every(result => result.isValid);
    const errors = [];

    if (!allValid) {
      results.forEach((result, index) => {
        if (!result.isValid) {
          errors.push(`Item at index ${index}: ${result.errors.join(', ')}`);
        }
      });
    }

    return {
      isValid: allValid,
      errors,
      results
    };
  }
}

module.exports = new Validators();