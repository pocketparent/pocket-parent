import os
import json
import logging
import bcrypt
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataManager:
    """Data manager for handling user data, routines, and caregiver updates."""
    
    def __init__(self, routines_file, caregiver_updates_file, users_file):
        """Initialize the data manager.
        
        Args:
            routines_file: Path to the routines JSON file
            caregiver_updates_file: Path to the caregiver updates JSON file
            users_file: Path to the users JSON file
        """
        self.routines_file = routines_file
        self.caregiver_updates_file = caregiver_updates_file
        self.users_file = users_file
        self.initialize_data_files()
    
    def initialize_data_files(self):
        """Initialize data files if they don't exist."""
        # Create directories if they don't exist
        for file_path in [self.routines_file, self.caregiver_updates_file, self.users_file]:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Initialize routines file
        if not os.path.exists(self.routines_file) or os.path.getsize(self.routines_file) == 0:
            with open(self.routines_file, 'w') as f:
                json.dump({}, f)
        
        # Initialize caregiver updates file
        if not os.path.exists(self.caregiver_updates_file) or os.path.getsize(self.caregiver_updates_file) == 0:
            with open(self.caregiver_updates_file, 'w') as f:
                json.dump({}, f)
        
        # Initialize users file with admin user
        if not os.path.exists(self.users_file) or os.path.getsize(self.users_file) == 0:
            admin_password = bcrypt.hashpw("Hatchling2025!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin_user = {
                "admin@hatchling.com": {
                    "id": "admin",
                    "email": "admin@hatchling.com",
                    "name": "Admin User",
                    "password": admin_password,
                    "role": "admin",
                    "subscription_status": "admin"
                }
            }
            with open(self.users_file, 'w') as f:
                json.dump(admin_user, f, indent=2)
    
    def get_routines(self, user_id='default'):
        """Get all routines for a user.
        
        Args:
            user_id: User ID to get routines for
            
        Returns:
            List of routines
        """
        try:
            with open(self.routines_file, 'r') as f:
                all_routines = json.load(f)
            
            # Return user's routines or empty list if user has no routines
            return all_routines.get(user_id, [])
        except Exception as e:
            logger.error(f"Error getting routines: {str(e)}")
            return []
    
    def add_routine(self, routine, user_id='default'):
        """Add a new routine for a user.
        
        Args:
            routine: Routine data to add
            user_id: User ID to add routine for
            
        Returns:
            Added routine data
        """
        try:
            with open(self.routines_file, 'r') as f:
                all_routines = json.load(f)
            
            # Initialize user's routines if they don't exist
            if user_id not in all_routines:
                all_routines[user_id] = []
            
            # Add the routine
            all_routines[user_id].append(routine)
            
            with open(self.routines_file, 'w') as f:
                json.dump(all_routines, f, indent=2)
            
            return routine
        except Exception as e:
            logger.error(f"Error adding routine: {str(e)}")
            return {"error": str(e)}
    
    def get_caregiver_updates(self, user_id='default'):
        """Get all caregiver updates for a user.
        
        Args:
            user_id: User ID to get updates for
            
        Returns:
            List of caregiver updates
        """
        try:
            with open(self.caregiver_updates_file, 'r') as f:
                all_updates = json.load(f)
            
            # Return user's updates or empty list if user has no updates
            return all_updates.get(user_id, [])
        except Exception as e:
            logger.error(f"Error getting caregiver updates: {str(e)}")
            return []
    
    def add_caregiver_update(self, update, user_id='default'):
        """Add a new caregiver update for a user.
        
        Args:
            update: Update data to add
            user_id: User ID to add update for
            
        Returns:
            Added update data
        """
        try:
            with open(self.caregiver_updates_file, 'r') as f:
                all_updates = json.load(f)
            
            # Initialize user's updates if they don't exist
            if user_id not in all_updates:
                all_updates[user_id] = []
            
            # Add the update
            all_updates[user_id].append(update)
            
            with open(self.caregiver_updates_file, 'w') as f:
                json.dump(all_updates, f, indent=2)
            
            return update
        except Exception as e:
            logger.error(f"Error adding caregiver update: {str(e)}")
            return {"error": str(e)}
    
    def get_user(self, user_id='default'):
        """Get user data.
        
        Args:
            user_id: User ID or email to get data for
            
        Returns:
            User data
        """
        try:
            with open(self.users_file, 'r') as f:
                all_users = json.load(f)
            
            # Check if user_id is an email
            if '@' in user_id and user_id in all_users:
                return all_users[user_id]
            
            # Otherwise, search by ID
            for email, user_data in all_users.items():
                if user_data.get('id') == user_id:
                    return user_data
            
            return None
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    def update_user(self, user_id, user_data):
        """Update user data.
        
        Args:
            user_id: User ID or email to update
            user_data: New user data
            
        Returns:
            Updated user data
        """
        try:
            with open(self.users_file, 'r') as f:
                all_users = json.load(f)
            
            # If user_id is an email, use it directly
            if '@' in user_id:
                email = user_id
            else:
                # Otherwise, find the email by ID
                email = None
                for e, data in all_users.items():
                    if data.get('id') == user_id:
                        email = e
                        break
            
            # If email not found, use the email from user_data
            if not email and 'email' in user_data:
                email = user_data['email']
            
            # If still no email, return error
            if not email:
                return {"error": "User not found and no email provided"}
            
            # Update or create the user
            all_users[email] = user_data
            
            with open(self.users_file, 'w') as f:
                json.dump(all_users, f, indent=2)
            
            return user_data
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return {"error": str(e)}
    
    def authenticate_user(self, email, password):
        """Authenticate a user.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User data if authentication successful, None otherwise
        """
        try:
            user = self.get_user(email)
            if not user:
                return None
            
            # Check if password is stored as bcrypt hash
            if user.get('password', '').startswith('$2b$'):
                # Verify bcrypt hash
                if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    return user
            else:
                # For backward compatibility, check plain text password
                if user.get('password') == password:
                    return user
            
            return None
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None
    
    def create_user(self, email, password, name, role='user'):
        """Create a new user.
        
        Args:
            email: User email
            password: User password
            name: User name
            role: User role
            
        Returns:
            Created user data
        """
        try:
            # Check if user already exists
            if self.get_user(email):
                return {"error": "User already exists"}
            
            # Hash the password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create user data
            user_id = email.split('@')[0]  # Simple ID from email
            user_data = {
                "id": user_id,
                "email": email,
                "name": name,
                "password": hashed_password,
                "role": role,
                "subscription_status": "trial"
            }
            
            # Update users file
            return self.update_user(email, user_data)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return {"error": str(e)}
