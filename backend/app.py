# Initialize Flask app with proper error handling
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize database with error handling
try:
    from init_db import init_database
    init_database()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Error initializing database: {str(e)}")
    logger.error(traceback.format_exc())
    # Continue execution - we'll create necessary files on first access

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from specified origins
# Updated to include both localhost and production domains by default
try:
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,https://myhatchling.ai,https://www.myhatchling.ai').split(',')
    CORS(app, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS, "supports_credentials": True, "allow_headers": ["Content-Type", "Authorization"]}})
    logger.info(f"CORS configured with allowed origins: {CORS_ALLOWED_ORIGINS}")
except Exception as e:
    logger.error(f"Error configuring CORS: {str(e)}")
    logger.error(traceback.format_exc())
    # Fall back to permissive CORS to ensure functionality
    CORS(app)
    logger.info("Fallback CORS configuration applied")

# Data storage paths with error handling
try:
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
    
    logger.info(f"Data files configured: {ROUTINES_FILE}, {CAREGIVER_UPDATES_FILE}, {USERS_FILE}")
except Exception as e:
    logger.error(f"Error configuring data paths: {str(e)}")
    logger.error(traceback.format_exc())
    # Fall back to default paths in current directory
    DATA_DIR = 'data'
    ROUTINES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 'routines.json')
    CAREGIVER_UPDATES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 'caregiver_updates.json')
    USERS_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 'users.json')
    logger.info(f"Fallback data files configured: {ROUTINES_FILE}, {CAREGIVER_UPDATES_FILE}, {USERS_FILE}")

# Initialize services with error handling
try:
    from data_manager import DataManager
    data_manager = DataManager(ROUTINES_FILE, CAREGIVER_UPDATES_FILE, USERS_FILE)
    logger.info("Data manager initialized successfully")
except Exception as e:
    logger.error(f"Error initializing data manager: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a minimal data manager to allow the app to function
    from data_manager import DataManager
    data_manager = DataManager('routines.json', 'caregiver_updates.json', 'users.json')
    logger.info("Fallback data manager initialized")

try:
    from parser_service import ParserService
    parser_service = ParserService()
    logger.info("Parser service initialized successfully")
except Exception as e:
    logger.error(f"Error initializing parser service: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a minimal parser service
    class MinimalParserService:
        def parse_routine(self, text):
            return {"error": "Parser service unavailable", "parsed_data": {}}
    parser_service = MinimalParserService()
    logger.info("Fallback parser service initialized")

try:
    from sms_service import SMSService
    sms_service = SMSService(data_manager)
    logger.info("SMS service initialized successfully")
except Exception as e:
    logger.error(f"Error initializing SMS service: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a minimal SMS service
    class MinimalSMSService:
        def __init__(self, data_manager):
            self.data_manager = data_manager
        def process_sms(self, message, from_number, user_id='default'):
            return {"error": "SMS service unavailable", "status": "error"}
    sms_service = MinimalSMSService(data_manager)
    logger.info("Fallback SMS service initialized")

try:
    from services.openai_service import OpenAIService
    openai_service = OpenAIService()
    logger.info("OpenAI service initialized successfully")
except Exception as e:
    logger.error(f"Error initializing OpenAI service: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a minimal OpenAI service
    class MinimalOpenAIService:
        def get_response(self, message, user_data, routines):
            return "I'm sorry, the AI assistant is currently unavailable. Please try again later."
        def get_suggestions(self, prompt):
            return ["AI suggestions are currently unavailable. Please try again later."]
    openai_service = MinimalOpenAIService()
    logger.info("Fallback OpenAI service initialized")

# Initialize Socket.IO service with error handling
try:
    from socket_service import SocketService
    socket_service = SocketService(app, data_manager)
    logger.info("Socket.IO service initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Socket.IO service: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a minimal Socket.IO service
    class MinimalSocketService:
        def __init__(self, app, data_manager):
            self.socketio = None
            self.data_manager = data_manager
        def run(self, host='0.0.0.0', port=8000, debug=False):
            app.run(host=host, port=port, debug=debug)
    socket_service = MinimalSocketService(app, data_manager)
    logger.info("Fallback Socket.IO service initialized")

# Root route handler
@app.route('/')
def index():
    try:
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
    except Exception as e:
        logger.error(f"Error in index route: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"status": "error", "message": "An error occurred"}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    try:
        return jsonify({"status": "healthy"})
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"status": "error", "message": "Health check failed"}), 500

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
        logger.error(f"Error in SMS webhook: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Get SMS messages (GET method for frontend)
@app.route('/sms', methods=['GET'])
def get_sms():
    try:
        user_id = request.args.get('user_id', 'default')
        updates = data_manager.get_caregiver_updates(user_id)
        return jsonify(updates)
    except Exception as e:
        logger.error(f"Error getting SMS messages: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Assistant endpoint for Parent Assistant feature
@app.route('/assistant', methods=['POST'])
def assistant():
    try:
        logger.info("Assistant endpoint called")
        data = request.get_json()
        message = data.get('message', '')
        user_id = data.get('user_id', 'default')
        
        logger.info(f"Request data: user_id={user_id}, message length={len(message)}")
        
        # Get user data for context
        user_data = data_manager.get_user(user_id)
        
        # Get routine data for context
        routines = data_manager.get_routines(user_id)
        
        # Get response from OpenAI
        response = openai_service.get_response(message, user_data, routines)
        
        logger.info(f"Generated response length: {len(response)}")
        
        return jsonify({"message": response, "status": "success"})
    except Exception as e:
        logger.error(f"Error in assistant endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Users endpoint - GET
@app.route('/users', methods=['GET'])
def get_user():
    try:
        user_id = request.args.get('user_id', 'default')
        user = data_manager.get_user(user_id)
        return jsonify(user)
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Users endpoint - POST
@app.route('/users', methods=['POST'])
def create_or_update_user():
    try:
        data = request.get_json()
        user_id = data.get('id', 'default')
        user_data = data
        result = data_manager.update_user(user_id, user_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error creating/updating user: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# User login endpoint
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required", "status": "error"}), 400
        
        # Authenticate user
        user = data_manager.authenticate_user(email, password)
        
        if not user:
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Invalid email or password", "status": "error"}), 401
        
        # Don't return the password in the response
        if 'password' in user:
            user = {k: v for k, v in user.items() if k != 'password'}
        
        logger.info(f"Successful login for email: {email}")
        return jsonify({"success": True, "user": user, "status": "success"})
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

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
        logger.error(f"Error updating subscription: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Get all routines - alternate endpoint to match frontend expectations
@app.route('/routines', methods=['GET'])
def get_routines_alt():
    return get_routines()

# Get all caregiver updates
@app.route('/api/routines', methods=['GET'])
def get_routines():
    try:
        user_id = request.args.get('user_id', 'default')
        routines = data_manager.get_routines(user_id)
        return jsonify(routines)
    except Exception as e:
        logger.error(f"Error getting routines: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Get all caregiver updates
@app.route('/api/updates', methods=['GET'])
def get_updates():
    try:
        user_id = request.args.get('user_id', 'default')
        updates = data_manager.get_caregiver_updates(user_id)
        return jsonify(updates)
    except Exception as e:
        logger.error(f"Error getting updates: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Add a new routine
@app.route('/api/routines', methods=['POST'])
def add_routine():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        routine = data.get('routine', {})
        
        if not routine:
            return jsonify({"error": "Routine data is required", "status": "error"}), 400
        
        result = data_manager.add_routine(routine, user_id)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error adding routine: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Add a new caregiver update
@app.route('/api/updates', methods=['POST'])
def add_update():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        update = data.get('update', {})
        
        if not update:
            return jsonify({"error": "Update data is required", "status": "error"}), 400
        
        result = data_manager.add_caregiver_update(update, user_id)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error adding update: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Get AI suggestions for baby routine
@app.route('/api/suggest', methods=['POST'])
def get_suggestions():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({"error": "Prompt is required", "status": "error"}), 400
        
        suggestions = openai_service.get_suggestions(prompt)
        return jsonify({"suggestions": suggestions, "status": "success"})
    except Exception as e:
        logger.error(f"Error getting suggestions: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Add a preflight route to handle OPTIONS requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def preflight_handler(path):
    try:
        response = app.make_default_options_response()
        return response
    except Exception as e:
        logger.error(f"Error in preflight handler: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400

# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.path}")
    return jsonify({"error": "Resource not found", "status": "error"}), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"500 error: {str(error)}")
    return jsonify({"error": "Internal server error", "status": "error"}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({"error": "An unexpected error occurred", "status": "error"}), 500

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    try:
        if os.path.isabs(DATA_DIR):
            os.makedirs(DATA_DIR, exist_ok=True)
        else:
            os.makedirs(os.path.join(os.path.dirname(__file__), DATA_DIR), exist_ok=True)
        
        # Initialize data files if they don't exist
        data_manager.initialize_data_files()
        
        # Run the Flask app with Socket.IO if available, otherwise fall back to standard Flask
        port = int(os.getenv('PORT', 8000))
        if hasattr(socket_service, 'socketio') and socket_service.socketio:
            socket_service.socketio.run(app, host='0.0.0.0', port=port, debug=(os.getenv('DEBUG', 'False').lower() == 'true'))
        else:
            app.run(host='0.0.0.0', port=port, debug=(os.getenv('DEBUG', 'False').lower() == 'true'))
    except Exception as e:
        logger.error(f"Error in main block: {str(e)}")
        logger.error(traceback.format_exc())
