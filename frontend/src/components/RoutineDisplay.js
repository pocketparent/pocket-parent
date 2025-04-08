import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Chip, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ApiService from '../services/ApiService';

// Styled components for the timeline
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 120,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  overflow: 'hidden',
}));

const TimeMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: 1,
  backgroundColor: theme.palette.divider,
  zIndex: 1,
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  transform: 'translateX(-50%)',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const CurrentTimeMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: 2,
  backgroundColor: theme.palette.primary.main,
  zIndex: 2,
}));

const ActivityMarker = styled(Box)(({ theme, status }) => ({
  position: 'absolute',
  top: 40,
  height: 60,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 
    status === 'completed' ? theme.palette.success.light :
    status === 'missed' ? theme.palette.error.light :
    status === 'off-track' ? theme.palette.warning.light :
    theme.palette.info.light,
  color: 
    status === 'completed' ? theme.palette.success.contrastText :
    status === 'missed' ? theme.palette.error.contrastText :
    status === 'off-track' ? theme.palette.warning.contrastText :
    theme.palette.info.contrastText,
  border: `1px solid ${
    status === 'completed' ? theme.palette.success.main :
    status === 'missed' ? theme.palette.error.main :
    status === 'off-track' ? theme.palette.warning.main :
    theme.palette.info.main
  }`,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
    boxShadow: theme.shadows[2],
  },
}));

const StatusCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

const UpdatesCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

const UpdateItem = styled(Box)(({ theme, status }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${
    status === 'on-track' ? theme.palette.success.main :
    status === 'off-track' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

// Helper function to convert time to position percentage
const timeToPosition = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  // Assuming 6am (360 minutes) to 8pm (1200 minutes) = 840 minute range
  return ((totalMinutes - 360) / 840) * 100;
};

// Helper function to get current time position
const getCurrentTimePosition = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return ((totalMinutes - 360) / 840) * 100;
};

// Helper function to determine activity status
const getActivityStatus = (activity, currentTime) => {
  const activityTime = new Date();
  const [hours, minutes] = activity.start_time ? activity.start_time.split(':').map(Number) : [0, 0];
  activityTime.setHours(hours, minutes, 0, 0);
  
  if (activity.actual_time) {
    return 'completed';
  }
  
  if (currentTime > activityTime && !activity.actual_time) {
    return 'missed';
  }
  
  return 'upcoming';
};

// Helper function to format routine data from API
const formatRoutineData = (routineData) => {
  if (!routineData || !routineData.routine) {
    return null;
  }
  
  const currentTime = new Date();
  const wakeEvents = routineData.routine.filter(event => event.type === 'wake');
  const sleepEvents = routineData.routine.filter(event => event.type === 'sleep');
  const napEvents = routineData.routine.filter(event => event.type === 'nap');
  const feedingEvents = routineData.routine.filter(event => event.type === 'feeding');
  
  const formattedActivities = routineData.routine.map(event => {
    return {
      id: event.id || `${event.type}_${event.start_time || ''}`,
      type: event.type,
      name: event.type.charAt(0).toUpperCase() + event.type.slice(1),
      plannedTime: event.start_time || '',
      actualTime: event.actual_time || null,
      status: getActivityStatus(event, currentTime),
      location: event.location || ''
    };
  });
  
  return {
    babyName: routineData.baby_name || 'Baby',
    wakeTime: wakeEvents.length > 0 ? wakeEvents[0].start_time : '06:00',
    bedTime: sleepEvents.length > 0 ? sleepEvents[0].start_time : '20:00',
    activities: formattedActivities
  };
};

const RoutineDisplay = ({ userId }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [routineData, setRoutineData] = React.useState(null);
  const [caregiverUpdates, setCaregiverUpdates] = React.useState([]);
  
  // Fetch routine data from API
  React.useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        setLoading(true);
        const routines = await ApiService.getRoutines(userId);
        
        if (routines && routines.length > 0) {
          // Use the most recent routine
          const latestRoutine = routines.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          setRoutineData(formatRoutineData(latestRoutine));
        } else {
          setError('No routines found');
        }
      } catch (err) {
        console.error('Error fetching routine data:', err);
        setError('Failed to load routine data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutineData();
  }, [userId]);
  
  // Fetch caregiver updates from API
  React.useEffect(() => {
    const fetchCaregiverUpdates = async () => {
      try {
        const updates = await ApiService.getCaregiverUpdates(userId);
        
        if (updates && updates.length > 0) {
          // Format updates for display
          const formattedUpdates = updates.map(update => ({
            id: update.id,
            time: new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            caregiver: update.from_number,
            message: update.message,
            status: 'on-track' // Default status, could be determined by more complex logic
          }));
          
          setCaregiverUpdates(formattedUpdates);
        }
      } catch (err) {
        console.error('Error fetching caregiver updates:', err);
        // Don't set error state here to avoid blocking the whole component
      }
    };
    
    fetchCaregiverUpdates();
  }, [userId]);
  
  // Generate time markers every 2 hours from 6am to 8pm
  const timeMarkers = [];
  for (let hour = 6; hour <= 20; hour += 2) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const position = timeToPosition(time);
    timeMarkers.push({ time, position });
  }

  const currentTimePosition = getCurrentTimePosition();
  
  // Calculate current status
  const getCurrentStatus = () => {
    if (!routineData || !routineData.activities) {
      return { activity: 'Unknown', lastUpdate: 'Never', nextActivity: 'Unknown' };
    }
    
    const now = new Date();
    const currentActivities = routineData.activities.filter(activity => {
      if (!activity.plannedTime) return false;
      
      const [hours, minutes] = activity.plannedTime.split(':').map(Number);
      const activityTime = new Date();
      activityTime.setHours(hours, minutes, 0, 0);
      
      return activityTime <= now;
    });
    
    const upcomingActivities = routineData.activities.filter(activity => {
      if (!activity.plannedTime) return false;
      
      const [hours, minutes] = activity.plannedTime.split(':').map(Number);
      const activityTime = new Date();
      activityTime.setHours(hours, minutes, 0, 0);
      
      return activityTime > now;
    });
    
    const lastActivity = currentActivities.length > 0 
      ? currentActivities[currentActivities.length - 1] 
      : null;
      
    const nextActivity = upcomingActivities.length > 0 
      ? upcomingActivities[0] 
      : null;
    
    const lastUpdateTime = caregiverUpdates.length > 0 
      ? caregiverUpdates[0].time 
      : 'Never';
    
    return {
      activity: lastActivity ? lastActivity.name : 'Awake',
      lastUpdate: lastUpdateTime,
      nextActivity: nextActivity 
        ? `${nextActivity.name} at ${nextActivity.plannedTime}` 
        : 'None scheduled'
    };
  };
  
  const currentStatus = getCurrentStatus();
  
  // Calculate daily summary
  const getDailySummary = () => {
    if (!routineData || !routineData.activities) {
      return { naps: '0/0', feedings: '0/0', onSchedule: '0%' };
    }
    
    const napActivities = routineData.activities.filter(a => a.type === 'nap');
    const completedNaps = napActivities.filter(a => a.status === 'completed').length;
    const totalNaps = napActivities.length;
    
    const feedingActivities = routineData.activities.filter(a => a.type === 'feeding');
    const completedFeedings = feedingActivities.filter(a => a.status === 'completed').length;
    const totalFeedings = feedingActivities.length;
    
    const completedActivities = routineData.activities.filter(a => a.status === 'completed').length;
    const totalActivities = routineData.activities.length;
    const onSchedulePercentage = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100) 
      : 0;
    
    return {
      naps: `${completedNaps}/${totalNaps}`,
      feedings: `${completedFeedings}/${totalFeedings}`,
      onSchedule: `${onSchedulePercentage}%`
    };
  };
  
  const dailySummary = getDailySummary();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1">
          Please make sure the backend server is running and has routine data available.
        </Typography>
      </Box>
    );
  }

  if (!routineData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          No routine data available
        </Typography>
        <Typography variant="body1">
          Please create a routine first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }} className="routine-display">
      <Typography variant="h4" gutterBottom className="text-2xl md:text-4xl font-bold mb-4">
        {routineData.babyName}'s Hatchling Routine
      </Typography>
      
      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12} md={4}>
          <StatusCard elevation={2} className="bg-white rounded-lg shadow-md p-4">
            <Typography variant="h6" gutterBottom className="text-lg font-semibold">
              Current Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} className="flex items-center mb-4">
              <AccessTimeIcon color="primary" sx={{ mr: 1 }} className="mr-2 text-primary-main" />
              <Typography variant="h5" className="text-xl font-medium">{currentStatus.activity}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom className="text-sm text-gray-600 mb-2">
              Last update: {currentStatus.lastUpdate}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom className="text-sm text-gray-600 mb-4">
              Next: {currentStatus.nextActivity}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }} className="mt-4 flex flex-wrap gap-2">
              <Button variant="contained" size="small" className="bg-primary-main hover:bg-primary-dark text-white px-3 py-1 rounded">Log Nap</Button>
              <Button variant="outlined" size="small" className="border-primary-main text-primary-main hover:bg-primary-light/10 px-3 py-1 rounded">Log Feeding</Button>
            </Box>
          </StatusCard>
        </Grid>
        
        {/* Daily Summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }} className="bg-white rounded-lg shadow-md p-4 h-full">
            <Typography variant="h6" gutterBottom className="text-lg font-semibold">
              Daily Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }} className="text-center">
                  <Typography variant="h4" className="text-2xl font-bold">{dailySummary.naps}</Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm text-gray-600">Naps Completed</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }} className="text-center">
                  <Typography variant="h4" className="text-2xl font-bold">{dailySummary.feedings}</Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm text-gray-600">Feedings</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }} className="text-center">
                  <Typography variant="h4" className="text-2xl font-bold">{dailySummary.onSchedule}</Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm text-gray-600">On Schedule</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Timeline */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }} className="bg-white rounded-lg shadow-md p-4">
            <Typography variant="h6" gutterBottom className="text-lg font-semibold">
              Today's Timeline
            </Typography>
            <TimelineContainer className="relative w-full h-32 mt-4 mb-4 bg-white rounded-lg p-4 overflow-hidden">
              {/* Time markers */}
              {timeMarkers.map((marker, index) => (
                <React.Fragment key={index}>
                  <TimeMarker style={{ left: `${marker.position}%` }} className="absolute top-0 h-full w-px bg-gray-200 z-10" />
                  <TimeLabel style={{ left: `${marker.position}%` }} className="absolute top-2 transform -translate-x-1/2 text-xs text-gray-500">
                    {marker.time.substring(0, 2)}
                    {parseInt(marker.time) >= 12 ? 'PM' : 'AM'}
                  </TimeLabel>
                </React.Fragment>
              ))}
              
              {/* Current time marker */}
              {currentTimePosition >= 0 && currentTimePosition <= 100 && (
                <CurrentTimeMarker style={{ left: `${currentTimePosition}%` }} className="absolute top-0 h-full w-0.5 bg-primary-main z-20" />
              )}
              
              {/* Activity markers */}
              {routineData.activities.map((activity, index) => {
                if (!activity.plannedTime) return null;
                
                const position = timeToPosition(activity.plannedTime);
                if (position < 0 || position > 100) return null;
                
                const width = activity.type === 'nap' ? 10 : 6;
                
                return (
                  <ActivityMarker 
                    key={index}
                    style={{ 
                      left: `${position}%`, 
                      width: `${width}%`,
                      marginLeft: `-${width / 2}%`
                    }}
                    status={activity.status}
                    className={`absolute top-10 h-16 rounded p-2 z-30 flex flex-col justify-center items-center ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-500' :
                      activity.status === 'missed' ? 'bg-red-100 text-red-800 border border-red-500' :
                      'bg-blue-100 text-blue-800 border border-blue-500'
                    } cursor-pointer hover:opacity-90 hover:shadow`}
                  >
                    <Typography variant="caption" className="text-xs font-medium">
                      {activity.name}
                    </Typography>
                    <Typography variant="caption" className="text-xs">
                      {activity.plannedTime}
                    </Typography>
                  </ActivityMarker>
                );
              })}
            </TimelineContainer>
          </Paper>
        </Grid>
        
        {/* Recent Updates */}
        <Grid item xs={12}>
          <UpdatesCard elevation={2} className="bg-white rounded-lg shadow-md p-4">
            <Typography variant="h6" gutterBottom className="text-lg font-semibold">
              Recent Caregiver Updates
            </Typography>
            {caregiverUpdates.length > 0 ? (
              <Box>
                {caregiverUpdates.slice(0, 5).map((update, index) => (
                  <UpdateItem 
                    key={index} 
                    status={update.status}
                    className={`p-2 mb-2 ${
                      update.status === 'on-track' ? 'border-l-4 border-green-500' :
                      update.status === 'off-track' ? 'border-l-4 border-yellow-500' :
                      'border-l-4 border-red-500'
                    } bg-gray-50 rounded`}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex justify-between items-center">
                      <Typography variant="body2" className="text-sm font-medium">
                        {update.time}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={update.caregiver} 
                        color="primary" 
                        variant="outlined"
                        className="text-xs bg-primary-50 text-primary-700 border border-primary-300 px-2 py-0.5 rounded-full"
                      />
                    </Box>
                    <Typography variant="body1" className="text-base mt-1">
                      {update.message}
                    </Typography>
                  </UpdateItem>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" className="text-base text-gray-600">
                No recent updates from caregivers.
              </Typography>
            )}
          </UpdatesCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoutineDisplay;
