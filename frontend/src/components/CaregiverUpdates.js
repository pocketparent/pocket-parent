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
  Badge,
  Avatar,
  Chip
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PersonIcon from '@material-ui/icons/Person';
import SmsIcon from '@material-ui/icons/Sms';
import ApiService from '../services/ApiService';

// Styled components using makeStyles approach
const UpdatesContainer = props => (
  <Paper style={{ 
    padding: 16, 
    height: '100%', 
    borderRadius: 12, 
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' 
  }} {...props} />
);

const UpdatesList = props => (
  <List style={{ 
    maxHeight: '400px', 
    overflow: 'auto', 
    padding: 0 
  }} {...props} />
);

const UpdateItem = ({ status, ...props }) => (
  <ListItem style={{ 
    padding: '8px 16px', 
    marginBottom: 8, 
    borderLeft: `4px solid ${
      status === 'on-track' ? '#66bb6a' : 
      status === 'off-track' ? '#ffa726' : 
      '#29b6f6'
    }`,
    backgroundColor: '#f8f9fa', 
    borderRadius: 12 
  }} {...props} />
);

const CaregiverChip = props => (
  <Chip style={{ 
    marginRight: 8, 
    marginBottom: 8 
  }} {...props} />
);

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
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" style={{ marginBottom: 16 }}>
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
        <Box p={2} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            No caregiver updates yet.
          </Typography>
        </Box>
      ) : (
        <UpdatesList>
          {Object.keys(groupedUpdates).map(date => (
            <React.Fragment key={date}>
              <Box p={1} bgcolor="background.paper">
                <Typography variant="subtitle2" color="textSecondary">
                  {date}
                </Typography>
              </Box>
              
              {groupedUpdates[date].map(update => (
                <UpdateItem key={update.id} status={update.status}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Badge
                          color={update.type === 'assistant' ? 'secondary' : 'primary'}
                          variant="dot"
                          style={{ marginRight: 8 }}
                        >
                          {update.type === 'assistant' ? 
                            <Avatar style={{ width: 24, height: 24, backgroundColor: '#26a69a' }}>AI</Avatar> :
                            <Avatar style={{ width: 24, height: 24, backgroundColor: '#5c6bc0' }}><SmsIcon fontSize="small" /></Avatar>
                          }
                        </Badge>
                        <Typography variant="body1" component="span" style={{ fontWeight: 500 }}>
                          {update.caregiver}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginLeft: 'auto' }}>
                          {update.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" style={{ marginBottom: 8 }}>
                          {update.message}
                        </Typography>
                        
                        {update.ai_response && (
                          <Box mt={1} p={1} bgcolor="background.paper" borderRadius={1}>
                            <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
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
