import React, { useState } from 'react';

const RequestForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    equipment: '',
    title: '',
    description: '',
    priority: 'medium',
    requestedBy: '',
    assignedTo: ''
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

    if (!formData.equipment) {
      newErrors.equipment = 'Equipment selection is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Request title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Requestor name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, this would be an API call
      console.log('Submitting request:', formData);
      
      // Mock success
      alert('Request created successfully!');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Equipment *</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className={`form-control ${errors.equipment ? 'error' : ''}`}
            >
              <option value="">Select equipment</option>
              <option value="Assembly Line A">Assembly Line A</option>
              <option value="CNC Machine 1">CNC Machine 1</option>
              <option value="Packing Station 3">Packing Station 3</option>
              <option value="HVAC Unit 1">HVAC Unit 1</option>
              <option value="Quality Testing Bench">Quality Testing Bench</option>
            </select>
            {errors.equipment && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.equipment}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Request Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Enter request title"
            />
            {errors.title && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-control"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Enter detailed description of the issue"
              rows="5"
            ></textarea>
            {errors.description && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Requested By *</label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleChange}
              className={`form-control ${errors.requestedBy ? 'error' : ''}`}
              placeholder="Enter your name"
            />
            {errors.requestedBy && <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.requestedBy}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select technician</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Michael Chen">Michael Chen</option>
              <option value="Emily Rodriguez">Emily Rodriguez</option>
              <option value="David Wilson">David Wilson</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ textAlign: 'right' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginRight: '10px' }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create Request
        </button>
      </div>
    </form>
  );
};

export default RequestForm;