import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Avatar,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SmsIcon from '@mui/icons-material/Sms';
import ApiService from '../services/ApiService';

// Styled components
const UpdatesContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const UpdatesList = styled(List)(({ theme }) => ({
  maxHeight: '400px',
  overflow: 'auto',
  padding: 0,
}));

const UpdateItem = styled(ListItem)(({ theme, status }) => ({
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${
    status === 'on-track' ? theme.palette.success.main :
    status === 'off-track' ? theme.palette.warning.main :
    theme.palette.info.main
  }`,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const CaregiverChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const CaregiverUpdates = ({ userId, babyId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingId, setPollingId] = useState(null);

  // Start polling for updates when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const caregiverUpdates = await ApiService.getCaregiverUpdates(userId);
        
        // Filter updates by baby_id if provided
        const filteredUpdates = babyId 
          ? caregiverUpdates.filter(update => update.baby_id === babyId)
          : caregiverUpdates;
        
        // Format updates for display
        const formattedUpdates = formatUpdates(filteredUpdates);
        setUpdates(formattedUpdates);
      } catch (err) {
        console.error('Error fetching caregiver updates:', err);
        setError('Failed to load caregiver updates');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up polling for real-time updates
    const intervalId = ApiService.startPolling(
      (data) => {
        if (data.updates) {
          // Filter updates by baby_id if provided
          const filteredUpdates = babyId 
            ? data.updates.filter(update => update.baby_id === babyId)
            : data.updates;
          
          // Format updates for display
          const formattedUpdates = formatUpdates(filteredUpdates);
          setUpdates(formattedUpdates);
        }
      },
      userId
    );

    setPollingId(intervalId);

    // Clean up polling when component unmounts
    return () => {
      if (pollingId) {
        ApiService.stopPolling(pollingId);
      }
    };
  }, [userId, babyId]);

  // Format updates for display
  const formatUpdates = (updates) => {
    return updates.map(update => ({
      id: update.id,
      time: new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(update.timestamp).toLocaleDateString(),
      caregiver: update.from_number || 'Parent',
      message: update.message,
      ai_response: update.ai_response,
      status: determineUpdateStatus(update),
      type: update.type || 'sms'
    })).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  };

  // Determine update status based on content
  const determineUpdateStatus = (update) => {
    // This is a simplified logic - could be more complex based on actual requirements
    if (update.type === 'assistant') {
      return 'info';
    }
    
    const message = update.message.toLowerCase();
    if (message.includes('missed') || message.includes('late') || message.includes('skip')) {
      return 'off-track';
    }
    
    return 'on-track';
  };

  // Group updates by date
  const groupUpdatesByDate = (updates) => {
    const grouped = {};
    
    updates.forEach(update => {
      if (!grouped[update.date]) {
        grouped[update.date] = [];
      }
      grouped[update.date].push(update);
    });
    
    return grouped;
  };

  const groupedUpdates = groupUpdatesByDate(updates);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <UpdatesContainer>
      <Typography variant="h6" gutterBottom>
        Caregiver Updates
      </Typography>
      
      {updates.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No caregiver updates yet.
          </Typography>
        </Box>
      ) : (
        <UpdatesList>
          {Object.keys(groupedUpdates).map(date => (
            <React.Fragment key={date}>
              <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {date}
                </Typography>
              </Box>
              
              {groupedUpdates[date].map(update => (
                <UpdateItem key={update.id} status={update.status}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Badge
                          color={update.type === 'assistant' ? 'secondary' : 'primary'}
                          variant="dot"
                          sx={{ mr: 1 }}
                        >
                          {update.type === 'assistant' ? 
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>AI</Avatar> :
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}><SmsIcon fontSize="small" /></Avatar>
                          }
                        </Badge>
                        <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                          {update.caregiver}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          {update.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {update.message}
                        </Typography>
                        
                        {update.ai_response && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {update.ai_response}
                            </Typography>
                          </Box>
                        )}
                      </>
                    }
                  />
                </UpdateItem>
              ))}
            </React.Fragment>
          ))}
        </UpdatesList>
      )}
    </UpdatesContainer>
  );
};

export default CaregiverUpdates;
