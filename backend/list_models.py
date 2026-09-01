import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.environ.get("GROQ_API_KEY", "")

print(f"API Key: {api_key[:12]}...")

try:
    resp = requests.get(
        "https://api.groq.com/openai/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10
    )
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        models = [m["id"] for m in resp.json().get("data", [])]
        print("Available models:")
        for m in sorted(models):
            print(" -", m)
    else:
        print("Error:", resp.text)
except Exception as e:
    print("Exception:", e)
