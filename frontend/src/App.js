import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dashboard from './components/Dashboard';
import MultiUserDashboardWithErrorHandling from './components/MultiUserDashboardWithErrorHandling';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingFallback } from './utils/apiUtils';

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

function App() {
  const [loading, setLoading] = useState(true);
  
  // Simulate app initialization
  useEffect(() => {
    // Check if the API is available
    const checkApiAvailability = async () => {
      try {
        // Add a small delay to ensure the app doesn't flash loading state for fast connections
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setLoading(false);
      }
    };
    
    checkApiAvailability();
  }, []);
  
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
              <MultiUserDashboardWithErrorHandling />
            </ErrorBoundary>
          </Route>
          <Route path="/dashboard">
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </Route>
          <Route path="*">
            <ErrorBoundary>
              <MultiUserDashboardWithErrorHandling />
            </ErrorBoundary>
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
