"""Quick test: check which Groq vision models are available and test OCR."""
import os
import requests
import base64
import json
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get("GROQ_API_KEY", "")
print(f"[1] API Key loaded: {key[:15]}...")

# Step 1: List available vision models
print("\n[2] Checking available Groq vision models...")
try:
    r = requests.get(
        "https://api.groq.com/openai/v1/models",
        headers={"Authorization": f"Bearer {key}"},
        timeout=15
    )
    if r.status_code == 200:
        all_models = [m["id"] for m in r.json().get("data", [])]
        vision_models = [m for m in all_models if "vision" in m.lower()]
        llama32_models = [m for m in all_models if "llama-3.2" in m.lower()]
        print(f"    Vision models: {vision_models}")
        print(f"    Llama 3.2 models: {llama32_models}")
    else:
        print(f"    Error {r.status_code}: {r.text[:200]}")
except Exception as e:
    print(f"    Exception: {e}")

# Step 2: Test vision with a tiny test image (1x1 red pixel JPEG)
print("\n[3] Testing vision API call with llama-3.2-11b-vision-preview...")
# Create a minimal 1x1 red JPEG for testing
import struct
minimal_jpeg = bytes([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
])

b64_img = base64.b64encode(minimal_jpeg).decode()

for model_name in ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview", "meta-llama/llama-4-scout-17b-16e-instruct"]:
    print(f"\n    Testing model: {model_name}")
    try:
        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What do you see in this image? Reply in one sentence."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}},
                    ],
                }
            ],
            "temperature": 0.1,
        }
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
            json=payload,
            timeout=20
        )
        print(f"    Status: {resp.status_code}")
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            print(f"    SUCCESS! Response: {content[:150]}")
        else:
            print(f"    Error: {resp.text[:300]}")
    except Exception as e:
        print(f"    Exception: {e}")

print("\n[DONE]")
