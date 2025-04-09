import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Snackbar,
  AppBar,
  Toolbar
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import PersonIcon from '@material-ui/icons/Person';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import MessageIcon from '@material-ui/icons/Message';
import SettingsIcon from '@material-ui/icons/Settings';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import Alert from '@material-ui/lab/Alert';
import ApiService from '../../services/ApiService';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  appBar: {
    backgroundColor: '#6b9080',
    color: '#fff',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  logo: {
    height: 40,
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 16,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
  },
  cardContent: {
    flexGrow: 1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    borderRadius: 16,
    maxHeight: 440,
  },
  searchBar: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  tabs: {
    marginBottom: theme.spacing(3),
  },
  tab: {
    minWidth: 100,
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
  },
  userAvatar: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
  },
}));

// Mock data for demonstration
const MOCK_USERS = [
  { id: 'user_001', name: 'Sarah Johnson', email: 'sarah@example.com', subscription_status: 'active', subscription_plan: 'premium', children: 2, last_active: '2025-04-09T10:23:45Z' },
  { id: 'user_002', name: 'Michael Chen', email: 'michael@example.com', subscription_status: 'trial', subscription_plan: 'standard', children: 1, last_active: '2025-04-08T15:12:30Z' },
  { id: 'user_003', name: 'Jessica Williams', email: 'jessica@example.com', subscription_status: 'active', subscription_plan: 'basic', children: 1, last_active: '2025-04-09T08:45:12Z' },
  { id: 'user_004', name: 'David Rodriguez', email: 'david@example.com', subscription_status: 'inactive', subscription_plan: 'standard', children: 3, last_active: '2025-04-05T11:30:22Z' },
  { id: 'user_005', name: 'Emily Taylor', email: 'emily@example.com', subscription_status: 'trial', subscription_plan: 'premium', children: 2, last_active: '2025-04-09T09:15:40Z' },
];

const MOCK_SMS_ACTIVITY = [
  { id: 'sms_001', user_id: 'user_001', from_number: '+15551234567', message: 'Baby napped from 2pm to 3:30pm', timestamp: '2025-04-09T15:30:00Z' },
  { id: 'sms_002', user_id: 'user_002', from_number: '+15559876543', message: 'Feeding at 12:15pm, 6oz formula', timestamp: '2025-04-09T12:20:00Z' },
  { id: 'sms_003', user_id: 'user_001', from_number: '+15551234567', message: 'Diaper change at 4pm, wet only', timestamp: '2025-04-09T16:05:00Z' },
  { id: 'sms_004', user_id: 'user_003', from_number: '+15554567890', message: 'Baby woke up at 7:30am', timestamp: '2025-04-09T07:35:00Z' },
  { id: 'sms_005', user_id: 'user_005', from_number: '+15552223333', message: 'Started bedtime routine at 7pm', timestamp: '2025-04-08T19:05:00Z' },
];

const MOCK_METRICS = {
  totalUsers: 127,
  activeUsers: 98,
  trialUsers: 42,
  totalChildren: 183,
  dailyLogs: 342,
  smsActivity: 215,
  churnRate: '3.2%',
  conversionRate: '68%',
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={props.className}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = ({ adminData, onLogout }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState(MOCK_USERS);
  const [smsActivity, setSmsActivity] = useState(MOCK_SMS_ACTIVITY);
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For demo purposes, we're using mock data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleImpersonateUser = (user) => {
    setNotification({
      open: true,
      message: `Now impersonating ${user.name}`,
      severity: 'info'
    });
    // In a real app, this would set up an impersonation session
  };

  const handleResetAccount = (user) => {
    setNotification({
      open: true,
      message: `Account reset for ${user.name}`,
      severity: 'success'
    });
    // In a real app, this would reset the user's account
  };

  const handleViewUserDashboard = (user) => {
    setSelectedUser(user);
    setTabValue(4); // Switch to User Dashboard tab
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography className={classes.statValue} color="primary">
              {metrics.totalUsers}
            </Typography>
            <Typography className={classes.statLabel}>
              {metrics.activeUsers} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant="h6" gutterBottom>
              Trial Users
            </Typography>
            <Typography className={classes.statValue} color="primary">
              {metrics.trialUsers}
            </Typography>
            <Typography className={classes.statLabel}>
              Conversion: {metrics.conversionRate}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant="h6" gutterBottom>
              Daily Logs
            </Typography>
            <Typography className={classes.statValue} color="primary">
              {metrics.dailyLogs}
            </Typography>
            <Typography className={classes.statLabel}>
              {metrics.smsActivity} via SMS
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant="h6" gutterBottom>
              Churn Rate
            </Typography>
            <Typography className={classes.statValue} color="primary">
              {metrics.churnRate}
            </Typography>
            <Typography className={classes.statLabel}>
              Last 30 days
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Recent User Activity
          </Typography>
          <TableContainer className={classes.tableContainer}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>Children</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className={classes.userInfo}>
                        <div className={classes.userAvatar}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.last_active).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        style={{
                          color: user.subscription_status === 'active' ? '#4caf50' :
                                user.subscription_status === 'trial' ? '#ff9800' : '#f44336'
                        }}
                      >
                        {user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1)} ({user.subscription_plan})
                      </Typography>
                    </TableCell>
                    <TableCell>{user.children}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        className={classes.actionButton}
                        onClick={() => handleViewUserDashboard(user)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderUsers = () => (
    <>
      <div className={classes.searchBar}>
        <TextField
          className={classes.searchInput}
          variant="outlined"
          placeholder="Search users by name or email"
          InputProps={{
            startAdornment: <SearchIcon color="action" style={{ marginRight: 8 }} />,
          }}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <Paper className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Children</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className={classes.userInfo}>
                      <div className={classes.userAvatar}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <Typography variant="body2">{user.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      style={{
                        color: user.subscription_status === 'active' ? '#4caf50' :
                              user.subscription_status === 'trial' ? '#ff9800' : '#f44336'
                      }}
                    >
                      {user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1)} ({user.subscription_plan})
                    </Typography>
                  </TableCell>
                  <TableCell>{user.children}</TableCell>
                  <TableCell>{new Date(user.last_active).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      className={classes.actionButton}
                      onClick={() => handleViewUserDashboard(user)}
                      title="View Dashboard"
                    >
                      <DashboardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      className={classes.actionButton}
                      onClick={() => handleImpersonateUser(user)}
                      title="Impersonate User"
                    >
                      <SupervisorAccountIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={() => handleResetAccount(user)}
                      title="Reset Account"
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );

  const renderSmsActivity = () => (
    <Paper className={classes.paper}>
      <Typography variant="h6" gutterBottom>
        SMS Activity
      </Typography>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>From Number</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {smsActivity.map((sms) => {
              const user = users.find(u => u.id === sms.user_id) || { name: 'Unknown User', email: '' };
              return (
                <TableRow key={sms.id}>
                  <TableCell>
                    <div className={classes.userInfo}>
                      <div className={classes.userAvatar}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <Typography variant="body2">{user.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{sms.from_number}</TableCell>
                  <TableCell>{sms.message}</TableCell>
                  <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            User Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Total Users</Typography>
              <Typography variant="h5">{metrics.totalUsers}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Active Users</Typography>
              <Typography variant="h5">{metrics.activeUsers}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Trial Users</Typography>
              <Typography variant="h5">{metrics.trialUsers}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Total Children</Typography>
              <Typography variant="h5">{metrics.totalChildren}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Activity Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Daily Logs</Typography>
              <Typography variant="h5">{metrics.dailyLogs}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">SMS Activity</Typography>
              <Typography variant="h5">{metrics.smsActivity}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Churn Rate</Typography>
              <Typography variant="h5">{metrics.churnRate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Conversion Rate</Typography>
              <Typography variant="h5">{metrics.conversionRate}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Subscription Distribution
          </Typography>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body1" color="textSecondary">
              Charts and detailed analytics would be displayed here
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderUserDashboard = () => {
    if (!selectedUser) {
      return (
        <Paper className={classes.paper}>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography variant="body1" color="textSecondary">
              Select a user to view their dashboard
            </Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <>
        <Paper className={classes.paper}>
          <Box display="flex" alignItems="center" mb={3}>
            <div className={classes.userAvatar} style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
              {selectedUser.name.charAt(0)}
            </div>
            <Box ml={2}>
              <Typography variant="h5">{selectedUser.name}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedUser.email}</Typography>
            </Box>
            <Box ml="auto">
              <Button
                variant="contained"
                color="primary"
                startIcon={<SupervisorAccountIcon />}
                onClick={() => handleImpersonateUser(selectedUser)}
              >
                Impersonate
              </Button>
            </Box>
          </Box>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Subscription Status</Typography>
              <Typography variant="body1">
                {selectedUser.subscription_status.charAt(0).toUpperCase() + selectedUser.subscription_status.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Subscription Plan</Typography>
              <Typography variant="body1">{selectedUser.subscription_plan.charAt(0).toUpperCase() + selectedUser.subscription_plan.slice(1)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Number of Children</Typography>
              <Typography variant="body1">{selectedUser.children}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Last Active</Typography>
              <Typography variant="body1">{new Date(selectedUser.last_active).toLocaleString()}</Typography>
            </Grid>
          </Grid>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {smsActivity
                  .filter(sms => sms.user_id === selectedUser.id)
                  .map((sms) => (
                    <TableRow key={sms.id}>
                      <TableCell>SMS</TableCell>
                      <TableCell>{sms.message}</TableCell>
                      <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Divider className={classes.divider} />
          
          <Typography variant="h6" gutterBottom>
            Admin Actions
          </Typography>
          <Box display="flex" mt={2}>
            <Button
              variant="outlined"
              color="primary"
              className={classes.actionButton}
              onClick={() => handleResetAccount(selectedUser)}
            >
              Reset Account
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.actionButton}
            >
              Edit Subscription
            </Button>
            <Button
              variant="outlined"
              className={classes.actionButton}
            >
              Send Message
            </Button>
          </Box>
        </Paper>
      </>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Box display="flex" alignItems="center">
            <img 
              src="/logo.png" 
              alt="Hatchling Logo" 
              className={classes.logo} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40?text=H';
              }}
            />
            <Typography variant="h6" className={classes.title}>
              Hatchling Admin
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Box mr={2} display="flex" alignItems="center">
              <PersonIcon style={{ marginRight: 8 }} />
              <Typography variant="body2">
                {adminData.name}
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={onLogout} title="Logout">
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container className={classes.container} maxWidth="lg">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          className={classes.tabs}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" className={classes.tab} />
          <Tab icon={<PeopleIcon />} label="Users" className={classes.tab} />
          <Tab icon={<MessageIcon />} label="SMS Activity" className={classes.tab} />
          <Tab icon={<TrendingUpIcon />} label="Metrics" className={classes.tab} />
          <Tab icon={<SupervisorAccountIcon />} label="User Dashboard" className={classes.tab} />
        </Tabs>
        
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <TabPanel value={tabValue} index={0} className={classes.tabPanel}>
              {renderDashboard()}
            </TabPanel>
            <TabPanel value={tabValue} index={1} className={classes.tabPanel}>
              {renderUsers()}
            </TabPanel>
            <TabPanel value={tabValue} index={2} className={classes.tabPanel}>
              {renderSmsActivity()}
            </TabPanel>
            <TabPanel value={tabValue} index={3} className={classes.tabPanel}>
              {renderMetrics()}
            </TabPanel>
            <TabPanel value={tabValue} index={4} className={classes.tabPanel}>
              {renderUserDashboard()}
            </TabPanel>
          </>
        )}
      </Container>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminDashboard;
