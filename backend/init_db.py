import os
import json
import logging
import bcrypt
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database with default admin user and required directories."""
    # Get data directory from environment or use default
    data_dir = os.getenv('DATA_DIR', 'data')
    
    # Handle absolute or relative paths
    if os.path.isabs(data_dir):
        data_path = Path(data_dir)
    else:
        data_path = Path(os.path.dirname(__file__)) / data_dir
    
    # Create data directory if it doesn't exist
    data_path.mkdir(exist_ok=True, mode=0o755)
    logger.info(f"Ensuring data directory exists at: {data_path}")
    
    # Define file paths
    users_file = data_path / os.getenv('USERS_FILE', 'users.json')
    routines_file = data_path / os.getenv('ROUTINES_FILE', 'routines.json')
    caregiver_updates_file = data_path / os.getenv('CAREGIVER_UPDATES_FILE', 'caregiver_updates.json')
    
    # Initialize users file with admin user if it doesn't exist
    if not users_file.exists() or os.path.getsize(users_file) == 0:
        logger.info(f"Creating users file with admin user at: {users_file}")
        
        # Hash the admin password with bcrypt for security
        admin_password = "Hatchling2025!"
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin_user = {
            "admin@hatchling.com": {
                "id": "admin",
                "email": "admin@hatchling.com",
                "name": "Admin User",
                "password": hashed_password,  # Properly hashed password
                "role": "admin",
                "subscription_status": "admin"
            }
        }
        
        # Ensure the parent directory exists
        users_file.parent.mkdir(exist_ok=True, mode=0o755)
        
        # Write the admin user to the file with proper permissions
        with open(users_file, 'w') as f:
            json.dump(admin_user, f, indent=2)
        
        # Set proper permissions for the users file
        os.chmod(users_file, 0o644)
    
    # Initialize routines file if it doesn't exist
    if not routines_file.exists() or os.path.getsize(routines_file) == 0:
        logger.info(f"Creating empty routines file at: {routines_file}")
        
        # Ensure the parent directory exists
        routines_file.parent.mkdir(exist_ok=True, mode=0o755)
        
        with open(routines_file, 'w') as f:
            json.dump({}, f, indent=2)
        
        # Set proper permissions for the routines file
        os.chmod(routines_file, 0o644)
    
    # Initialize caregiver updates file if it doesn't exist
    if not caregiver_updates_file.exists() or os.path.getsize(caregiver_updates_file) == 0:
        logger.info(f"Creating empty caregiver updates file at: {caregiver_updates_file}")
        
        # Ensure the parent directory exists
        caregiver_updates_file.parent.mkdir(exist_ok=True, mode=0o755)
        
        with open(caregiver_updates_file, 'w') as f:
            json.dump({}, f, indent=2)
        
        # Set proper permissions for the caregiver updates file
        os.chmod(caregiver_updates_file, 0o644)
    
    logger.info("Database initialization complete")

if __name__ == "__main__":
    init_database()
