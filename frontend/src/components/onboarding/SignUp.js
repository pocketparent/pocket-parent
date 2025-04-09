import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  TextField,
  CircularProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

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
  signupButton: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    backgroundColor: '#e6d7c3',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d9c8af',
    },
  },
  loginLink: {
    marginTop: theme.spacing(2),
    color: '#666',
    cursor: 'pointer',
  },
  errorMessage: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  successMessage: {
    color: theme.palette.success.main,
    marginTop: theme.spacing(2),
    textAlign: 'center',
  }
}));

const SignUp = ({ onSignUpComplete }) => {
  const classes = useStyles();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get API base URL from environment
  const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Call the backend API directly to create user
      const response = await axios.post(`${baseUrl}/users`, {
        name,
        email,
        password
      });
      
      // Check if the response contains an error
      if (response.data && response.data.error) {
        setError(response.data.error);
        setLoading(false);
        return;
      }
      
      // Set success message
      setSuccess('Account created successfully!');
      
      // Wait a moment before proceeding to next step
      setTimeout(() => {
        // Try to log in the user automatically
        handleAutoLogin();
      }, 1500);
      
    } catch (error) {
      console.error('Sign up error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.error || 'Error creating account. Please try again.');
      } else if (error.request) {
        // The request was made but no response was received
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error creating account. Please try again.');
      }
      
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    try {
      // Call the login API
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password
      });
      
      // Check if login was successful
      if (response.data.success) {
        const userData = response.data.user;
        
        // Complete the sign-up process with the user data
        onSignUpComplete(userData);
      } else {
        // If auto-login fails, still complete the sign-up process
        // but without user data (will require manual login)
        onSignUpComplete({
          email,
          name,
          subscription_status: 'trial'
        });
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      // If auto-login fails, still complete the sign-up process
      onSignUpComplete({
        email,
        name,
        subscription_status: 'trial'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={classes.container}>
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
            Sign up
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Create your Hatchling account
          </Typography>
        </Box>

        <Box width="100%">
          <TextField
            className={classes.textField}
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
          
          <TextField
            className={classes.textField}
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
          
          <TextField
            className={classes.textField}
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          
          <TextField
            className={classes.textField}
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
          
          {error && (
            <Typography variant="body2" className={classes.errorMessage}>
              {error}
            </Typography>
          )}
          
          {success && (
            <Typography variant="body2" className={classes.successMessage}>
              {success}
            </Typography>
          )}
          
          <Button
            className={classes.signupButton}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Typography 
            variant="body2" 
            className={classes.loginLink}
            align="center"
          >
            Already have an account? Log in
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
