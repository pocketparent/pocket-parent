import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from data_manager import DataManager
from parser_service import ParserService
from sms_service import SMSService
from services.openai_service import OpenAIService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from specified origins
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS}})

# Data storage paths
DATA_DIR = os.getenv('DATA_DIR', 'data')
ROUTINES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                            os.getenv('ROUTINES_FILE', 'routines.json'))
CAREGIVER_UPDATES_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                                     os.getenv('CAREGIVER_UPDATES_FILE', 'caregiver_updates.json'))
USERS_FILE = os.path.join(os.path.dirname(__file__), DATA_DIR, 
                         os.getenv('USERS_FILE', 'users.json'))

# Ensure data directory exists
os.makedirs(os.path.dirname(ROUTINES_FILE), exist_ok=True)

# Initialize services
data_manager = DataManager(ROUTINES_FILE, CAREGIVER_UPDATES_FILE, USERS_FILE)
parser_service = ParserService()
sms_service = SMSService(data_manager)
openai_service = OpenAIService()

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    return jsonify({"status": "healthy", "message": "Hatchling backend is running"}), 200

@app.route('/parse-routine', methods=['POST'])
def parse_routine():
    """
    Parse a freeform description of a baby's routine.
    
    Request body:
    {
        "text": "Description of baby's routine",
        "user_id": "unique_user_identifier"
    }
    """
    # Get request data
    data = request.json
    
    # Validate request
    if not data or 'text' not in data:
        return jsonify({"error": "Missing required field: text"}), 400
    
    if 'user_id' not in data:
        return jsonify({"error": "Missing required field: user_id"}), 400
    
    try:
        # Parse the routine
        routine_data = parser_service.parse_routine(data['text'], data['user_id'])
        
        # Save the parsed routine
        saved_routine = data_manager.save_routine(routine_data)
        
        return jsonify(saved_routine), 201
    
    except Exception as e:
        return jsonify({"error": f"Failed to parse routine: {str(e)}"}), 500

@app.route('/routines', methods=['GET'])
def get_routines():
    """
    Get all routines or routines for a specific user.
    
    Query parameters:
    - user_id: Optional. If provided, returns only routines for that user.
    """
    # Check if user_id is provided
    user_id = request.args.get('user_id')
    
    try:
        if user_id:
            # Get routines for specific user
            routines = data_manager.get_user_routines(user_id)
        else:
            # Get all routines
            routines = data_manager.get_all_routines()
        
        return jsonify(routines), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve routines: {str(e)}"}), 500

@app.route('/sms', methods=['POST'])
def process_sms():
    """
    Process an SMS message from a caregiver.
    
    Request body:
    {
        "message": "SMS message content",
        "from_number": "Phone number that sent the message",
        "user_id": "User ID associated with this caregiver"
    }
    """
    # Get request data
    data = request.json
    
    # Validate request
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    required_fields = ['message', 'from_number', 'user_id']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Process the SMS message
        processed_message = sms_service.process_sms(
            data['message'],
            data['from_number'],
            data['user_id']
        )
        
        return jsonify(processed_message), 201
    
    except Exception as e:
        return jsonify({"error": f"Failed to process SMS: {str(e)}"}), 500

@app.route('/sms', methods=['GET'])
def get_sms_messages():
    """
    Get SMS messages for a specific user.
    
    Query parameters:
    - user_id: Required. The ID of the user to get messages for.
    """
    # Get user_id from query parameters
    user_id = request.args.get('user_id')
    
    # Validate request
    if not user_id:
        return jsonify({"error": "Missing required query parameter: user_id"}), 400
    
    try:
        # Get messages for the user
        messages = sms_service.get_user_messages(user_id)
        
        return jsonify(messages), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve SMS messages: {str(e)}"}), 500

@app.route('/assistant', methods=['POST'])
def ask_assistant():
    """
    Ask a question to the AI assistant.
    
    Request body:
    {
        "message": "Question text",
        "user_id": "User ID"
    }
    """
    # Get request data
    data = request.json
    
    # Validate request
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    required_fields = ['message', 'user_id']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Get user data for subscription check
        user = data_manager.get_user(data['user_id'])
        
        # Create user if not exists
        if not user:
            user = data_manager.save_user({
                'id': data['user_id'],
                'subscription_status': 'trial'
            })
        
        # Check subscription status
        if user.get('subscription_status') not in ['active', 'trial']:
            return jsonify({
                "error": "Subscription required",
                "message": "This feature requires an active Hatchling subscription."
            }), 403
        
        # Get user's routines for context
        routines = data_manager.get_user_routines(data['user_id'])
        latest_routine = routines[-1] if routines else None
        
        # Check if it's a routine-specific question
        is_routine_question = any(word in data['message'].lower() for word in 
                                ['routine', 'schedule', 'nap', 'feed', 'diaper', 'sleep'])
        
        if is_routine_question and latest_routine:
            response = openai_service.get_routine_specific_response(data['message'], latest_routine)
        else:
            response = openai_service.get_response(data['message'], user, latest_routine)
        
        # Save the interaction
        interaction = {
            'user_id': data['user_id'],
            'message': data['message'],
            'response': response,
            'type': 'assistant'
        }
        data_manager.save_caregiver_update(interaction)
        
        return jsonify({"message": response}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to process assistant request: {str(e)}"}), 500

@app.route('/users', methods=['GET'])
def get_user():
    """
    Get user data.
    
    Query parameters:
    - user_id: Required. The ID of the user to get data for.
    """
    # Get user_id from query parameters
    user_id = request.args.get('user_id')
    
    # Validate request
    if not user_id:
        return jsonify({"error": "Missing required query parameter: user_id"}), 400
    
    try:
        # Get user data
        user = data_manager.get_user(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve user data: {str(e)}"}), 500

@app.route('/users', methods=['POST'])
def create_or_update_user():
    """
    Create or update a user.
    
    Request body:
    {
        "id": "User ID",
        "subscription_status": "active|inactive|trial",
        ... other user data
    }
    """
    # Get request data
    data = request.json
    
    # Validate request
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    if 'id' not in data:
        return jsonify({"error": "Missing required field: id"}), 400
    
    try:
        # Save user data
        user = data_manager.save_user(data)
        
        return jsonify(user), 201
    
    except Exception as e:
        return jsonify({"error": f"Failed to save user data: {str(e)}"}), 500

@app.route('/subscription', methods=['POST'])
def update_subscription():
    """
    Update a user's subscription status.
    
    Request body:
    {
        "user_id": "User ID",
        "subscription_status": "active|inactive|trial"
    }
    """
    # Get request data
    data = request.json
    
    # Validate request
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    required_fields = ['user_id', 'subscription_status']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate subscription status
    valid_statuses = ['active', 'inactive', 'trial']
    if data['subscription_status'] not in valid_statuses:
        return jsonify({"error": f"Invalid subscription status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    try:
        # Update subscription status
        user = data_manager.update_user_subscription(data['user_id'], data['subscription_status'])
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to update subscription: {str(e)}"}), 500

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
    app.run(host='0.0.0.0', port=port, debug=debug)
