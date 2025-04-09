import React, { useState, useEffect } from 'react';
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
  Button
} from '@material-ui/core';
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
  AccessTime as TimeIcon
} from '@material-ui/icons';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import isToday from 'date-fns/isToday';
import isPast from 'date-fns/isPast';
import isFuture from 'date-fns/isFuture';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
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

const Dashboard = () => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routines, setRoutines] = useState([]);
  const [caregiverUpdates, setCaregiverUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [babyName, setBabyName] = useState('Baby');
  
  // Get API base URL from environment
  const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  // Fetch routines and caregiver updates
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format date for API requests
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Get user ID from localStorage or use default
        const userId = localStorage.getItem('userId') || 'default';
        
        // Fetch routines with proper base URL
        const routinesResponse = await axios.get(`${baseUrl}/api/routines`, {
          params: { user_id: userId }
        });
        
        // Fetch caregiver updates with proper base URL
        const updatesResponse = await axios.get(`${baseUrl}/api/updates`, {
          params: { user_id: userId }
        });
        
        // Set data
        setRoutines(routinesResponse.data || []);
        setCaregiverUpdates(updatesResponse.data || []);
        
        // Extract baby name if available
        if (routinesResponse.data && routinesResponse.data.length > 0 && routinesResponse.data[0].baby_name) {
          setBabyName(routinesResponse.data[0].baby_name);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDate, baseUrl]);
  
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
          baby_name: routine.baby_name || babyName
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
          baby_name: update.baby_name || babyName
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
  
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.header}>
          <Typography variant="h4" gutterBottom>
            {babyName}'s Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track daily activities and routines
          </Typography>
        </div>
        
        <div className={classes.dateNavigation}>
          <IconButton onClick={goToPreviousDay}>
            <ArrowBackIcon />
          </IconButton>
          
          <div className={classes.dateDisplay}>
            <IconButton 
              color="primary" 
              onClick={goToToday}
              disabled={isToday(selectedDate)}
            >
              <TodayIcon />
            </IconButton>
            <Typography variant="h6">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && ' (Today)'}
            </Typography>
          </div>
          
          <IconButton onClick={goToNextDay}>
            <ArrowForwardIcon />
          </IconButton>
        </div>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            {renderCurrentActivity()}
            {renderActivityTimeline()}
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
