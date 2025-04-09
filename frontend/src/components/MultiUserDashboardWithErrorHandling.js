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
  WifiOff as WifiOffIcon
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
    mockData = null
  } = options;
  
  const executeRequest = async () => {
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
    executeRequest();
    
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

// Helper function to format date and time for logs
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    return format(date, 'MMM d, h:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateTimeString;
  }
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const MultiUserDashboardWithErrorHandling = () => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routines, setRoutines] = useState([]);
  const [caregiverUpdates, setCaregiverUpdates] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [babyName, setBabyName] = useState('Baby');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [connected, setConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const socketRef = useRef(null);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setIsOnline(true);
      // Refresh data when coming back online
      fetchData();
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Format date for API requests
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Use our custom API hook for routines with mock data fallback
  const routinesApi = useApiWithRetry(
    getApiUrl(`/api/routines?date=${dateStr}`),
    {
      dependencies: [selectedDate, isOnline],
      mockData: MOCK_ROUTINES,
      onSuccess: (data) => {
        setRoutines(data || []);
        // Extract baby name if available
        if (data && data.length > 0 && data[0].baby_name) {
          setBabyName(data[0].baby_name);
        }
      }
    }
  );
  
  // Use our custom API hook for caregiver updates
  const updatesApi = useApiWithRetry(
    getApiUrl(`/api/caregiver-updates?date=${dateStr}`),
    {
      dependencies: [selectedDate, isOnline],
      mockData: [],
      onSuccess: (data) => {
        setCaregiverUpdates(data || []);
      }
    }
  );
  
  // Use our custom API hook for activity logs
  const logsApi = useApiWithRetry(
    getApiUrl(`/api/activity-logs?date=${dateStr}`),
    {
      dependencies: [selectedDate, isOnline],
      mockData: [],
      onSuccess: (data) => {
        setActivityLogs(data || []);
      }
    }
  );
  
  // Use our custom API hook for users
  const usersApi = useApiWithRetry(
    getApiUrl('/api/users'),
    {
      dependencies: [isOnline],
      mockData: MOCK_USERS,
      onSuccess: (data) => {
        setUsers(data || []);
      }
    }
  );
  
  // Use our custom API hook for current user
  const currentUserApi = useApiWithRetry(
    getApiUrl('/api/users/current'),
    {
      dependencies: [isOnline],
      mockData: MOCK_USERS[0],
      onSuccess: (data) => {
        setCurrentUser(data || null);
      }
    }
  );
  
  // Initialize socket connection
  useEffect(() => {
    if (!isOnline) {
      return; // Don't attempt socket connection when offline
    }
    
    try {
      // Connect to the socket server
      const baseUrl = getApiBaseUrl();
      console.log('Connecting to socket server at:', baseUrl);
      
      socketRef.current = io(baseUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      
      // Set up event listeners
      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
        setConnected(true);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setConnected(false);
      });
      
      socketRef.current.on('routine_update', (data) => {
        console.log('Received routine update:', data);
        // Update routines if it's for the current date
        const routineDate = new Date(data.date);
        if (isSameDay(routineDate, selectedDate)) {
          fetchData();
        }
        
        // Show notification
        setNotificationMessage(`${data.user_name || 'Someone'} updated the routine`);
        setShowNotification(true);
      });
      
      socketRef.current.on('caregiver_update', (data) => {
        console.log('Received caregiver update:', data);
        // Update caregiver updates
        fetchData();
        
        // Show notification
        setNotificationMessage(`New update from ${data.caregiver_name || 'caregiver'}`);
        setShowNotification(true);
      });
      
      socketRef.current.on('user_activity', (data) => {
        console.log('Received user activity:', data);
        // Add to activity logs
        setActivityLogs(prevLogs => [data, ...prevLogs]);
      });
      
      // Clean up on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  }, [isOnline]);
  
  // Fetch all data
  const fetchData = () => {
    if (isOnline) {
      routinesApi.retry();
      updatesApi.retry();
      logsApi.retry();
      usersApi.retry();
    }
  };
  
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
  
  // Get all activities for the selected date
  const getActivitiesForSelectedDate = () => {
    // Extract activities from routines
    let activities = [];
    
    routines.forEach(routine => {
      if (routine.routine && Array.isArray(routine.routine)) {
        activities = [...activities, ...routine.routine.map(activity => ({
          ...activity,
          source: 'routine',
          baby_name: routine.baby_name || babyName,
          user_id: routine.user_id,
          created_at: routine.created_at
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
          baby_name: update.baby_name || babyName,
          created_at: update.timestamp
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
              {babyName} is {currentActivity.type === 'nap' ? 'napping' : 
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
          const user = activity.user_id ? users.find(u => u.id === activity.user_id) : null;
          
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
                  {user && ` • Added by ${user.name || user.email}`}
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
  
  // Render activity logs
  const renderActivityLogs = () => {
    if (activityLogs.length === 0) {
      return (
        <Paper className={classes.noActivities} elevation={0}>
          <Typography variant="body1" color="textSecondary">
            No activity logs for this day.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <div className={classes.activityLog}>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>
        
        {activityLogs.map((log, index) => (
          <div key={index} className={classes.logItem}>
            <div className={classes.logItemHeader}>
              <Avatar className={classes.logItemAvatar}>
                {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="body2">
                <strong>{log.user_name || 'User'}</strong>
              </Typography>
              <Typography variant="body2" className={classes.logItemTime}>
                {formatDateTime(log.timestamp)}
              </Typography>
            </div>
            <Typography variant="body2">
              {log.action_type === 'add' ? 'Added' : 
               log.action_type === 'update' ? 'Updated' : 
               log.action_type === 'delete' ? 'Deleted' : 'Logged'} 
              {' '}
              {log.activity_type} 
              {log.activity_time && ` at ${formatTime(log.activity_time)}`}
            </Typography>
          </div>
        ))}
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
          {users.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper className={classes.userCard} elevation={0}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar className={classes.userAvatar}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="body1">
                      {user.name || 'Unnamed User'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.role || 'Caregiver'}
                    </Typography>
                  </Grid>
                  {user.online && (
                    <Grid item>
                      <Chip 
                        size="small" 
                        label="Online" 
                        className={classes.statusInProgress}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };
  
  // Handle invite submission
  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    try {
      await axios.post(getApiUrl('/api/users/invite'), { email: inviteEmail });
      setNotificationMessage(`Invitation sent to ${inviteEmail}`);
      setShowNotification(true);
      setInviteEmail('');
      setShowShareDialog(false);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setNotificationMessage('Failed to send invitation. Please try again.');
      setShowNotification(true);
    }
  };
  
  // Check if any API calls are loading
  const isLoading = 
    routinesApi.status === API_STATES.LOADING || 
    updatesApi.status === API_STATES.LOADING || 
    logsApi.status === API_STATES.LOADING || 
    usersApi.status === API_STATES.LOADING || 
    currentUserApi.status === API_STATES.LOADING;
  
  // Check if any API calls have errors
  const hasError = 
    routinesApi.status === API_STATES.ERROR || 
    updatesApi.status === API_STATES.ERROR || 
    logsApi.status === API_STATES.ERROR || 
    usersApi.status === API_STATES.ERROR || 
    currentUserApi.status === API_STATES.ERROR;
  
  // Check if any API calls have timed out
  const hasTimeout = 
    routinesApi.status === API_STATES.TIMEOUT || 
    updatesApi.status === API_STATES.TIMEOUT || 
    logsApi.status === API_STATES.TIMEOUT || 
    usersApi.status === API_STATES.TIMEOUT || 
    currentUserApi.status === API_STATES.TIMEOUT;
  
  // Get the first error to display
  const firstError = 
    routinesApi.error || 
    updatesApi.error || 
    logsApi.error || 
    usersApi.error || 
    currentUserApi.error;
  
  // If offline, show offline fallback
  if (!isOnline) {
    return <OfflineFallback message={`You're currently offline. Here's a preview of ${babyName}'s dashboard with sample data.`} />;
  }
  
  // If loading, show loading fallback
  if (isLoading) {
    return <LoadingFallback message="Loading dashboard data..." />;
  }
  
  // If error, show error fallback
  if (hasError) {
    return (
      <ApiErrorFallback 
        error={firstError} 
        retry={fetchData} 
        message="We couldn't connect to the server. Please check your internet connection and try again."
      />
    );
  }
  
  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <div className={classes.header}>
          <Typography variant="h4" gutterBottom>
            {babyName}'s Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track and manage daily routines and activities
          </Typography>
        </div>
        
        <div className={`${classes.connectionStatus} ${isOnline ? classes.online : classes.offline}`}>
          {isOnline ? (
            <>
              <WifiIcon style={{ marginRight: 8, color: '#4caf50' }} />
              <Typography variant="body2">
                {connected ? 'Connected with real-time updates' : 'Connected'}
              </Typography>
            </>
          ) : (
            <>
              <WifiOffIcon style={{ marginRight: 8, color: '#f44336' }} />
              <Typography variant="body2">
                Offline Mode - Limited Functionality
              </Typography>
            </>
          )}
        </div>
        
        <div className={classes.dateNavigation}>
          <IconButton onClick={goToPreviousDay}>
            <ArrowBackIcon />
          </IconButton>
          
          <div className={classes.dateDisplay}>
            <TodayIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && ' (Today)'}
            </Typography>
          </div>
          
          <div>
            {!isToday(selectedDate) && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={goToToday}
                style={{ marginRight: 8 }}
              >
                Today
              </Button>
            )}
            <IconButton onClick={goToNextDay}>
              <ArrowForwardIcon />
            </IconButton>
          </div>
        </div>
        
        <ErrorBoundary>
          {renderCurrentActivity()}
          {renderActivityTimeline()}
          {renderActivityLogs()}
          {renderUsers()}
        </ErrorBoundary>
      </Container>
      
      <Fab 
        color="primary" 
        className={classes.shareButton}
        onClick={() => setShowShareDialog(true)}
      >
        <ShareIcon />
      </Fab>
      
      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
      >
        <Alert onClose={() => setShowNotification(false)} severity="info">
          {notificationMessage}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      >
        <DialogTitle>Share with Caregivers</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body2" gutterBottom>
            Invite another caregiver to access and update {babyName}'s routine.
          </Typography>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            className={classes.inviteField}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleInvite} color="primary" variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Add proper default export statement
export default MultiUserDashboardWithErrorHandling;
