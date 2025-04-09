import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress, 
  Container 
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Alert from '@material-ui/lab/Alert';
import ApiService from '../services/ApiService';

// Styled components using makeStyles approach
const useStyles = makeStyles((theme) => ({
  pageContainer: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
  },
  pricingCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: props => props.featured ? theme.shadows[10] : theme.shadows[2],
    border: props => props.featured ? `2px solid ${theme.palette.primary.main}` : 'none',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  pricingHeader: {
    backgroundColor: props => props.featured ? theme.palette.primary.main : theme.palette.grey[100],
    color: props => props.featured ? theme.palette.primary.contrastText : theme.palette.text.primary,
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  priceTag: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  featureList: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  featureItem: {
    padding: theme.spacing(1, 0),
  },
  subscriptionButton: {
    margin: theme.spacing(2),
    backgroundColor: props => props.featured ? theme.palette.secondary.main : theme.palette.primary.main,
    '&:hover': {
      backgroundColor: props => props.featured ? theme.palette.secondary.dark : theme.palette.primary.dark,
    },
  },
  statusCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
}));

const BillingPage = ({ userId = null }) => {
  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Use default user ID if not provided
  const effectiveUserId = userId || process.env.REACT_APP_DEFAULT_USER_ID || 'test_user_123';

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await ApiService.getUser(effectiveUserId);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        // Create default user if not exists
        try {
          const newUser = await ApiService.createOrUpdateUser({
            id: effectiveUserId,
            subscription_status: 'trial'
          });
          setUser(newUser);
          setError(null);
        } catch (createErr) {
          console.error('Error creating user:', createErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [effectiveUserId]);

  // Handle subscription update
  const handleSubscriptionUpdate = async (status) => {
    try {
      setLoading(true);
      setError(null);
      setUpdateSuccess(false);
      const updatedUser = await ApiService.updateSubscription(effectiveUserId, status);
      setUser(updatedUser);
      setUpdateSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  // Get subscription status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active Premium Subscription';
      case 'trial':
        return 'Free Trial';
      case 'inactive':
        return 'No Active Subscription';
      default:
        return 'Unknown Status';
    }
  };

  // Get subscription status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success.main';
      case 'trial':
        return 'info.main';
      case 'inactive':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <Typography variant="h4" className={classes.sectionTitle} gutterBottom>
        Hatchling Subscription
      </Typography>

      {/* Current Subscription Status */}
      {user && (
        <Paper className={classes.statusCard}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Current Subscription
              </Typography>
              <Typography variant="body1" style={{ marginBottom: 8 }}>
                Status:{' '}
                <Box component="span" style={{ color: getStatusColor(user.subscription_status), fontWeight: 'bold' }}>
                  {getStatusText(user.subscription_status)}
                </Box>
              </Typography>
              {user.subscription_status === 'trial' && (
                <Typography variant="body2" color="textSecondary">
                  Your free trial gives you access to all premium features. Upgrade to continue access when your trial ends.
                </Typography>
              )}
              {user.subscription_status === 'inactive' && (
                <Typography variant="body2" color="textSecondary">
                  Upgrade to Hatchling Premium to access all features including the AI assistant and history view.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4} style={{ textAlign: { xs: 'left', md: 'right' } }}>
              {user.subscription_status !== 'active' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubscriptionUpdate('active')}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Upgrade Now'}
                </Button>
              )}
              {user.subscription_status === 'active' && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleSubscriptionUpdate('inactive')}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Cancel Subscription'}
                </Button>
              )}
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" style={{ marginTop: 16 }}>
              {error}
            </Alert>
          )}
          {updateSuccess && (
            <Alert severity="success" style={{ marginTop: 16 }}>
              Subscription updated successfully!
            </Alert>
          )}
        </Paper>
      )}

      {/* Pricing Plans */}
      <Typography variant="h5" className={classes.sectionTitle} gutterBottom>
        Subscription Plans
      </Typography>
      <Grid container spacing={4}>
        {/* Free Plan */}
        <Grid item xs={12} md={4}>
          <Card className={classes.pricingCard}>
            <Box className={classes.pricingHeader}>
              <Typography variant="h5" gutterBottom>
                Basic
              </Typography>
            </Box>
            <CardContent style={{ flexGrow: 1 }}>
              <Typography variant="h3" className={classes.priceTag}>
                $0 <Typography variant="body1" component="span" color="textSecondary">/month</Typography>
              </Typography>
              <Divider style={{ margin: '16px 0' }} />
              <List className={classes.featureList}>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Basic routine tracking" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="SMS updates for caregivers" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Single baby profile" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={classes.subscriptionButton}
                onClick={() => handleSubscriptionUpdate('inactive')}
                disabled={loading || (user && user.subscription_status === 'inactive')}
              >
                {loading ? <CircularProgress size={24} /> : 'Current Plan'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Premium Plan */}
        <Grid item xs={12} md={4}>
          <Card className={classes.pricingCard} style={{ featured: true }}>
            <Box className={classes.pricingHeader} style={{ featured: true }}>
              <Typography variant="h5" gutterBottom>
                Premium
              </Typography>
            </Box>
            <CardContent style={{ flexGrow: 1 }}>
              <Typography variant="h3" className={classes.priceTag}>
                $9.99 <Typography variant="body1" component="span" color="textSecondary">/month</Typography>
              </Typography>
              <Divider style={{ margin: '16px 0' }} />
              <List className={classes.featureList}>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="All Basic features" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="AI assistant for routine help" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Multiple baby profiles" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited history" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                className={classes.subscriptionButton}
                onClick={() => handleSubscriptionUpdate('active')}
                disabled={loading || (user && user.subscription_status === 'active')}
                style={{ featured: true }}
              >
                {loading ? <CircularProgress size={24} /> : user && user.subscription_status === 'active' ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Family Plan */}
        <Grid item xs={12} md={4}>
          <Card className={classes.pricingCard}>
            <Box className={classes.pricingHeader}>
              <Typography variant="h5" gutterBottom>
                Family
              </Typography>
            </Box>
            <CardContent style={{ flexGrow: 1 }}>
              <Typography variant="h3" className={classes.priceTag}>
                $14.99 <Typography variant="body1" component="span" color="textSecondary">/month</Typography>
              </Typography>
              <Divider style={{ margin: '16px 0' }} />
              <List className={classes.featureList}>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="All Premium features" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Up to 5 caregiver accounts" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Priority support" />
                </ListItem>
                <ListItem className={classes.featureItem}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Custom routine templates" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                className={classes.subscriptionButton}
                disabled={true}
              >
                Coming Soon
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BillingPage;
