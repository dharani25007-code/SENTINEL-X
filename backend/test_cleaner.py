import re

def clean_observation(text):
    print("INPUT:\n", text)
    
    # 1. Remove form headers: "Observed by:", "Facility:", "Date:", "OIL INDIA LIMITED", "Near miss", "CARD"
    t = text
    # Remove up to "OBSERVATION:" if present
    obs_idx = re.search(r'\bOBSERVATION\b[\s:]*', t, re.IGNORECASE)
    if obs_idx:
        t = t[obs_idx.end():]
    else:
        # Cut off "observed by: ...", "facility: ...", "date: ..."
        t = re.sub(r'(?:observed\s*(?:by|ty)|facility|date)[\s:]*[^,\n]+?(?=(?:Rig floor|Technician|Contractor|Floorman|Worker|Two contract|Empty plastic|While|During|[A-Z][a-z]+ was observed|[A-Z][a-z]+ entered))', '', t, flags=re.IGNORECASE)
        # If still starts with "observed ty: ...", strip it
        t = re.sub(r'^.*?observed\s*(?:by|ty)[^:\n]*:?[^\n]*?(?:Emi\s*|\-\s*)?', '', t, flags=re.IGNORECASE)

    # 2. Cut off everything at and after ACTION / CORRECTION / HINDI text / Signatures / Checkbox
    t = re.split(r'(?:\bACTION\b|\bCORRECTION\b|\bAction\/Correction\b|रिग|तुरंत|Check\s*Chore|\bRajesh Kumar\b|\bSignature\b|\bChecked\b)', t, flags=re.IGNORECASE)[0]

    # 3. Remove non-ascii
    t = re.sub(r'[^\x00-\x7F]+', ' ', t)

    # 4. Remove isolated form noise / OCR artifact gibberish like "1 - GE os cp ge", "Bi Ng 3; - Emi"
    t = re.sub(r'\b(?:Bi Ng|Emi|os cp ge|Check Chore|Pre-maoral)\b', ' ', t, flags=re.IGNORECASE)
    t = re.sub(r'\b\d+\s*[-=]\s*[A-Z]{1,3}\s+[a-z]{1,3}\s+[a-z]{1,3}\s+[a-z]{1,3}\b', ' ', t)
    t = re.sub(r'\|\s*', ' ', t)
    t = re.sub(r'[\\><=_]+', ' ', t)

    # 5. Fix common OCR character misreads
    t = re.sub(r'\bwagt\b', 'waqt', t, flags=re.IGNORECASE)
    t = re.sub(r'\bvope\b', 'rope', t, flags=re.IGNORECASE)
    t = re.sub(r'\(Vikram\s+5\)', '(Vikram S.)', t, flags=re.IGNORECASE)

    # 6. Normalize whitespace and trim
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'^[\s\-,\.\'\"]+|[\s\-,\.\'\"]+$', '', t)

    # 7. If "Rig floor" is present inside, ensure it starts from "Rig floor" (or other incident opener)
    opener = re.search(r'\b(Rig floor|Technician|Contractor|Floorman|Worker|Two contract|Empty plastic|While|During)\b', t, re.IGNORECASE)
    if opener:
        t = t[opener.start():]

    return t

sample = "observed ty: Rajesh Kumar (Driller Bi Ng 3; - Emi Rig floor pe drill pipe lift karte waqt 1 - GE os cp ge Helper (Vikram S.) . narrowly escaped pinch zone when the wire rope parted. - 'ACTION"
out = clean_observation(sample)
print("OUTPUT:\n", out)
