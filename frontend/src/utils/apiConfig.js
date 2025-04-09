// API configuration for different environments
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:5000',
    timeout: 10000,
    retryAttempts: 3
  },
  production: {
    baseUrl: 'https://hatchling-backend.onrender.com',
    timeout: 15000,
    retryAttempts: 5
  },
  test: {
    baseUrl: 'http://localhost:5000',
    timeout: 5000,
    retryAttempts: 1
  }
};

// Get current environment
const getEnvironment = () => {
  // Check if we're in production based on URL or environment variable
  if (window.location.hostname.includes('render.com') || 
      process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Check if we're in test environment
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  
  // Default to development
  return 'development';
};

// Get API configuration for current environment
const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// Get base URL for API requests
const getApiBaseUrl = () => {
  return getApiConfig().baseUrl;
};

// Get API URL for specific endpoint
const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Get timeout for API requests
const getApiTimeout = () => {
  return getApiConfig().timeout;
};

// Get retry attempts for API requests
const getApiRetryAttempts = () => {
  return getApiConfig().retryAttempts;
};

export {
  getApiUrl,
  getApiBaseUrl,
  getApiTimeout,
  getApiRetryAttempts,
  getEnvironment
};
