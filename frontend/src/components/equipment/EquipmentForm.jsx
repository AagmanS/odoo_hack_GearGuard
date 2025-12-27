import React, { useState } from 'react';

const EquipmentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '',
    status: 'operational',
    location: '',
    purchase_date: '',
    warranty_expiry: '',
    criticality: 5,
    safety_risk: 0
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, this would be an API call
      console.log('Submitting equipment:', formData);
      
      // Mock success
      alert('Equipment added successfully!');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Equipment Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="Enter equipment name"
            />
            {errors.name && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-control ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select category</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="HVAC">HVAC</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Transportation">Transportation</option>
              <option value="IT">IT</option>
              <option value="Power Generation">Power Generation</option>
            </select>
            {errors.category && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.category}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`form-control ${errors.department ? 'error' : ''}`}
            >
              <option value="">Select department</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Logistics">Logistics</option>
              <option value="IT">IT</option>
              <option value="Facilities">Facilities</option>
            </select>
            {errors.department && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.department}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
            >
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Out of Order</option>
              <option value="locked_down">Locked Down</option>
            </select>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter location"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty Expiry</label>
            <input
              type="date"
              name="warranty_expiry"
              value={formData.warranty_expiry}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Criticality (1-10)</label>
            <input
              type="range"
              name="criticality"
              min="1"
              max="10"
              value={formData.criticality}
              onChange={handleChange}
              className="form-control"
              style={{ padding: '0' }}
            />
            <div style={{ textAlign: 'center', marginTop: '5px' }}>
              {formData.criticality}/10
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Safety Risk (0-10)</label>
            <input
              type="range"
              name="safety_risk"
              min="0"
              max="10"
              value={formData.safety_risk}
              onChange={handleChange}
              className="form-control"
              style={{ padding: '0' }}
            />
            <div style={{ textAlign: 'center', marginTop: '5px' }}>
              {formData.safety_risk}/10
            </div>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ textAlign: 'right' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginRight: '10px' }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add Equipment
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;