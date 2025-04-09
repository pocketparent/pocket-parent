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
  }
}));

const AdminLogin = ({ onLogin }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would be an API call to verify admin credentials
      // For demo purposes, we'll use a hardcoded check
      if (email === 'admin@hatchling.ai' && password === 'admin123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const adminData = {
          id: 'admin_001',
          name: 'Admin User',
          email: email,
          role: 'admin'
        };
        
        onLogin(adminData);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
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
            placeholder="admin@hatchling.ai"
            onKeyPress={handleKeyPress}
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
