import os
import re
from dotenv import load_dotenv
from services.openai_service import OpenAIService

# Load environment variables
load_dotenv()

class ParserService:
    """
    Service for parsing natural language descriptions of baby routines.
    Extracts structured data from freeform text.
    """
    
    def __init__(self):
        """Initialize the parser service."""
        pass
    
    def parse_routine(self, text, user_id):
        """
        Parse a freeform description of a baby's routine.
        
        Args:
            text (str): Freeform description of the routine
            user_id (str): ID of the user submitting the routine
            
        Returns:
            dict: Structured routine data
        """
        # Extract routine events from text
        routine_events = self._extract_events(text)
        
        # Create routine object
        routine = {
            'user_id': user_id,
            'text': text,
            'routine': routine_events,
            'baby_name': self._extract_baby_name(text) or 'Baby'
        }
        
        return routine
    
    def _extract_events(self, text):
        """
        Extract routine events from text.
        
        Args:
            text (str): Freeform description of the routine
            
        Returns:
            list: List of routine events
        """
        events = []
        
        # Extract nap events
        nap_patterns = [
            r'(?:baby|infant)?\s*nap(?:ped)?\s*(?:from|between)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(?:\s*to\s*|\s*-\s*)(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:baby|infant)?\s*nap\s*(?:start(?:ed)?|begin|began)?\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:baby|infant)?\s*nap\s*(?:end(?:ed)?|finish(?:ed)?|stop(?:ped)?)?\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        ]
        
        for pattern in nap_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.groups()) == 2:  # Full nap period
                    events.append({
                        'type': 'nap',
                        'start_time': self._normalize_time(match.group(1)),
                        'end_time': self._normalize_time(match.group(2))
                    })
                elif 'start' in pattern or 'begin' in pattern:  # Nap start
                    events.append({
                        'type': 'nap',
                        'start_time': self._normalize_time(match.group(1))
                    })
                elif 'end' in pattern or 'finish' in pattern or 'stop' in pattern:  # Nap end
                    events.append({
                        'type': 'nap_end',
                        'time': self._normalize_time(match.group(1))
                    })
        
        # Extract feeding events
        feeding_patterns = [
            r'(?:baby|infant)?\s*(?:fed|feeding|feed|ate|eat|bottle|breast(?:fed)?)\s*(?:at|around|from)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:start(?:ed)?|begin|began)?\s*feeding\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        ]
        
        for pattern in feeding_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                events.append({
                    'type': 'feeding',
                    'start_time': self._normalize_time(match.group(1))
                })
        
        # Extract wake/sleep events
        wake_patterns = [
            r'(?:baby|infant)?\s*woke\s*(?:up)?\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:baby|infant)?\s*(?:is|was)?\s*(?:up|awake)\s*(?:at|around|since)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        ]
        
        for pattern in wake_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                events.append({
                    'type': 'wake',
                    'start_time': self._normalize_time(match.group(1))
                })
        
        sleep_patterns = [
            r'(?:baby|infant)?\s*(?:went to sleep|fell asleep|sleeping|asleep|bedtime)\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:baby|infant)?\s*sleep\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        ]
        
        for pattern in sleep_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                events.append({
                    'type': 'sleep',
                    'start_time': self._normalize_time(match.group(1))
                })
        
        # Extract diaper events
        diaper_patterns = [
            r'(?:baby|infant)?\s*(?:diaper|nappy)\s*(?:change(?:d)?)\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'(?:baby|infant)?\s*(?:poop(?:ed)?|pee(?:d)?|wet|soiled|dirty\s*diaper)\s*(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        ]
        
        for pattern in diaper_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                diaper_type = 'wet'
                if 'poop' in text.lower() or 'soiled' in text.lower() or 'dirty' in text.lower():
                    diaper_type = 'dirty'
                elif 'wet' in text.lower() or 'pee' in text.lower():
                    diaper_type = 'wet'
                
                events.append({
                    'type': 'diaper',
                    'start_time': self._normalize_time(match.group(1)),
                    'diaper_type': diaper_type
                })
        
        return events
    
    def _normalize_time(self, time_str):
        """
        Normalize time string to HH:MM format.
        
        Args:
            time_str (str): Time string to normalize
            
        Returns:
            str: Normalized time string
        """
        if not time_str:
            return None
        
        # Remove any whitespace
        time_str = time_str.strip().lower()
        
        # Extract hours, minutes, and am/pm
        hours_match = re.search(r'(\d{1,2})', time_str)
        minutes_match = re.search(r':(\d{2})', time_str)
        am_pm_match = re.search(r'(am|pm)', time_str)
        
        if not hours_match:
            return None
        
        hours = int(hours_match.group(1))
        minutes = int(minutes_match.group(1)) if minutes_match else 0
        am_pm = am_pm_match.group(1) if am_pm_match else None
        
        # Adjust hours based on am/pm
        if am_pm == 'pm' and hours < 12:
            hours += 12
        elif am_pm == 'am' and hours == 12:
            hours = 0
        
        # Format as HH:MM
        return f"{hours:02d}:{minutes:02d}"
    
    def _extract_baby_name(self, text):
        """
        Extract baby name from text.
        
        Args:
            text (str): Text to extract baby name from
            
        Returns:
            str: Baby name or None if not found
        """
        # Common patterns for baby name mentions
        name_patterns = [
            r'(?:baby|infant)?\s*(\w+)(?:\'s)?\s*(?:routine|schedule|nap|feeding|diaper)',
            r'(\w+)(?:\'s)?\s*(?:routine|schedule|nap|feeding|diaper)'
        ]
        
        for pattern in name_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.group(1)
                # Exclude common words that might be matched
                if name.lower() not in ['baby', 'infant', 'the', 'her', 'his', 'their', 'our', 'my']:
                    return name
        
        return None
