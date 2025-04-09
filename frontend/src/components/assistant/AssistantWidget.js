import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Box,
  Button,
  Collapse,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ParentAssistantChat from './ParentAssistantChat';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2, 0),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    backgroundColor: '#e6d7c3',
    color: '#333',
    borderRadius: '16px 16px 0 0',
    cursor: 'pointer',
  },
  headerExpanded: {
    borderRadius: '16px 16px 0 0',
  },
  headerCollapsed: {
    borderRadius: '16px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
  },
  icon: {
    marginRight: theme.spacing(1),
    color: '#6b9080',
  },
  content: {
    padding: theme.spacing(0),
    borderRadius: '0 0 16px 16px',
  },
  helpButton: {
    marginLeft: theme.spacing(1),
    color: '#6b9080',
  },
  helpContent: {
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: '0 0 16px 16px',
    marginTop: -1,
    borderTop: '1px solid #eee',
  },
  helpTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  helpItem: {
    marginBottom: theme.spacing(1),
  },
}));

const AssistantWidget = ({ userId, childData, expanded = true }) => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showHelp, setShowHelp] = useState(false);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (showHelp) setShowHelp(false);
  };
  
  const toggleHelp = (e) => {
    e.stopPropagation();
    setShowHelp(!showHelp);
  };
  
  return (
    <Paper className={classes.root} elevation={3}>
      <Box 
        className={`${classes.header} ${isExpanded ? classes.headerExpanded : classes.headerCollapsed}`}
        onClick={toggleExpanded}
      >
        <Typography variant="h6" className={classes.title}>
          <HelpOutlineIcon className={classes.icon} />
          Ask anything
        </Typography>
        <Box>
          <IconButton 
            className={classes.helpButton} 
            size="small"
            onClick={toggleHelp}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>
      
      <Collapse in={showHelp}>
        <Box className={classes.helpContent}>
          <Typography variant="subtitle1" className={classes.helpTitle}>
            How to use the Parenting Assistant
          </Typography>
          <Typography variant="body2" className={classes.helpItem}>
            • Ask questions about your child's routine, development, or general parenting advice
          </Typography>
          <Typography variant="body2" className={classes.helpItem}>
            • Get suggestions for handling common parenting challenges
          </Typography>
          <Typography variant="body2" className={classes.helpItem}>
            • The assistant uses AI to provide helpful responses based on parenting best practices
          </Typography>
          <Typography variant="body2" className={classes.helpItem}>
            • For medical concerns, always consult with your pediatrician
          </Typography>
        </Box>
      </Collapse>
      
      <Collapse in={isExpanded}>
        <Box className={classes.content}>
          <ParentAssistantChat userId={userId} childData={childData} />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AssistantWidget;
