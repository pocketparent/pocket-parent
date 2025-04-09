# Hatchling Application Deployment Guide

## Overview
This document provides instructions for deploying and using the Hatchling parenting application. The application consists of a React frontend and a Flask backend, both configured for deployment on Render.

## Deployment Instructions

### Prerequisites
- A Render account
- Access to the GitHub repository at https://github.com/pocketparent/pocket-parent

### Deployment Steps
1. **Connect your Render account to the GitHub repository**
   - In the Render dashboard, click "New" and select "Blueprint"
   - Connect to the GitHub repository
   - Select the repository and branch (main)

2. **Configure environment variables**
   - The render.yaml file already contains most required environment variables
   - You'll need to manually set the OPENAI_API_KEY in the Render dashboard after deployment

3. **Deploy the application**
   - Render will automatically detect the render.yaml file and create the services
   - The deployment process will take a few minutes
   - Once complete, you'll have two services:
     - hatchling-backend: The Flask API
     - hatchling-frontend: The React application

## Using the Application

### Admin Access
- **URL**: https://hatchling-frontend.onrender.com/admin
- **Credentials**:
  - Email: admin@hatchling.com
  - Password: Hatchling2025!

### User Sign-up
- Navigate to https://hatchling-frontend.onrender.com
- Click "Get Started" or "Sign Up"
- Fill in the required information
- Complete the onboarding process

### Features
- **User Onboarding**: Step-by-step process for new users
- **Admin Dashboard**: Manage users and view analytics
- **GPT-Powered Assistant**: AI parenting advice
- **Multi-User System**: Collaborate with caregivers
- **Real-time Updates**: Instant notifications for all users

## Troubleshooting

### Common Issues
- **Database Initialization**: The application automatically initializes the database on first startup
- **Admin Access**: If you can't access the admin dashboard, check the backend logs to ensure the database was properly initialized
- **Sign-up Errors**: If users can't sign up, verify that the backend is running and the frontend is correctly configured to connect to it

### Checking Logs
- In the Render dashboard, navigate to the service
- Click on "Logs" to view the application logs
- Look for any error messages that might indicate issues

## Technical Details

### Backend
- Flask application with RESTful API endpoints
- Socket.IO for real-time communication
- OpenAI integration for the parenting assistant
- Data stored in JSON files on a mounted disk

### Frontend
- React application with responsive design
- Real-time updates using Socket.IO
- User authentication and session management
- Role-based access control

## Security Considerations
- User passwords are hashed using bcrypt
- Admin credentials should be changed after first login
- OpenAI API key is stored securely in Render environment variables
