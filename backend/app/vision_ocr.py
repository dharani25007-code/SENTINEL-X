"""
AI Vision OCR Engine for Oilfield Near-Miss Paper Cards and Field Photos.

Uses Groq's multimodal vision models to extract handwritten/printed text
from oilfield observation slips and equipment tags.

Model fallback chain:
  1. llama-3.2-11b-vision-preview  (fast, lightweight)
  2. llama-3.2-90b-vision-preview  (high accuracy)
"""

import os
import io
import json
import base64
import re
import traceback
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Ordered list of vision models to try
VISION_MODELS = [
    "llama-3.2-11b-vision-preview",
    "llama-3.2-90b-vision-preview",
]

PROMPT = (
    "You are an OCR system. Read ALL text visible in this image carefully.\n"
    "This is a photo of an industrial safety observation card from Oil India Limited.\n\n"
    "Instructions:\n"
    "1. Read every word written on the card (handwritten or printed).\n"
    "2. Find the FACILITY name (e.g. Moran, Digboi, Duliajan, Naharkatiya, Pipeline, Numaligarh).\n"
    "3. Find the OBSERVATION text describing what happened.\n\n"
    "Reply in this exact format:\n"
    "FACILITY: <facility name from the card>\n"
    "OBSERVATION: <the safety observation text from the card>"
)


def compress_image(image_bytes: bytes, max_size_kb: int = 500) -> str:
    """Compress image to base64 string, keeping it under Groq's size limit."""
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        # Resize if too large (max 1024px on longest side)
        max_dim = 1024
        if max(img.size) > max_dim:
            ratio = max_dim / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        # Convert to JPEG and compress
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=70, optimize=True)
        return base64.b64encode(buf.getvalue()).decode("utf-8")
    except ImportError:
        # PIL not available, use raw bytes (may be large)
        print("[Vision OCR] WARNING: Pillow not installed, using raw image bytes")
        return base64.b64encode(image_bytes).decode("utf-8")
    except Exception as e:
        print(f"[Vision OCR] Image compression error: {e}")
        return base64.b64encode(image_bytes).decode("utf-8")


def call_groq_vision(model: str, b64_image: str, api_key: str) -> dict | None:
    """Make a single Groq Vision API call. Returns parsed result or None."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}"
                        }
                    },
                ],
            }
        ],
        "temperature": 0.1,
        "max_tokens": 1024,
    }

    print(f"[Vision OCR] Calling model: {model} ...")
    resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
    print(f"[Vision OCR] Response status: {resp.status_code}")

    if resp.status_code != 200:
        print(f"[Vision OCR] ERROR response: {resp.text[:400]}")
        return None

    content = resp.json()["choices"][0]["message"]["content"]
    print(f"[Vision OCR] Model output:\n{content}\n")
    return content


def parse_vision_response(content: str) -> dict:
    """Parse the FACILITY/OBSERVATION format from the vision model response."""
    facility = "Duliajan Central Complex"
    narrative = content.strip()

    # Try to extract FACILITY line
    fac_match = re.search(
        r"(?:FACILITY|UNIT|LOCATION|SITE)\s*:\s*(.+?)(?:\n|$)",
        content, re.IGNORECASE
    )
    if fac_match:
        facility = fac_match.group(1).strip()

    # Try to extract OBSERVATION/NARRATIVE line
    narr_match = re.search(
        r"(?:OBSERVATION|NARRATIVE|DESCRIPTION|REPORT)\s*:\s*(.+)",
        content, re.IGNORECASE | re.DOTALL
    )
    if narr_match:
        narrative = narr_match.group(1).strip()

    # Normalize facility to one of the 6 standard names
    facility_lower = facility.lower()
    if "moran" in facility_lower or "rig" in facility_lower or "drilling" in facility_lower:
        facility = "Moran Drilling Rig #4"
    elif "digboi" in facility_lower or "refinery" in facility_lower:
        facility = "Digboi Refinery Unit #2"
    elif "duliajan" in facility_lower or "central" in facility_lower:
        facility = "Duliajan Central Complex"
    elif "naharkatiya" in facility_lower or "gas plant" in facility_lower:
        facility = "Naharkatiya Gas Plant"
    elif "pipeline" in facility_lower or "pump station" in facility_lower:
        facility = "Pipeline Pump Station 7"
    elif "numaligarh" in facility_lower or "terminal" in facility_lower:
        facility = "Numaligarh Terminal"

    return {
        "narrative": narrative,
        "facility": facility,
    }


def extract_text_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Main entry point: extracts safety observation narrative and facility
    from an uploaded image using Groq Vision models.
    """
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        print("[Vision OCR] FATAL: No GROQ_API_KEY found in environment!")
        return {
            "narrative": "Error: GROQ_API_KEY not configured in backend .env file.",
            "facility": "Duliajan Central Complex",
            "confidence": 0.0,
            "model": "none",
            "error": "Missing API key"
        }

    # Step 1: Compress image for API upload
    print(f"[Vision OCR] Received image: {len(image_bytes)} bytes, type: {mime_type}")
    b64_image = compress_image(image_bytes)
    print(f"[Vision OCR] Compressed to base64 length: {len(b64_image)} chars")

    # Step 2: Try each vision model in order
    for model in VISION_MODELS:
        try:
            content = call_groq_vision(model, b64_image, api_key)
            if content and len(content) > 20:
                result = parse_vision_response(content)
                if len(result["narrative"]) > 15:
                    return {
                        "narrative": result["narrative"],
                        "facility": result["facility"],
                        "confidence": 0.97,
                        "model": model,
                    }
                else:
                    print(f"[Vision OCR] Model {model} returned too-short narrative, trying next...")
        except Exception as e:
            print(f"[Vision OCR] Model {model} failed with exception:")
            traceback.print_exc()
            continue

    # Step 3: All models failed — return error with explanation
    print("[Vision OCR] ALL vision models failed. Returning error response.")
    return {
        "narrative": "OCR vision models unavailable. Please type the observation manually or check your Groq API key has vision model access.",
        "facility": "Duliajan Central Complex",
        "confidence": 0.0,
        "model": "none",
        "error": "All Groq vision models returned errors. Check backend terminal logs for details."
    }
