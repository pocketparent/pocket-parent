import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiService from '../services/ApiService';
import RoutineDisplay from '../components/RoutineDisplay';
import CaregiverUpdates from '../components/CaregiverUpdates';
import RoutineForm from '../components/RoutineForm';
import ParentAssistantChat from '../components/ParentAssistantChat';

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

const Dashboard = ({ userId = null }) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingId, setPollingId] = useState(null);
  const [user, setUser] = useState(null);
  
  // Use default user ID if not provided
  const effectiveUserId = userId || process.env.REACT_APP_DEFAULT_USER_ID || 'test_user_123';

  // Fetch initial data and set up polling
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        try {
          const userData = await ApiService.getUser(effectiveUserId);
          setUser(userData);
        } catch (err) {
          console.warn('User not found, creating default user');
          // Create default user if not exists
          const newUser = await ApiService.createOrUpdateUser({
            id: effectiveUserId,
            subscription_status: 'trial'
          });
          setUser(newUser);
        }
        
        // Fetch routines
        const routinesData = await ApiService.getRoutines(effectiveUserId);
        setRoutines(routinesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up polling for real-time updates
    const intervalId = ApiService.startPolling(
      (data) => {
        if (data.routines) {
          setRoutines(data.routines);
        }
      },
      effectiveUserId
    );

    setPollingId(intervalId);

    // Clean up polling when component unmounts
    return () => {
      if (pollingId) {
        ApiService.stopPolling(pollingId);
      }
    };
  }, [effectiveUserId]);

  // Handle new routine added
  const handleRoutineAdded = (newRoutine) => {
    setRoutines(prev => [...prev, newRoutine]);
  };

  // Get the most recent routine
  const getLatestRoutine = () => {
    if (!routines || routines.length === 0) {
      return null;
    }
    
    return routines.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0];
  };

  const latestRoutine = getLatestRoutine();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <SectionTitle variant="h4" gutterBottom>
        Hatchling Dashboard
      </SectionTitle>
      
      <Grid container spacing={4}>
        {/* Routine Form */}
        <Grid item xs={12}>
          <RoutineForm 
            userId={effectiveUserId} 
            onRoutineAdded={handleRoutineAdded} 
          />
        </Grid>
        
        {/* Routine Display */}
        <Grid item xs={12}>
          {latestRoutine ? (
            <RoutineDisplay userId={effectiveUserId} />
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No Routine Data Available
              </Typography>
              <Typography variant="body1">
                Add your first routine update using the form above.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Caregiver Updates and AI Assistant */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <CaregiverUpdates userId={effectiveUserId} />
            </Grid>
            <Grid item xs={12} md={5}>
              <ParentAssistantChat userId={effectiveUserId} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
