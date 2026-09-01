import re

def test_extract(raw_text):
    print("RAW:", raw_text)
    facility = "Duliajan Central Complex"
    
    t = raw_text.lower()
    if "moran" in t or "rig #4" in t or "drilling rig" in t:
        facility = "Moran Drilling Rig #4"
    elif "digboi" in t or "refinery" in t:
        facility = "Digboi Refinery Unit #2"
    elif "duliajan" in t or "central complex" in t:
        facility = "Duliajan Central Complex"
    elif "naharkatiya" in t or "gas plant" in t:
        facility = "Naharkatiya Gas Plant"
    elif "pipeline" in t or "pump station 7" in t:
        facility = "Pipeline Pump Station 7"
    elif "numaligarh" in t or "terminal" in t:
        facility = "Numaligarh Terminal"

    # Match observation starting after observer/date/header or at common start triggers
    cleaned = raw_text
    # 1. Try finding pattern starting with Rig floor / Technician / Contractor / Operator / Worker / During / While
    match_start = re.search(r'(?:Rig floor|Technician|Contractor|Floorman|Worker|Two contract|Empty plastic|While|During|Observed)[\s\S]+?(?:ACTION|CORRECTION|Action\/Correction|रिग|तुरंत|Check|\n\s*Rajesh|\n\s*Observed|\Z)', raw_text, re.IGNORECASE)
    if match_start:
        cleaned = match_start.group(0)
    else:
        # Cut off header lines (Date, Observed by, etc)
        cleaned = re.sub(r'^.*?observed[^\n:]*:[^\n]*', '', cleaned, flags=re.IGNORECASE | re.DOTALL)
        cleaned = re.sub(r'^.*?Facility[^\n:]*:[^\n]*', '', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Clean non-ascii / garbled chars
    cleaned = re.sub(r'[^\x00-\x7F]+', ' ', cleaned)
    # Remove form noise markers like "1 = - GE os cp ge", "Bi Ng 3; - | = Emi > \"
    cleaned = re.sub(r'\|\s*', ' ', cleaned)
    cleaned = re.sub(r'[\\><=_]+', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Minor OCR fixes
    cleaned = re.sub(r'\bwagt\b', 'waqt', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bvope\b', 'rope', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\(Vikram\s+5\)', '(Vikram S.)', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+-\s*$', '', cleaned)

    return facility, cleaned

raw = "CARD i my @ | : Moran Drilling Rig #4 owe: 12iof2023 | | a Se \ - S observed ty: Rajesh Kumar (Driller Bi Ng 3; - | = Emi > \ Rig floor pe drill pipe lift karte wagt 1 = - GE os cp ge Helper (Vikram 5) . narrowly escaped pinch zone when the wire vope parted. - '"
fac, clean = test_extract(raw)
print("FACILITY:", fac)
print("CLEAN NARRATIVE:", clean)
