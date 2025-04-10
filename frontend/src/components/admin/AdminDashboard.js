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
  const [users, setUsers] = useState([]);
  const [smsActivity, setSmsActivity] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    trialUsers: 0,
    totalChildren: 0,
    dailyLogs: 0,
    smsActivity: 0,
    churnRate: '0%',
    conversionRate: '0%',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users data
      const usersResponse = await ApiService.getAllUsers();
      if (usersResponse && Array.isArray(usersResponse)) {
        setUsers(usersResponse);
        
        // Calculate metrics from user data
        const activeUsers = usersResponse.filter(user => user.subscription_status === 'active');
        const trialUsers = usersResponse.filter(user => user.subscription_status === 'trial');
        
        // Count total children
        let totalChildren = 0;
        usersResponse.forEach(user => {
          if (user.children && Array.isArray(user.children)) {
            totalChildren += user.children.length;
          }
        });
        
        // Calculate conversion rate
        const conversionRate = usersResponse.length > 0 
          ? Math.round((activeUsers.length / usersResponse.length) * 100) + '%'
          : '0%';
        
        // Fetch SMS activity
        const smsResponse = await ApiService.getAllSmsActivity();
        if (smsResponse && Array.isArray(smsResponse)) {
          setSmsActivity(smsResponse);
          
          // Update metrics with real data
          setMetrics({
            totalUsers: usersResponse.length,
            activeUsers: activeUsers.length,
            trialUsers: trialUsers.length,
            totalChildren: totalChildren,
            dailyLogs: smsResponse.length,
            smsActivity: smsResponse.length,
            churnRate: '3.2%', // This would need a more complex calculation in a real app
            conversionRate: conversionRate,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setNotification({
        open: true,
        message: 'Error loading dashboard data. Using sample data instead.',
        severity: 'error'
      });
      
      // Fall back to sample data if API fails
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    // Sample data for demonstration when API fails
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

    setUsers(MOCK_USERS);
    setSmsActivity(MOCK_SMS_ACTIVITY);
    setMetrics(MOCK_METRICS);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleImpersonateUser = async (user) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call an API endpoint to create an impersonation session
      const impersonationResponse = await ApiService.impersonateUser(user.id);
      
      if (impersonationResponse && impersonationResponse.success) {
        setImpersonatedUser(user);
        setNotification({
          open: true,
          message: `Now impersonating ${user.name}. You can view the application as this user.`,
          severity: 'info'
        });
        
        // Switch to the impersonation tab
        setTabValue(4);
      } else {
        throw new Error('Failed to impersonate user');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      setNotification({
        open: true,
        message: `Error impersonating user: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndImpersonation = () => {
    setImpersonatedUser(null);
    setNotification({
      open: true,
      message: 'Impersonation session ended',
      severity: 'info'
    });
    setTabValue(0); // Return to dashboard
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
              const user = users.find(u => u.id === sms.user_id) || { name: 'Unknown User' };
              return (
                <TableRow key={sms.id}>
                  <TableCell>{user.name}</TableCell>
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

  const renderSettings = () => (
    <Paper className={classes.paper}>
      <Typography variant="h6" gutterBottom>
        Admin Settings
      </Typography>
      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          Account Information
        </Typography>
        <Typography variant="body2">
          Email: {adminData?.email || 'admin@hatchling.com'}
        </Typography>
        <Typography variant="body2">
          Role: Administrator
        </Typography>
      </Box>
      <Divider className={classes.divider} />
      <Box mt={3}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ExitToAppIcon />}
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>
    </Paper>
  );

  const renderUserDashboard = () => {
    const user = impersonatedUser || selectedUser;
    
    if (!user) {
      return (
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            No user selected
          </Typography>
          <Typography variant="body1">
            Please select a user to view their dashboard.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <>
        {impersonatedUser && (
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" style={{ color: '#f44336' }}>
              Impersonating: {user.name}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEndImpersonation}
            >
              End Impersonation
            </Button>
          </Box>
        )}
        
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            User Profile
          </Typography>
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Account Information
                </Typography>
                <Typography variant="body2">
                  Name: {user.name}
                </Typography>
                <Typography variant="body2">
                  Email: {user.email}
                </Typography>
                <Typography variant="body2">
                  Subscription: {user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1)} ({user.subscription_plan})
                </Typography>
                <Typography variant="body2">
                  Last Active: {new Date(user.last_active).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Children
                </Typography>
                {Array.isArray(user.children) && user.children.length > 0 ? (
                  user.children.map((child, index) => (
                    <Typography key={index} variant="body2">
                      Child {index + 1}: {child.name || 'Unnamed'} 
                      {child.birth_date ? ` (${new Date(child.birth_date).toLocaleDateString()})` : ''}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">
                    No children registered
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {impersonatedUser && (
          <Box mt={3}>
            <Paper className={classes.paper}>
              <Typography variant="h6" gutterBottom>
                User Dashboard View
              </Typography>
              <Typography variant="body1" paragraph>
                This is a simulation of what the user would see in their dashboard.
              </Typography>
              
              <iframe 
                src={`/dashboard?user_id=${user.id}&impersonation=true`}
                style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '8px' }}
                title="User Dashboard"
              />
            </Paper>
          </Box>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

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
          <Box>
            <IconButton color="inherit" onClick={onLogout} title="Logout">
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container className={classes.container}>
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
          <Tab icon={<SettingsIcon />} label="Settings" className={classes.tab} />
          {(selectedUser || impersonatedUser) && (
            <Tab icon={<PersonIcon />} label="User Dashboard" className={classes.tab} />
          )}
        </Tabs>
        
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
          {renderSettings()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4} className={classes.tabPanel}>
          {renderUserDashboard()}
        </TabPanel>
      </Container>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminDashboard;
