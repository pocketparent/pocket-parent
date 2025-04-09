"""
Root level gunicorn configuration file for Render deployment.
"""

import os

# Bind to the port provided by Render
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Worker configuration
workers = 2
worker_class = "eventlet"
threads = 2
timeout = 120

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Preload the application to avoid import errors
preload_app = True

# Set the Python path to include the backend directory
pythonpath = "."
