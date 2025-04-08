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
  Alert,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ApiService from '../services/ApiService';

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

const PricingCard = styled(Card)(({ theme, featured }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: featured ? theme.shadows[10] : theme.shadows[2],
  border: featured ? `2px solid ${theme.palette.primary.main}` : 'none',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const PricingHeader = styled(Box)(({ theme, featured }) => ({
  backgroundColor: featured ? theme.palette.primary.main : theme.palette.grey[100],
  color: featured ? theme.palette.primary.contrastText : theme.palette.text.primary,
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const PriceTag = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const FeatureList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

const SubscriptionButton = styled(Button)(({ theme, featured }) => ({
  margin: theme.spacing(2),
  backgroundColor: featured ? theme.palette.secondary.main : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: featured ? theme.palette.secondary.dark : theme.palette.primary.dark,
  },
}));

const StatusCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const BillingPage = ({ userId = null }) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <SectionTitle variant="h4" gutterBottom>
        Hatchling Subscription
      </SectionTitle>
      
      {/* Current Subscription Status */}
      {user && (
        <StatusCard>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Current Subscription
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Status: <Box component="span" sx={{ color: getStatusColor(user.subscription_status), fontWeight: 'bold' }}>
                  {getStatusText(user.subscription_status)}
                </Box>
              </Typography>
              {user.subscription_status === 'trial' && (
                <Typography variant="body2" color="text.secondary">
                  Your free trial gives you access to all premium features. Upgrade to continue access when your trial ends.
                </Typography>
              )}
              {user.subscription_status === 'inactive' && (
                <Typography variant="body2" color="text.secondary">
                  Upgrade to Hatchling Premium to access all features including the AI assistant and history view.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
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
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {updateSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Subscription updated successfully!
            </Alert>
          )}
        </StatusCard>
      )}
      
      {/* Pricing Plans */}
      <SectionTitle variant="h5" gutterBottom>
        Subscription Plans
      </SectionTitle>
      
      <Grid container spacing={4}>
        {/* Free Plan */}
        <Grid item xs={12} md={4}>
          <PricingCard>
            <PricingHeader>
              <Typography variant="h5" gutterBottom>
                Basic
              </Typography>
            </PricingHeader>
            <CardContent sx={{ flexGrow: 1 }}>
              <PriceTag>
                $0
                <Typography variant="body1" component="span" color="text.secondary">
                  /month
                </Typography>
              </PriceTag>
              <Divider sx={{ my: 2 }} />
              <FeatureList>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Basic routine tracking" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="SMS updates for caregivers" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Single baby profile" />
                </FeatureItem>
              </FeatureList>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <SubscriptionButton 
                variant="contained" 
                fullWidth
                onClick={() => handleSubscriptionUpdate('inactive')}
                disabled={loading || (user && user.subscription_status === 'inactive')}
              >
                {user && user.subscription_status === 'inactive' ? 'Current Plan' : 'Select Plan'}
              </SubscriptionButton>
            </CardActions>
          </PricingCard>
        </Grid>
        
        {/* Premium Plan */}
        <Grid item xs={12} md={4}>
          <PricingCard featured={true}>
            <PricingHeader featured={true}>
              <Typography variant="h5" gutterBottom>
                Premium
              </Typography>
            </PricingHeader>
            <CardContent sx={{ flexGrow: 1 }}>
              <PriceTag>
                $9.99
                <Typography variant="body1" component="span" color="text.secondary">
                  /month
                </Typography>
              </PriceTag>
              <Divider sx={{ my: 2 }} />
              <FeatureList>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="All Basic features" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="AI Parenting Assistant" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited history view" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Multiple baby profiles" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Priority support" />
                </FeatureItem>
              </FeatureList>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <SubscriptionButton 
                featured={true}
                variant="contained" 
                fullWidth
                onClick={() => handleSubscriptionUpdate('active')}
                disabled={loading || (user && user.subscription_status === 'active')}
              >
                {user && user.subscription_status === 'active' ? 'Current Plan' : 'Select Plan'}
              </SubscriptionButton>
            </CardActions>
          </PricingCard>
        </Grid>
        
        {/* Family Plan */}
        <Grid item xs={12} md={4}>
          <PricingCard>
            <PricingHeader>
              <Typography variant="h5" gutterBottom>
                Family
              </Typography>
            </PricingHeader>
            <CardContent sx={{ flexGrow: 1 }}>
              <PriceTag>
                $14.99
                <Typography variant="body1" component="span" color="text.secondary">
                  /month
                </Typography>
              </PriceTag>
              <Divider sx={{ my: 2 }} />
              <FeatureList>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="All Premium features" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Up to 5 parent accounts" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited baby profiles" />
                </FeatureItem>
                <FeatureItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Advanced analytics" />
                </FeatureItem>
              </FeatureList>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <SubscriptionButton 
                variant="contained" 
                fullWidth
                disabled={true}
              >
                Coming Soon
              </SubscriptionButton>
            </CardActions>
          </PricingCard>
        </Grid>
      </Grid>
      
      {/* Disclaimer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This is a placeholder billing page. In a production environment, this would connect to Stripe or another payment processor.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default BillingPage;
