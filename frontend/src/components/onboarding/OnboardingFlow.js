import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SignUp from './SignUp';
import Welcome from './Welcome';
import RoutineQuestionnaire from './RoutineQuestionnaire';
import SubscriptionPlans from './SubscriptionPlans';
import ApiService from '../../services/ApiService';

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
  stepper: {
    backgroundColor: 'transparent',
    marginBottom: theme.spacing(4),
    width: '100%',
    maxWidth: 800,
  },
  completionContainer: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 600,
    width: '100%',
  },
  completionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: '#333',
  },
  completionMessage: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    color: '#555',
  },
  dashboardButton: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    backgroundColor: '#e6d7c3',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d9c8af',
    },
  },
}));

const OnboardingFlow = ({ onComplete }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [routineData, setRoutineData] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = ['Sign Up', 'Child Info', 'Daily Routine', 'Choose Plan'];

  const handleSignUpComplete = (user) => {
    setUserData(user);
    setActiveStep(1);
  };

  const handleChildInfoComplete = (count, childData) => {
    setChildCount(count);
    
    // Create a new array if it doesn't exist yet
    const newChildrenData = [...childrenData];
    newChildrenData[currentChildIndex] = childData;
    
    setChildrenData(newChildrenData);
    setActiveStep(2);
  };

  const handleRoutineComplete = (routine) => {
    // Add routine data for current child
    const newRoutineData = [...routineData];
    newRoutineData[currentChildIndex] = routine;
    setRoutineData(newRoutineData);
    
    // If we have more children to process
    if (currentChildIndex < childCount - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
      setActiveStep(1); // Go back to child info for next child
    } else {
      setActiveStep(3); // Move to subscription plan
    }
  };

  const handleSubscriptionComplete = async (plan) => {
    setSubscriptionPlan(plan);
    setLoading(true);
    
    try {
      // Update user with children and subscription data
      const updatedUserData = {
        ...userData,
        subscription_status: 'trial',
        subscription_plan: plan.id,
        trial_start_date: new Date().toISOString(),
        children: childrenData.map((child, index) => ({
          name: child.name,
          birth_date: child.birthDate,
          routine: routineData[index]
        }))
      };
      
      // Save to API
      await ApiService.createOrUpdateUser(updatedUserData);
      
      // For each child, create their routine
      for (let i = 0; i < childrenData.length; i++) {
        const routineText = routineData[i].routineDescription;
        await ApiService.createRoutine({
          text: routineText,
          baby_id: i.toString()
        }, userData.id);
      }
      
      setLoading(false);
      setActiveStep(4); // Complete
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setLoading(false);
      // Handle error
    }
  };

  const handleBackToChildInfo = () => {
    setActiveStep(1);
  };

  const handleBackToRoutine = () => {
    setActiveStep(2);
  };

  const handleGoToDashboard = () => {
    onComplete(userData);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <SignUp onSignUpComplete={handleSignUpComplete} />;
      case 1:
        return <Welcome onContinue={handleChildInfoComplete} />;
      case 2:
        return (
          <RoutineQuestionnaire 
            childData={childrenData[currentChildIndex]} 
            onNext={handleRoutineComplete}
            onBack={handleBackToChildInfo}
          />
        );
      case 3:
        return (
          <SubscriptionPlans 
            onSelectPlan={handleSubscriptionComplete}
            onBack={handleBackToRoutine}
          />
        );
      case 4:
        return (
          <Container className={classes.container}>
            <Paper className={classes.completionContainer} elevation={0}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <img 
                  src="/logo.png" 
                  alt="Hatchling Logo" 
                  style={{ width: 100, height: 100, marginBottom: 24 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/100?text=Hatchling';
                  }}
                />
                <Typography variant="h4" className={classes.completionTitle}>
                  Welcome to Hatchling!
                </Typography>
                <Typography variant="body1" className={classes.completionMessage}>
                  Your account has been set up successfully. You're all ready to start tracking your {childCount > 1 ? "children's" : "child's"} routines and get personalized support.
                </Typography>
                <Typography variant="body2" style={{ marginBottom: 16, color: '#666' }}>
                  Your 30-day free trial of the {subscriptionPlan?.title} plan has started.
                </Typography>
                <Button
                  className={classes.dashboardButton}
                  variant="contained"
                  color="primary"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </Paper>
          </Container>
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.container}>
      {activeStep < 4 && (
        <Stepper activeStep={activeStep} className={classes.stepper} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      {renderStepContent()}
    </div>
  );
};

export default OnboardingFlow;
