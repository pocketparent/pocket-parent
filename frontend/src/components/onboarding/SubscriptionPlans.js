import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    minHeight: '100vh',
    backgroundColor: '#FAF9F6',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 900,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    color: '#333',
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    color: '#555',
  },
  planCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 12,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
  },
  planCardHighlighted: {
    border: '2px solid #d9c8af',
    backgroundColor: '#faf7f2',
  },
  planTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  planPrice: {
    fontWeight: 700,
    fontSize: '1.8rem',
    marginBottom: theme.spacing(2),
    color: '#333',
  },
  planDescription: {
    marginBottom: theme.spacing(2),
    color: '#555',
  },
  planFeatures: {
    padding: 0,
  },
  planFeatureItem: {
    padding: theme.spacing(0.5, 0),
  },
  planFeatureIcon: {
    minWidth: 32,
    color: '#6b9080',
  },
  cardActions: {
    padding: theme.spacing(2),
    marginTop: 'auto',
  },
  selectButton: {
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    backgroundColor: '#e6d7c3',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d9c8af',
    },
    width: '100%',
  },
  backButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    color: '#666',
  },
  trialNote: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  form: {
    width: '100%',
  }
}));

const SubscriptionPlans = ({ onSelectPlan, onBack }) => {
  const classes = useStyles();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'basic',
      title: 'Basic',
      price: '$5.99/month',
      description: 'Perfect for single parents',
      features: [
        'Full routine tracking',
        'AI parenting assistant',
        'SMS logging',
        'Real-time dashboard',
        'Parents only access'
      ]
    },
    {
      id: 'standard',
      title: 'Standard',
      price: '$9.99/month',
      description: 'Great for parents with a caregiver',
      features: [
        'Everything in Basic',
        'Add 1 caregiver',
        'Caregiver SMS access',
        'Real-time sync between users',
        'Shared routine updates'
      ]
    },
    {
      id: 'premium',
      title: 'Premium',
      price: '$15.99/month',
      description: 'Ideal for families with multiple caregivers',
      features: [
        'Everything in Standard',
        'Unlimited caregivers',
        'Priority support',
        'Advanced routine analytics',
        'Multi-child support'
      ]
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = (e) => {
    // Prevent default form submission behavior
    if (e) e.preventDefault();
    
    if (!selectedPlan) return;
    
    const plan = plans.find(p => p.id === selectedPlan);
    onSelectPlan(plan);
  };

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <img 
            src="/logo.png" 
            alt="Hatchling Logo" 
            className={classes.logo} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/80?text=Hatchling';
            }}
          />
          <Typography variant="h4" className={classes.title}>
            Choose plan
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Select a subscription plan that works for your family
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                className={`${classes.planCard} ${selectedPlan === plan.id ? classes.planCardHighlighted : ''}`}
                elevation={selectedPlan === plan.id ? 4 : 1}
                onClick={() => handleSelectPlan(plan.id)}
                style={{ cursor: 'pointer' }}
              >
                <CardContent>
                  <Typography variant="h5" className={classes.planTitle}>
                    {plan.title}
                  </Typography>
                  <Typography variant="h4" className={classes.planPrice}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" className={classes.planDescription}>
                    {plan.description}
                  </Typography>
                  <Divider />
                  <List className={classes.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} className={classes.planFeatureItem}>
                        <ListItemIcon className={classes.planFeatureIcon}>
                          <CheckIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions className={classes.cardActions}>
                  <Button 
                    className={classes.selectButton}
                    variant={selectedPlan === plan.id ? "contained" : "outlined"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="body2" className={classes.trialNote}>
          All plans include a 30-day free trial. No credit card required to start.
        </Typography>

        <form onSubmit={handleContinue} className={classes.form}>
          <Box width="100%" mt={4} display="flex" flexDirection="column" alignItems="center">
            <Button
              className={classes.selectButton}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!selectedPlan}
              style={{ maxWidth: 300 }}
            >
              Continue with {selectedPlan ? plans.find(p => p.id === selectedPlan).title : 'selected plan'}
            </Button>
            
            <Button
              className={classes.backButton}
              variant="text"
              onClick={onBack}
              type="button"
            >
              Back
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SubscriptionPlans;
