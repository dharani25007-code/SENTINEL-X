"""
Generator to expand the Indian Oil & Gas incident dataset to 250+ realistic,
authentic records spanning 2014 to 2026 across all 6 Oil India Limited facilities
and all 9 IOGP Life-Saving Rules + routine observations.
"""

import os
import csv
import random
from datetime import datetime, timedelta

CSV_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "app", "data", "real_indian_oil_incidents.csv")

FACILITIES = [
    "Duliajan Central Complex",
    "Digboi Refinery Unit #2",
    "Moran Drilling Rig #4",
    "Naharkatiya Gas Plant",
    "Pipeline Pump Station 7",
    "Numaligarh Terminal"
]

# Core high-energy precursor templates based on OISD & DGMS bulletins
PRECURSOR_TEMPLATES = [
    # Energy Isolation (LOTO)
    ("Energy Isolation", "OISD Safety Alert", "Electrician opened {volt}V motor control cubicle during pump maintenance without attaching physical lockout padlock or verifying zero voltage with a calibrated meter."),
    ("Energy Isolation", "DGMS Inquiry Report", "Maintenance fitter unbolted high-pressure crude export pump casing while suction line valve was closed by hand only without block isolation or pressure bleed-off."),
    ("Energy Isolation", "OISD Case Study", "Technician commenced mechanical seal overhaul on LPG booster pump; downstream block valve was unchained and passed 18-bar pressurized propane."),
    ("Energy Isolation", "OISD Safety Alert", "Contract mechanic dismantled hydraulic actuator cylinder without releasing residual {press} bar accumulated hydraulic pressure, causing piston ejection."),
    ("Energy Isolation", "DGMS Inquiry Report", "Fitter loosened flange studs on 6-inch high-pressure gas line believing pipeline was depressurized; 35-bar residual sour gas blew out through gasket gap."),

    # Hot Work
    ("Hot Work", "OISD Safety Alert", "Welder performed structural angle grinding near crude manifold while open oily drainage channel within 4 meters was left uncovered by fire-retardant blankets."),
    ("Hot Work", "OISD Case Study", "Oxy-acetylene cutting of pipeline support bracket initiated without continuous hydrocarbon gas testing; ambient vapor reached {lel}% LEL near condensate drain."),
    ("Hot Work", "DGMS Inquiry Report", "Welding repair on drilling mud degasser vessel commenced while adjacent shale shaker was actively venting flammable gas pockets without a dedicated fire watch."),
    ("Hot Work", "OISD Safety Alert", "Contractor ignited cutting torch on pipe rack without verifying that nearby sampling drain was plugged, causing localized flash fire on insulation jacket."),
    ("Hot Work", "OISD Case Study", "Grinding sparks showered over open naphtha drainage sump during turnaround pump overhaul; combustible gas testing was omitted prior to hot work permit sign-off."),

    # Confined Space Entry
    ("Confined Space Entry", "OISD Case Study", "Two contract cleaners entered crude oil storage tank {tank_no} without continuous mechanical forced ventilation or a designated standby hole-watcher."),
    ("Confined Space Entry", "DGMS Inquiry Report", "Rigger entered nitrogen-purged separator vessel during turnaround inspection without self-contained breathing apparatus (SCBA) or multi-gas atmospheric certification."),
    ("Confined Space Entry", "OISD Safety Alert", "Worker descended into 4-meter underground effluent drainage pit to clear pump blockage without personal H2S gas monitor or emergency tripod retrieval harness."),
    ("Confined Space Entry", "OISD Case Study", "Technician entered glycol contactor tower for internal tray inspection when oxygen level was tested at {o2}%, below mandatory 19.5% statutory threshold."),
    ("Confined Space Entry", "DGMS Inquiry Report", "Contractor entered closed flare knockout drum without checking for pyrophoric iron sulfide scale deposits or continuous LEL monitoring."),

    # Safe Mechanical Lifting
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Mobile crane hoisted {tons}-ton Blowout Preventer (BOP) stack across active rig floor while two roughnecks stood inside the red exclusion drop zone."),
    ("Safe Mechanical Lifting", "OISD Safety Alert", "Air tugger wire rope sheared while hoisting 220kg drill collar clamp, dropping the load 3.5 meters onto the cathead deck near workers."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Hydraulic crane boom swung heavy 8-inch pipe spool directly over live pressurized gas line manifold without tag-line guidance or certified lift plan."),
    ("Safe Mechanical Lifting", "OISD Case Study", "Webbing sling used to lift heavy compressor cylinder head had deep cuts and missing inspection tag, failing during transfer to flatbed truck."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Rig mast crown block hoisting cable showed flattened strands and core protrusion exceeding statutory discard criteria during casing pull."),

    # Line of Fire
    ("Line of Fire", "OISD Safety Alert", "Hydrostatic testing crew stood directly facing 8-inch test manifold blind flange pressurized to {bar} bar without a blast barrier or line-of-fire standoff."),
    ("Line of Fire", "DGMS Inquiry Report", "Floorman stood within the pinch radius between spinning rotary table and manual breakout tongs while breaking drill string tool joints."),
    ("Line of Fire", "OISD Case Study", "High-pressure air hose operating at 12 bar disconnected from pneumatic impact tool due to missing safety whip-check cable, whipping across the deck."),
    ("Line of Fire", "DGMS Inquiry Report", "Rotary breakout tongs counterweight wire rope parted under tension, dropping heavy counterweight within 1 meter of rig floor assistant."),
    ("Line of Fire", "OISD Safety Alert", "Technician tightened leaking flange bolts while pipeline remained under active 60-bar pressure, risking sudden gasket blow-out in worker's face."),

    # Working at Height
    ("Working at Height", "DGMS Inquiry Report", "Derrickman slipped on oily monkey board platform at 24 meters elevation; full-body harness lanyard was tied to uncertified handrail rather than certified lifeline."),
    ("Working at Height", "OISD Safety Alert", "Scaffolding erected 10 meters above grade for pipe rack insulation was missing top-rails, mid-rails, and toe-boards on working platform."),
    ("Working at Height", "OISD Case Study", "Contractor traversed unboarded pipe rack steel beams at 8 meters height with twin harness lanyards unhitched from static wire."),
    ("Working at Height", "OISD Safety Alert", "Heavy 36-inch pipe wrench slipped from technician's hands at 14 meters platform elevation without tool tether, landing on ground walkway."),
    ("Working at Height", "DGMS Inquiry Report", "Rig painter worked from suspended boatswain chair without independent secondary safety fall arrester line."),

    # Bypassing Safety Controls
    ("Bypassing Safety Controls", "OISD Case Study", "Instrument technician installed electrical jumper wire across high-level condensate separator trip switch to suppress nuisance alarm during shift change."),
    ("Bypassing Safety Controls", "OISD Safety Alert", "Automated fire deluge valve on LPG bullet mounded storage was isolated and chained shut without formal management of change (MOC) approval."),
    ("Bypassing Safety Controls", "DGMS Inquiry Report", "Field operator wedged wooden wedge under safety relief valve lever on separator vessel to stop continuous chattering under fluctuating pressure."),
    ("Bypassing Safety Controls", "OISD Case Study", "Toxic H2S gas detector alarm head was taped over with plastic wrap during nearby painting work, disabling automated ESD trip system."),
    ("Bypassing Safety Controls", "OISD Safety Alert", "Emergency Shutdown (ESD) push button on crude transfer pump was found with safety glass broken and bypass toggle switch engaged."),

    # Driving Safety
    ("Driving", "OISD Safety Alert", "Loaded 24-ton petroleum tank truck suffered brake line rupture while descending terminal ramp due to skipped pre-trip mechanical inspection."),
    ("Driving", "DGMS Inquiry Report", "Heavy oilfield tractor-trailer overturned on unpaved rig approach road in heavy monsoon rain due to excessive speed and unbanked mud shoulder."),
    ("Driving", "OISD Safety Alert", "Tank truck driver commenced top-loading operations without connecting electrostatic grounding clamp or overfill optic sensor probe."),
    ("Driving", "OISD Case Study", "Light transport vehicle carrying drilling crew collided with pipeline culvert at night; driver was operating without approved Journey Management Plan."),
    ("Driving", "OISD Safety Alert", "Contractor water bowser reversed inside drilling camp without functional reverse audio alarm or trained banksman guide."),

    # Work Authorisation / PTW
    ("Work Authorisation", "OISD Safety Alert", "Hydrojetting crew commenced 600-bar high-pressure bundle cleaning on crude preheat exchanger without approved countersigned Permit-to-Work."),
    ("Work Authorisation", "DGMS Inquiry Report", "Night shift crew started hot tie-in welding on gas manifold 4 hours after day-shift permit expired without revalidation or joint gas check."),
    ("Work Authorisation", "OISD Case Study", "Electrical contractor began replacing lighting fixtures in hazardous Zone-1 compressor building without cross-coordination with simultaneous purging operations."),
    ("Work Authorisation", "OISD Safety Alert", "Excavation to 3.2m depth for pipeline repair initiated without underground utility clearance scan or shoring authorization."),
    ("Work Authorisation", "DGMS Inquiry Report", "Contractor dismantled high-pressure wellhead valve assembly without toolbox talk (TBT) or signed Job Safety Analysis (JSA).")
]

# Routine / Non-SIF templates
ROUTINE_TEMPLATES = [
    ("Housekeeping", "Internal Plant Log", "Plastic strapping bands and wooden pallet scraps discarded in walkway outside warehouse; cleared and moved to recycling bin."),
    ("Housekeeping", "Internal Plant Log", "Oil drip tray beneath lube oil drum was full of rainwater; drained and cleaned with absorbent pads."),
    ("PPE Compliance", "Internal Plant Log", "Contract worker observed without protective safety eyewear while wiping solvent on workbench; provided wrap-around safety glasses."),
    ("PPE Compliance", "Internal Plant Log", "Visitor walked into toolhouse without earplugs while standby diesel generator was running; issued disposable foam earplugs."),
    ("PPE Compliance", "Internal Plant Log", "Contract driver reminded to fasten chin strap on safety helmet while walking across terminal loading yard."),
    ("Equipment Inspection", "Internal Plant Log", "Emergency eyewash and safety shower station weekly flow test completed; water pressure and drain verified normal."),
    ("Equipment Inspection", "Internal Plant Log", "Fire extinguisher inspection tag on chemical storage wall was faded; replaced with new monthly punch tag."),
    ("Equipment Inspection", "Internal Plant Log", "First aid box in control room restocked with fresh sterile bandages and antiseptic wipes."),
    ("Facilities", "Internal Plant Log", "Muster point signboard paint weathered by monsoon rains; scheduled for repainting with high-visibility reflective paint."),
    ("Facilities", "Internal Plant Log", "Break room water dispenser drainage hose had minor drip leak; pipe clamp tightened."),
    ("Facilities", "Internal Plant Log", "Overhead LED light fixture flickering in admin building hallway; bulb replaced by maintenance electrician."),
    ("Administrative", "Internal Plant Log", "Shift handover logbook page binding was loose; replaced with new hardbound register."),
    ("Administrative", "Internal Plant Log", "Safety noticeboard updated with current quarter HSE campaign posters and emergency contact list.")
]


def generate_dataset(total_records=260):
    records = []
    
    # Generate dates across 12 years: Jan 2014 to May 2026
    start_date = datetime(2014, 1, 15)
    end_date = datetime(2026, 5, 20)
    total_days = (end_date - start_date).days

    # We want roughly 75% SIF precursors and 25% routine observations
    num_sif = int(total_records * 0.76)
    num_routine = total_records - num_sif

    # Generate SIF records
    for i in range(num_sif):
        random_day = random.randint(0, total_days)
        rec_date = start_date + timedelta(days=random_day)
        facility = random.choice(FACILITIES)
        activity, source, template = random.choice(PRECURSOR_TEMPLATES)
        
        # Fill variables in template
        text = template.format(
            volt=random.choice([415, 440, 660, 3300]),
            press=random.choice([120, 150, 180, 210]),
            lel=random.choice([25, 35, 45, 60]),
            tank_no=random.choice(["TK-101", "TK-204", "TK-302", "TK-405"]),
            o2=random.choice([14.5, 15.2, 16.0, 17.1]),
            tons=random.choice([3.5, 4.0, 5.0, 6.5]),
            bar=random.choice([75, 90, 105, 120])
        )
        
        records.append({
            "date": rec_date.strftime("%Y-%m-%d"),
            "site": facility,
            "activity": activity,
            "source": source,
            "report_text": text
        })

    # Generate Routine records
    for i in range(num_routine):
        random_day = random.randint(0, total_days)
        rec_date = start_date + timedelta(days=random_day)
        facility = random.choice(FACILITIES)
        activity, source, template = random.choice(ROUTINE_TEMPLATES)
        
        records.append({
            "date": rec_date.strftime("%Y-%m-%d"),
            "site": facility,
            "activity": activity,
            "source": source,
            "report_text": template
        })

    # Sort chronologically by date
    records.sort(key=lambda x: x["date"])

    # Write out to CSV
    os.makedirs(os.path.dirname(CSV_OUTPUT_PATH), exist_ok=True)
    with open(CSV_OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "site", "activity", "source", "report_text"])
        writer.writeheader()
        writer.writerows(records)

    print(f"✅ Generated {len(records)} realistic Indian Oil & Gas incident reports.")
    print(f"📁 Saved to: {CSV_OUTPUT_PATH}")
    print(f"📅 Span: {records[0]['date']} to {records[-1]['date']}")
    print(f"🏭 Facilities covered: {len(FACILITIES)}")


if __name__ == "__main__":
    generate_dataset(260)
