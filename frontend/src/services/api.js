// API service for making API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  // Generic method to make API requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Equipment API methods
  async getEquipment() {
    return this.request('/equipment');
  }

  async getEquipmentById(id) {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(data) {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id, data) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipment(id) {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance Request API methods
  async getRequests() {
    return this.request('/requests');
  }

  async getRequestById(id) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(data) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id, data) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRequest(id) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Technician API methods
  async getTechnicians() {
    return this.request('/technicians');
  }

  async getTechnicianById(id) {
    return this.request(`/technicians/${id}`);
  }

  async createTechnician(data) {
    return this.request('/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTechnician(id, data) {
    return this.request(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTechnician(id) {
    return this.request(`/technicians/${id}`, {
      method: 'DELETE',
    });
  }

  // Impact API methods
  async getImpactLogs() {
    return this.request('/impact');
  }

  async getImpactLogById(id) {
    return this.request(`/impact/${id}`);
  }

  async createImpactLog(data) {
    return this.request('/impact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateImpactLog(id, data) {
    return this.request(`/impact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteImpactLog(id) {
    return this.request(`/impact/${id}`, {
      method: 'DELETE',
    });
  }

  async calculateDowntimeImpact(data) {
    return this.request('/impact/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();