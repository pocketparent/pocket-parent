import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    height: '100vh',
    backgroundColor: '#FAF9F6',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 600,
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
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  textField: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  nextButton: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    backgroundColor: '#e6d7c3',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d9c8af',
    },
  },
  backButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    color: '#666',
  },
  childName: {
    fontWeight: 'bold',
  }
}));

const RoutineQuestionnaire = ({ childData, onNext, onBack }) => {
  const classes = useStyles();
  const [routineDescription, setRoutineDescription] = useState('');
  const [napCount, setNapCount] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleNext = () => {
    if (!routineDescription) return;
    
    const routineData = {
      routineDescription,
      napCount,
      bedtime,
      specialInstructions,
    };
    
    onNext(routineData);
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
            {childData.name}'s routine
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            What does a "perfect day" look like for {childData.name}'s schedule?
          </Typography>
        </Box>

        <Box width="100%">
          <TextField
            className={classes.textField}
            label="Describe an example daily schedule..."
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            value={routineDescription}
            onChange={(e) => setRoutineDescription(e.target.value)}
            placeholder="E.g., Wake up at 7am, breakfast at 7:30am, morning nap at 9:30am..."
          />
          
          <TextField
            className={classes.textField}
            label={`Roughly how many naps does ${childData.name} take per day?`}
            variant="outlined"
            fullWidth
            value={napCount}
            onChange={(e) => setNapCount(e.target.value)}
            placeholder="E.g., 2 naps"
          />
          
          <TextField
            className={classes.textField}
            label="What time does bedtime usually happen?"
            variant="outlined"
            fullWidth
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            placeholder="E.g., 7:30pm"
          />
          
          <TextField
            className={classes.textField}
            label="Any special instructions or preferences?"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="E.g., Needs white noise for naps, prefers to be rocked to sleep..."
          />
          
          <Button
            className={classes.nextButton}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleNext}
            disabled={!routineDescription}
          >
            Next
          </Button>
          
          <Button
            className={classes.backButton}
            variant="text"
            fullWidth
            onClick={onBack}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RoutineQuestionnaire;
