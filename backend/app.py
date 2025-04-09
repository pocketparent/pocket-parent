import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from data_manager import DataManager
from parser_service import ParserService
from sms_service import SMSService
from services.openai_service import OpenAIService
from socket_service import SocketService
from init_db import init_database

# Load environment variables
load_dotenv()

# Initialize database
init_database()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from specified origins
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS}})

# Data storage paths
DATA_DIR = os.getenv('DATA_DIR', 'data')

# Handle absolute or relative paths for data directory
if os.path.isabs(DATA_DIR):
    # If DATA_DIR is an absolute path, use it directly
    ROUTINES_FILE = os.path.join(DATA_DIR, os.getenv('ROUTINES_FILE', 'routines.json'))
    CAREGIVER_UPDATES_FILE = os.path.join(DATA_DIR, os.getenv('CAREGIVER_UPDATES_FILE', 'caregiver_updates.json'))
    USERS_FILE = os.path.join(DATA_DIR, os.getenv('USERS_FILE', 'users.json'))
else:
    # If DATA_DIR is a relative path, join with the current directory
    ROUTINES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                                os.getenv('ROUTINES_FILE', 'routines.json'))
    CAREGIVER_UPDATES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                                        os.getenv('CAREGIVER_UPDATES_FILE', 'caregiver_updates.json'))
    USERS_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                            os.getenv('USERS_FILE', 'users.json'))

# Initialize services
data_manager = DataManager(ROUTINES_FILE, CAREGIVER_UPDATES_FILE, USERS_FILE)
parser_service = ParserService()
# Fix: SMSService only takes one argument (data_manager)
sms_service = SMSService(data_manager)
openai_service = OpenAIService()
socket_service = SocketService(app, data_manager)

# Root route handler
@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Hatchling API is running",
        "endpoints": {
            "sms": "/sms",
            "routines": "/api/routines",
            "updates": "/api/updates",
            "health": "/health",
            "assistant": "/assistant",
            "users": "/users",
            "parse-routine": "/parse-routine"
        }
    })

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

# SMS webhook endpoint
@app.route('/sms', methods=['POST'])
def sms_webhook():
    try:
        # Handle Twilio webhook
        if 'From' in request.form:
            # This is a Twilio webhook request
            from_number = request.form.get('From', '')
            body = request.form.get('Body', '')
            user_id = request.form.get('user_id', 'default')  # Add default user_id
            
            # Process the SMS message
            response = sms_service.process_sms(body, from_number, user_id)
            return jsonify(response)
        
        # Handle direct API call
        data = request.get_json()
        message = data.get('message', '')
        from_number = data.get('from_number', '')
        user_id = data.get('user_id', 'default')  # Add default if not provided
        
        # Process the message
        result = sms_service.process_sms(message, from_number, user_id)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get SMS messages (GET method for frontend)
@app.route('/sms', methods=['GET'])
def get_sms():
    try:
        user_id = request.args.get('user_id', 'default')
        updates = data_manager.get_caregiver_updates(user_id)
        return jsonify(updates)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Assistant endpoint for Parent Assistant feature
@app.route('/assistant', methods=['POST'])
def assistant():
    try:
        print("Assistant endpoint called")
        data = request.get_json()
        message = data.get('message', '')
        user_id = data.get('user_id', 'default')
        
        print(f"Request data: user_id={user_id}, message={message}")
        
        # Get user data for context
        user_data = data_manager.get_user(user_id)
        
        # Get routine data for context
        routines = data_manager.get_routines(user_id)
        
        # Get response from OpenAI
        response = openai_service.get_response(message, user_data, routines)
        
        print(f"Generated response: {response[:100]}...")  # Log first 100 chars of response
        
        return jsonify({"message": response})
    except Exception as e:
        print(f"Error in assistant endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Users endpoint - GET
@app.route('/users', methods=['GET'])
def get_user():
    try:
        user_id = request.args.get('user_id', 'default')
        user = data_manager.get_user(user_id)
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Users endpoint - POST
@app.route('/users', methods=['POST'])
def create_or_update_user():
    try:
        data = request.get_json()
        
        # Check if this is a sign-up request
        if 'email' in data and 'password' in data and 'name' in data:
            # This is a sign-up request
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            
            # Create the user
            result = data_manager.create_user(email, password, name)
            
            # Check for errors
            if 'error' in result:
                return jsonify({"error": result['error']}), 400
                
            # Return success
            return jsonify({"success": True, "user": result})
        
        # Otherwise, treat as a regular user update
        user_id = data.get('id', 'default')
        user_data = data
        result = data_manager.update_user(user_id, user_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error creating/updating user: {str(e)}")
        return jsonify({"error": str(e)}), 400

# User login endpoint
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Authenticate user
        user = data_manager.authenticate_user(email, password)
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Don't return the password in the response
        if 'password' in user:
            user = {k: v for k, v in user.items() if k != 'password'}
        
        return jsonify({"success": True, "user": user})
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": str(e)}), 400

# Parse routine endpoint
@app.route('/parse-routine', methods=['POST'])
def parse_routine():
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = data.get('user_id', 'default')
        baby_id = data.get('baby_id', 'default')
        
        # Parse the routine text
        parsed_routine = parser_service.parse_routine(text)
        
        # Add the routine to the database
        result = data_manager.add_routine(parsed_routine, user_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Subscription endpoint
@app.route('/subscription', methods=['POST'])
def update_subscription():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        subscription_status = data.get('subscription_status', 'trial')
        
        # Get the user
        user = data_manager.get_user(user_id)
        
        # Update subscription status
        if user:
            user['subscription_status'] = subscription_status
            result = data_manager.update_user(user_id, user)
        else:
            # Create new user with subscription status
            user = {
                'id': user_id,
                'subscription_status': subscription_status
            }
            result = data_manager.update_user(user_id, user)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get all routines - alternate endpoint to match frontend expectations
@app.route('/routines', methods=['GET'])
def get_routines_alt():
    return get_routines()

# Get all caregiver updates
@app.route('/api/routines', methods=['GET'])
def get_routines():
    user_id = request.args.get('user_id', 'default')
    routines = data_manager.get_routines(user_id)
    return jsonify(routines)

# Get all caregiver updates
@app.route('/api/updates', methods=['GET'])
def get_updates():
    user_id = request.args.get('user_id', 'default')
    updates = data_manager.get_caregiver_updates(user_id)
    return jsonify(updates)

# Add a new routine
@app.route('/api/routines', methods=['POST'])
def add_routine():
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    routine = data.get('routine', {})
    
    if not routine:
        return jsonify({"error": "Routine data is required"}), 400
    
    result = data_manager.add_routine(routine, user_id)
    return jsonify(result)

# Add a new caregiver update
@app.route('/api/updates', methods=['POST'])
def add_update():
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    update = data.get('update', {})
    
    if not update:
        return jsonify({"error": "Update data is required"}), 400
    
    result = data_manager.add_caregiver_update(update, user_id)
    return jsonify(result)

# Get AI suggestions for baby routine
@app.route('/api/suggest', methods=['POST'])
def get_suggestions():
    data = request.get_json()
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    suggestions = openai_service.get_suggestions(prompt)
    return jsonify({"suggestions": suggestions})

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    if os.path.isabs(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    else:
        os.makedirs(os.path.join(os.path.dirname(__file__), DATA_DIR), exist_ok=True)
    
    # Initialize data files if they don't exist
    data_manager.initialize_data_files()
    
    # Run the Flask app with Socket.IO
    port = int(os.getenv('PORT', 8000))
    socket_service.run(host='0.0.0.0', port=port, debug=(os.getenv('DEBUG', 'False').lower() == 'true'))
