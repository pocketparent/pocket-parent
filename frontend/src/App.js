import React from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Container,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import HistoryIcon from '@material-ui/icons/History';
import PeopleIcon from '@material-ui/icons/People';
import PaymentIcon from '@material-ui/icons/Payment';
import ChatIcon from '@material-ui/icons/Chat';
import CloseIcon from '@material-ui/icons/Close';
import Dashboard from './components/Dashboard';
import BillingPage from './components/BillingPage';
import ParentAssistantChat from './components/ParentAssistantChat';
import CaregiverUpdates from './components/CaregiverUpdates';
import './styles/global.css';

// Create a custom theme with empathy-first design principles
const theme = createTheme({
  palette: {
    primary: {
      main: '#5c6bc0',
      light: '#8e99f3',
      dark: '#26418f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26a69a',
      light: '#64d8cb',
      dark: '#00766c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#37474f',
      secondary: '#78909c',
    },
    success: {
      main: '#66bb6a',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ffa726',
    },
    info: {
      main: '#29b6f6',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.12)',
    // ... rest of shadows
  ],
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12,
      },
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
});

// Styled components using withStyles or makeStyles instead of styled
const AppWrapper = props => (
  <Box display="flex" flexDirection="column" minHeight="100vh" {...props} />
);

const MainContent = props => (
  <Box flexGrow={1} padding={3} marginTop={8} bgcolor={theme.palette.background.default} {...props} />
);

const Logo = props => (
  <Typography variant="h6" component="div" style={{ fontWeight: 700, color: theme.palette.primary.contrastText, display: 'flex', alignItems: 'center' }} {...props}>
    Hatchling<span style={{ color: theme.palette.secondary.light }}>.</span>
  </Typography>
);

const NavDrawer = props => (
  <Drawer
    style={{
      width: 240,
      flexShrink: 0,
    }}
    PaperProps={{
      style: {
        width: 240,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
      }
    }}
    {...props}
  />
);

const NavLink = props => (
  <Link style={{ textDecoration: 'none', color: 'inherit' }} {...props} />
);

const App = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
  };
  
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Caregivers', icon: <PeopleIcon />, path: '/caregivers' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Assistant', icon: <ChatIcon />, path: '/assistant' },
    { text: 'Billing', icon: <PaymentIcon />, path: '/billing' },
  ];
  
  const drawer = (
    <Box width={240}>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Logo>
          Hatchling<span>.</span>
        </Logo>
        {isMobile && (
          <IconButton onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <NavLink to={item.path} key={item.text} onClick={isMobile ? closeDrawer : undefined}>
            <ListItem button>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </NavLink>
        ))}
      </List>
    </Box>
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppWrapper>
          <AppBar position="fixed" color="primary" elevation={0}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
                style={{ marginRight: theme.spacing(2) }}
              >
                <MenuIcon />
              </IconButton>
              <Logo style={{ flexGrow: 1 }}>
                Hatchling<span>.</span>
              </Logo>
              <Button color="inherit" component={Link} to="/assistant">
                Assistant
              </Button>
            </Toolbar>
          </AppBar>
          
          <NavDrawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? drawerOpen : true}
            onClose={closeDrawer}
          >
            {drawer}
          </NavDrawer>
          
          <MainContent style={{ marginLeft: isMobile ? 0 : '240px' }}>
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/caregivers" element={<CaregiverUpdates />} />
                <Route path="/history" element={<CaregiverUpdates />} />
                <Route path="/assistant" element={<ParentAssistantChat />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </MainContent>
        </AppWrapper>
      </Router>
    </ThemeProvider>
  );
};

export default App;
