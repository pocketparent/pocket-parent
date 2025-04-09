import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Divider, 
  IconButton, 
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  CircularProgress
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { 
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Alarm as AlarmIcon,
  LocalDining as FeedingIcon,
  Opacity as DiaperIcon,
  Hotel as SleepIcon,
  WbSunny as WakeIcon,
  Toys as PlayIcon,
  Bathtub as BathIcon,
  DirectionsWalk as WalkIcon,
  Book as ReadingIcon,
  LocalHospital as MedicineIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Error as ErrorIcon
} from '@material-ui/icons';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import isToday from 'date-fns/isToday';
import isPast from 'date-fns/isPast';
import isFuture from 'date-fns/isFuture';
import axios from 'axios';
import io from 'socket.io-client';
import ErrorBoundary from './ErrorBoundary';
import { useApiWithRetry, ApiErrorFallback, LoadingFallback, getApiUrl, API_STATES } from '../utils/apiUtils';

// Rest of the component code remains the same
