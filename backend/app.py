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

# Initialize services
data_manager = DataManager(ROUTINES_FILE, CAREGIVER_UPDATES_FILE, USERS_FILE)
parser_service = ParserService()
# Fix: SMSService only takes one argument (data_manager)
sms_service = SMSService(data_manager)
openai_service = OpenAIService()

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
            "health": "/health"
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

# Get all routines
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
    os.makedirs(os.path.join(os.path.dirname(__file__), DATA_DIR), exist_ok=True)
    
    # Initialize data files if they don't exist
    data_manager.initialize_data_files()
    
    # Run the Flask app
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=(os.getenv('DEBUG', 'False').lower() == 'true'))
