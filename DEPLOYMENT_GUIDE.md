# Hatchling Deployment Guide

This guide provides comprehensive instructions for deploying and maintaining the Hatchling application on Render.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Deployment Process](#deployment-process)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting Common Issues](#troubleshooting-common-issues)
5. [Maintenance Procedures](#maintenance-procedures)
6. [Testing Procedures](#testing-procedures)

## Environment Setup

### Prerequisites

- GitHub repository: https://github.com/pocketparent/pocket-parent
- Render account with access to create web services
- OpenAI API key for the parent assistant feature
- Twilio account (optional, for SMS features)

### Repository Structure

The Hatchling application consists of two main components:

- **Frontend**: React application in the `/frontend` directory
- **Backend**: Flask API in the `/backend` directory

## Deployment Process

### Initial Deployment

1. Fork or clone the repository from GitHub
2. Set up the services on Render using the `render.yaml` configuration
3. Configure environment variables for both frontend and backend services
4. Deploy the services

### Updating the Deployment

1. Push changes to the GitHub repository
2. Render will automatically detect changes and start a new deployment
3. Monitor the deployment logs for any errors
4. Verify the application functionality after deployment

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_APP` | Flask application entry point | `app.py` |
| `FLASK_ENV` | Flask environment | `production` |
| `DEBUG` | Enable debug mode | `False` |
| `PORT` | Port to run the application | `8000` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for CORS | `https://myhatchling.ai,https://www.myhatchling.ai` |
| `DATA_DIR` | Directory for data storage | `/data` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-your-openai-api-key` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `your-twilio-account-sid` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-twilio-auth-token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `your-twilio-phone-number` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://hatchling-backend.onrender.com` |
| `REACT_APP_API_BASE_URL` | Alternative backend API URL | `https://hatchling-backend.onrender.com` |
| `REACT_APP_SOCKET_URL` | WebSocket URL | `https://hatchling-backend.onrender.com` |
| `REACT_APP_DEFAULT_USER_ID` | Default user ID | `default` |
| `REACT_APP_POLLING_INTERVAL` | Polling interval in milliseconds | `5000` |

## Troubleshooting Common Issues

### Eventlet and dnspython Compatibility

**Issue**: Eventlet has compatibility issues with newer versions of dnspython.

**Solution**: Pin dnspython to version 2.3.0 in requirements.txt:

```
dnspython==2.3.0
```

### OpenAI API Compatibility

**Issue**: OpenAI SDK version 0.27.0 uses a different API pattern than newer versions.

**Solution**: Use the older API syntax in your code:

```python
# Instead of this (newer versions):
self.client = openai.OpenAI(api_key=self.api_key)

# Use this (for version 0.27.0):
openai.api_key = self.api_key
response = openai.ChatCompletion.create(...)
```

### Socket.IO Initialization Errors

**Issue**: Missing Flask request import in socket_service.py.

**Solution**: Add the import at the top of the file:

```python
from flask import request
```

### CORS Issues

**Issue**: Frontend cannot connect to backend due to CORS restrictions.

**Solution**: Ensure the backend CORS configuration includes all necessary origins:

```python
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,https://myhatchling.ai,https://www.myhatchling.ai').split(',')
CORS(app, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS, "supports_credentials": True, "allow_headers": ["Content-Type", "Authorization"]}})
```

### Node.js Build Issues

**Issue**: Frontend build fails due to Node.js compatibility issues.

**Solution**: Use the `--openssl-legacy-provider` flag in the build command:

```
export NODE_OPTIONS=--openssl-legacy-provider
npm ci
npm run build
```

## Maintenance Procedures

### Regular Maintenance Tasks

1. **Update Dependencies**: Regularly update dependencies to ensure security and compatibility
2. **Monitor Logs**: Check Render logs for errors or warnings
3. **Backup Data**: Regularly backup the data directory
4. **Check API Keys**: Ensure API keys are valid and not expired

### Updating the Application

1. Make changes to the codebase locally
2. Test changes thoroughly
3. Commit and push changes to GitHub
4. Monitor the deployment on Render
5. Verify functionality after deployment

### Scaling the Application

1. **Vertical Scaling**: Increase the resources allocated to the services in Render
2. **Horizontal Scaling**: Add more instances of the services in Render

## Testing Procedures

### Pre-Deployment Testing Checklist

- [ ] Backend API endpoints return expected responses
- [ ] Frontend builds successfully
- [ ] Environment variables are correctly configured
- [ ] Database initialization works correctly
- [ ] Authentication system works properly

### Post-Deployment Testing Checklist

- [ ] Frontend loads correctly at https://myhatchling.ai
- [ ] User signup flow works correctly
- [ ] Admin login works at https://myhatchling.ai/admin with credentials:
  - Email: admin@hatchling.com
  - Password: Hatchling2025!
- [ ] Parent assistant chat functionality works
- [ ] Routine tracking features work correctly
- [ ] Real-time updates via WebSockets work

### Automated Testing

Consider implementing automated tests using:

- **Backend**: pytest for API endpoint testing
- **Frontend**: Jest and React Testing Library for component testing
- **End-to-End**: Cypress or Playwright for full application testing

## Conclusion

Following this guide should help ensure successful deployment and maintenance of the Hatchling application on Render. If you encounter any issues not covered in this guide, please refer to the Render documentation or contact support.
