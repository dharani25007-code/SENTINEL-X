import os
import requests
import re
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.environ.get("GROQ_API_KEY", "")

raw_text = "Mle 1 Ja , /. bh i 7) 8 1 Ny y ME Crore fi i Wp I 24 rid 2 Dag, hod gp Tie: 1, 2m a Area: Sa rp Bp 60... 1 Cas 3 J y, rey ne J Oo rt pp ~ (Pig) thou Sing ary ney Cr cp O70 the s (ending 8 lechyicy) break, lr Z server por R. Sharmg 0"

prompt = (
    "You are an expert OCR reconstruction & safety incident extraction engine for Oil India Limited (OIL).\n\n"
    "Below is raw, noisy, or distorted OCR text scanned from a handwritten/printed field safety observation card at an oilfield facility.\n\n"
    "TASK:\n"
    "1. Identify the OIL Facility (one of: Duliajan Central Complex, Digboi Refinery Unit #2, Moran Drilling Rig #4, Naharkatiya Gas Plant, Pipeline Pump Station 7, Numaligarh Terminal).\n"
    "2. Reconstruct the clean, coherent safety observation narrative from the OCR fragments (e.g. identify equipment like pumps, breakers, vessels, and actions like LOTO, welding, lifting, zero energy, pressure). Exclude form headers, signatures, and observer names.\n\n"
    f"RAW OCR TEXT:\n{raw_text}\n\n"
    "Respond in EXACTLY this format:\n"
    "FACILITY: <facility name>\n"
    "OBSERVATION: <coherent clean safety observation narrative>"
)

try:
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 512,
        },
        timeout=15,
    )
    print("Status:", resp.status_code)
    print("Output:\n", resp.json().get("choices", [{}])[0].get("message", {}).get("content", ""))
except Exception as e:
    print("Error:", e)
