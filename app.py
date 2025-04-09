"""
Root application file that imports and runs the Flask app from the backend directory.
This file is needed for Render deployment as specified in render.yaml.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app from the backend directory
from backend.app import app

# This allows the app to be run directly with 'python app.py'
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), debug=False)
