# Deployment Configuration for Hatchling

This file contains instructions for deploying the Hatchling application in a production environment.

## Backend Deployment

The backend is a Flask application that should be deployed with a production-ready WSGI server like Gunicorn.

### Requirements
- Python 3.10+
- pip packages as listed in requirements.txt
- Environment variables properly configured

### Environment Variables
Copy the `.env.example` file to `.env` and configure the following variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `PORT`: Set to 8000 (default)
- `DEBUG`: Set to False in production
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins

### Deployment Steps
1. Install dependencies: `pip install -r requirements.txt`
2. Install Gunicorn: `pip install gunicorn`
3. Run with Gunicorn: `gunicorn -b 0.0.0.0:8000 app:app`

## Frontend Deployment

The frontend is a React application that can be deployed as a static site.

### Requirements
- Node.js 14+
- npm packages as listed in package.json
- Environment variables properly configured

### Environment Variables
Copy the `.env.example` file to `.env` and configure the following variables:
- `REACT_APP_API_BASE_URL`: URL of your deployed backend API
- `REACT_APP_DEFAULT_USER_ID`: Default user ID for development (remove in production)
- `REACT_APP_POLLING_INTERVAL`: Polling interval in milliseconds (default: 5000)

### Deployment Steps
1. Install dependencies: `npm install`
2. Build for production: `npm run build`
3. Deploy the contents of the `build` directory to your static hosting service

## Docker Deployment (Optional)

For containerized deployment, Docker files are provided.

### Backend Docker
```
docker build -t hatchling-backend -f Dockerfile.backend .
docker run -p 8000:8000 --env-file .env hatchling-backend
```

### Frontend Docker
```
docker build -t hatchling-frontend -f Dockerfile.frontend .
docker run -p 3000:80 hatchling-frontend
```

## Database Considerations

The current implementation uses JSON files for data storage. For production use, consider migrating to a proper database system like PostgreSQL or MongoDB.

## Security Considerations

1. Ensure all API keys and secrets are properly secured
2. Set up proper authentication for API endpoints
3. Configure HTTPS for all traffic
4. Implement rate limiting for API endpoints
5. Regularly backup data
