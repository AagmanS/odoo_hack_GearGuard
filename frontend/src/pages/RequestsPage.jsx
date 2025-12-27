import React, { useState } from 'react';
import MaintenanceKanban from '../components/requests/MaintenanceKanban';
import RequestForm from '../components/requests/RequestForm';

const RequestsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddRequest = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Maintenance Requests</h1>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleAddRequest}>
            New Request
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Request</h2>
          <RequestForm onClose={handleCloseForm} />
        </div>
      )}

      <MaintenanceKanban />
    </div>
  );
};

export default RequestsPage;