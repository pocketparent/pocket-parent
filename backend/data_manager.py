import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DataManager:
    """
    Service for handling data storage and retrieval for the Hatchling app.
    Manages routines, caregiver updates, and user data.
    """
    
    def __init__(self, routines_file, caregiver_updates_file, users_file=None):
        """
        Initialize the DataManager with file paths for data storage.
        
        Args:
            routines_file (str): Path to the routines JSON file
            caregiver_updates_file (str): Path to the caregiver updates JSON file
            users_file (str, optional): Path to the users JSON file
        """
        self.routines_file = routines_file
        self.caregiver_updates_file = caregiver_updates_file
        self.users_file = users_file or os.path.join(os.path.dirname(routines_file), 'users.json')
        
        # Ensure data directory exists
        self._ensure_data_directory()
        
        # Ensure all data files exist
        self._ensure_file_exists(self.routines_file, [])
        self._ensure_file_exists(self.caregiver_updates_file, [])
        self._ensure_file_exists(self.users_file, [])
    
    def _ensure_data_directory(self):
        """
        Ensure that the data directory exists, creating it if it doesn't.
        """
        for file_path in [self.routines_file, self.caregiver_updates_file, self.users_file]:
            directory = os.path.dirname(file_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                print(f"Created directory: {directory}")
    
    def _ensure_file_exists(self, file_path, default_content=None):
        """
        Ensure that a data file exists, creating it with default content if it doesn't.
        
        Args:
            file_path (str): Path to the file
            default_content (any, optional): Default content to write if file doesn't exist
        """
        if not os.path.exists(file_path):
            # Ensure directory exists
            directory = os.path.dirname(file_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                print(f"Created directory: {directory}")
            
            # Create file with default content
            with open(file_path, 'w') as f:
                json.dump(default_content or [], f)
            print(f"Created file: {file_path}")
    
    def _read_json_file(self, file_path):
        """
        Read and parse a JSON file.
        
        Args:
            file_path (str): Path to the JSON file
            
        Returns:
            dict or list: The parsed JSON data
        """
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            # Return empty list if file is empty or doesn't exist
            return []
    
    def _write_json_file(self, file_path, data):
        """
        Write data to a JSON file.
        
        Args:
            file_path (str): Path to the JSON file
            data (dict or list): Data to write
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Ensure directory exists
            directory = os.path.dirname(file_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                print(f"Created directory: {directory}")
            
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error writing to {file_path}: {str(e)}")
            return False
    
    def initialize_data_files(self):
        """
        Initialize all data files if they don't exist.
        This method can be called explicitly during app startup.
        """
        # Ensure data directory exists
        self._ensure_data_directory()
        
        # Ensure all data files exist
        self._ensure_file_exists(self.routines_file, [])
        self._ensure_file_exists(self.caregiver_updates_file, [])
        self._ensure_file_exists(self.users_file, [])
        
        print(f"Data files initialized: {self.routines_file}, {self.caregiver_updates_file}, {self.users_file}")
    
    # Routine methods
    def save_routine(self, routine_data):
        """
        Save a routine to the routines file.
        
        Args:
            routine_data (dict): Routine data to save
            
        Returns:
            dict: The saved routine with generated ID
        """
        routines = self._read_json_file(self.routines_file)
        
        # Add timestamp and ID if not present
        if 'created_at' not in routine_data:
            routine_data['created_at'] = datetime.now().isoformat()
        
        if 'id' not in routine_data:
            # Generate a simple ID based on timestamp
            routine_data['id'] = f"routine_{len(routines) + 1}_{int(datetime.now().timestamp())}"
        
        # Add to routines list
        routines.append(routine_data)
        
        # Save to file
        self._write_json_file(self.routines_file, routines)
        
        return routine_data
    
    def get_all_routines(self):
        """
        Get all routines.
        
        Returns:
            list: All routines
        """
        return self._read_json_file(self.routines_file)
    
    def get_routines(self, user_id=None):
        """
        Get routines, optionally filtered by user ID.
        
        Args:
            user_id (str, optional): User ID to filter by
            
        Returns:
            list: Filtered routines or all routines if no user_id provided
        """
        routines = self._read_json_file(self.routines_file)
        if user_id:
            return [r for r in routines if r.get('user_id') == user_id]
        return routines
    
    def get_user_routines(self, user_id):
        """
        Get routines for a specific user.
        
        Args:
            user_id (str): User ID
            
        Returns:
            list: Routines for the specified user
        """
        routines = self._read_json_file(self.routines_file)
        return [r for r in routines if r.get('user_id') == user_id]
    
    def get_baby_routines(self, baby_id):
        """
        Get routines for a specific baby.
        
        Args:
            baby_id (str): Baby ID
            
        Returns:
            list: Routines for the specified baby
        """
        routines = self._read_json_file(self.routines_file)
        return [r for r in routines if r.get('baby_id') == baby_id]
    
    def add_routine(self, routine, user_id=None):
        """
        Add a new routine.
        
        Args:
            routine (dict): Routine data
            user_id (str, optional): User ID to associate with the routine
            
        Returns:
            dict: The saved routine
        """
        if user_id:
            routine['user_id'] = user_id
        
        return self.save_routine(routine)
    
    # Caregiver update methods
    def save_caregiver_update(self, update_data):
        """
        Save a caregiver update to the updates file.
        
        Args:
            update_data (dict): Update data to save
            
        Returns:
            dict: The saved update with generated ID
        """
        updates = self._read_json_file(self.caregiver_updates_file)
        
        # Add timestamp and ID if not present
        if 'timestamp' not in update_data:
            update_data['timestamp'] = datetime.now().isoformat()
        
        if 'id' not in update_data:
            # Generate a simple ID based on timestamp
            update_data['id'] = f"update_{len(updates) + 1}_{int(datetime.now().timestamp())}"
        
        # Add to updates list
        updates.append(update_data)
        
        # Save to file
        self._write_json_file(self.caregiver_updates_file, updates)
        
        return update_data
    
    def get_caregiver_updates(self, user_id=None):
        """
        Get caregiver updates, optionally filtered by user ID.
        
        Args:
            user_id (str, optional): User ID to filter by
            
        Returns:
            list: Filtered updates or all updates if no user_id provided
        """
        updates = self._read_json_file(self.caregiver_updates_file)
        if user_id:
            return [u for u in updates if u.get('user_id') == user_id]
        return updates
    
    def get_user_updates(self, user_id):
        """
        Get updates for a specific user.
        
        Args:
            user_id (str): User ID
            
        Returns:
            list: Updates for the specified user
        """
        updates = self._read_json_file(self.caregiver_updates_file)
        return [u for u in updates if u.get('user_id') == user_id]
    
    def get_baby_updates(self, baby_id):
        """
        Get updates for a specific baby.
        
        Args:
            baby_id (str): Baby ID
            
        Returns:
            list: Updates for the specified baby
        """
        updates = self._read_json_file(self.caregiver_updates_file)
        return [u for u in updates if u.get('baby_id') == baby_id]
    
    def add_caregiver_update(self, update, user_id=None):
        """
        Add a new caregiver update.
        
        Args:
            update (dict): Update data
            user_id (str, optional): User ID to associate with the update
            
        Returns:
            dict: The saved update
        """
        if user_id:
            update['user_id'] = user_id
        
        return self.save_caregiver_update(update)
    
    # User methods
    def save_user(self, user_data):
        """
        Save a user to the users file.
        
        Args:
            user_data (dict): User data to save
            
        Returns:
            dict: The saved user with generated ID
        """
        users = self._read_json_file(self.users_file)
        
        # Check if user already exists
        existing_user = next((u for u in users if u.get('id') == user_data.get('id')), None)
        
        if existing_user:
            # Update existing user
            for key, value in user_data.items():
                existing_user[key] = value
            
            # Save to file
            self._write_json_file(self.users_file, users)
            
            return existing_user
        else:
            # Add timestamp and ID if not present
            if 'created_at' not in user_data:
                user_data['created_at'] = datetime.now().isoformat()
            
            if 'id' not in user_data:
                # Generate a simple ID based on timestamp
                user_data['id'] = f"user_{len(users) + 1}_{int(datetime.now().timestamp())}"
            
            # Set default subscription status if not present
            if 'subscription_status' not in user_data:
                user_data['subscription_status'] = 'trial'
            
            # Add to users list
            users.append(user_data)
            
            # Save to file
            self._write_json_file(self.users_file, users)
            
            return user_data
    
    def get_user(self, user_id):
        """
        Get a user by ID.
        
        Args:
            user_id (str): User ID
            
        Returns:
            dict: User data or None if not found
        """
        users = self._read_json_file(self.users_file)
        return next((u for u in users if u.get('id') == user_id), None)
    
    def get_all_users(self):
        """
        Get all users.
        
        Returns:
            list: All users
        """
        return self._read_json_file(self.users_file)
    
    def update_user_subscription(self, user_id, subscription_status):
        """
        Update a user's subscription status.
        
        Args:
            user_id (str): User ID
            subscription_status (str): New subscription status ('active', 'inactive', 'trial')
            
        Returns:
            dict: Updated user data or None if user not found
        """
        users = self._read_json_file(self.users_file)
        user = next((u for u in users if u.get('id') == user_id), None)
        
        if user:
            user['subscription_status'] = subscription_status
            user['updated_at'] = datetime.now().isoformat()
            
            # Save to file
            self._write_json_file(self.users_file, users)
            
            return user
        
        return None
