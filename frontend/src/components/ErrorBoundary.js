import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button,
  Box
} from '@material-ui/core';
import { 
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@material-ui/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You could also log to a remote logging service here
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <Container maxWidth="md" style={{ marginTop: '2rem' }}>
          <Paper style={{ padding: '2rem', textAlign: 'center' }}>
            <ErrorIcon style={{ fontSize: 60, color: '#f44336', marginBottom: '1rem' }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry, but there was an error loading this page. Our team has been notified.
            </Typography>
            {this.state.error && (
              <Paper 
                style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f5f5f5', 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  marginBottom: '1rem',
                  textAlign: 'left'
                }}
              >
                <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Paper>
            )}
            <Box mt={3}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                style={{ marginRight: '1rem' }}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
