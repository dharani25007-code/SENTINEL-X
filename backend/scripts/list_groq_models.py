import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")
print(f"Testing with API Key: {api_key[:10]}...{api_key[-4:] if api_key else 'None'}")

url = "https://api.groq.com/openai/v1/models"
resp = requests.get(url, headers={"Authorization": f"Bearer {api_key}"})

print(f"Status Code: {resp.status_code}")
try:
    data = resp.json()
    if "data" in data:
        print("\nAvailable models:")
        for m in data["data"]:
            print(f" - {m.get('id')}")
    else:
        print("Response JSON:", data)
except Exception as e:
    print(f"Error reading response: {e}, Raw: {resp.text}")
