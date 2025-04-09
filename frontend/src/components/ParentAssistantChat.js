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
  CircularProgress
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import SendIcon from '@material-ui/icons/Send';
import ApiService from '../services/ApiService';

// Styled components using makeStyles approach
const ChatContainer = props => (
  <Paper style={{ 
    padding: 16, 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
  }} {...props} />
);

const MessageList = props => (
  <List style={{ 
    flexGrow: 1, 
    overflow: 'auto', 
    padding: 8, 
    marginBottom: 16, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 12 
  }} {...props} />
);

const MessageItem = ({ isUser, ...props }) => (
  <ListItem style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: isUser ? 'flex-end' : 'flex-start', 
    padding: 8 
  }} {...props} />
);

const MessageBubble = ({ isUser, children, ...props }) => (
  <Box style={{ 
    backgroundColor: isUser ? '#8e99f3' : '#f1f3f4', 
    color: isUser ? '#ffffff' : '#37474f', 
    padding: '8px 16px', 
    borderRadius: 12, 
    maxWidth: '80%', 
    wordBreak: 'break-word' 
  }} {...props}>
    {children}
  </Box>
);

const MessageTime = props => (
  <Typography style={{ 
    fontSize: '0.75rem', 
    color: '#78909c', 
    marginTop: 4 
  }} {...props} />
);

const InputContainer = props => (
  <Box style={{ 
    display: 'flex', 
    padding: 8, 
    backgroundColor: '#ffffff', 
    borderRadius: 12 
  }} {...props} />
);

const DisclaimerText = props => (
  <Typography style={{ 
    fontSize: '0.75rem', 
    color: '#78909c', 
    fontStyle: 'italic', 
    marginBottom: 8 
  }} {...props} />
);

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
      <Box p={2}>
        <Alert severity="info" style={{ marginBottom: 16 }}>
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
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="textSecondary">
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
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessageList>
      
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
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
          rowsMax={3}
          style={{ marginRight: 8 }}
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
