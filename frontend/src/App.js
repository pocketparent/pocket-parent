import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dashboard from './components/Dashboard';
import MultiUserDashboardWithErrorHandling from './components/MultiUserDashboardWithErrorHandling';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingFallback } from './utils/fallbackComponents';

// Create a theme instance
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#fafafa',
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
        borderRadius: 8,
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
  const [loading, setLoading] = useState(false); // Changed to false to skip initial loading
  const [mockMode, setMockMode] = useState(true); // Start with mock mode enabled
  
  // Skip initialization delay and loading screen
  useEffect(() => {
    console.log('App initialized with mock data');
    // We're not setting loading to false here anymore since we start with loading=false
  }, []);
  
  // If loading, show loading fallback - but we start with loading=false now
  if (loading) {
    return <LoadingFallback message="Initializing Hatchling..." />;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/">
            <ErrorBoundary>
              <MultiUserDashboardWithErrorHandling initialData={MOCK_DATA} useMockData={mockMode} />
            </ErrorBoundary>
          </Route>
          <Route path="/dashboard">
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </Route>
          <Route path="*">
            <ErrorBoundary>
              <MultiUserDashboardWithErrorHandling initialData={MOCK_DATA} useMockData={mockMode} />
            </ErrorBoundary>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
