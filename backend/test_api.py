#!/usr/bin/env python3

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_123"
TEST_PHONE_NUMBER = "+15551234567"

def print_header(title):
    """Print a formatted header for test sections."""
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80 + "\n")

def test_health_check():
    """Test the health check endpoint."""
    print_header("Testing Health Check Endpoint")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200 and response.json().get("status") == "healthy":
            print("\n✅ Health check successful!")
            return True
        else:
            print("\n❌ Health check failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_parse_routine():
    """Test the parse routine endpoint."""
    print_header("Testing Parse Routine Endpoint")
    
    routine_text = "Baby napped from 2pm to 3:30pm, then had a bottle at 4pm. Diaper change at 5pm."
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/parse-routine",
            json={"text": routine_text, "user_id": TEST_USER_ID}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201 and "routine" in response.json():
            print("\n✅ Parse routine successful!")
            return True
        else:
            print("\n❌ Parse routine failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_get_routines():
    """Test the get routines endpoint."""
    print_header("Testing Get Routines Endpoint")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/routines",
            params={"user_id": TEST_USER_ID}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ Get routines successful!")
            return True
        else:
            print("\n❌ Get routines failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_process_sms():
    """Test the process SMS endpoint."""
    print_header("Testing Process SMS Endpoint")
    
    sms_message = "Baby just woke up at 7am and had breakfast at 7:30am."
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sms",
            json={
                "message": sms_message,
                "from_number": TEST_PHONE_NUMBER,
                "user_id": TEST_USER_ID
            }
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ Process SMS successful!")
            return True
        else:
            print("\n❌ Process SMS failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_get_sms_messages():
    """Test the get SMS messages endpoint."""
    print_header("Testing Get SMS Messages Endpoint")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/sms",
            params={"user_id": TEST_USER_ID}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ Get SMS messages successful!")
            return True
        else:
            print("\n❌ Get SMS messages failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_ask_assistant():
    """Test the ask assistant endpoint."""
    print_header("Testing Ask Assistant Endpoint")
    
    question = "What's a normal nap schedule for a 6-month-old baby?"
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/assistant",
            json={"message": question, "user_id": TEST_USER_ID}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200 and "message" in response.json():
            print("\n✅ Ask assistant successful!")
            return True
        else:
            print("\n❌ Ask assistant failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_get_user():
    """Test the get user endpoint."""
    print_header("Testing Get User Endpoint")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/users",
            params={"user_id": TEST_USER_ID}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ Get user successful!")
            return True
        else:
            print("\n❌ Get user failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_create_or_update_user():
    """Test the create or update user endpoint."""
    print_header("Testing Create or Update User Endpoint")
    
    user_data = {
        "id": TEST_USER_ID,
        "name": "Test User",
        "email": "test@example.com",
        "subscription_status": "trial"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/users",
            json=user_data
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ Create or update user successful!")
            return True
        else:
            print("\n❌ Create or update user failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_update_subscription():
    """Test the update subscription endpoint."""
    print_header("Testing Update Subscription Endpoint")
    
    subscription_data = {
        "user_id": TEST_USER_ID,
        "subscription_status": "active"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/subscription",
            json=subscription_data
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ Update subscription successful!")
            return True
        else:
            print("\n❌ Update subscription failed!")
            return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and print a summary."""
    print_header("Running All Tests")
    
    tests = [
        ("Health Check", test_health_check),
        ("Parse Routine", test_parse_routine),
        ("Get Routines", test_get_routines),
        ("Process SMS", test_process_sms),
        ("Get SMS Messages", test_get_sms_messages),
        ("Ask Assistant", test_ask_assistant),
        ("Get User", test_get_user),
        ("Create or Update User", test_create_or_update_user),
        ("Update Subscription", test_update_subscription)
    ]
    
    results = []
    
    for name, test_func in tests:
        print(f"\nRunning test: {name}")
        result = test_func()
        results.append((name, result))
    
    print_header("Test Summary")
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{name}: {status}")
        
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)}, Passed: {passed}, Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! The Hatchling API is working correctly.")
    else:
        print(f"\n⚠️ {failed} test(s) failed. Please check the logs above for details.")

if __name__ == "__main__":
    run_all_tests()
