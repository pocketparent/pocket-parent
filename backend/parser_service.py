import os
import re
import datetime
from dateutil import parser as date_parser
from dotenv import load_dotenv
from services.openai_service import OpenAIService

# Load environment variables
load_dotenv()

class ParserService:
    """
    Service for parsing natural language descriptions of baby routines.
    Extracts structured data from freeform text with enhanced capabilities
    for relative time expressions, complex routines, and fault tolerance.
    """
    
    def __init__(self):
        """Initialize the parser service."""
        # Common time expressions for relative time parsing
        self.time_expressions = {
            'morning': '08:00',
            'early morning': '06:00',
            'late morning': '10:00',
            'noon': '12:00',
            'afternoon': '14:00',
            'early afternoon': '13:00',
            'late afternoon': '16:00',
            'evening': '18:00',
            'early evening': '17:00',
            'late evening': '20:00',
            'night': '20:00',
            'midnight': '00:00',
            'bedtime': '19:30',
        }
        
        # Activity types and their synonyms
        self.activity_types = {
            'nap': ['nap', 'sleep', 'snooze', 'rest', 'doze'],
            'feeding': ['feed', 'eat', 'bottle', 'nurse', 'breastfeed', 'formula', 'solids', 'snack', 'meal'],
            'wake': ['wake', 'awake', 'up', 'woke', 'gets up', 'wakes up'],
            'sleep': ['sleep', 'bedtime', 'down', 'asleep', 'bed', 'crib'],
            'diaper': ['diaper', 'change', 'poop', 'pee', 'wet', 'soiled', 'dirty', 'bathroom', 'potty'],
            'play': ['play', 'playtime', 'activity', 'tummy time', 'floor time', 'toys'],
            'bath': ['bath', 'bathe', 'bathing', 'wash', 'clean'],
            'walk': ['walk', 'stroller', 'outside', 'outdoors', 'fresh air'],
            'reading': ['read', 'book', 'story', 'stories'],
        }
        
        # Initialize OpenAI service for complex parsing assistance
        try:
            self.openai_service = OpenAIService()
            self.use_ai_assist = True
        except Exception as e:
            print(f"Warning: OpenAI service not available: {str(e)}")
            self.use_ai_assist = False
    
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
        
        # Try to extract baby name
        baby_name = self._extract_baby_name(text) or 'Baby'
        
        # Create routine object
        routine = {
            'user_id': user_id,
            'text': text,
            'routine': routine_events,
            'baby_name': baby_name,
            'parsed_at': datetime.datetime.now().isoformat(),
            'confidence_score': self._calculate_confidence_score(text, routine_events)
        }
        
        # Use AI to enhance parsing if available and needed
        if self.use_ai_assist and (len(routine_events) < 3 or self._calculate_confidence_score(text, routine_events) < 0.7):
            try:
                ai_enhanced_events = self._ai_enhanced_parsing(text, baby_name)
                if ai_enhanced_events and len(ai_enhanced_events) > len(routine_events):
                    routine['routine'] = ai_enhanced_events
                    routine['ai_enhanced'] = True
            except Exception as e:
                print(f"AI enhancement failed: {str(e)}")
        
        return routine
    
    def _extract_events(self, text):
        """
        Extract routine events from text with enhanced pattern recognition.
        
        Args:
            text (str): Freeform description of the routine
            
        Returns:
            list: List of routine events
        """
        events = []
        
        # Normalize text for better pattern matching
        normalized_text = self._normalize_text(text)
        
        # Extract events with absolute times
        events.extend(self._extract_absolute_time_events(normalized_text))
        
        # Extract events with relative times
        events.extend(self._extract_relative_time_events(normalized_text))
        
        # Extract duration-based events
        events.extend(self._extract_duration_events(normalized_text))
        
        # Extract location information for events
        events = self._enhance_events_with_location(events, normalized_text)
        
        # Sort events by start_time if available
        events = sorted(events, key=lambda e: e.get('start_time', '00:00'))
        
        return events
    
    def _normalize_text(self, text):
        """
        Normalize text for better pattern matching.
        
        Args:
            text (str): Text to normalize
            
        Returns:
            str: Normalized text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Replace common abbreviations
        abbreviations = {
            'hrs': 'hours',
            'hr': 'hour',
            'mins': 'minutes',
            'min': 'minute',
            'am.': 'am',
            'pm.': 'pm',
            'a.m.': 'am',
            'p.m.': 'pm',
            'approx.': 'approximately',
            'approx': 'approximately',
            'w/': 'with',
            'w/o': 'without',
            'b/w': 'between',
            'b/f': 'before',
            'a/f': 'after',
        }
        
        for abbr, full in abbreviations.items():
            text = text.replace(abbr, full)
        
        # Standardize time formats
        # Replace "7:00 in the morning" with "7:00 am"
        text = re.sub(r'(\d{1,2}(?::\d{2})?) in the morning', r'\1 am', text)
        text = re.sub(r'(\d{1,2}(?::\d{2})?) in the evening', r'\1 pm', text)
        text = re.sub(r'(\d{1,2}(?::\d{2})?) at night', r'\1 pm', text)
        
        # Replace "7 o'clock" with "7:00"
        text = re.sub(r'(\d{1,2}) o\'clock', r'\1:00', text)
        
        # Replace "half past 7" with "7:30"
        text = re.sub(r'half past (\d{1,2})', lambda m: f"{int(m.group(1))}:30", text)
        
        # Replace "quarter past 7" with "7:15"
        text = re.sub(r'quarter past (\d{1,2})', lambda m: f"{int(m.group(1))}:15", text)
        
        # Replace "quarter to 8" with "7:45"
        text = re.sub(r'quarter to (\d{1,2})', lambda m: f"{int(m.group(1))-1}:45", text)
        
        return text
    
    def _extract_absolute_time_events(self, text):
        """
        Extract events with absolute times from text.
        
        Args:
            text (str): Normalized text to extract events from
            
        Returns:
            list: List of events with absolute times
        """
        events = []
        
        # Enhanced patterns for various activity types
        for activity_type, synonyms in self.activity_types.items():
            # Create pattern with all synonyms for this activity type
            activity_pattern = '|'.join(synonyms)
            
            # Pattern for "activity at/around time"
            pattern = fr'(?:baby|infant)?\s*(?:{activity_pattern})\s*(?:at|around|about|approximately|near|by)?\s*(\d{{1,2}}(?::\d{{2}})?(?:\s*(?:am|pm))?)'
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                time_str = match.group(1)
                normalized_time = self._normalize_time(time_str)
                
                if normalized_time:
                    event = {
                        'type': activity_type,
                        'start_time': normalized_time,
                        'source_text': match.group(0)
                    }
                    
                    # Add additional details based on activity type
                    if activity_type == 'feeding':
                        event['feeding_type'] = self._determine_feeding_type(match.group(0))
                    elif activity_type == 'diaper':
                        event['diaper_type'] = self._determine_diaper_type(match.group(0))
                    elif activity_type == 'nap' or activity_type == 'sleep':
                        # Try to find duration
                        duration = self._extract_duration_near_match(text, match.start(), match.end())
                        if duration:
                            event['duration'] = duration
                    
                    events.append(event)
        
        # Extract time ranges (e.g., "nap from 1pm to 3pm")
        time_range_pattern = r'(?:baby|infant)?\s*(?:nap|sleep|feed|eat|play)\s*(?:from|between)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|until|till|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)'
        matches = re.finditer(time_range_pattern, text, re.IGNORECASE)
        
        for match in matches:
            start_time = self._normalize_time(match.group(1))
            end_time = self._normalize_time(match.group(2))
            
            if start_time and end_time:
                # Determine activity type
                activity_type = 'nap'  # Default
                for act_type, synonyms in self.activity_types.items():
                    if any(syn in match.group(0).lower() for syn in synonyms):
                        activity_type = act_type
                        break
                
                event = {
                    'type': activity_type,
                    'start_time': start_time,
                    'end_time': end_time,
                    'source_text': match.group(0)
                }
                
                # Calculate duration
                start_dt = datetime.datetime.strptime(start_time, '%H:%M')
                end_dt = datetime.datetime.strptime(end_time, '%H:%M')
                
                # Handle cases where end time is on the next day
                if end_dt < start_dt:
                    end_dt += datetime.timedelta(days=1)
                
                duration_minutes = (end_dt - start_dt).total_seconds() / 60
                event['duration'] = f"{int(duration_minutes)} minutes"
                
                events.append(event)
        
        return events
    
    def _extract_relative_time_events(self, text):
        """
        Extract events with relative time expressions.
        
        Args:
            text (str): Normalized text to extract events from
            
        Returns:
            list: List of events with relative times
        """
        events = []
        
        # Pattern for "X hours/minutes after/before Y"
        relative_pattern = r'(\d+)\s*(hour|minute|min|hr)s?\s*(after|before|following|prior to)\s*(\w+)'
        matches = re.finditer(relative_pattern, text, re.IGNORECASE)
        
        for match in matches:
            amount = int(match.group(1))
            unit = match.group(2)
            relation = match.group(3)
            reference = match.group(4)
            
            # Convert unit to minutes
            minutes = amount * 60 if unit.startswith('hour') or unit.startswith('hr') else amount
            
            # Find the reference event or time
            reference_time = None
            reference_event = None
            
            # Check if reference is a time of day
            for time_expr, time_value in self.time_expressions.items():
                if reference.lower() in time_expr:
                    reference_time = time_value
                    break
            
            # Check if reference is an activity
            if not reference_time:
                for act_type, synonyms in self.activity_types.items():
                    if any(reference.lower() in syn for syn in synonyms):
                        # Find the most recent mention of this activity type
                        for event in events:
                            if event['type'] == act_type and 'start_time' in event:
                                reference_event = event
                                break
                        break
            
            # If we found a reference time or event, create a new event
            if reference_time or reference_event:
                # Determine the activity type
                activity_context = text[max(0, match.start() - 50):min(len(text), match.end() + 50)]
                activity_type = self._determine_activity_type(activity_context)
                
                if activity_type:
                    event = {
                        'type': activity_type,
                        'relative_time': True,
                        'source_text': match.group(0)
                    }
                    
                    # Calculate the time based on reference
                    if reference_time:
                        base_time = datetime.datetime.strptime(reference_time, '%H:%M')
                        if relation.lower() in ['after', 'following']:
                            new_time = base_time + datetime.timedelta(minutes=minutes)
                        else:  # before, prior to
                            new_time = base_time - datetime.timedelta(minutes=minutes)
                        
                        event['start_time'] = new_time.strftime('%H:%M')
                        event['reference'] = f"relative to {reference}"
                    
                    elif reference_event:
                        base_time = datetime.datetime.strptime(reference_event['start_time'], '%H:%M')
                        if relation.lower() in ['after', 'following']:
                            new_time = base_time + datetime.timedelta(minutes=minutes)
                        else:  # before, prior to
                            new_time = base_time - datetime.timedelta(minutes=minutes)
                        
                        event['start_time'] = new_time.strftime('%H:%M')
                        event['reference'] = f"relative to {reference_event['type']} at {reference_event['start_time']}"
                    
                    events.append(event)
        
        # Pattern for time of day expressions
        for time_expr, time_value in self.time_expressions.items():
            pattern = fr'(?:baby|infant)?\s*(?:{"|".join(sum(self.activity_types.values(), []))})\s*(?:in|during|at)\s*(?:the)?\s*({time_expr})'
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                # Determine activity type
                activity_type = self._determine_activity_type(match.group(0))
                
                if activity_type:
                    event = {
                        'type': activity_type,
                        'start_time': time_value,
                        'approximate_time': True,
                        'source_text': match.group(0)
                    }
                    
                    # Add additional details based on activity type
                    if activity_type == 'feeding':
                        event['feeding_type'] = self._determine_feeding_type(match.group(0))
                    elif activity_type == 'diaper':
                        event['diaper_type'] = self._determine_diaper_type(match.group(0))
                    
                    events.append(event)
        
        return events
    
    def _extract_duration_events(self, text):
        """
        Extract events with duration information.
        
        Args:
            text (str): Normalized text to extract events from
            
        Returns:
            list: List of events with duration information
        """
        events = []
        
        # Pattern for "X hour/minute nap/feed/etc."
        duration_pattern = r'(\d+)\s*(hour|minute|min|hr)s?\s*(nap|feed|feeding|sleep|play|bath|walk)'
        matches = re.finditer(duration_pattern, text, re.IGNORECASE)
        
        for match in matches:
            amount = int(match.group(1))
            unit = match.group(2)
            activity = match.group(3)
            
            # Convert to minutes
            minutes = amount * 60 if unit.startswith('hour') or unit.startswith('hr') else amount
            duration = f"{minutes} minutes"
            
            # Determine activity type
            activity_type = None
            for act_type, synonyms in self.activity_types.items():
                if any(activity.lower() in syn for syn in synonyms):
                    activity_type = act_type
                    break
            
            if activity_type:
                # Look for time information near this mention
                context = text[max(0, match.start() - 50):min(len(text), match.end() + 50)]
                time_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', context)
                
                event = {
                    'type': activity_type,
                    'duration': duration,
                    'source_text': match.group(0)
                }
                
                if time_match:
                    event['start_time'] = self._normalize_time(time_match.group(1))
                
                events.append(event)
        
        return events
    
    def _extract_duration_near_match(self, text, start_pos, end_pos):
        """
        Extract duration information near a specific match position.
        
        Args:
            text (str): Text to search in
            start_pos (int): Start position of the match
            end_pos (int): End position of the match
            
        Returns:
            str: Duration string or None if not found
        """
        # Look for duration patterns like "for 2 hours" or "lasting 30 minutes"
        context = text[max(0, start_pos - 30):min(len(text), end_pos + 30)]
        
        duration_patterns = [
            r'for\s*(\d+)\s*(hour|minute|min|hr)s?',
            r'lasting\s*(\d+)\s*(hour|minute|min|hr)s?',
            r'(\d+)\s*(hour|minute|min|hr)s?\s*long',
            r'(\d+)\s*(hour|minute|min|hr)s?\s*duration',
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, context, re.IGNORECASE)
            if match:
                amount = int(match.group(1))
                unit = match.group(2)
                
                # Convert to minutes
                minutes = amount * 60 if unit.startswith('hour') or unit.startswith('hr') else amount
                return f"{minutes} minutes"
        
        return None
    
    def _enhance_events_with_location(self, events, text):
        """
        Enhance events with location information.
        
        Args:
            events (list): List of events to enhance
            text (str): Original text to extract location from
            
        Returns:
            list: Enhanced events with location information
        """
        # Common locations for baby activities
        locations = {
            'crib': ['crib', 'bassinet', 'bed', 'cot'],
            'stroller': ['stroller', 'pram', 'buggy', 'pushchair'],
            'car': ['car', 'carseat', 'vehicle', 'drive'],
            'carrier': ['carrier', 'wrap', 'sling', 'baby wear'],
            'swing': ['swing', 'rocker', 'bouncer'],
            'arms': ['arms', 'held', 'hold', 'holding', 'cuddle'],
            'floor': ['floor', 'mat', 'playmat', 'carpet', 'rug'],
            'highchair': ['highchair', 'high chair', 'feeding chair'],
            'bath': ['bath', 'bathtub', 'tub'],
            'outside': ['outside', 'outdoors', 'yard', 'garden', 'park'],
        }
        
        for event in events:
            # Only look for location for certain activity types
            if event['type'] in ['nap', 'sleep', 'play', 'feeding']:
                # Get context around this event's mention
                if 'source_text' in event and event['source_text'] in text:
                    source_text = event['source_text']
                    start_pos = text.find(source_text)
                    context = text[max(0, start_pos - 30):min(len(text), start_pos + len(source_text) + 30)]
                    
                    # Check for location mentions
                    for location, synonyms in locations.items():
                        if any(re.search(fr'\b{syn}\b', context, re.IGNORECASE) for syn in synonyms):
                            event['location'] = location
                            break
        
        return events
    
    def _determine_activity_type(self, text):
        """
        Determine the activity type from text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            str: Activity type or None if not determined
        """
        for activity_type, synonyms in self.activity_types.items():
            if any(re.search(fr'\b{syn}\b', text, re.IGNORECASE) for syn in synonyms):
                return activity_type
        
        return None
    
    def _determine_feeding_type(self, text):
        """
        Determine the feeding type from text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            str: Feeding type (breast, bottle, solids, snack)
        """
        if re.search(r'\b(breast|nursing|nurse)\b', text, re.IGNORECASE):
            return 'breast'
        elif re.search(r'\b(bottle|formula)\b', text, re.IGNORECASE):
            return 'bottle'
        elif re.search(r'\b(solid|food|puree|cereal|vegetable|fruit|meat)\b', text, re.IGNORECASE):
            return 'solids'
        elif re.search(r'\b(snack)\b', text, re.IGNORECASE):
            return 'snack'
        
        return 'feeding'  # Default
    
    def _determine_diaper_type(self, text):
        """
        Determine the diaper type from text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            str: Diaper type (wet, dirty, both)
        """
        has_wet = re.search(r'\b(wet|pee)\b', text, re.IGNORECASE) is not None
        has_dirty = re.search(r'\b(dirty|poop|soiled|bowel)\b', text, re.IGNORECASE) is not None
        
        if has_wet and has_dirty:
            return 'both'
        elif has_dirty:
            return 'dirty'
        elif has_wet:
            return 'wet'
        
        return 'wet'  # Default
    
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
        
        try:
            # Try to parse with dateutil
            parsed_time = date_parser.parse(time_str)
            return parsed_time.strftime('%H:%M')
        except:
            # Fall back to regex-based parsing
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
        Extract baby name from text with improved accuracy.
        
        Args:
            text (str): Text to extract baby name from
            
        Returns:
            str: Baby name or None if not found
        """
        # Common patterns for baby name mentions
        name_patterns = [
            r'(?:baby|infant)?\s*(\w+)(?:\'s)?\s*(?:routine|schedule|nap|feeding|diaper)',
            r'(\w+)(?:\'s)?\s*(?:routine|schedule|nap|feeding|diaper)',
            r'my\s*(?:baby|infant|little one)?\s*(\w+)\s*',
            r'(?:baby|infant)?\s*(\w+)\s*(?:is|has|does|wakes|sleeps|eats)',
        ]
        
        for pattern in name_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.group(1)
                # Exclude common words that might be matched
                if (name.lower() not in ['baby', 'infant', 'the', 'her', 'his', 'their', 'our', 'my', 'this', 'that', 'will', 'has', 'had', 'have', 'does', 'did'] 
                    and len(name) > 1):
                    return name.capitalize()
        
        return None
    
    def _calculate_confidence_score(self, text, events):
        """
        Calculate a confidence score for the parsing results.
        
        Args:
            text (str): Original text
            events (list): Extracted events
            
        Returns:
            float: Confidence score between 0 and 1
        """
        if not events:
            return 0.0
        
        # Base score on number of events extracted
        base_score = min(len(events) / 5.0, 1.0)
        
        # Check if we have complete information
        complete_events = sum(1 for e in events if 'start_time' in e)
        completeness_score = complete_events / len(events) if events else 0
        
        # Check if we have a variety of activity types
        activity_types = set(e['type'] for e in events)
        variety_score = min(len(activity_types) / 3.0, 1.0)
        
        # Calculate final score
        return (base_score * 0.4 + completeness_score * 0.4 + variety_score * 0.2)
    
    def _ai_enhanced_parsing(self, text, baby_name):
        """
        Use OpenAI to enhance parsing for complex or ambiguous text.
        
        Args:
            text (str): Original text to parse
            baby_name (str): Baby's name
            
        Returns:
            list: Enhanced list of events or None if AI enhancement failed
        """
        if not self.use_ai_assist:
            return None
        
        try:
            # Create a prompt for the AI
            prompt = f"""
            Parse the following baby routine description for {baby_name} into structured data.
            Extract all activities with their times, durations, and other relevant details.
            
            Description: {text}
            
            Format each activity as a JSON object with these fields:
            - type: The activity type (nap, feeding, wake, sleep, diaper, play, bath, etc.)
            - start_time: Time in 24-hour format (HH:MM)
            - end_time: Time in 24-hour format if available
            - duration: Duration in minutes if available
            - location: Location if mentioned
            - Additional type-specific fields (feeding_type, diaper_type, etc.)
            
            Return a JSON array of all activities.
            """
            
            # Get response from OpenAI
            response = self.openai_service.get_response(prompt)
            
            # Extract JSON from response
            import json
            json_str = response.split("```json")[1].split("```")[0] if "```json" in response else response
            json_str = re.search(r'\[\s*\{.*\}\s*\]', json_str, re.DOTALL)
            
            if json_str:
                events = json.loads(json_str.group(0))
                
                # Validate and normalize the events
                for event in events:
                    if 'start_time' in event and event['start_time']:
                        event['start_time'] = self._normalize_time(event['start_time'])
                    if 'end_time' in event and event['end_time']:
                        event['end_time'] = self._normalize_time(event['end_time'])
                    event['ai_generated'] = True
                
                return events
        except Exception as e:
            print(f"AI parsing enhancement failed: {str(e)}")
        
        return None
