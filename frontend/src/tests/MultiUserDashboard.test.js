import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiUserDashboard from '../components/MultiUserDashboard';
import axios from 'axios';
import io from 'socket.io-client';

// Mock axios
jest.mock('axios');

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const disconnect = jest.fn();
  
  return jest.fn(() => ({
    emit,
    on,
    disconnect,
    connect: jest.fn(),
  }));
});

describe('MultiUserDashboard Component', () => {
  // Sample data for tests
  const mockRoutines = [
    {
      id: 'routine_1',
      user_id: 'user_1',
      baby_name: 'Mari',
      created_at: '2025-04-09T10:00:00Z',
      routine: [
        {
          type: 'wake',
          start_time: '07:00',
          source_text: 'Baby wakes up at 7am'
        },
        {
          type: 'feeding',
          start_time: '08:00',
          feeding_type: 'bottle',
          source_text: 'Baby has a bottle at 8am'
        },
        {
          type: 'nap',
          start_time: '10:00',
          duration: '120 minutes',
          source_text: 'Baby naps at 10am for 2 hours'
        }
      ]
    }
  ];
  
  const mockCaregiverUpdates = [
    {
      id: 'update_1',
      user_id: 'user_1',
      baby_name: 'Mari',
      timestamp: '2025-04-09T12:30:00Z',
      activity_type: 'diaper',
      time: '12:30',
      caregiver_name: 'Nanny',
      notes: 'Wet diaper changed'
    }
  ];
  
  const mockActivityLogs = [
    {
      id: 'log_1',
      user_id: 'user_1',
      user_name: 'Mom',
      timestamp: '2025-04-09T08:05:00Z',
      action_type: 'add',
      activity_type: 'feeding',
      activity_time: '08:00'
    },
    {
      id: 'log_2',
      user_id: 'user_2',
      user_name: 'Dad',
      timestamp: '2025-04-09T10:05:00Z',
      action_type: 'add',
      activity_type: 'nap',
      activity_time: '10:00'
    }
  ];
  
  const mockUsers = [
    {
      id: 'user_1',
      name: 'Mom',
      email: 'mom@example.com',
      role: 'Parent',
      online: true
    },
    {
      id: 'user_2',
      name: 'Dad',
      email: 'dad@example.com',
      role: 'Parent',
      online: false
    }
  ];
  
  const mockCurrentUser = {
    id: 'user_1',
    name: 'Mom',
    email: 'mom@example.com',
    role: 'Parent'
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup axios mock responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/routines')) {
        return Promise.resolve({ data: mockRoutines });
      } else if (url.includes('/api/caregiver-updates')) {
        return Promise.resolve({ data: mockCaregiverUpdates });
      } else if (url.includes('/api/activity-logs')) {
        return Promise.resolve({ data: mockActivityLogs });
      } else if (url.includes('/api/users/current')) {
        return Promise.resolve({ data: mockCurrentUser });
      } else if (url.includes('/api/users')) {
        return Promise.resolve({ data: mockUsers });
      }
      return Promise.resolve({ data: [] });
    });
    
    // Setup socket.io mock
    const mockSocket = io();
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        callback();
      }
    });
  });
  
  test('renders dashboard with baby name', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mari's Dashboard/i)).toBeInTheDocument();
    });
  });
  
  test('displays current activity when available', async () => {
    // Mock current time to match an activity in progress
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
    jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(30);
    
    render(<MultiUserDashboard />);
    
    // Wait for data to load and check for current activity
    await waitFor(() => {
      expect(screen.getByText(/Mari is napping/i)).toBeInTheDocument();
    });
  });
  
  test('displays activity timeline with all activities', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      // Check for wake activity
      expect(screen.getByText(/Wake/i)).toBeInTheDocument();
      expect(screen.getByText(/7:00 am/i)).toBeInTheDocument();
      
      // Check for feeding activity
      expect(screen.getByText(/Feeding/i)).toBeInTheDocument();
      expect(screen.getByText(/8:00 am/i)).toBeInTheDocument();
      
      // Check for nap activity
      expect(screen.getByText(/Nap/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 am/i)).toBeInTheDocument();
      
      // Check for caregiver update
      expect(screen.getByText(/Diaper/i)).toBeInTheDocument();
      expect(screen.getByText(/Nanny/i)).toBeInTheDocument();
    });
  });
  
  test('displays activity logs with user attribution', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      // Check for activity log entries
      expect(screen.getByText(/Mom/i)).toBeInTheDocument();
      expect(screen.getByText(/Dad/i)).toBeInTheDocument();
      expect(screen.getByText(/Added feeding/i, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/Added nap/i, { exact: false })).toBeInTheDocument();
    });
  });
  
  test('displays caregivers section with user information', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      // Check for caregivers section
      expect(screen.getByText(/Caregivers/i)).toBeInTheDocument();
      
      // Check for user information
      expect(screen.getByText(/Mom/i)).toBeInTheDocument();
      expect(screen.getByText(/mom@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Dad/i)).toBeInTheDocument();
      expect(screen.getByText(/dad@example.com/i)).toBeInTheDocument();
    });
  });
  
  test('handles date navigation correctly', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mari's Dashboard/i)).toBeInTheDocument();
    });
    
    // Click previous day button
    fireEvent.click(screen.getByLabelText(/previous day/i) || screen.getByTestId('ArrowBackIcon').closest('button'));
    
    // Verify axios was called with the new date
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/routines?date='));
    
    // Click next day button
    fireEvent.click(screen.getByLabelText(/next day/i) || screen.getByTestId('ArrowForwardIcon').closest('button'));
    
    // Verify axios was called again
    expect(axios.get).toHaveBeenCalledTimes(6); // Initial 3 calls + 3 more for date change
  });
  
  test('opens share dialog when share button is clicked', async () => {
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mari's Dashboard/i)).toBeInTheDocument();
    });
    
    // Click share button
    fireEvent.click(screen.getByLabelText(/share/i) || screen.getByTestId('ShareIcon').closest('button'));
    
    // Verify dialog is shown
    expect(screen.getByText(/Share with Caregivers/i)).toBeInTheDocument();
    expect(screen.getByText(/Invite another caregiver/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });
  
  test('handles caregiver invitation', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(<MultiUserDashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mari's Dashboard/i)).toBeInTheDocument();
    });
    
    // Click share button
    fireEvent.click(screen.getByLabelText(/share/i) || screen.getByTestId('ShareIcon').closest('button'));
    
    // Enter email
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'grandma@example.com' }
    });
    
    // Click send invitation button
    fireEvent.click(screen.getByText(/Send Invitation/i));
    
    // Verify axios post was called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users/invite', {
        email: 'grandma@example.com'
      });
    });
  });
  
  test('shows real-time indicator when connected', async () => {
    // Mock socket connection
    const mockSocket = io();
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        callback();
      }
    });
    
    render(<MultiUserDashboard />);
    
    // Wait for data to load and socket to connect
    await waitFor(() => {
      expect(screen.getByText(/Real-time updates active/i)).toBeInTheDocument();
    });
  });
  
  test('handles real-time updates from socket', async () => {
    // Mock socket connection and events
    const mockSocket = io();
    let connectCallback;
    let routineUpdateCallback;
    
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        connectCallback = callback;
      } else if (event === 'routine_update') {
        routineUpdateCallback = callback;
      }
    });
    
    render(<MultiUserDashboard />);
    
    // Simulate socket connection
    if (connectCallback) connectCallback();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mari's Dashboard/i)).toBeInTheDocument();
    });
    
    // Reset axios mock to verify it's called again after update
    axios.get.mockClear();
    
    // Simulate receiving a routine update
    if (routineUpdateCallback) {
      routineUpdateCallback({
        user_name: 'Dad',
        date: new Date().toISOString()
      });
    }
    
    // Verify data is fetched again
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
