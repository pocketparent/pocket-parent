import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dashboard from './components/Dashboard';
import MultiUserDashboardWithErrorHandling from './components/MultiUserDashboardWithErrorHandling';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingFallback } from './utils/fallbackComponents';
import { OnboardingFlow } from './components/onboarding';
import { AdminRoutes } from './components/admin';

// Create a theme instance
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#e6d7c3',
    },
    secondary: {
      main: '#6b9080',
    },
    background: {
      default: '#FAF9F6',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 16,
      },
    },
  },
});

// Sample mock data for immediate display
const MOCK_DATA = {
  babyName: 'Baby',
  activities: [
    { type: 'wake', start_time: '07:30', notes: 'Woke up happy' },
    { type: 'feeding', start_time: '08:00', duration: '20 minutes', feeding_type: 'Bottle', notes: '4oz formula' },
    { type: 'diaper', start_time: '09:15', diaper_type: 'Wet' },
    { type: 'nap', start_time: '10:00', duration: '45 minutes' },
    { type: 'feeding', start_time: '12:00', duration: '25 minutes', feeding_type: 'Bottle', notes: '5oz formula' }
  ]
};

function App() {
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  // Check if user is already logged in and onboarded
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // In a real app, we would check localStorage or cookies for user session
        const storedUser = localStorage.getItem('hatchling_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsOnboarded(true);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    
    checkUserStatus();
  }, []);
  
  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    setIsOnboarded(true);
    // In a real app, we would store user data in localStorage or cookies
    localStorage.setItem('hatchling_user', JSON.stringify(userData));
  };
  
  // If loading, show loading fallback
  if (loading) {
    return <LoadingFallback message="Initializing Hatchling..." />;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/">
            {isOnboarded ? (
              <Redirect to="/dashboard" />
            ) : (
              <ErrorBoundary>
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/dashboard">
            <ErrorBoundary>
              {isOnboarded ? (
                <MultiUserDashboardWithErrorHandling 
                  initialData={MOCK_DATA} 
                  useMockData={mockMode}
                  userData={user}
                />
              ) : (
                <Redirect to="/" />
              )}
            </ErrorBoundary>
          </Route>
          <Route path="/onboarding">
            <ErrorBoundary>
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            </ErrorBoundary>
          </Route>
          <Route path="/admin">
            <AdminRoutes />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
