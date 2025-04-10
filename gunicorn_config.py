import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Gunicorn configuration
bind = "0.0.0.0:" + os.environ.get("PORT", "8000")
workers = 1
worker_class = "eventlet"
timeout = 120
preload_app = True
loglevel = "info"

# Logging configuration
accesslog = "-"
errorlog = "-"

# Ensure proper handling of SIGTERM
graceful_timeout = 10
