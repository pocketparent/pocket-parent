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
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiService from '../services/ApiService';

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(3),
}));

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
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Update'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Routine update added successfully!
        </Alert>
      )}
    </FormContainer>
  );
};

export default RoutineForm;
