import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Paper, 
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import PersonIcon from '@material-ui/icons/Person';
import ApiService from '../../services/ApiService';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: '600px',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: '#e6d7c3',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    backgroundColor: '#6b9080',
    color: '#fff',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
    backgroundColor: '#f8f8f8',
  },
  messageRow: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  messageRowReverse: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: theme.spacing(1.5, 2),
    borderRadius: 16,
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
  userMessage: {
    backgroundColor: '#e6d7c3',
    color: '#333',
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#fff',
    color: '#333',
    borderTopLeftRadius: 4,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  avatar: {
    width: 36,
    height: 36,
    marginRight: theme.spacing(1),
    backgroundColor: '#6b9080',
  },
  userAvatar: {
    width: 36,
    height: 36,
    marginLeft: theme.spacing(1),
    backgroundColor: '#e6d7c3',
    color: '#333',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
  },
  sendButton: {
    color: '#6b9080',
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: '#666',
    fontStyle: 'italic',
    padding: theme.spacing(1, 2),
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #eee',
  },
  timestamp: {
    fontSize: '0.7rem',
    color: '#999',
    marginTop: theme.spacing(0.5),
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    maxWidth: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  loadingText: {
    marginLeft: theme.spacing(1),
    color: '#666',
  },
  suggestionChip: {
    margin: theme.spacing(0.5),
    backgroundColor: '#f0f0f0',
    color: '#333',
    cursor: 'pointer',
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    display: 'inline-block',
    fontSize: '0.85rem',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  suggestionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(1, 2),
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #eee',
  },
}));

// Initial welcome message from the assistant
const WELCOME_MESSAGE = {
  sender: 'assistant',
  text: "Hi there! I'm your Hatchling parenting assistant. I can help with questions about your child's routine, development, or general parenting advice. How can I help you today?",
  timestamp: new Date().toISOString()
};

// Sample suggested questions
const SUGGESTED_QUESTIONS = [
  "Is my baby's nap schedule normal?",
  "What should I do if my baby wakes up early?",
  "How can I establish a bedtime routine?",
  "When should I introduce solid foods?",
  "What are signs of a growth spurt?"
];

const ParentAssistantChat = ({ userId, childData }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Call API to get assistant response
      const response = await ApiService.sendAssistantMessage(userId, userMessage.text);
      
      // Add assistant response to chat
      const assistantMessage = {
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting assistant response:', error);
      
      // Add error message
      const errorMessage = {
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (question) => {
    setInputText(question);
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Paper className={classes.root}>
      <Box className={classes.header}>
        <Avatar className={classes.headerIcon}>
          <ChildCareIcon />
        </Avatar>
        <Typography variant="h6">
          Parenting Assistant
        </Typography>
      </Box>
      
      <Box className={classes.messagesContainer}>
        {messages.map((message, index) => (
          <Box 
            key={index} 
            className={message.sender === 'user' ? classes.messageRowReverse : classes.messageRow}
          >
            {message.sender === 'assistant' && (
              <Avatar className={classes.avatar}>
                <ChildCareIcon />
              </Avatar>
            )}
            
            <Box>
              <Box 
                className={`${classes.messageBubble} ${
                  message.sender === 'user' ? classes.userMessage : classes.assistantMessage
                }`}
              >
                <Typography variant="body2">
                  {message.text}
                </Typography>
              </Box>
              <Typography className={classes.timestamp}>
                {formatTimestamp(message.timestamp)}
              </Typography>
            </Box>
            
            {message.sender === 'user' && (
              <Avatar className={classes.userAvatar}>
                <PersonIcon />
              </Avatar>
            )}
          </Box>
        ))}
        
        {isLoading && (
          <Box className={classes.messageRow}>
            <Avatar className={classes.avatar}>
              <ChildCareIcon />
            </Avatar>
            <Box className={classes.loadingContainer}>
              <CircularProgress size={20} />
              <Typography className={classes.loadingText}>
                Thinking...
              </Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      <Box className={classes.suggestionsContainer}>
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <Box 
            key={index} 
            className={classes.suggestionChip}
            onClick={() => handleSuggestionClick(question)}
          >
            {question}
          </Box>
        ))}
      </Box>
      
      <Box className={classes.inputContainer}>
        <TextField
          className={classes.input}
          variant="outlined"
          placeholder="Type your question here..."
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          multiline
          rowsMax={3}
          size="small"
        />
        <IconButton 
          className={classes.sendButton}
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <SendIcon />
        </IconButton>
      </Box>
      
      <Typography className={classes.disclaimer}>
        This isn't medical advice—please consult your pediatrician for anything urgent or serious.
      </Typography>
    </Paper>
  );
};

export default ParentAssistantChat;
