import re

def test_digboi(raw):
    print("INPUT:\n", raw)
    t = raw

    # 1. Start after Observation: or anchor
    obsMatch = re.search(r'\bOBSERVATION[\s:]*', t, re.IGNORECASE)
    if obsMatch:
        t = t[obsMatch.end():]
    else:
        opener = re.search(r'\b(Contractor|Technician|Rig floor|Floorman|Worker|Two contract|Empty plastic|While|During)\b', t, re.IGNORECASE)
        if opener:
            t = t[opener.start():]

    # 2. Cut off at Action Taken / Acton / Stopped work / Observer / signatures
    t = re.split(r'(?:\bACTION\b|\bCORRECTION\b|\bAction\s*Taken\b|\bActon\b|\bStopped\s*work\b|\bBarricaded\b|\bObserver\b|\bRajesh\s*Sharma\b|रिग|तुरंत|Check\s*Chore|\bChecked\b)', t, flags=re.IGNORECASE)[0]

    # 3. Clean non-ascii
    t = re.sub(r'[^\x00-\x7F]+', ' ', t)

    # 4. Specific typo & OCR symbol fixes
    t = re.sub(r'torch\s*\+\s*cutting', 'torch cutting', t, flags=re.IGNORECASE)
    t = re.sub(r'\b2:5\b', '2.5', t)
    t = re.sub(r'\bopen\s+[0-9a-z\s\-\[\]*{}]+(?=condensate|condefsate)', 'open ', t, flags=re.IGNORECASE)
    t = re.sub(r'\bcondefsate\b', 'condensate', t, flags=re.IGNORECASE)
    t = re.sub(r'\bstvong\b', 'strong', t, flags=re.IGNORECASE)
    t = re.sub(r'1\s*\*\s*\{\s*yirocarbon\.?\s*ml', 'hydrocarbon smell.', t, flags=re.IGNORECASE)
    t = re.sub(r'\byirocarbon\b', 'hydrocarbon', t, flags=re.IGNORECASE)
    t = re.sub(r'\bcoins\.?\s*detector\b', 'continuous gas detector', t, flags=re.IGNORECASE)
    t = re.sub(r'\bfive\s*watch\b', 'fire watch', t, flags=re.IGNORECASE)

    # 5. Remove leftover symbols
    t = re.sub(r'[\\><=_+*{}|\[\]]+', ' ', t)
    t = re.sub(r'\b(?:BEE|EERE|Repo|Apne|Bo|CIA|BN|PR|Fr|hg|ll|RN|Qe|Tw|TN|Sd|oy|OE|Riga)\b', ' ', t)

    # 6. Normalize whitespace
    t = re.sub(r'\s+\.\s+', '. ', t)
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'^[\s\-,\.\'\"]+|[\s\-,\.\'\"]+$', '', t)

    return t

sample = "Contractor was observed torch + cutting within 2:5 meters of open 4t - n [ condefsate drainage with stvong 1 * { yirocarbon. ml No coins. detector or five watch present BEE Acton : Stopped work immediately. EERE - wg Barvicaded area. CE gas gl % 4 - testing & fire wich before Yestart Repo Ea os Apne Bo : Observer: Rajesh Sharma - Shift Supenviso 1 ra CIA BN 2 3 to i PR Fr. a hg ll PR RN Qe on Tw TN 0 po Sd oy OE Riga"
out = test_digboi(sample)
print("\nOUTPUT:\n", out)
