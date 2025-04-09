import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Divider, 
  IconButton, 
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  CircularProgress
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { AssistantWidget } from './assistant';
import { 
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Alarm as AlarmIcon,
  LocalDining as FeedingIcon,
  Opacity as DiaperIcon,
  Hotel as SleepIcon,
  WbSunny as WakeIcon,
  Toys as PlayIcon,
  Bathtub as BathIcon,
  DirectionsWalk as WalkIcon,
  Book as ReadingIcon,
  LocalHospital as MedicineIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  CloudOff as CloudOffIcon,
  Info as InfoIcon
} from '@material-ui/icons';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import isToday from 'date-fns/isToday';
import isPast from 'date-fns/isPast';
import isFuture from 'date-fns/isFuture';
import axios from 'axios';
import io from 'socket.io-client';
import ErrorBoundary from './ErrorBoundary';
import { LoadingFallback, ApiErrorFallback, OfflineFallback, API_STATES } from '../utils/fallbackComponents';
import { getApiUrl, getApiTimeout, getApiRetryAttempts, getApiBaseUrl } from '../utils/apiConfig';

// Custom hook for API calls with retry logic and timeout
const useApiWithRetry = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(API_STATES.IDLE);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef(null);
  
  const { 
    method = 'GET', 
    payload = null, 
    maxRetries = getApiRetryAttempts(), 
    retryDelay = 1000,
    timeout = getApiTimeout(),
    dependencies = [],
    onSuccess = () => {},
    onError = () => {},
    mockData = null,
    initialData = null
  } = options;
  
  // Initialize with initialData if provided
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setStatus(API_STATES.SUCCESS);
    }
  }, [initialData]);
  
  const executeRequest = async () => {
    // Don't make the request if we're using initialData only
    if (options.useInitialDataOnly) {
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setStatus(API_STATES.LOADING);
    
    // Set timeout for the request
    timeoutRef.current = setTimeout(() => {
      if (status === API_STATES.LOADING) {
        console.log(`API request timed out after ${timeout}ms: ${url}`);
        setStatus(API_STATES.TIMEOUT);
        
        // If we have mock data, use it as fallback
        if (mockData) {
          console.log('Using mock data as fallback');
          setData(mockData);
          onSuccess(mockData);
        }
      }
    }, timeout);
    
    try {
      // Check for network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      
      // Log the request for debugging
      console.log(`API Request (${method}): ${url}`, payload);
      
      // Execute the request with the appropriate method
      let response;
      if (method === 'GET') {
        response = await axios.get(url, { timeout });
      } else if (method === 'POST') {
        response = await axios.post(url, payload, { timeout });
      } else if (method === 'PUT') {
        response = await axios.put(url, payload, { timeout });
      } else if (method === 'DELETE') {
        response = await axios.delete(url, { timeout });
      }
      
      // Clear the timeout since request completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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
      
      // Clear the timeout since request completed (with error)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Determine if we should retry
      if (retryCount < maxRetries) {
        console.log(`Retrying API call (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        // Schedule retry after delay
        setTimeout(() => {
          executeRequest();
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        // If we have mock data and exhausted retries, use it as fallback
        if (mockData) {
          console.log('Using mock data as fallback after retry failure');
          setData(mockData);
          setStatus(API_STATES.SUCCESS);
          onSuccess(mockData);
        } else {
          setError(err);
          setStatus(API_STATES.ERROR);
          onError(err);
        }
      }
    }
  };
  
  // Execute the request when dependencies change
  useEffect(() => {
    // Skip API call if we're using initialData only
    if (!options.useInitialDataOnly) {
      executeRequest();
    }
    
    // Cleanup function to clear timeout on unmount or dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [...dependencies]);
  
  // Function to manually retry the request
  const retry = () => {
    setRetryCount(0);
    executeRequest();
  };
  
  return { data, status, error, retry };
};

// Rest of the component code remains the same as before
const useStyles = makeStyles((theme) => ({
  // Styles remain the same as in the original component
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  dateNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
  },
  currentActivity: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2),
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
    borderLeft: '4px solid #4caf50',
  },
  currentActivityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
  },
  activityTimeline: {
    marginTop: theme.spacing(4),
  },
  timelineItem: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
  },
  timelineItemCurrent: {
    borderLeft: '4px solid #4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  timelineItemPast: {
    opacity: 0.7,
  },
  timelineItemFuture: {
    borderLeft: '4px solid #bbbbbb',
  },
  activityIcon: {
    marginRight: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTime: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
    minWidth: '80px',
  },
  activityDetails: {
    flexGrow: 1,
  },
  activityStatus: {
    marginLeft: theme.spacing(2),
  },
  caregiverChip: {
    marginLeft: theme.spacing(1),
    height: '24px',
  },
  noActivities: {
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  addRoutineButton: {
    marginTop: theme.spacing(2),
  },
  // Activity type specific colors
  nap: {
    backgroundColor: 'rgba(123, 31, 162, 0.1)',
    color: '#7b1fa2',
  },
  feeding: {
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    color: '#f57c00',
  },
  wake: {
    backgroundColor: 'rgba(251, 192, 45, 0.1)',
    color: '#fbc02d',
  },
  sleep: {
    backgroundColor: 'rgba(48, 63, 159, 0.1)',
    color: '#303f9f',
  },
  diaper: {
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    color: '#009688',
  },
  play: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    color: '#e91e63',
  },
  bath: {
    backgroundColor: 'rgba(3, 169, 244, 0.1)',
    color: '#03a9f4',
  },
  walk: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#4caf50',
  },
  reading: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    color: '#9c27b0',
  },
  medicine: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    color: '#d32f2f',
  },
  // Status chips
  statusCompleted: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusInProgress: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  statusUpcoming: {
    backgroundColor: '#bbbbbb',
    color: 'white',
  },
  // Multi-user features
  userSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  userCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  userAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
  userActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
  },
  activityLog: {
    marginTop: theme.spacing(4),
  },
  logItem: {
    borderLeft: '3px solid #e0e0e0',
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  logItemHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  logItemAvatar: {
    width: 24,
    height: 24,
    fontSize: '0.75rem',
    marginRight: theme.spacing(1),
  },
  logItemTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
  },
  shareButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1000,
  },
  notificationBadge: {
    marginRight: theme.spacing(2),
  },
  dialogContent: {
    minWidth: 300,
  },
  inviteField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  realTimeIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  realTimeIcon: {
    color: '#4caf50',
    marginRight: theme.spacing(1),
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.6,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0.6,
    },
  },
  errorContainer: {
    padding: theme.spacing(3),
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
  errorIcon: {
    fontSize: 60,
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  online: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  offline: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  mockDataBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockDataIcon: {
    color: '#ff9800',
    marginRight: theme.spacing(1),
  },
  tryConnectButton: {
    marginLeft: theme.spacing(2),
  },
  assistantContainer: {
    marginBottom: theme.spacing(4),
  }
}));

// Activity icons mapping
const activityIcons = {
  nap: <SleepIcon />,
  feeding: <FeedingIcon />,
  wake: <WakeIcon />,
  sleep: <SleepIcon />,
  diaper: <DiaperIcon />,
  play: <PlayIcon />,
  bath: <BathIcon />,
  walk: <WalkIcon />,
  reading: <ReadingIcon />,
  medicine: <MedicineIcon />,
  default: <TimeIcon />
};

// Sample mock data for offline fallback
const MOCK_ROUTINES = [
  {
    id: 1,
    baby_name: 'Baby',
    routine: [
      { type: 'wake', start_time: '07:30', notes: 'Woke up happy' },
      { type: 'feeding', start_time: '08:00', duration: '20 minutes', feeding_type: 'Bottle', notes: '4oz formula' },
      { type: 'diaper', start_time: '09:15', diaper_type: 'Wet' },
      { type: 'nap', start_time: '10:00', duration: '45 minutes' },
      { type: 'feeding', start_time: '12:00', duration: '25 minutes', feeding_type: 'Bottle', notes: '5oz formula' },
      { type: 'play', start_time: '13:30', duration: '30 minutes', notes: 'Tummy time' },
      { type: 'nap', start_time: '14:30', duration: '1 hour' },
      { type: 'feeding', start_time: '16:00', duration: '20 minutes', feeding_type: 'Bottle', notes: '4oz formula' },
      { type: 'bath', start_time: '18:30', duration: '15 minutes' },
      { type: 'sleep', start_time: '19:30', notes: 'Bedtime routine completed' }
    ]
  }
];

const MOCK_USERS = [
  { id: 1, name: 'Parent 1', email: 'parent1@example.com', role: 'Primary Caregiver', online: true },
  { id: 2, name: 'Parent 2', email: 'parent2@example.com', role: 'Caregiver' }
];

// Helper function to get activity status
const getActivityStatus = (activity, currentTime) => {
  const startTime = activity.start_time ? new Date(`2000-01-01T${activity.start_time}:00`) : null;
  const endTime = activity.end_time ? new Date(`2000-01-01T${activity.end_time}:00`) : null;
  
  // If we have actual_time, it means the activity is completed
  if (activity.actual_time) {
    return 'completed';
  }
  
  // If we don't have start_time, we can't determine status
  if (!startTime) {
    return 'unknown';
  }
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const compareTime = new Date(`2000-01-01T${currentHours}:${currentMinutes}:00`);
  
  // If we have end_time, check if current time is between start and end
  if (endTime) {
    if (compareTime >= startTime && compareTime <= endTime) {
      return 'inProgress';
    } else if (compareTime < startTime) {
      return 'upcoming';
    } else {
      return 'missed';
    }
  }
  
  // If we don't have end_time but have duration, calculate end time
  if (activity.duration) {
    const durationMatch = activity.duration.match(/(\d+)/);
    if (durationMatch) {
      const durationMinutes = parseInt(durationMatch[1], 10);
      const calculatedEndTime = new Date(startTime.getTime() + durationMinutes * 60000);
      
      if (compareTime >= startTime && compareTime <= calculatedEndTime) {
        return 'inProgress';
      } else if (compareTime < startTime) {
        return 'upcoming';
      } else {
        return 'missed';
      }
    }
  }
  
  // If we only have start_time, check if it's in the past or future
  if (compareTime < startTime) {
    return 'upcoming';
  } else if (compareTime > startTime) {
    // If it's within 30 minutes after start time, consider it in progress
    const thirtyMinutesLater = new Date(startTime.getTime() + 30 * 60000);
    if (compareTime <= thirtyMinutesLater) {
      return 'inProgress';
    } else {
      return 'missed';
    }
  } else {
    return 'inProgress';
  }
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

const MultiUserDashboardWithErrorHandling = ({ initialData, useMockData = false, userData = null }) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routines, setRoutines] = useState([]);
  const [users, setUsers] = useState([]);
  const [caregiverUpdates, setCaregiverUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  
  // API calls with retry logic and fallback to mock data
  const routinesApi = useApiWithRetry('/api/routines', {
    dependencies: [selectedDate],
    mockData: MOCK_ROUTINES,
    initialData: initialData,
    useInitialDataOnly: useMockData
  });
  
  const usersApi = useApiWithRetry('/api/users', {
    dependencies: [],
    mockData: MOCK_USERS,
    useInitialDataOnly: useMockData
  });
  
  const caregiverUpdatesApi = useApiWithRetry('/api/caregiver-updates', {
    dependencies: [selectedDate],
    mockData: [],
    useInitialDataOnly: useMockData
  });
  
  // Set data from API responses
  useEffect(() => {
    if (routinesApi.data) {
      setRoutines(routinesApi.data);
    }
    
    if (usersApi.data) {
      setUsers(usersApi.data);
    }
    
    if (caregiverUpdatesApi.data) {
      setCaregiverUpdates(caregiverUpdatesApi.data);
    }
  }, [routinesApi.data, usersApi.data, caregiverUpdatesApi.data]);
  
  // Setup socket connection for real-time updates
  useEffect(() => {
    if (useMockData) {
      return; // Skip socket setup in mock mode
    }
    
    try {
      // Connect to socket server
      const socketUrl = getApiBaseUrl();
      socketRef.current = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      // Socket event handlers
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
        setSnackbar({
          open: true,
          message: 'Connected to real-time updates',
          severity: 'success'
        });
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });
      
      socketRef.current.on('routine_update', (data) => {
        console.log('Received routine update:', data);
        // Update routines with new data
        setRoutines(prevRoutines => {
          const updatedRoutines = [...prevRoutines];
          const index = updatedRoutines.findIndex(r => r.id === data.id);
          
          if (index !== -1) {
            updatedRoutines[index] = data;
          } else {
            updatedRoutines.push(data);
          }
          
          return updatedRoutines;
        });
        
        // Show notification
        setSnackbar({
          open: true,
          message: `Routine updated for ${data.baby_name}`,
          severity: 'info'
        });
      });
      
      socketRef.current.on('caregiver_update', (data) => {
        console.log('Received caregiver update:', data);
        // Add to caregiver updates
        setCaregiverUpdates(prev => [data, ...prev]);
        
        // Add to notifications
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'caregiver_update',
            message: `${data.caregiver_name} logged ${data.activity_type} for ${data.baby_name}`,
            timestamp: new Date().toISOString(),
            read: false
          },
          ...prev
        ]);
        
        // Show notification
        setSnackbar({
          open: true,
          message: `${data.caregiver_name} logged ${data.activity_type} for ${data.baby_name}`,
          severity: 'info'
        });
      });
      
      socketRef.current.on('user_online', (data) => {
        console.log('User online:', data);
        // Update user status
        setUsers(prev => {
          const updatedUsers = [...prev];
          const index = updatedUsers.findIndex(u => u.id === data.id);
          
          if (index !== -1) {
            updatedUsers[index] = { ...updatedUsers[index], online: true };
          }
          
          return updatedUsers;
        });
      });
      
      socketRef.current.on('user_offline', (data) => {
        console.log('User offline:', data);
        // Update user status
        setUsers(prev => {
          const updatedUsers = [...prev];
          const index = updatedUsers.findIndex(u => u.id === data.id);
          
          if (index !== -1) {
            updatedUsers[index] = { ...updatedUsers[index], online: false };
          }
          
          return updatedUsers;
        });
      });
      
      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }, [useMockData]);
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Handle share dialog
  const handleOpenShareDialog = () => {
    setShowShareDialog(true);
  };
  
  const handleCloseShareDialog = () => {
    setShowShareDialog(false);
  };
  
  const handleInviteChange = (e) => {
    setInviteEmail(e.target.value);
  };
  
  const handleSendInvite = () => {
    // In a real app, this would send an API request
    console.log('Sending invite to:', inviteEmail);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Invitation sent to ${inviteEmail}`,
      severity: 'success'
    });
    
    // Close dialog and reset form
    setShowShareDialog(false);
    setInviteEmail('');
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get all activities for the selected date
  const getActivitiesForSelectedDate = () => {
    // Extract activities from routines
    let activities = [];
    
    routines.forEach(routine => {
      if (routine.routine && Array.isArray(routine.routine)) {
        activities = [...activities, ...routine.routine.map(activity => ({
          ...activity,
          source: 'routine',
          baby_name: routine.baby_name || 'Baby'
        }))];
      }
    });
    
    // Add caregiver updates as activities
    caregiverUpdates.forEach(update => {
      if (update.activity_type) {
        activities.push({
          type: update.activity_type,
          start_time: update.time,
          actual_time: update.time,
          source: 'caregiver',
          caregiver_name: update.caregiver_name || 'Caregiver',
          notes: update.notes,
          baby_name: update.baby_name || 'Baby'
        });
      }
    });
    
    // Sort activities by start_time
    return activities.sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      
      const timeA = a.start_time.split(':').map(Number);
      const timeB = b.start_time.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  };
  
  // Get current activity
  const getCurrentActivity = () => {
    const activities = getActivitiesForSelectedDate();
    const now = new Date();
    
    // Only check for current activity if viewing today
    if (!isToday(selectedDate)) {
      return null;
    }
    
    // Find an activity that is currently in progress
    return activities.find(activity => {
      const status = getActivityStatus(activity, now);
      return status === 'inProgress';
    });
  };
  
  // Render activity icon with appropriate styling
  const renderActivityIcon = (activity) => {
    const icon = activityIcons[activity.type] || activityIcons.default;
    
    return (
      <Avatar className={`${classes.activityIcon} ${classes[activity.type] || ''}`}>
        {icon}
      </Avatar>
    );
  };
  
  // Render activity status chip
  const renderActivityStatus = (activity) => {
    const status = getActivityStatus(activity);
    
    let chipLabel = 'Scheduled';
    let chipClass = classes.statusUpcoming;
    
    if (status === 'completed') {
      chipLabel = 'Completed';
      chipClass = classes.statusCompleted;
    } else if (status === 'inProgress') {
      chipLabel = 'In Progress';
      chipClass = classes.statusInProgress;
    } else if (status === 'missed') {
      chipLabel = 'Missed';
      chipClass = '';
    }
    
    return (
      <Chip 
        size="small" 
        label={chipLabel} 
        className={chipClass}
      />
    );
  };
  
  // Render current activity section
  const renderCurrentActivity = () => {
    const currentActivity = getCurrentActivity();
    
    if (!currentActivity) {
      return null;
    }
    
    return (
      <Paper className={classes.currentActivity} elevation={0}>
        <div className={classes.currentActivityIndicator} />
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {renderActivityIcon(currentActivity)}
          </Grid>
          <Grid item xs>
            <Typography variant="h6">
              {currentActivity.baby_name} is {currentActivity.type === 'nap' ? 'napping' : 
                currentActivity.type === 'feeding' ? 'feeding' :
                currentActivity.type === 'sleep' ? 'sleeping' :
                currentActivity.type === 'play' ? 'playing' :
                currentActivity.type === 'bath' ? 'bathing' :
                currentActivity.type === 'walk' ? 'walking' :
                currentActivity.type === 'reading' ? 'reading' :
                currentActivity.type}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Started at {formatTime(currentActivity.start_time)}
              {currentActivity.duration && ` • ${currentActivity.duration}`}
              {currentActivity.location && ` • ${currentActivity.location}`}
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              icon={<AlarmIcon />} 
              label="Now" 
              className={classes.statusInProgress}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Render timeline of activities
  const renderActivityTimeline = () => {
    const activities = getActivitiesForSelectedDate();
    
    if (activities.length === 0) {
      return (
        <Paper className={classes.noActivities} elevation={0}>
          <Typography variant="body1" color="textSecondary">
            No activities scheduled for this day.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            className={classes.addRoutineButton}
            onClick={() => window.location.href = '/add-routine'}
          >
            Add Routine
          </Button>
        </Paper>
      );
    }
    
    return (
      <div className={classes.activityTimeline}>
        {activities.map((activity, index) => {
          const status = getActivityStatus(activity);
          
          return (
            <Paper 
              key={index}
              className={`${classes.timelineItem} ${
                status === 'inProgress' ? classes.timelineItemCurrent : 
                status === 'completed' || status === 'missed' ? classes.timelineItemPast : 
                classes.timelineItemFuture
              }`}
              elevation={0}
            >
              <div className={classes.activityTime}>
                <TimeIcon fontSize="small" style={{ marginRight: 8 }} />
                {formatTime(activity.actual_time || activity.start_time)}
              </div>
              
              {renderActivityIcon(activity)}
              
              <div className={classes.activityDetails}>
                <Typography variant="body1">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  {activity.type === 'feeding' && activity.feeding_type && ` (${activity.feeding_type})`}
                  {activity.type === 'diaper' && activity.diaper_type && ` (${activity.diaper_type})`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {activity.duration && `Duration: ${activity.duration}`}
                  {activity.location && ` • ${activity.location}`}
                  {activity.notes && ` • ${activity.notes}`}
                </Typography>
              </div>
              
              <div className={classes.activityStatus}>
                {renderActivityStatus(activity)}
                {activity.source === 'caregiver' && activity.caregiver_name && (
                  <Chip 
                    size="small" 
                    label={activity.caregiver_name}
                    className={classes.caregiverChip}
                  />
                )}
              </div>
            </Paper>
          );
        })}
      </div>
    );
  };
  
  // Render users section
  const renderUsers = () => {
    if (users.length === 0) {
      return null;
    }
    
    return (
      <div className={classes.userSection}>
        <Typography variant="h6" gutterBottom>
          Caregivers
        </Typography>
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Paper className={classes.userCard} elevation={0}>
                <Box display="flex" alignItems="center">
                  <Avatar className={classes.userAvatar}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="body1">
                      {user.name}
                      {user.online && (
                        <Chip 
                          size="small" 
                          label="Online" 
                          className={classes.statusInProgress}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.role}
                    </Typography>
                  </Box>
                </Box>
                <div className={classes.userActions}>
                  <Button size="small" color="primary">
                    Message
                  </Button>
                  <Button size="small">
                    View Activity
                  </Button>
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };
  
  // Render activity log
  const renderActivityLog = () => {
    if (caregiverUpdates.length === 0) {
      return null;
    }
    
    return (
      <div className={classes.activityLog}>
        <Typography variant="h6" gutterBottom>
          Recent Updates
        </Typography>
        {caregiverUpdates.slice(0, 5).map((update, index) => (
          <div key={index} className={classes.logItem}>
            <div className={classes.logItemHeader}>
              <Avatar className={classes.logItemAvatar}>
                {update.caregiver_name ? update.caregiver_name.charAt(0) : 'C'}
              </Avatar>
              <Typography variant="body2">
                <strong>{update.caregiver_name || 'Caregiver'}</strong> logged {update.activity_type} for {update.baby_name || 'Baby'}
              </Typography>
              <Typography variant="caption" className={classes.logItemTime}>
                {formatTime(update.time)}
              </Typography>
            </div>
            {update.notes && (
              <Typography variant="body2" color="textSecondary">
                {update.notes}
              </Typography>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render share dialog
  const renderShareDialog = () => (
    <Dialog open={showShareDialog} onClose={handleCloseShareDialog}>
      <DialogTitle>Invite a Caregiver</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body2" gutterBottom>
          Share access to your baby's routine with family members or caregivers.
        </Typography>
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          className={classes.inviteField}
          value={inviteEmail}
          onChange={handleInviteChange}
          placeholder="example@email.com"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseShareDialog} color="default">
          Cancel
        </Button>
        <Button 
          onClick={handleSendInvite} 
          color="primary" 
          variant="contained"
          disabled={!inviteEmail}
        >
          Send Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render error state
  const renderError = () => {
    if (routinesApi.status === API_STATES.ERROR && !useMockData) {
      return (
        <ApiErrorFallback 
          error={routinesApi.error} 
          resetErrorBoundary={routinesApi.retry} 
        />
      );
    }
    return null;
  };
  
  // Render loading state
  const renderLoading = () => {
    if (routinesApi.status === API_STATES.LOADING) {
      return <LoadingFallback message="Loading baby routines..." />;
    }
    return null;
  };
  
  // Main render
  return (
    <Container className={classes.root}>
      {/* Connection status indicator */}
      {!navigator.onLine && (
        <Box className={`${classes.connectionStatus} ${classes.offline}`}>
          <WifiOffIcon style={{ marginRight: 8 }} />
          <Typography variant="body2">
            You are currently offline. Some features may be limited.
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            className={classes.tryConnectButton}
            onClick={() => window.location.reload()}
          >
            Try to reconnect
          </Button>
        </Box>
      )}
      
      {/* Mock data indicator */}
      {useMockData && (
        <Box className={classes.mockDataBanner}>
          <InfoIcon className={classes.mockDataIcon} />
          <Typography variant="body2">
            Viewing demo data. Connect to the internet to see real-time updates.
          </Typography>
        </Box>
      )}
      
      {/* AI Parenting Assistant Widget */}
      <Box className={classes.assistantContainer}>
        <AssistantWidget 
          userId={userData?.id || '1'} 
          childData={routines.length > 0 ? routines[0] : null} 
        />
      </Box>
      
      {/* Real-time connection indicator */}
      {socketConnected && (
        <Box className={classes.realTimeIndicator}>
          <WifiIcon className={classes.realTimeIcon} />
          <Typography variant="body2">
            Connected to real-time updates
          </Typography>
        </Box>
      )}
      
      {/* Error and loading states */}
      {renderError()}
      {renderLoading()}
      
      {/* Main content - only show when not in error or loading state */}
      {routinesApi.status !== API_STATES.ERROR && routinesApi.status !== API_STATES.LOADING && (
        <>
          {/* Header with date navigation */}
          <Box className={classes.header}>
            <Box className={classes.dateNavigation}>
              <IconButton onClick={goToPreviousDay}>
                <ArrowBackIcon />
              </IconButton>
              
              <Box className={classes.dateDisplay}>
                <TodayIcon style={{ marginRight: 8 }} />
                <Typography variant="h6">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  {isToday(selectedDate) && (
                    <Chip 
                      size="small" 
                      label="Today" 
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </Typography>
              </Box>
              
              <IconButton onClick={goToNextDay}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            
            {!isToday(selectedDate) && (
              <Button 
                variant="outlined" 
                startIcon={<TodayIcon />}
                onClick={goToToday}
              >
                Go to Today
              </Button>
            )}
          </Box>
          
          {/* Current activity */}
          {renderCurrentActivity()}
          
          {/* Activity timeline */}
          <Typography variant="h6" gutterBottom>
            Daily Schedule
          </Typography>
          {renderActivityTimeline()}
          
          {/* Users section */}
          {renderUsers()}
          
          {/* Activity log */}
          {renderActivityLog()}
          
          {/* Share button */}
          <Fab 
            color="primary" 
            className={classes.shareButton}
            onClick={handleOpenShareDialog}
          >
            <ShareIcon />
          </Fab>
          
          {/* Share dialog */}
          {renderShareDialog()}
          
          {/* Snackbar for notifications */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
};

export default MultiUserDashboardWithErrorHandling;
