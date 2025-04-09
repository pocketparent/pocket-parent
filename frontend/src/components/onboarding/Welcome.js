import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Box,
  Grid,
  TextField,
  ButtonGroup
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
    maxWidth: 500,
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
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    width: '100%',
  },
  childCountButton: {
    padding: theme.spacing(2, 4),
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    '&.selected': {
      backgroundColor: '#e6e0d4',
      color: '#333',
      fontWeight: 'bold',
    },
  },
  continueButton: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 4),
    borderRadius: 8,
    backgroundColor: '#e6d7c3',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d9c8af',
    },
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const Welcome = ({ onContinue }) => {
  const classes = useStyles();
  const [childCount, setChildCount] = useState(null);
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showNameField, setShowNameField] = useState(false);

  const handleChildCountSelect = (count) => {
    setChildCount(count);
    setShowNameField(true);
  };

  const handleContinue = () => {
    if (!childName || !birthDate) return;
    
    const childData = {
      name: childName,
      birthDate: birthDate,
    };
    
    onContinue(childCount, childData);
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
            Welcome!
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Let's get started by setting up your profile
          </Typography>
        </Box>

        <Box width="100%">
          <Typography variant="h6" gutterBottom>
            How many children do you have?
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button 
                fullWidth
                className={`${classes.childCountButton} ${childCount === 1 ? 'selected' : ''}`}
                onClick={() => handleChildCountSelect(1)}
                variant={childCount === 1 ? "contained" : "outlined"}
              >
                1
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                fullWidth
                className={`${classes.childCountButton} ${childCount === 2 ? 'selected' : ''}`}
                onClick={() => handleChildCountSelect(2)}
                variant={childCount === 2 ? "contained" : "outlined"}
              >
                2
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                fullWidth
                className={`${classes.childCountButton} ${childCount === 3 ? 'selected' : ''}`}
                onClick={() => handleChildCountSelect(3)}
                variant={childCount === 3 ? "contained" : "outlined"}
              >
                3+
              </Button>
            </Grid>
          </Grid>

          {showNameField && (
            <>
              <TextField
                className={classes.textField}
                label="Child's name"
                variant="outlined"
                fullWidth
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter your child's name"
              />
              
              <TextField
                className={classes.textField}
                label="Birth month and year"
                variant="outlined"
                fullWidth
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="e.g., January 2023"
                helperText="Format: Month Year"
              />
              
              <Button
                className={classes.continueButton}
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleContinue}
                disabled={!childName || !birthDate}
              >
                Continue
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Welcome;
