import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  CircularProgress, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Container
} from '@material-ui/core';
import { 
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  SentimentDissatisfied as SadIcon
} from '@material-ui/icons';
import { getApiTimeout } from './apiConfig';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: theme.spacing(3),
  },
  icon: {
    fontSize: 60,
    marginBottom: theme.spacing(2),
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  warningIcon: {
    color: theme.palette.warning.main,
  },
  button: {
    marginTop: theme.spacing(2),
  },
  errorDetails: {
    maxHeight: '150px',
    overflow: 'auto',
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    textAlign: 'left',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    padding: theme.spacing(3),
  },
  fallbackContent: {
    marginTop: theme.spacing(4),
    width: '100%',
  },
  fallbackCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  }
}));

// Loading component with timeout
export const LoadingFallback = ({ message, timeout = getApiTimeout() }) => {
  const classes = useStyles();
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  if (isTimedOut) {
    return (
      <Box className={classes.root}>
        <SadIcon className={`${classes.icon} ${classes.warningIcon}`} />
        <Typography variant="h6" gutterBottom>
          Taking longer than expected...
        </Typography>
        <Typography variant="body1" paragraph align="center">
          We're having trouble connecting to the server. You can continue waiting or try refreshing the page.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          className={classes.button}
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }
  
  return (
    <Box className={classes.root}>
      <CircularProgress size={60} />
      <Typography variant="body1" style={{ marginTop: '1rem' }}>
        {message || "Loading..."}
      </Typography>
    </Box>
  );
};

// Error fallback component
export const ApiErrorFallback = ({ error, retry, message }) => {
  const classes = useStyles();
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Box className={classes.root}>
      <ErrorIcon className={`${classes.icon} ${classes.errorIcon}`} />
      <Typography variant="h6" gutterBottom>
        Connection Error
      </Typography>
      <Typography variant="body1" paragraph align="center">
        {message || "We couldn't connect to the server. Please check your internet connection and try again."}
      </Typography>
      
      {error && (
        <>
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => setShowDetails(!showDetails)}
            size="small"
          >
            {showDetails ? "Hide Error Details" : "Show Error Details"}
          </Button>
          
          {showDetails && (
            <Paper className={classes.errorDetails}>
              <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                {error.toString()}
              </Typography>
            </Paper>
          )}
        </>
      )}
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<RefreshIcon />}
        onClick={retry || (() => window.location.reload())}
        className={classes.button}
      >
        Try Again
      </Button>
    </Box>
  );
};

// Offline fallback with demo data
export const OfflineFallback = ({ message }) => {
  const classes = useStyles();
  
  // Sample demo data
  const demoActivities = [
    { type: 'wake', time: '7:30 AM', notes: 'Woke up happy' },
    { type: 'feeding', time: '8:00 AM', notes: 'Bottle, 4oz' },
    { type: 'diaper', time: '9:15 AM', notes: 'Wet' },
    { type: 'nap', time: '10:00 AM', notes: 'Slept for 45 minutes' },
    { type: 'feeding', time: '12:00 PM', notes: 'Bottle, 5oz' }
  ];
  
  return (
    <Container className={classes.container} maxWidth="md">
      <ErrorIcon className={`${classes.icon} ${classes.warningIcon}`} />
      <Typography variant="h5" gutterBottom>
        You're currently offline
      </Typography>
      <Typography variant="body1" paragraph align="center">
        {message || "We can't connect to the server right now. Here's some sample data to preview the app functionality."}
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<RefreshIcon />}
        onClick={() => window.location.reload()}
        className={classes.button}
      >
        Try to Reconnect
      </Button>
      
      <div className={classes.fallbackContent}>
        <Typography variant="h6" gutterBottom>
          Sample Baby Schedule
        </Typography>
        
        {demoActivities.map((activity, index) => (
          <Paper key={index} className={classes.fallbackCard} elevation={1}>
            <Typography variant="body1">
              <strong>{activity.time}</strong> - {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {activity.notes}
            </Typography>
          </Paper>
        ))}
      </div>
    </Container>
  );
};

// API States
export const API_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout'
};
