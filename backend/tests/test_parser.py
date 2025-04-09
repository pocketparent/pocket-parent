import unittest
import sys
import os
import json
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the enhanced parser service
from enhanced_parser_service import EnhancedParserService

class TestEnhancedParserService(unittest.TestCase):
    """Test cases for the EnhancedParserService."""
    
    def setUp(self):
        """Set up the test environment."""
        self.parser = EnhancedParserService()
        self.user_id = "test_user_123"
    
    def test_absolute_time_parsing(self):
        """Test parsing of absolute time expressions."""
        # Simple absolute time
        text = "Baby wakes up at 7am, has a feeding at 8am, and naps at 10am for 2 hours."
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify we have 3 events
        self.assertEqual(len(result['routine']), 3)
        
        # Verify wake event
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        
        # Verify feeding event
        feeding_event = next((e for e in result['routine'] if e['type'] == 'feeding'), None)
        self.assertIsNotNone(feeding_event)
        self.assertEqual(feeding_event['start_time'], '08:00')
        
        # Verify nap event with duration
        nap_event = next((e for e in result['routine'] if e['type'] == 'nap'), None)
        self.assertIsNotNone(nap_event)
        self.assertEqual(nap_event['start_time'], '10:00')
        self.assertIn('duration', nap_event)
        self.assertEqual(nap_event['duration'], '120 minutes')
    
    def test_relative_time_parsing(self):
        """Test parsing of relative time expressions."""
        # Relative time expressions
        text = "Baby wakes up at 7am. Two hours after waking, she has a bottle. She naps 3 hours after her morning wake."
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify we have 3 events
        self.assertEqual(len(result['routine']), 3)
        
        # Verify wake event
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        
        # Verify feeding event (2 hours after wake)
        feeding_event = next((e for e in result['routine'] if e['type'] == 'feeding'), None)
        self.assertIsNotNone(feeding_event)
        self.assertEqual(feeding_event['start_time'], '09:00')
        
        # Verify nap event (3 hours after wake)
        nap_event = next((e for e in result['routine'] if e['type'] == 'nap'), None)
        self.assertIsNotNone(nap_event)
        self.assertEqual(nap_event['start_time'], '10:00')
    
    def test_approximate_time_parsing(self):
        """Test parsing of approximate time expressions."""
        # Approximate time expressions
        text = "Baby wakes up around 7ish, has a feeding at approximately 8:30am, and naps sometime in the morning."
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify we have 3 events
        self.assertEqual(len(result['routine']), 3)
        
        # Verify wake event with approximate time
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        self.assertTrue(wake_event['approximate_time'])
        
        # Verify feeding event with approximate time
        feeding_event = next((e for e in result['routine'] if e['type'] == 'feeding'), None)
        self.assertIsNotNone(feeding_event)
        self.assertEqual(feeding_event['start_time'], '08:30')
        self.assertTrue(feeding_event['approximate_time'])
        
        # Verify nap event with time of day
        nap_event = next((e for e in result['routine'] if e['type'] == 'nap'), None)
        self.assertIsNotNone(nap_event)
        self.assertTrue(nap_event['approximate_time'])
    
    def test_complex_routine_parsing(self):
        """Test parsing of a complex routine with multiple activities."""
        # Complex routine with various expressions
        text = """
        Mari wakes up at 7am and has a bottle right after waking. She plays for an hour after her bottle.
        Around 10ish she goes down for her morning nap which lasts about 2 hours.
        After her nap, she has lunch and then plays until about 2:30pm when she has her afternoon nap.
        The afternoon nap is usually 1-2 hours. After waking up, she has a snack and then we go for a walk.
        Dinner is at 6pm, followed by a bath at 6:30pm. Bedtime routine starts at 7pm with a final bottle,
        story time, and then she's in bed by 7:30pm.
        """
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify baby name extraction
        self.assertEqual(result['baby_name'], 'Mari')
        
        # Verify we have multiple events (at least 10)
        self.assertGreaterEqual(len(result['routine']), 10)
        
        # Verify wake event
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        
        # Verify bedtime
        sleep_event = next((e for e in result['routine'] if e['type'] == 'sleep'), None)
        self.assertIsNotNone(sleep_event)
        self.assertEqual(sleep_event['start_time'], '19:30')
        
        # Verify bath time
        bath_event = next((e for e in result['routine'] if e['type'] == 'bath'), None)
        self.assertIsNotNone(bath_event)
        self.assertEqual(bath_event['start_time'], '18:30')
    
    def test_fault_tolerance(self):
        """Test fault tolerance for unparseable content."""
        # Text with some parseable and some unparseable content
        text = """
        Baby wakes up at 7am. 
        Sometimes she's fussy in the morning.
        She has a bottle at 8am.
        The weather has been nice lately.
        She usually naps well but it depends on the day.
        """
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify we have at least 2 events (wake and feeding)
        self.assertGreaterEqual(len(result['routine']), 2)
        
        # Verify wake event
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        
        # Verify feeding event
        feeding_event = next((e for e in result['routine'] if e['type'] == 'feeding'), None)
        self.assertIsNotNone(feeding_event)
        self.assertEqual(feeding_event['start_time'], '08:00')
        
        # Verify unparsed segments are identified
        self.assertIn('unparsed_segments', result)
        self.assertGreaterEqual(len(result['unparsed_segments']), 1)
    
    def test_expanded_vocabulary(self):
        """Test expanded vocabulary for parenting phrases."""
        # Text with various synonyms for activities
        text = """
        Baby rises at 7am and has her morning milk. 
        She enjoys tummy time for 30 minutes after her feed.
        She gets drowsy around 9:30am and slumbers until 11am.
        After her siesta, she munches on some puree.
        We have a stroll in the park before her afternoon doze.
        """
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify we have at least 5 events
        self.assertGreaterEqual(len(result['routine']), 5)
        
        # Verify wake event (rises)
        wake_event = next((e for e in result['routine'] if e['type'] == 'wake'), None)
        self.assertIsNotNone(wake_event)
        self.assertEqual(wake_event['start_time'], '07:00')
        
        # Verify feeding events (milk, munches, puree)
        feeding_events = [e for e in result['routine'] if e['type'] == 'feeding']
        self.assertGreaterEqual(len(feeding_events), 2)
        
        # Verify nap events (slumbers, siesta, doze)
        nap_events = [e for e in result['routine'] if e['type'] == 'nap']
        self.assertGreaterEqual(len(nap_events), 2)
        
        # Verify play event (tummy time)
        play_event = next((e for e in result['routine'] if e['type'] == 'play'), None)
        self.assertIsNotNone(play_event)
        
        # Verify walk event (stroll)
        walk_event = next((e for e in result['routine'] if e['type'] == 'walk'), None)
        self.assertIsNotNone(walk_event)
    
    def test_feedback_generation(self):
        """Test generation of user-friendly feedback."""
        # Simple routine
        text = "Baby wakes at 7am, naps at 10am for 2 hours, and goes to bed at 7pm."
        result = self.parser.parse_routine(text, self.user_id)
        
        # Verify feedback is generated
        self.assertIn('feedback', result)
        self.assertIsInstance(result['feedback'], str)
        self.assertGreater(len(result['feedback']), 10)
        
        # Verify confidence score
        self.assertIn('confidence_score', result)
        self.assertGreaterEqual(result['confidence_score'], 0)
        self.assertLessEqual(result['confidence_score'], 1)

if __name__ == '__main__':
    unittest.main()
