import axios from 'axios';

class ApiService {
  constructor() {
    // Support both environment variable names for compatibility
    this.baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    this.defaultUserId = process.env.REACT_APP_DEFAULT_USER_ID || 'test_user_123';
    this.pollingInterval = parseInt(process.env.REACT_APP_POLLING_INTERVAL || '5000', 10);
    
    console.log('API Service initialized with baseUrl:', this.baseUrl);
    
    // Configure axios defaults for CORS
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response ? error.response.data : error.message);
        // Enhance error with additional information
        const enhancedError = new Error(
          error.response ? 
            `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` : 
            `Network Error: ${error.message}`
        );
        enhancedError.originalError = error;
        enhancedError.status = error.response ? error.response.status : 0;
        enhancedError.data = error.response ? error.response.data : null;
        throw enhancedError;
      }
    );
  }

  // Routine endpoints
  async getRoutines(userId = this.defaultUserId) {
    try {
      const response = await this.axiosInstance.get(`/routines`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }

  async createRoutine(routineData, userId = this.defaultUserId) {
    try {
      const response = await this.axiosInstance.post(`/parse-routine`, {
        text: routineData.text,
        user_id: userId,
        baby_id: routineData.baby_id
      });
      return response.data;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  }

  // SMS and caregiver updates endpoints
  async getCaregiverUpdates(userId = this.defaultUserId) {
    try {
      const response = await this.axiosInstance.get(`/sms`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching caregiver updates:', error);
      throw error;
    }
  }

  async sendSmsUpdate(message, fromNumber, userId = this.defaultUserId) {
    try {
      const response = await this.axiosInstance.post(`/sms`, {
        message,
        from_number: fromNumber,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SMS update:', error);
      throw error;
    }
  }

  // AI Assistant endpoints
  async sendAssistantMessage(userId = this.defaultUserId, message) {
    try {
      const response = await this.axiosInstance.post(`/assistant`, {
        message,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending assistant message:', error);
      throw error;
    }
  }

  // User and subscription endpoints
  async getUser(userId = this.defaultUserId) {
    try {
      const response = await this.axiosInstance.get(`/users`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async createOrUpdateUser(userData) {
    try {
      const response = await this.axiosInstance.post(`/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.axiosInstance.post(`/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async updateSubscription(userId = this.defaultUserId, subscriptionStatus) {
    try {
      const response = await this.axiosInstance.post(`/subscription`, {
        user_id: userId,
        subscription_status: subscriptionStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Health check to verify API connectivity
  async checkHealth() {
    try {
      const response = await this.axiosInstance.get(`/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Polling mechanism for real-time updates
  startPolling(callback, userId = this.defaultUserId, interval = this.pollingInterval) {
    // Initial fetch
    this.fetchUpdates(callback, userId);
    
    // Set up interval for polling
    const intervalId = setInterval(() => {
      this.fetchUpdates(callback, userId);
    }, interval);
    
    // Return interval ID so it can be cleared later
    return intervalId;
  }

  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  async fetchUpdates(callback, userId) {
    try {
      // Fetch both routines and caregiver updates
      const [routines, updates] = await Promise.all([
        this.getRoutines(userId),
        this.getCaregiverUpdates(userId)
      ]);
      
      // Call the callback with the fetched data
      callback({
        routines,
        updates
      });
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Call callback with error information
      callback({
        error: error.message,
        routines: [],
        updates: []
      });
    }
  }
}

export default new ApiService();
