import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ApiService from '../../services/ApiService';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    height: '100vh',
    backgroundColor: '#FAF9F6',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 500,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    color: '#333',
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    color: '#555',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  loginButton: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    backgroundColor: '#6b9080',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#5a7a6d',
    },
  },
  errorMessage: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  connectionStatus: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    padding: theme.spacing(1, 2),
    borderRadius: 20,
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
  connected: {
    backgroundColor: '#4caf50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  helpText: {
    marginTop: theme.spacing(2),
    color: '#666',
    fontSize: '0.85rem',
    textAlign: 'center',
  }
}));

const AdminLogin = ({ onLogin }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiConnected, setApiConnected] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isConnected = await ApiService.checkHealth();
        setApiConnected(isConnected);
        if (!isConnected) {
          setSnackbarMessage('Unable to connect to the server. Login functionality may not work properly.');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnected(false);
        setSnackbarMessage('Unable to connect to the server. Login functionality may not work properly.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }
    };

    checkApiConnection();
    
    // Set up periodic connection checks
    const intervalId = setInterval(checkApiConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!apiConnected) {
      setSnackbarMessage('Cannot log in while disconnected from the server. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Use the ApiService to authenticate
      const response = await ApiService.login(email, password);
      
      if (response && response.success) {
        setSnackbarMessage('Login successful! Redirecting to admin dashboard...');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Wait a moment before redirecting
        setTimeout(() => {
          onLogin(response.user);
        }, 1000);
      } else {
        // Handle unsuccessful login
        throw new Error(response?.error || 'Invalid email or password');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Extract more specific error message if available
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container className={classes.container}>
      <Box 
        className={classes.connectionStatus}
        style={{ backgroundColor: apiConnected ? '#e8f5e9' : '#ffebee' }}
      >
        <Box 
          className={`${classes.statusIndicator} ${apiConnected ? classes.connected : classes.disconnected}`}
        />
        <Typography variant="caption">
          {apiConnected ? 'Connected' : 'Disconnected'}
        </Typography>
      </Box>
      
      <Paper className={classes.paper} elevation={0}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <img 
            src="/logo.png" 
            alt="Hatchling Logo" 
            className={classes.logo} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/80?text=Hatchling';
            }}
          />
          <Typography variant="h4" className={classes.title}>
            Admin Login
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Secure access for Hatchling administrators
          </Typography>
        </Box>

        <Box width="100%">
          <TextField
            className={classes.textField}
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hatchling.com"
            onKeyPress={handleKeyPress}
            disabled={loading}
            error={!!error && !email}
          />
          
          <TextField
            className={classes.textField}
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            onKeyPress={handleKeyPress}
            disabled={loading}
            error={!!error && !password}
          />
          
          {error && (
            <Typography variant="body2" className={classes.errorMessage}>
              {error}
            </Typography>
          )}
          
          <Button
            className={classes.loginButton}
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loading || !apiConnected}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          
          <Typography variant="body2" className={classes.helpText}>
            Default admin credentials: admin@hatchling.com / Hatchling2025!
          </Typography>
        </Box>
      </Paper>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminLogin;
