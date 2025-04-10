import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Box,
  Grid,
  Avatar,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Message as MessageIcon
} from '@material-ui/icons';
import ApiService from '../services/ApiService';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  title: {
    fontWeight: 600,
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: 16,
  },
  userCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  userAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#e6d7c3',
    color: '#333',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1),
  },
  userInfo: {
    flexGrow: 1,
  },
  userActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  addButton: {
    marginLeft: theme.spacing(1),
  },
  roleChip: {
    marginTop: theme.spacing(1),
    backgroundColor: '#f0f0f0',
  },
  primaryRole: {
    backgroundColor: '#e6d7c3',
    color: '#333',
  },
  secondaryRole: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  permissionItem: {
    padding: theme.spacing(1, 0),
  },
  dialogContent: {
    minWidth: 400,
  },
  inviteField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  inviteList: {
    marginTop: theme.spacing(2),
  },
  pendingInvite: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  inviteActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  notificationSettings: {
    marginTop: theme.spacing(3),
  },
  notificationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
  },
  formControl: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minWidth: 200,
  },
  messageField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  activityLog: {
    marginTop: theme.spacing(3),
  },
  activityItem: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  activityIcon: {
    backgroundColor: '#f0f0f0',
  },
  activityTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  realTimeIndicator: {
    display: 'flex',
    alignItems: 'center',
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
}));

// Mock data for caregivers
const MOCK_CAREGIVERS = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    email: 'sarah@example.com', 
    role: 'Primary Parent',
    permissions: ['view', 'edit', 'invite', 'admin'],
    online: true,
    lastActive: '2025-04-09T15:30:00Z'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    email: 'michael@example.com', 
    role: 'Parent',
    permissions: ['view', 'edit'],
    online: false,
    lastActive: '2025-04-08T09:15:00Z'
  },
  { 
    id: 3, 
    name: 'Emily Taylor', 
    email: 'emily@example.com', 
    role: 'Babysitter',
    permissions: ['view', 'log'],
    online: false,
    lastActive: '2025-04-07T18:45:00Z'
  },
  { 
    id: 4, 
    name: 'Grandma Rodriguez', 
    email: 'grandma@example.com', 
    role: 'Family',
    permissions: ['view', 'log'],
    online: false,
    lastActive: '2025-04-05T14:20:00Z'
  }
];

// Mock data for pending invites
const MOCK_INVITES = [
  { id: 1, email: 'uncle@example.com', role: 'Family', sentAt: '2025-04-08T10:00:00Z' },
  { id: 2, email: 'nanny@example.com', role: 'Caregiver', sentAt: '2025-04-09T09:30:00Z' }
];

// Mock data for activity log
const MOCK_ACTIVITY_LOG = [
  { id: 1, userId: 2, userName: 'Michael Chen', action: 'logged a feeding', timestamp: '2025-04-09T14:30:00Z' },
  { id: 2, userId: 3, userName: 'Emily Taylor', action: 'logged a diaper change', timestamp: '2025-04-09T12:15:00Z' },
  { id: 3, userId: 1, userName: 'Sarah Johnson', action: 'updated the routine schedule', timestamp: '2025-04-09T10:00:00Z' },
  { id: 4, userId: 4, userName: 'Grandma Rodriguez', action: 'logged a nap', timestamp: '2025-04-08T15:45:00Z' },
  { id: 5, userId: 2, userName: 'Michael Chen', action: 'added a milestone', timestamp: '2025-04-08T09:30:00Z' }
];

const CaregiverManagement = () => {
  const classes = useStyles();
  const [caregivers, setCaregivers] = useState(MOCK_CAREGIVERS);
  const [pendingInvites, setPendingInvites] = useState(MOCK_INVITES);
  const [activityLog, setActivityLog] = useState(MOCK_ACTIVITY_LOG);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Family');
  const [messageText, setMessageText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [notificationSettings, setNotificationSettings] = useState({
    allActivities: true,
    feedings: true,
    naps: true,
    diapers: true,
    medications: true,
    milestones: true,
    caregiverChanges: true
  });
  
  const handleOpenInviteDialog = () => {
    setShowInviteDialog(true);
  };
  
  const handleCloseInviteDialog = () => {
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('Family');
  };
  
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedUser(null);
  };
  
  const handleOpenPermissionsDialog = (user) => {
    setSelectedUser(user);
    setShowPermissionsDialog(true);
  };
  
  const handleClosePermissionsDialog = () => {
    setShowPermissionsDialog(false);
    setSelectedUser(null);
  };
  
  const handleOpenNotificationsDialog = () => {
    setShowNotificationsDialog(true);
  };
  
  const handleCloseNotificationsDialog = () => {
    setShowNotificationsDialog(false);
  };
  
  const handleOpenMessageDialog = (user) => {
    setSelectedUser(user);
    setShowMessageDialog(true);
  };
  
  const handleCloseMessageDialog = () => {
    setShowMessageDialog(false);
    setSelectedUser(null);
    setMessageText('');
  };
  
  const handleInviteChange = (e) => {
    setInviteEmail(e.target.value);
  };
  
  const handleRoleChange = (e) => {
    setInviteRole(e.target.value);
  };
  
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
  };
  
  const handleSendInvite = () => {
    // In a real app, this would send an API request
    console.log('Sending invite to:', inviteEmail, 'with role:', inviteRole);
    
    // Add to pending invites
    const newInvite = {
      id: pendingInvites.length + 1,
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date().toISOString()
    };
    
    setPendingInvites([...pendingInvites, newInvite]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Invitation sent to ${inviteEmail}`,
      severity: 'success'
    });
    
    handleCloseInviteDialog();
  };
  
  const handleSendMessage = () => {
    if (!selectedUser || !messageText.trim()) return;
    
    // In a real app, this would send an API request
    console.log('Sending message to:', selectedUser.name, 'Message:', messageText);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Message sent to ${selectedUser.name}`,
      severity: 'success'
    });
    
    // Add to activity log
    const newActivity = {
      id: activityLog.length + 1,
      userId: 1, // Current user
      userName: 'You',
      action: `sent a message to ${selectedUser.name}`,
      timestamp: new Date().toISOString()
    };
    
    setActivityLog([newActivity, ...activityLog]);
    
    handleCloseMessageDialog();
  };
  
  const handleCancelInvite = (inviteId) => {
    // In a real app, this would send an API request
    console.log('Canceling invite:', inviteId);
    
    // Remove from pending invites
    setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Invitation canceled',
      severity: 'info'
    });
  };
  
  const handleResendInvite = (invite) => {
    // In a real app, this would send an API request
    console.log('Resending invite to:', invite.email);
    
    // Update sent timestamp
    const updatedInvites = pendingInvites.map(item => 
      item.id === invite.id 
        ? { ...item, sentAt: new Date().toISOString() } 
        : item
    );
    
    setPendingInvites(updatedInvites);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Invitation resent to ${invite.email}`,
      severity: 'success'
    });
  };
  
  const handleRemoveUser = (userId) => {
    // In a real app, this would send an API request
    console.log('Removing user:', userId);
    
    // Get user name before removal
    const user = caregivers.find(u => u.id === userId);
    
    // Remove from caregivers
    setCaregivers(caregivers.filter(user => user.id !== userId));
    
    // Show success message
    setSnackbar({
      open: true,
      message: `${user.name} has been removed`,
      severity: 'success'
    });
    
    // Add to activity log
    const newActivity = {
      id: activityLog.length + 1,
      userId: 1, // Current user
      userName: 'You',
      action: `removed ${user.name} from caregivers`,
      timestamp: new Date().toISOString()
    };
    
    setActivityLog([newActivity, ...activityLog]);
  };
  
  const handleTogglePermission = (permission) => {
    if (!selectedUser) return;
    
    // Toggle permission
    const hasPermission = selectedUser.permissions.includes(permission);
    let updatedPermissions;
    
    if (hasPermission) {
      updatedPermissions = selectedUser.permissions.filter(p => p !== permission);
    } else {
      updatedPermissions = [...selectedUser.permissions, permission];
    }
    
    // Update user
    const updatedUser = { ...selectedUser, permissions: updatedPermissions };
    setSelectedUser(updatedUser);
    
    // Update caregivers list
    const updatedCaregivers = caregivers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setCaregivers(updatedCaregivers);
  };
  
  const handleToggleNotification = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  const handleSavePermissions = () => {
    // In a real app, this would send an API request
    console.log('Saving permissions for user:', selectedUser);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `Permissions updated for ${selectedUser.name}`,
      severity: 'success'
    });
    
    // Add to activity log
    const newActivity = {
      id: activityLog.length + 1,
      userId: 1, // Current user
      userName: 'You',
      action: `updated permissions for ${selectedUser.name}`,
      timestamp: new Date().toISOString()
    };
    
    setActivityLog([newActivity, ...activityLog]);
    
    // Close dialog
    handleClosePermissionsDialog();
  };
  
  const handleSaveNotifications = () => {
    // In a real app, this would send an API request
    console.log('Saving notification settings:', notificationSettings);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Notification settings saved',
      severity: 'success'
    });
    
    // Close dialog
    handleCloseNotificationsDialog();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const renderInviteDialog = () => (
    <Dialog open={showInviteDialog} onClose={handleCloseInviteDialog}>
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
        <FormControl variant="outlined" fullWidth className={classes.formControl}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={inviteRole}
            onChange={handleRoleChange}
            label="Role"
          >
            <MenuItem value="Parent">Parent</MenuItem>
            <MenuItem value="Family">Family Member</MenuItem>
            <MenuItem value="Caregiver">Caregiver</MenuItem>
            <MenuItem value="Babysitter">Babysitter</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="textSecondary">
          You can customize their permissions after they accept the invitation.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseInviteDialog} color="default">
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
  
  const renderPermissionsDialog = () => {
    if (!selectedUser) return null;
    
    return (
      <Dialog open={showPermissionsDialog} onClose={handleClosePermissionsDialog}>
        <DialogTitle>Permissions for {selectedUser.name}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body2" gutterBottom>
            Customize what {selectedUser.name} can do in the app.
          </Typography>
          
          <List>
            <ListItem className={classes.permissionItem}>
              <ListItemText 
                primary="View baby's routine" 
                secondary="Can see all activities and schedules"
              />
              <ListItemSecondaryAction>
                <Switch 
                  edge="end"
                  checked={selectedUser.permissions.includes('view')}
                  onChange={() => handleTogglePermission('view')}
                  disabled={selectedUser.role === 'Primary Parent'}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.permissionItem}>
              <ListItemText 
                primary="Log activities" 
                secondary="Can record feedings, naps, etc."
              />
              <ListItemSecondaryAction>
                <Switch 
                  edge="end"
                  checked={selectedUser.permissions.includes('log')}
                  onChange={() => handleTogglePermission('log')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.permissionItem}>
              <ListItemText 
                primary="Edit routines" 
                secondary="Can modify schedules and routines"
              />
              <ListItemSecondaryAction>
                <Switch 
                  edge="end"
                  checked={selectedUser.permissions.includes('edit')}
                  onChange={() => handleTogglePermission('edit')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.permissionItem}>
              <ListItemText 
                primary="Invite others" 
                secondary="Can invite new caregivers"
              />
              <ListItemSecondaryAction>
                <Switch 
                  edge="end"
                  checked={selectedUser.permissions.includes('invite')}
                  onChange={() => handleTogglePermission('invite')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem className={classes.permissionItem}>
              <ListItemText 
                primary="Admin access" 
                secondary="Full control over all settings"
              />
              <ListItemSecondaryAction>
                <Switch 
                  edge="end"
                  checked={selectedUser.permissions.includes('admin')}
                  onChange={() => handleTogglePermission('admin')}
                  disabled={selectedUser.role === 'Primary Parent'}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionsDialog} color="default">
            Cancel
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            color="primary" 
            variant="contained"
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderNotificationsDialog = () => (
    <Dialog open={showNotificationsDialog} onClose={handleCloseNotificationsDialog}>
      <DialogTitle>Notification Settings</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body2" gutterBottom>
          Choose which activities you want to be notified about.
        </Typography>
        
        <List>
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="All Activities" 
              secondary="Get notified about everything"
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.allActivities}
                onChange={() => handleToggleNotification('allActivities')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Feedings" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.feedings}
                onChange={() => handleToggleNotification('feedings')}
                disabled={notificationSettings.allActivities}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Naps & Sleep" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.naps}
                onChange={() => handleToggleNotification('naps')}
                disabled={notificationSettings.allActivities}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Diaper Changes" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.diapers}
                onChange={() => handleToggleNotification('diapers')}
                disabled={notificationSettings.allActivities}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Medications" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.medications}
                onChange={() => handleToggleNotification('medications')}
                disabled={notificationSettings.allActivities}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Milestones" 
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.milestones}
                onChange={() => handleToggleNotification('milestones')}
                disabled={notificationSettings.allActivities}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem className={classes.permissionItem}>
            <ListItemText 
              primary="Caregiver Changes" 
              secondary="When caregivers join or leave"
            />
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={notificationSettings.caregiverChanges}
                onChange={() => handleToggleNotification('caregiverChanges')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseNotificationsDialog} color="default">
          Cancel
        </Button>
        <Button 
          onClick={handleSaveNotifications} 
          color="primary" 
          variant="contained"
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const renderMessageDialog = () => {
    if (!selectedUser) return null;
    
    return (
      <Dialog open={showMessageDialog} onClose={handleCloseMessageDialog}>
        <DialogTitle>Message {selectedUser.name}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body2" gutterBottom>
            Send a message to {selectedUser.name}.
          </Typography>
          <TextField
            label="Message"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className={classes.messageField}
            value={messageText}
            onChange={handleMessageChange}
            placeholder={`Hi ${selectedUser.name}, ...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog} color="default">
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            color="primary" 
            variant="contained"
            disabled={!messageText.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderPendingInvites = () => {
    if (pendingInvites.length === 0) {
      return null;
    }
    
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Pending Invitations
        </Typography>
        <div className={classes.inviteList}>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className={classes.pendingInvite}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2">
                    {invite.email}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Role: {invite.role} • Sent: {new Date(invite.sentAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Button 
                    size="small" 
                    onClick={() => handleResendInvite(invite)}
                  >
                    Resend
                  </Button>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCancelInvite(invite.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </div>
          ))}
        </div>
      </Paper>
    );
  };
  
  const renderActivityLog = () => {
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activityLog.map((activity) => (
            <ListItem key={activity.id} className={classes.activityItem}>
              <ListItemAvatar>
                <Avatar className={classes.activityIcon}>
                  {activity.userName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={`${activity.userName} ${activity.action}`}
                secondary={
                  <Typography variant="caption" className={classes.activityTime}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };
  
  return (
    <div className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h5" className={classes.title}>
          Caregivers & Permissions
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={handleOpenNotificationsDialog}
          >
            Notifications
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={handleOpenInviteDialog}
          >
            Invite Caregiver
          </Button>
        </Box>
      </Box>
      
      <Box className={classes.realTimeIndicator}>
        <NotificationsIcon className={classes.realTimeIcon} />
        <Typography variant="body2">
          Real-time updates enabled. Caregivers will be notified of changes instantly.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {caregivers.map((caregiver) => (
          <Grid item xs={12} sm={6} md={4} key={caregiver.id}>
            <Paper className={classes.userCard} elevation={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar className={classes.userAvatar}>
                  {caregiver.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" align="center">
                  {caregiver.name}
                </Typography>
                <Chip 
                  label={caregiver.role}
                  className={`${classes.roleChip} ${
                    caregiver.role === 'Primary Parent' ? classes.primaryRole : classes.secondaryRole
                  }`}
                  size="small"
                />
                {caregiver.online && (
                  <Chip 
                    label="Online"
                    size="small"
                    style={{ marginTop: 8, backgroundColor: '#4caf50', color: 'white' }}
                  />
                )}
              </Box>
              
              <Box mt={2} className={classes.userInfo}>
                <Typography variant="body2" color="textSecondary">
                  {caregiver.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last active: {new Date(caregiver.lastActive).toLocaleString()}
                </Typography>
                
                <Box mt={1}>
                  <Typography variant="body2">
                    Permissions:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" mt={0.5}>
                    {caregiver.permissions.includes('view') && (
                      <Chip 
                        label="View"
                        size="small"
                        style={{ margin: 2 }}
                      />
                    )}
                    {caregiver.permissions.includes('log') && (
                      <Chip 
                        label="Log"
                        size="small"
                        style={{ margin: 2 }}
                      />
                    )}
                    {caregiver.permissions.includes('edit') && (
                      <Chip 
                        label="Edit"
                        size="small"
                        style={{ margin: 2 }}
                      />
                    )}
                    {caregiver.permissions.includes('invite') && (
                      <Chip 
                        label="Invite"
                        size="small"
                        style={{ margin: 2 }}
                      />
                    )}
                    {caregiver.permissions.includes('admin') && (
                      <Chip 
                        label="Admin"
                        size="small"
                        style={{ margin: 2, backgroundColor: '#f44336', color: 'white' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <div className={classes.userActions}>
                <Button 
                  size="small" 
                  startIcon={<MessageIcon />}
                  onClick={() => handleOpenMessageDialog(caregiver)}
                >
                  Message
                </Button>
                <Button 
                  size="small" 
                  startIcon={<SupervisorAccountIcon />}
                  onClick={() => handleOpenPermissionsDialog(caregiver)}
                  disabled={caregiver.role === 'Primary Parent' && caregiver.id !== 1}
                >
                  Permissions
                </Button>
                {caregiver.role !== 'Primary Parent' && (
                  <Button 
                    size="small" 
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleRemoveUser(caregiver.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {renderPendingInvites()}
      {renderActivityLog()}
      {renderInviteDialog()}
      {renderPermissionsDialog()}
      {renderNotificationsDialog()}
      {renderMessageDialog()}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CaregiverManagement;
