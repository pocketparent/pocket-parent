import ApiService from './ApiService';

class ImpersonationService {
  static async impersonateUser(userId) {
    try {
      // In a real implementation, this would make an API call to create an impersonation session
      // For now, we'll simulate this by storing the impersonated user ID in localStorage
      localStorage.setItem('impersonated_user_id', userId);
      
      // Fetch the user data to return
      const userData = await ApiService.getUser(userId);
      
      return {
        success: true,
        user: userData,
        message: 'Impersonation session started'
      };
    } catch (error) {
      console.error('Error impersonating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to impersonate user'
      };
    }
  }
  
  static async endImpersonation() {
    try {
      // Remove the impersonated user ID from localStorage
      localStorage.removeItem('impersonated_user_id');
      
      return {
        success: true,
        message: 'Impersonation session ended'
      };
    } catch (error) {
      console.error('Error ending impersonation:', error);
      return {
        success: false,
        error: error.message || 'Failed to end impersonation'
      };
    }
  }
  
  static getImpersonatedUserId() {
    return localStorage.getItem('impersonated_user_id');
  }
  
  static isImpersonating() {
    return !!localStorage.getItem('impersonated_user_id');
  }
}

export default ImpersonationService;
