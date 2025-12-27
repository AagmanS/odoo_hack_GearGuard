import React, { useState, useEffect } from 'react';
import EquipmentList from '../components/equipment/EquipmentList';
import EquipmentForm from '../components/equipment/EquipmentForm';

const EquipmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddEquipment = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    // Trigger a refresh of the equipment list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Equipment Management</h1>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleAddEquipment}>
            Add Equipment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2>Add New Equipment</h2>
          <EquipmentForm onClose={handleCloseForm} />
        </div>
      )}

      <EquipmentList key={refreshTrigger} />
    </div>
  );
};

export default EquipmentPage;