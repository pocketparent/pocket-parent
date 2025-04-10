import axios from 'axios';

class ApiService {
  static API_URL = process.env.REACT_APP_API_URL || 'https://hatchling-backend.onrender.com';
  static DEFAULT_USER_ID = process.env.REACT_APP_DEFAULT_USER_ID || 'default';

  // Health check
  static async checkHealth() {
    try {
      const response = await axios.get(`${this.API_URL}/health`);
      return response.data && response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // User authentication
  static async login(email, password) {
    try {
      const response = await axios.post(`${this.API_URL}/login`, { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // User management
  static async createOrUpdateUser(userData) {
    try {
      const response = await axios.post(`${this.API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Create/update user error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async getUser(userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.get(`${this.API_URL}/users?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async getAllUsers() {
    try {
      const response = await axios.get(`${this.API_URL}/admin/users`);
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // Routine management
  static async getRoutines(userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.get(`${this.API_URL}/routines?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get routines error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async createRoutine(routineData, userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.post(`${this.API_URL}/api/routines`, {
        routine: routineData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Create routine error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // Caregiver updates
  static async getCaregiverUpdates(userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.get(`${this.API_URL}/api/updates?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get caregiver updates error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async addCaregiverUpdate(updateData, userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.post(`${this.API_URL}/api/updates`, {
        update: updateData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Add caregiver update error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // SMS functionality
  static async sendSms(message, fromNumber, userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.post(`${this.API_URL}/sms`, {
        message,
        from_number: fromNumber,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Send SMS error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async getSmsMessages(userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.get(`${this.API_URL}/sms?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get SMS messages error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  static async getAllSmsActivity() {
    try {
      const response = await axios.get(`${this.API_URL}/admin/sms-activity`);
      return response.data;
    } catch (error) {
      console.error('Get all SMS activity error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // Assistant functionality
  static async getAssistantResponse(message, userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.post(`${this.API_URL}/assistant`, {
        message,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Get assistant response error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // Subscription management
  static async updateSubscription(subscriptionData, userId = this.DEFAULT_USER_ID) {
    try {
      const response = await axios.post(`${this.API_URL}/subscription`, {
        ...subscriptionData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error.response ? error.response.data : error;
    }
  }

  // Impersonation functionality
  static async impersonateUser(userId) {
    try {
      // This would typically be a server endpoint, but for now we'll implement it client-side
      // Import the ImpersonationService dynamically to avoid circular dependencies
      const ImpersonationService = (await import('./ImpersonationService')).default;
      return await ImpersonationService.impersonateUser(userId);
    } catch (error) {
      console.error('Impersonate user error:', error);
      throw error;
    }
  }

  static async endImpersonation() {
    try {
      // This would typically be a server endpoint, but for now we'll implement it client-side
      const ImpersonationService = (await import('./ImpersonationService')).default;
      return await ImpersonationService.endImpersonation();
    } catch (error) {
      console.error('End impersonation error:', error);
      throw error;
    }
  }
}

export default ApiService;
