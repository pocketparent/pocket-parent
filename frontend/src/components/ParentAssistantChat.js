import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ApiService from '../services/ApiService';

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const MessageList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const MessageItem = styled(ListItem)(({ theme, isUser }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isUser ? 'flex-end' : 'flex-start',
  padding: theme.spacing(1),
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  maxWidth: '80%',
  wordBreak: 'break-word',
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const DisclaimerText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
  marginBottom: theme.spacing(1),
}));

const ParentAssistantChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
  const messagesEndRef = useRef(null);

  // Fetch user data and subscription status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await ApiService.getUser(userId);
        if (userData) {
          setSubscriptionStatus(userData.subscription_status || 'trial');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [userId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Check subscription status
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trial') {
      setError('This feature requires an active subscription. Please upgrade to Hatchling Premium.');
      return;
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setError(null);

    try {
      // Send message to API
      const response = await ApiService.sendAssistantMessage(userId, newMessage);

      // Add assistant response to chat
      const assistantMessage = {
        id: `resp_${Date.now()}`,
        text: response.message,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render subscription required message
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trial') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Upgrade to Hatchling Premium to access the Parent Support Assistant.
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          component="a"
          href="/billing"
        >
          Upgrade Now
        </Button>
      </Box>
    );
  }

  return (
    <ChatContainer>
      <Typography variant="h6" gutterBottom>
        Parent Support Assistant
      </Typography>
      
      <DisclaimerText>
        This is an AI assistant and may not always be accurate. For medical questions or concerns, 
        please consult your pediatrician or a qualified professional.
      </DisclaimerText>
      
      <MessageList>
        {messages.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Ask me anything about your baby's routine or general parenting questions.
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} isUser={message.isUser}>
              <MessageBubble isUser={message.isUser}>
                <Typography variant="body2">{message.text}</Typography>
              </MessageBubble>
              <MessageTime>{formatTime(message.timestamp)}</MessageTime>
            </MessageItem>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessageList>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your question here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          disabled={loading}
          multiline
          maxRows={3}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || loading}
        >
          Send
        </Button>
      </InputContainer>
    </ChatContainer>
  );
};

export default ParentAssistantChat;
