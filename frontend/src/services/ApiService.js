import axios from 'axios';

class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    this.defaultUserId = process.env.REACT_APP_DEFAULT_USER_ID || 'test_user_123';
    this.pollingInterval = parseInt(process.env.REACT_APP_POLLING_INTERVAL || '5000', 10);
  }

  // Routine endpoints
  async getRoutines(userId = this.defaultUserId) {
    try {
      const response = await axios.get(`${this.baseUrl}/routines`, {
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
      const response = await axios.post(`${this.baseUrl}/parse-routine`, {
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
      const response = await axios.get(`${this.baseUrl}/sms`, {
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
      const response = await axios.post(`${this.baseUrl}/sms`, {
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
      const response = await axios.post(`${this.baseUrl}/assistant`, {
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
      const response = await axios.get(`${this.baseUrl}/users`, {
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
      const response = await axios.post(`${this.baseUrl}/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async updateSubscription(userId = this.defaultUserId, subscriptionStatus) {
    try {
      const response = await axios.post(`${this.baseUrl}/subscription`, {
        user_id: userId,
        subscription_status: subscriptionStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
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
    }
  }
}

export default new ApiService();
