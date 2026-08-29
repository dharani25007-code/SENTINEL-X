"""
Generate 320 realistic, high-quality Indian Oil & Gas incident records
spanning 2014 to 2026 across all 6 Oil India Limited installations.
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

TEMPLATES = [
    # Energy Isolation (LOTO)
    ("Energy Isolation", "OISD Safety Alert", "Electrician opened {volt}V motor control center cubicle during shift turnaround without prior lock-out or busbar voltage verification."),
    ("Energy Isolation", "DGMS Inquiry Report", "Maintenance fitter unbolted high-pressure crude export pump casing while suction line valve was closed by hand only without block lock or bleed-off."),
    ("Energy Isolation", "OISD Case Study", "Technician commenced mechanical seal overhaul on LPG booster pump; downstream block valve was unchained and passed 18-bar pressurized propane."),
    ("Energy Isolation", "OISD Safety Alert", "Contract mechanic dismantled hydraulic actuator cylinder without releasing residual {press} bar accumulated hydraulic pressure, causing piston ejection."),
    ("Energy Isolation", "DGMS Inquiry Report", "Fitter loosened flange studs on 6-inch high-pressure gas line believing pipeline was depressurized; 35-bar residual sour gas blew out through gasket gap."),
    ("Energy Isolation", "OISD Safety Alert", "Technician replaced mechanical seal on LPG booster pump without verifying zero energy or chaining suction/discharge manual gate valves."),
    ("Energy Isolation", "DGMS Inquiry Report", "Contract fitter removed bonnet from pressurized crude pipeline strainer without cracking bleed valve to confirm depressurization."),
    ("Energy Isolation", "OISD Case Study", "Electrician opened 440V motor terminal box without testing busbar with voltmeter or locking breaker."),
    ("Energy Isolation", "OISD Safety Alert", "Maintenance crew opened 3300V compressor motor terminal box without zero voltage verification."),
    ("Energy Isolation", "OISD Case Study", "Mechanic unbolted crude export booster pump while electrical breaker had no padlock or tag attached."),

    # Hot Work
    ("Hot Work", "OISD Safety Alert", "Welding sparks from heater tube repair ignited residual heavy fuel oil trapped in adjacent unblanked drainage channel; fire extinguished by portable foam tender."),
    ("Hot Work", "OISD Case Study", "Oxy-acetylene cutting of pipeline support bracket initiated without continuous hydrocarbon gas testing; ambient vapor reached {lel}% LEL near condensate drain."),
    ("Hot Work", "DGMS Inquiry Report", "Welding repair on drilling mud degasser vessel commenced while adjacent shale shaker was actively venting flammable gas pockets without a dedicated fire watch."),
    ("Hot Work", "OISD Safety Alert", "Contractor ignited cutting torch on pipe rack without verifying that nearby sampling drain was plugged, causing localized flash fire on insulation jacket."),
    ("Hot Work", "OISD Case Study", "Grinding sparks showered over open naphtha drainage sump during turnaround pump overhaul; combustible gas testing was omitted prior to hot work permit sign-off."),
    ("Hot Work", "OISD Safety Alert", "Gas torch cutting executed on fuel loading arm structural bracket without continuous combustible gas monitoring; fuel vapors detected at 35% LEL."),
    ("Hot Work", "OISD Case Study", "Welder struck arc on pipe rack directly over unsealed oily water drain; spark shower ignited oil sheen."),
    ("Hot Work", "OISD Safety Alert", "Grinding sparks fell directly into open oily water sewer during heat exchanger bundle overhaul."),
    ("Hot Work", "OISD Safety Alert", "Angle grinding executed near gasoline loading arm without continuous combustible gas detector."),

    # Confined Space Entry
    ("Confined Space Entry", "OISD Case Study", "Two contract cleaners entered crude oil storage tank {tank_no} without continuous mechanical forced ventilation or a designated standby hole-watcher."),
    ("Confined Space Entry", "DGMS Inquiry Report", "Rigger entered nitrogen-purged separator vessel during turnaround inspection without self-contained breathing apparatus (SCBA) or multi-gas atmospheric certification."),
    ("Confined Space Entry", "OISD Safety Alert", "Worker descended into 4-meter underground effluent drainage pit to clear pump blockage without personal H2S gas monitor or emergency tripod retrieval harness."),
    ("Confined Space Entry", "OISD Case Study", "Technician entered glycol contactor tower for internal tray inspection when oxygen level was tested at {o2}%, below mandatory 19.5% statutory threshold."),
    ("Confined Space Entry", "DGMS Inquiry Report", "Contractor entered closed flare knockout drum without checking for pyrophoric iron sulfide scale deposits or continuous LEL monitoring."),
    ("Confined Space Entry", "OISD Case Study", "Two painters entered crude storage tank without continuous mechanical forced ventilation or dedicated standby rescue personnel."),
    ("Confined Space Entry", "OISD Case Study", "Contractor entered nitrogen-purged catalyst vessel during reactor turnaround without supplied-air breathing apparatus or entry permit validation."),
    ("Confined Space Entry", "OISD Case Study", "Worker descended into 4-meter effluent sump to unblock pump suction without personal H2S gas monitor or tripod rescue harness."),
    ("Confined Space Entry", "OISD Case Study", "Contractor entered glycol separator vessel with oxygen reading at 14.8% without respiratory protection."),

    # Safe Mechanical Lifting
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Mobile crane hoisted {tons}-ton Blowout Preventer (BOP) stack across active rig floor while two roughnecks stood inside the red exclusion drop zone."),
    ("Safe Mechanical Lifting", "OISD Safety Alert", "Air tugger wire rope sheared while hoisting 220kg drill collar clamp, dropping the load 3.5 meters onto the cathead deck near workers."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Hydraulic crane boom swung heavy 8-inch pipe spool directly over live pressurized gas line manifold without tag-line guidance or certified lift plan."),
    ("Safe Mechanical Lifting", "OISD Case Study", "Webbing sling used to lift heavy compressor cylinder head had deep cuts and missing inspection tag, failing during transfer to flatbed truck."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Rig mast crown block hoisting cable showed flattened strands and core protrusion exceeding statutory discard criteria during casing pull."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Mobile crane boom touched overhead 11kV electrical power transmission line during rig mobilization; tires caught fire, operator jumped clear."),
    ("Safe Mechanical Lifting", "OISD Safety Alert", "Webbing sling used to hoist heavy mud pump liner showed deep cuts and lacked load rating tag."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Mobile crane lifted 5-ton mud tank section with uncertified shackles and missing safety latch on hook."),
    ("Safe Mechanical Lifting", "DGMS Inquiry Report", "Crane swung 3.5-ton drill collar bundle directly above roughnecks on rig floor."),

    # Line of Fire
    ("Line of Fire", "OISD Safety Alert", "Hydrostatic testing crew stood directly facing 8-inch test manifold blind flange pressurized to {bar} bar without a blast barrier or line-of-fire standoff."),
    ("Line of Fire", "DGMS Inquiry Report", "Floorman stood within the pinch radius between spinning rotary table and manual breakout tongs while breaking drill string tool joints."),
    ("Line of Fire", "OISD Case Study", "High-pressure air hose operating at 12 bar disconnected from pneumatic impact tool due to missing safety whip-check cable, whipping across the deck."),
    ("Line of Fire", "DGMS Inquiry Report", "Rotary breakout tongs counterweight wire rope parted under tension, dropping heavy counterweight within 1 meter of rig floor assistant."),
    ("Line of Fire", "OISD Safety Alert", "Technician tightened leaking flange bolts while pipeline remained under active 60-bar pressure, risking sudden gasket blow-out in worker's face."),
    ("Line of Fire", "DGMS Inquiry Report", "Roughneck was positioned inside the pinch zone between the spinning rotary table and manual backup tongs during drill string breakout."),
    ("Line of Fire", "DGMS Inquiry Report", "Rotary breakout tongs counterweight wire rope sheared, dropping heavy counterweight within 1 meter of rig floor helper."),
    ("Line of Fire", "DGMS Inquiry Report", "Roughneck stood directly in line of tensioned winch wire rope while pulling drill collar onto catwalk."),

    # Working at Height
    ("Working at Height", "DGMS Inquiry Report", "Derrickman slipped on oily monkey board platform at 24 meters elevation; full-body harness lanyard was tied to uncertified handrail rather than certified lifeline."),
    ("Working at Height", "OISD Safety Alert", "Scaffolding erected 10 meters above grade for pipe rack insulation was missing top-rails, mid-rails, and toe-boards on working platform."),
    ("Working at Height", "OISD Case Study", "Contractor traversed unboarded pipe rack steel beams at 8 meters height with twin harness lanyards unhitched from static wire."),
    ("Working at Height", "OISD Safety Alert", "Heavy 36-inch pipe wrench slipped from technician's hands at 14 meters platform elevation without tool tether, landing on ground walkway."),
    ("Working at Height", "DGMS Inquiry Report", "Rig painter worked from suspended boatswain chair without independent secondary safety fall arrester line."),
    ("Working at Height", "DGMS Inquiry Report", "Floorman slipped on grease-covered monkey board platform at 22 meters elevation; harness lanyard was attached to uncertified railing rather than certified lifeline."),
    ("Working at Height", "OISD Safety Alert", "Scaffolders erected 12-meter tube-and-coupler tower for piping inspection without sole plates on loose soil foundation."),
    ("Working at Height", "OISD Safety Alert", "Insulation technician traversed unboarded pipe rack beams 9 meters above grade with twin lanyards unhitched from static wire."),

    # Bypassing Safety Controls
    ("Bypassing Safety Controls", "OISD Case Study", "Instrument technician installed electrical jumper wire across high-level condensate separator trip switch to suppress nuisance alarm during shift change."),
    ("Bypassing Safety Controls", "OISD Safety Alert", "Automated fire deluge valve on LPG bullet mounded storage was isolated and chained shut without formal management of change (MOC) approval."),
    ("Bypassing Safety Controls", "DGMS Inquiry Report", "Field operator wedged wooden wedge under safety relief valve lever on separator vessel to stop continuous chattering under fluctuating pressure."),
    ("Bypassing Safety Controls", "OISD Case Study", "Toxic H2S gas detector alarm head was taped over with plastic wrap during nearby painting work, disabling automated ESD trip system."),
    ("Bypassing Safety Controls", "OISD Safety Alert", "Emergency Shutdown (ESD) push button on crude transfer pump was found with safety glass broken and bypass toggle switch engaged."),
    ("Bypassing Safety Controls", "OISD Case Study", "Field operator tied open safety relief valve bypass lever on separator vessel using G.I. binding wire to silence continuous chattering."),

    # Driving Safety
    ("Driving", "OISD Safety Alert", "Loaded 24-ton petroleum tank truck suffered brake line rupture while descending terminal ramp due to skipped pre-trip mechanical inspection."),
    ("Driving", "DGMS Inquiry Report", "Heavy oilfield tractor-trailer overturned on unpaved rig approach road in heavy monsoon rain due to excessive speed and unbanked mud shoulder."),
    ("Driving", "OISD Safety Alert", "Tank truck driver commenced top-loading operations without connecting electrostatic grounding clamp or overfill optic sensor probe."),
    ("Driving", "OISD Case Study", "Light transport vehicle carrying drilling crew collided with pipeline culvert at night; driver was operating without approved Journey Management Plan."),
    ("Driving", "OISD Safety Alert", "Contractor water bowser reversed inside drilling camp without functional reverse audio alarm or trained banksman guide."),
    ("Driving", "OISD Safety Alert", "Loaded petroleum tank truck suffered brake line failure while descending terminal weighbridge ramp due to inadequate pre-trip inspection."),

    # Work Authorisation / PTW
    ("Work Authorisation", "OISD Safety Alert", "Hydrojetting crew commenced 600-bar high-pressure bundle cleaning on crude preheat exchanger without approved countersigned Permit-to-Work."),
    ("Work Authorisation", "DGMS Inquiry Report", "Night shift crew started hot tie-in welding on gas manifold 4 hours after day-shift permit expired without revalidation or joint gas check."),
    ("Work Authorisation", "OISD Case Study", "Electrical contractor began replacing lighting fixtures in hazardous Zone-1 compressor building without cross-coordination with simultaneous purging operations."),
    ("Work Authorisation", "OISD Safety Alert", "Excavation to 3.2m depth for pipeline repair initiated without underground utility clearance scan or shoring authorization."),
    ("Work Authorisation", "DGMS Inquiry Report", "Contractor dismantled high-pressure wellhead valve assembly without toolbox talk (TBT) or signed Job Safety Analysis (JSA)."),
    ("Work Authorisation", "OISD Safety Alert", "Hydrojetting contractor commenced high-pressure bundle cleaning at 600 bar on crude preheat exchanger without countersigned Permit-to-Work."),

    # Excavation
    ("Excavation", "OISD Case Study", "Pipeline repair trench excavated to 2.8 meters depth in wet clay collapsed partially on south wall; shoring was missing."),
    ("Excavation", "OISD Case Study", "Mechanical excavator bucket struck unmapped 4-inch underground condensate drain pipe during pumping station drainage widening."),
    ("Excavation", "OISD Case Study", "Trench excavated to 3.4m depth for valve replacement lacked shoring or soil slope angle."),

    # Routine / Housekeeping / PPE Compliance / Inspection
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
    ("Facilities", "Internal Plant Log", "Break room refrigerator door gasket is worn and requires replacement."),
    ("Administrative", "Internal Plant Log", "Safety noticeboard had expired training calendar from previous quarter; updated with current schedule."),
    ("Administrative", "Internal Plant Log", "Shift handover logbook page binding was loose; replaced with new registered register.")
]


def generate_320_records():
    records = []
    start_date = datetime(2014, 1, 15)
    end_date = datetime(2026, 5, 20)
    total_days = (end_date - start_date).days

    # Random seed for reproducible, clean chronological distribution
    random.seed(42)

    for i in range(320):
        random_day = int((i / 320.0) * total_days) + random.randint(-10, 10)
        random_day = max(0, min(total_days, random_day))
        rec_date = start_date + timedelta(days=random_day)
        
        facility = random.choice(FACILITIES)
        activity, source, template = random.choice(TEMPLATES)
        
        # Populate template variables if present
        text = template.format(
            volt=random.choice([415, 440, 660, 3300]),
            press=random.choice([120, 140, 160, 180]),
            lel=random.choice([25, 35, 45, 60]),
            tank_no=random.choice(["TK-101", "TK-204", "TK-302", "TK-405"]),
            o2=random.choice([14.5, 15.2, 16.0, 16.8]),
            tons=random.choice([3.5, 4.0, 5.0, 6.5]),
            bar=random.choice([75, 90, 100, 120])
        )
        
        records.append({
            "date": rec_date.strftime("%Y-%m-%d"),
            "site": facility,
            "activity": activity,
            "source": source,
            "report_text": text
        })

    # Sort strictly chronologically
    records.sort(key=lambda x: x["date"])

    # Write out directly to CSV
    os.makedirs(os.path.dirname(CSV_OUTPUT_PATH), exist_ok=True)
    with open(CSV_OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "site", "activity", "source", "report_text"])
        writer.writeheader()
        writer.writerows(records)

    print(f"✅ Generated {len(records)} records in {CSV_OUTPUT_PATH}")

if __name__ == "__main__":
    generate_320_records()
