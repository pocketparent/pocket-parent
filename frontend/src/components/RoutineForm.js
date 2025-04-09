import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import ApiService from '../services/ApiService';

// Styled components using makeStyles approach
const FormContainer = props => (
  <Paper style={{ 
    padding: 24, 
    borderRadius: 12, 
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', 
    marginBottom: 24 
  }} {...props} />
);

const RoutineForm = ({ userId, onRoutineAdded }) => {
  const [routineText, setRoutineText] = useState('');
  const [babyId, setBabyId] = useState('');
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch babies associated with this user
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        // In a real implementation, this would fetch from a /babies endpoint
        // For now, we'll use a placeholder
        const user = await ApiService.getUser(userId);
        if (user && user.babies) {
          setBabies(user.babies);
          if (user.babies.length > 0) {
            setBabyId(user.babies[0].id);
          }
        } else {
          // Create a default baby if none exists
          setBabies([{ id: 'default_baby', name: 'Baby' }]);
          setBabyId('default_baby');
        }
      } catch (err) {
        console.error('Error fetching babies:', err);
        // Set a default baby as fallback
        setBabies([{ id: 'default_baby', name: 'Baby' }]);
        setBabyId('default_baby');
      }
    };

    fetchBabies();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!routineText.trim()) {
      setError('Please enter a routine description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const routineData = {
        text: routineText,
        baby_id: babyId
      };

      const result = await ApiService.createRoutine(routineData, userId);
      
      // Clear form and show success message
      setRoutineText('');
      setSuccess(true);
      
      // Notify parent component
      if (onRoutineAdded) {
        onRoutineAdded(result);
      }
    } catch (err) {
      console.error('Error creating routine:', err);
      setError('Failed to create routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Typography variant="h6" gutterBottom>
        Add Routine Update
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {babies.length > 1 && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="baby-select-label">Baby</InputLabel>
                <Select
                  labelId="baby-select-label"
                  id="baby-select"
                  value={babyId}
                  label="Baby"
                  onChange={(e) => setBabyId(e.target.value)}
                >
                  {babies.map((baby) => (
                    <MenuItem key={baby.id} value={baby.id}>
                      {baby.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Routine Description"
              placeholder="Describe what happened (e.g., 'Baby napped from 2pm to 3:30pm')"
              value={routineText}
              onChange={(e) => setRoutineText(e.target.value)}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !routineText.trim()}
              style={{ marginTop: 8 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Update'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {error && (
        <Alert severity="error" style={{ marginTop: 16 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" style={{ marginTop: 16 }}>
          Routine update added successfully!
        </Alert>
      )}
    </FormContainer>
  );
};

export default RoutineForm;
