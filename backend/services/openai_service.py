import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class OpenAIService:
    """
    Service for handling OpenAI GPT interactions for the Hatchling app.
    Provides parent support through AI-powered responses to questions about
    baby routines and general parenting topics.
    """
    
    def __init__(self):
        """Initialize the OpenAI service with API key from environment variables."""
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.client = openai.OpenAI(api_key=self.api_key)
        self.disclaimer = "This is an AI assistant and may not always be accurate. For medical questions or concerns, please consult your pediatrician or a qualified professional."
        
    def get_response(self, query, user_data=None, baby_data=None):
        """
        Get a response from OpenAI GPT for a parenting or routine-related query.
        
        Args:
            query (str): The user's question or request
            user_data (dict, optional): User data for personalized responses
            baby_data (dict, optional): Baby routine data for context-aware responses
            
        Returns:
            str: The AI response with disclaimer
        """
        try:
            # Prepare system message with context
            system_message = self._build_system_message(user_data, baby_data)
            
            # Create the messages array for the API call
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": query}
            ]
            
            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            # Extract the response text
            response_text = response.choices[0].message.content.strip()
            
            # Add the disclaimer
            full_response = f"{self.disclaimer}\n\n{response_text}"
            
            return full_response
            
        except Exception as e:
            # Return a friendly error message
            return f"{self.disclaimer}\n\nI'm sorry, I couldn't process your question at the moment. Please try again later."
    
    def _build_system_message(self, user_data, baby_data):
        """
        Build a system message with context for more relevant responses.
        
        Args:
            user_data (dict, optional): User data for personalized responses
            baby_data (dict, optional): Baby routine data for context-aware responses
            
        Returns:
            str: The system message with context
        """
        system_message = """
        You are a helpful, empathetic parenting assistant for the Hatchling app. 
        Your responses should be:
        1. Concise and friendly
        2. In plain language (not overly clinical or robotic)
        3. Empathetic to the challenges of parenting
        4. Focused on providing practical advice
        
        When answering questions about baby routines, focus on typical patterns and gentle guidance.
        For medical questions, always emphasize the importance of consulting healthcare professionals.
        """
        
        # Add context from baby data if available
        if baby_data:
            routine_context = f"""
            Here is some context about the baby's routine:
            - Name: {baby_data.get('baby_name', 'the baby')}
            """
            
            # Add recent activities if available
            if baby_data.get('routine'):
                routine_context += "\n- Recent activities:\n"
                for activity in baby_data.get('routine')[:5]:  # Last 5 activities
                    activity_type = activity.get('type', '')
                    start_time = activity.get('start_time', '')
                    routine_context += f"  * {activity_type} at {start_time}\n"
            
            system_message += routine_context
        
        return system_message
    
    def get_routine_specific_response(self, query, routine_data):
        """
        Get a response specifically about a baby's routine using the available data.
        
        Args:
            query (str): The user's question about the routine
            routine_data (dict): The baby's routine data
            
        Returns:
            str: The AI response with disclaimer
        """
        try:
            # Extract relevant routine information
            baby_name = routine_data.get('baby_name', 'your baby')
            
            # Create a context-rich prompt
            routine_context = f"The following is data about {baby_name}'s routine:\n"
            
            if routine_data.get('routine'):
                for activity in routine_data.get('routine'):
                    activity_type = activity.get('type', '')
                    start_time = activity.get('start_time', '')
                    actual_time = activity.get('actual_time', '')
                    
                    if actual_time:
                        routine_context += f"- {activity_type} scheduled for {start_time}, actually happened at {actual_time}\n"
                    else:
                        routine_context += f"- {activity_type} scheduled for {start_time}\n"
            
            # Combine the context with the user's query
            full_query = f"{routine_context}\n\nBased on this information, please answer: {query}"
            
            # Get response using the standard method
            return self.get_response(full_query, baby_data=routine_data)
            
        except Exception as e:
            # Return a friendly error message
            return f"{self.disclaimer}\n\nI'm sorry, I couldn't process your question about the routine at the moment. Please try again later."
