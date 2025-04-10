import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  TextField,
  CircularProgress,
  Snackbar,
  Link
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import ApiService from '../services/ApiService';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 16,
    maxWidth: 450,
    width: '100%',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
    borderRadius: 8,
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  logo: {
    marginBottom: theme.spacing(3),
    height: 60,
  },
  links: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
}));

const UserLogin = () => {
  const classes = useStyles();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await ApiService.login(email, password);
      
      if (response && response.success) {
        // Store auth token or user info in localStorage/sessionStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        
        // Redirect to dashboard
        history.push('/dashboard');
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <img 
          src="/logo.png" 
          alt="Hatchling Logo" 
          className={classes.logo}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/180x60?text=Hatchling';
          }}
        />
        
        <Typography component="h1" variant="h5" className={classes.title}>
          Log in to your account
        </Typography>
        
        <form className={classes.form} onSubmit={handleLogin} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Box className={classes.links}>
            <Link href="/forgot-password" variant="body2">
              Forgot password?
            </Link>
            <Link href="/signup" variant="body2">
              Don't have an account? Sign up
            </Link>
          </Box>
        </form>
      </Paper>
      
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserLogin;
