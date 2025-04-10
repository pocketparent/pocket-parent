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
  Link,
  Stepper,
  Step,
  StepLabel
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import ApiService from '../../services/ApiService';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
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
    maxWidth: 600,
    width: '100%',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
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
  stepper: {
    width: '100%',
    marginBottom: theme.spacing(4),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  formSection: {
    marginTop: theme.spacing(3),
  },
}));

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyBirthdate, setBabyBirthdate] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Check if email already exists
  useEffect(() => {
    const checkEmailExists = async () => {
      if (email && email.includes('@') && email.includes('.')) {
        try {
          const response = await ApiService.checkEmailExists(email);
          if (response && response.exists) {
            setError('This email is already registered. Please use a different email or log in.');
            setShowError(true);
          }
        } catch (err) {
          console.error('Error checking email:', err);
        }
      }
    };
    
    const debounceTimer = setTimeout(() => {
      checkEmailExists();
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }, [email]);
  
  const steps = ['Create Account', 'Baby Information', 'Choose Plan'];
  
  const handleNext = (e) => {
    if (e) e.preventDefault();
    
    // Validate current step
    if (activeStep === 0) {
      if (!email || !password || !confirmPassword || !name) {
        setError('Please fill in all required fields');
        setShowError(true);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setShowError(true);
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setShowError(true);
        return;
      }
    } else if (activeStep === 1) {
      if (!babyName) {
        setError('Please enter your baby\'s name');
        setShowError(true);
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    try {
      // First check if email exists
      const emailCheckResponse = await ApiService.checkEmailExists(email);
      if (emailCheckResponse && emailCheckResponse.exists) {
        throw new Error('This email is already registered. Please use a different email or log in.');
      }
      
      // Create user account
      const signupResponse = await ApiService.signup({
        email,
        password,
        name,
        baby_name: babyName,
        baby_birthdate: babyBirthdate,
        subscription_plan: selectedPlan
      });
      
      if (signupResponse && signupResponse.success) {
        // Store auth token or user info
        localStorage.setItem('auth_token', signupResponse.token);
        localStorage.setItem('user_info', JSON.stringify(signupResponse.user));
        
        // Redirect to dashboard
        history.push('/dashboard');
      } else {
        throw new Error(signupResponse?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      setShowError(true);
      
      // Go back to first step if email already exists
      if (err.message && err.message.includes('already registered')) {
        setActiveStep(0);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <form className={classes.form} onSubmit={handleNext}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="name"
              label="Your Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classes.textField}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classes.textField}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={classes.textField}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={classes.textField}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue'}
            </Button>
            
            <Box textAlign="center" mt={2}>
              <Link href="/login" variant="body2">
                Already have an account? Log in
              </Link>
            </Box>
          </form>
        );
      
      case 1:
        return (
          <form className={classes.form} onSubmit={handleNext}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="babyName"
              label="Baby's Name"
              name="babyName"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              className={classes.textField}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="babyBirthdate"
              label="Baby's Birth Date (optional)"
              name="babyBirthdate"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={babyBirthdate}
              onChange={(e) => setBabyBirthdate(e.target.value)}
              className={classes.textField}
            />
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </Box>
          </form>
        );
      
      case 2:
        return (
          <form className={classes.form} onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Choose Your Subscription Plan
            </Typography>
            
            <Box display="flex" flexDirection="column" mt={2}>
              <Paper 
                elevation={selectedPlan === 'basic' ? 3 : 1} 
                style={{ 
                  padding: 16, 
                  marginBottom: 16, 
                  border: selectedPlan === 'basic' ? '2px solid #3f51b5' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectPlan('basic')}
              >
                <Typography variant="h6">Basic Plan</Typography>
                <Typography variant="h4">$9.99<Typography variant="body1" component="span">/month</Typography></Typography>
                <Typography variant="body2">
                  • Track baby's daily activities<br />
                  • Share with up to 2 caregivers<br />
                  • Basic reporting
                </Typography>
              </Paper>
              
              <Paper 
                elevation={selectedPlan === 'premium' ? 3 : 1} 
                style={{ 
                  padding: 16, 
                  marginBottom: 16, 
                  border: selectedPlan === 'premium' ? '2px solid #3f51b5' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectPlan('premium')}
              >
                <Typography variant="h6">Premium Plan</Typography>
                <Typography variant="h4">$19.99<Typography variant="body1" component="span">/month</Typography></Typography>
                <Typography variant="body2">
                  • All Basic features<br />
                  • Share with unlimited caregivers<br />
                  • Advanced analytics and insights<br />
                  • Priority support
                </Typography>
              </Paper>
              
              <Paper 
                elevation={selectedPlan === 'family' ? 3 : 1} 
                style={{ 
                  padding: 16, 
                  marginBottom: 16, 
                  border: selectedPlan === 'family' ? '2px solid #3f51b5' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectPlan('family')}
              >
                <Typography variant="h6">Family Plan</Typography>
                <Typography variant="h4">$29.99<Typography variant="body1" component="span">/month</Typography></Typography>
                <Typography variant="body2">
                  • All Premium features<br />
                  • Support for multiple children<br />
                  • Family calendar integration<br />
                  • Personalized development tracking
                </Typography>
              </Paper>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !selectedPlan}
              >
                {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
              </Button>
            </Box>
          </form>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container component="main" maxWidth="md" className={classes.container}>
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
          Create Your Hatchling Account
        </Typography>
        
        <Stepper activeStep={activeStep} className={classes.stepper} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
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

export default SignUp;
