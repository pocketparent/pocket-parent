import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Gunicorn configuration - simplified for resource efficiency
bind = "0.0.0.0:" + os.environ.get("PORT", "8000")
workers = 1
worker_class = "gthread"  # Using gthread instead of eventlet for better resource usage
worker_connections = 100  # Limit connections to reduce memory usage
threads = 4  # Use threads for concurrency
timeout = 120
preload_app = False  # Disable preloading to reduce memory usage
loglevel = "info"

# Logging configuration
accesslog = "-"
errorlog = "-"

# Ensure proper handling of SIGTERM
graceful_timeout = 10
keepalive = 5  # Reduce keepalive to free up resources faster

# Memory optimization
max_requests = 1000  # Restart workers after handling this many requests
max_requests_jitter = 50  # Add jitter to prevent all workers from restarting simultaneously
