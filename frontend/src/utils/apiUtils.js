import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button,
  CircularProgress,
  Box
} from '@material-ui/core';
import { 
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon
} from '@material-ui/icons';
import axios from 'axios';

// API connection state management
const API_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Custom hook for API calls with retry logic
const useApiWithRetry = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(API_STATES.IDLE);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    method = 'GET', 
    payload = null, 
    maxRetries = 3, 
    retryDelay = 1000,
    dependencies = [],
    onSuccess = () => {},
    onError = () => {}
  } = options;
  
  const executeRequest = async () => {
    setStatus(API_STATES.LOADING);
    
    try {
      // Log the request for debugging
      console.log(`API Request (${method}): ${url}`, payload);
      
      // Execute the request with the appropriate method
      let response;
      if (method === 'GET') {
        response = await axios.get(url);
      } else if (method === 'POST') {
        response = await axios.post(url, payload);
      } else if (method === 'PUT') {
        response = await axios.put(url, payload);
      } else if (method === 'DELETE') {
        response = await axios.delete(url);
      }
      
      // Log the response for debugging
      console.log(`API Response (${method}): ${url}`, response.data);
      
      setData(response.data);
      setStatus(API_STATES.SUCCESS);
      setError(null);
      setRetryCount(0);
      onSuccess(response.data);
    } catch (err) {
      console.error(`API Error (${method}): ${url}`, err);
      
      // Determine if we should retry
      if (retryCount < maxRetries) {
        console.log(`Retrying API call (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        // Schedule retry after delay
        setTimeout(() => {
          executeRequest();
        }, retryDelay * (retryCount + 1)); // Exponential backoff
      } else {
        setError(err);
        setStatus(API_STATES.ERROR);
        onError(err);
      }
    }
  };
  
  // Execute the request when dependencies change
  useEffect(() => {
    executeRequest();
  }, [...dependencies]);
  
  // Function to manually retry the request
  const retry = () => {
    setRetryCount(0);
    executeRequest();
  };
  
  return { data, status, error, retry };
};

// API Error Fallback Component
const ApiErrorFallback = ({ error, retry, message }) => {
  return (
    <Paper style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
      <CloudOffIcon style={{ fontSize: 60, color: '#f44336', marginBottom: '1rem' }} />
      <Typography variant="h5" gutterBottom>
        Connection Error
      </Typography>
      <Typography variant="body1" paragraph>
        {message || "We couldn't connect to the server. Please check your internet connection and try again."}
      </Typography>
      {error && (
        <Paper 
          style={{ 
            padding: '1rem', 
            backgroundColor: '#f5f5f5', 
            maxHeight: '150px', 
            overflow: 'auto',
            marginBottom: '1rem',
            textAlign: 'left'
          }}
        >
          <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
            {error.toString()}
          </Typography>
        </Paper>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<RefreshIcon />}
        onClick={retry}
      >
        Retry Connection
      </Button>
    </Paper>
  );
};

// Loading Component
const LoadingFallback = ({ message }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="200px"
    >
      <CircularProgress size={60} />
      <Typography variant="body1" style={{ marginTop: '1rem' }}>
        {message || "Loading..."}
      </Typography>
    </Box>
  );
};

// Environment Configuration Helper
const getApiUrl = (endpoint) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseUrl}${endpoint}`;
};

export { 
  useApiWithRetry, 
  ApiErrorFallback, 
  LoadingFallback, 
  getApiUrl,
  API_STATES 
};
