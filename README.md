# Pocket Parent - Baby Routine Tracking System

This repository contains the Pocket Parent application, a comprehensive system for tracking and managing baby routines with real-time updates between caregivers.

## Overview

Pocket Parent helps parents and caregivers stay aligned with a baby's daily routine through:

- Natural language parsing of routine descriptions
- SMS integration for caregiver updates
- Real-time dashboard for monitoring activities
- Multi-user support for families with multiple caregivers

## Project Structure

The project is organized into two main components:

- **Frontend**: React application with a clean, responsive UI
- **Backend**: Flask API with natural language parsing and SMS integration

### Key Features

- **Natural Language Processing**: Understand descriptions like "Baby napped from 2pm to 3:30pm"
- **SMS Integration**: Send and receive updates via text message
- **Real-time Dashboard**: Monitor baby activities with live updates
- **Multi-user Support**: Connect multiple caregivers to the same baby profile
- **Routine Comparison**: Compare planned vs. actual routines
- **Activity Tracking**: Log feedings, naps, diaper changes, and more

## Setup Instructions

### Prerequisites

- Node.js (v14+) and npm for the frontend
- Python 3.8+ for the backend
- Git
- Twilio account (for SMS functionality)

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/pocketparent/pocket-parent.git
   cd pocket-parent
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install flask flask-cors python-dotenv twilio
   ```

5. Create a `.env` file in the backend directory by copying the example:
   ```
   cp .env.example .env
   ```

6. Update the `.env` file with your Twilio credentials:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   PORT=8000
   DEBUG=True
   
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_phone_number_here
   TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid_here
   
   DATA_DIR=data
   ROUTINES_FILE=routines.json
   CAREGIVER_UPDATES_FILE=caregiver_updates.json
   ```

7. Create the data directory:
   ```
   mkdir -p data
   ```

8. Run the backend server:
   ```
   python app.py
   ```
   The server will run on http://localhost:8000

9. Verify the server is running by accessing the health check endpoint:
   ```
   curl http://localhost:8000/health
   ```

### Frontend Setup

1. Navigate to the frontend directory from the project root:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory by copying the example:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file if needed (default values should work with local backend):
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000
   REACT_APP_DEFAULT_USER_ID=test_user_123
   REACT_APP_POLLING_INTERVAL=5000
   ```

5. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Testing SMS Integration

You can test the SMS integration using curl:

```bash
curl -X POST http://localhost:8000/sms \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Baby napped from 2pm to 3:30pm",
    "from_number": "+1234567890",
    "user_id": "test_user_123"
  }'
```

Or using the Twilio console to send a test message to your Twilio phone number.

### Example SMS Commands

- "Baby woke up at 7:30am"
- "Started feeding at 12:15pm"
- "Diaper change at 3pm, wet only"
- "Nap started at 1:30pm"
- "Nap ended at 3pm"
- "What's next in the routine?"
- "When is the next nap scheduled?"

## Twilio Setup

To fully utilize the SMS functionality:

1. Create a Twilio account at https://www.twilio.com
2. Purchase a phone number with SMS capabilities
3. Set up a Messaging Service in the Twilio console
4. Configure your webhook URL to point to your deployed backend `/sms` endpoint
5. Update your `.env` file with the Twilio credentials

## Real-time Connection

The frontend and backend are connected in real-time through a polling mechanism. When caregivers send updates via SMS or the dashboard, all connected clients will see the changes without needing to refresh the page.

The polling interval can be adjusted in the frontend `.env` file by changing the `REACT_APP_POLLING_INTERVAL` value (in milliseconds).

## Development

### Backend Development

The backend is built with Flask and uses:
- `flask-cors` for handling Cross-Origin Resource Sharing
- `python-dotenv` for environment variable management
- `twilio` for SMS integration

Key files:
- `app.py`: Main Flask application with API endpoints
- `data_manager.py`: Handles data storage and retrieval
- `parser_service.py`: Natural language processing for routine descriptions
- `sms_service.py`: SMS message handling and processing

### Frontend Development

The frontend is built with React and uses:
- React Router for navigation
- Material UI for components
- Axios for API requests

Key directories:
- `src/components`: Reusable UI components
- `src/pages`: Page-level components
- `src/services`: API service integrations

## Deployment

### Backend Deployment

1. Choose a hosting provider that supports Python applications (Heroku, AWS, DigitalOcean, etc.)
2. Set up environment variables on your hosting provider
3. Deploy the backend code
4. Update the Twilio webhook URL to point to your deployed backend

### Frontend Deployment

1. Build the frontend for production:
   ```
   npm run build
   ```
2. Deploy the build directory to a static hosting service (Netlify, Vercel, GitHub Pages, etc.)
3. Update the `REACT_APP_API_BASE_URL` in the production environment to point to your deployed backend

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

Backend:
- Set `DEBUG=False`
- Update `CORS_ALLOWED_ORIGINS` to include your frontend domain
- Ensure all Twilio credentials are properly set

Frontend:
- Set `REACT_APP_API_BASE_URL` to your production backend URL

## Troubleshooting

### Common Issues

1. **SMS not working**
   - Verify Twilio credentials in the backend `.env` file
   - Check that your Twilio webhook is correctly configured
   - Ensure your server is publicly accessible

2. **Frontend not connecting to backend**
   - Check that the `REACT_APP_API_BASE_URL` is correct
   - Verify that CORS is properly configured on the backend
   - Check for network errors in the browser console

3. **Backend server not starting**
   - Ensure all dependencies are installed
   - Check for syntax errors in the Python code
   - Verify that the port is not already in use

### Getting Help

If you encounter issues not covered here, please open an issue on the GitHub repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## GitHub Repository

This project is hosted at: https://github.com/pocketparent/pocket-parent
