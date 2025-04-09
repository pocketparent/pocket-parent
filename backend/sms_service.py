import os
import json
import logging
from twilio.rest import Client
from dotenv import load_dotenv
from services.openai_service import OpenAIService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SMSService:
    """
    Service for handling SMS message processing for the Hatchling app.
    Manages sending and receiving SMS messages via Twilio.
    """
    
    def __init__(self, data_manager):
        """
        Initialize the SMS service with Twilio credentials and data manager.
        
        Args:
            data_manager: DataManager instance for data storage and retrieval
        """
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.messaging_service_sid = os.getenv('TWILIO_MESSAGING_SERVICE_SID')
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None
        self.data_manager = data_manager
        self.openai_service = OpenAIService()
    
    def process_sms(self, message, from_number, user_id):
        """
        Process an incoming SMS message.
        
        Args:
            message (str): The message content
            from_number (str): The phone number that sent the message
            user_id (str): The user ID associated with this caregiver
            
        Returns:
            dict: The processed message data
        """
        # Check if user exists and get subscription status
        user = self.data_manager.get_user(user_id)
        if not user:
            # Create a new user with trial subscription if not exists
            user = self.data_manager.update_user(user_id, {
                'id': user_id,
                'phone_number': from_number,
                'subscription_status': 'trial'
            })
        
        # Create update object
        update = {
            'user_id': user_id,
            'from_number': from_number,
            'message': message
        }
        
        # Save the update
        saved_update = self.data_manager.add_caregiver_update(update, user_id)
        
        # Check if this is a question for the AI assistant
        if self._is_ai_question(message):
            # Process as AI question if subscription is active or trial
            if user.get('subscription_status') in ['active', 'trial']:
                # Get user's routines for context
                routines = self.data_manager.get_routines(user_id)
                latest_routine = routines[-1] if routines else None
                
                # Check if it's a routine-specific question
                if self._is_routine_question(message) and latest_routine:
                    response = self.openai_service.get_routine_specific_response(message, latest_routine)
                else:
                    response = self.openai_service.get_response(message, user, latest_routine)
                
                # Send the response back via SMS
                self._send_sms(response, from_number)
                
                # Add AI response to the saved update
                saved_update['ai_response'] = response
                # Update the saved update in the database
                self.data_manager.add_caregiver_update(saved_update, user_id)
            else:
                # Send subscription required message
                subscription_message = "This feature requires an active Hatchling subscription. Please contact the account owner to upgrade."
                self._send_sms(subscription_message, from_number)
                
                # Add subscription message to the saved update
                saved_update['ai_response'] = subscription_message
                # Update the saved update in the database
                self.data_manager.add_caregiver_update(saved_update, user_id)
        else:
            # Process as routine update
            # This will be handled by the parser service in the main app.py
            pass
        
        return saved_update
    
    def get_user_messages(self, user_id):
        """
        Get all SMS messages for a specific user.
        
        Args:
            user_id (str): The user ID to get messages for
            
        Returns:
            list: List of messages for the user
        """
        return self.data_manager.get_caregiver_updates(user_id)
    
    def _send_sms(self, message, to_number):
        """
        Send an SMS message via Twilio.
        
        Args:
            message (str): The message content
            to_number (str): The recipient phone number
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.client:
            logger.warning("Twilio client not initialized. Check your credentials.")
            return False
        
        try:
            # Use messaging service if available, otherwise use phone number
            if self.messaging_service_sid:
                sent_message = self.client.messages.create(
                    messaging_service_sid=self.messaging_service_sid,
                    body=message,
                    to=to_number
                )
            else:
                sent_message = self.client.messages.create(
                    from_=self.phone_number,
                    body=message,
                    to=to_number
                )
            
            return True
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            return False
    
    def _is_ai_question(self, message):
        """
        Determine if a message is a question for the AI assistant.
        
        Args:
            message (str): The message content
            
        Returns:
            bool: True if it's an AI question, False otherwise
        """
        # Check if message contains question words or ends with question mark
        question_indicators = ['what', 'when', 'why', 'how', 'where', 'who', 'can', 'should', 'could', 'would', '?']
        
        message_lower = message.lower()
        
        # Check for question indicators
        if any(indicator in message_lower for indicator in question_indicators):
            return True
        
        # Check for specific parenting question patterns
        parenting_indicators = [
            'normal', 'advice', 'help', 'suggest', 'recommend', 'tips', 
            'baby', 'infant', 'child', 'feeding', 'sleep', 'nap', 'diaper',
            'development', 'milestone', 'growth', 'health', 'sick', 'fever',
            'rash', 'crying', 'fussy', 'colicky', 'teething', 'solid food'
        ]
        
        if any(indicator in message_lower for indicator in parenting_indicators):
            return True
        
        return False
    
    def _is_routine_question(self, message):
        """
        Determine if a message is specifically about the baby's routine.
        
        Args:
            message (str): The message content
            
        Returns:
            bool: True if it's a routine question, False otherwise
        """
        # Check for routine-specific question patterns
        routine_indicators = [
            'last', 'recent', 'today', 'schedule', 'routine', 'next',
            'when did', 'what time', 'how long', 'how many', 
            'nap', 'feed', 'diaper', 'sleep', 'wake', 'ate', 'changed'
        ]
        
        message_lower = message.lower()
        
        return any(indicator in message_lower for indicator in routine_indicators)
