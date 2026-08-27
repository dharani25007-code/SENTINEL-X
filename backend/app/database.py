"""
Database module for SIF Sentinel.

Uses SQLite with WAL mode for lightweight, fast, zero-dependency persistence.
Stores all classified safety reports, verdicts, IOGP tags, explanations, and
provides aggregated analytics for the executive dashboard and pattern intelligence.
"""

import os
import json
import sqlite3
import random
from datetime import datetime, timedelta
from typing import Optional, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "sif_reports.db")
SEED_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "synthetic_reports.jsonl")


def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


def init_db(auto_seed: bool = False):
    conn = get_db_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_text TEXT NOT NULL,
                verdict TEXT NOT NULL,
                confidence REAL NOT NULL,
                reasoning TEXT,
                iogp_rule TEXT,
                iogp_rule_confidence REAL,
                explanation TEXT,
                site TEXT,
                activity TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_verdict ON reports(verdict);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_iogp_rule ON reports(iogp_rule);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_site ON reports(site);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON reports(created_at);")

    if auto_seed:
        cursor = conn.execute("SELECT COUNT(*) as count FROM reports;")
        count = cursor.fetchone()["count"]
        if count == 0:
            _seed_realistic_oil_data(conn)
            conn.commit()

    conn.close()


def clear_database():
    """Wipe all reports and reset DBMS to 0 records."""
    conn = get_db_connection()
    with conn:
        conn.execute("DELETE FROM reports;")
        conn.execute("DELETE FROM sqlite_sequence WHERE name='reports';")
    conn.execute("VACUUM;")
    conn.close()


def reseed_database():
    """Reseed the realistic OIL dataset."""
    conn = get_db_connection()
    with conn:
        conn.execute("DELETE FROM reports;")
        _seed_realistic_oil_data(conn)
        conn.commit()
    conn.close()


REALISTIC_SCENARIOS = {
    "Work Authorisation": [
        "Contractor crew commenced hot tie-in welding on separator gas line without obtaining a valid Work Authorisation or isolation certificate.",
        "Electrical sub-contractor entered 33kV substation switchgear room and opened live panel without signed Permit-to-Work from area authority.",
        "Maintenance team began high-pressure hydro-blasting inside crude storage tank without valid atmospheric gas clearance permit.",
        "Piping modification work started on flare header line before permit was formally countersigned by shift superintendent.",
        "Contractor heavy vehicle entered hazardous zone without valid hot work vehicle entry permit."
    ],
    "Energy Isolation": [
        "Technician replaced mechanical seal on high-pressure crude export pump without verifying zero hydraulic energy or applying LOTO locks.",
        "Valves on fuel gas header were closed with handwheel only; no physical lock or blind flange installed prior to piping disassembly.",
        "Electrician working on motor control center circuit breaker without tagging out the upstream supply breaker.",
        "Instrument fitter disconnected pneumatic actuator on emergency shutdown valve while the gas line remained under 80 bar pressure.",
        "Maintenance crew unbolted flange on steam line without checking bleed valve for residual thermal pressure."
    ],
    "Hot Work": [
        "Welder observed grinding steel support frame 2.5 meters from open hydrocarbon condensate drain with flammable vapor smell present.",
        "Torch cutting operation conducted on crude manifold without dedicated fire watch or spark containment blanket deployed.",
        "Contractor performing welding on diesel tank skirt without continuous atmospheric LEL gas monitoring.",
        "Open-flame brazing carried out adjacent to natural gas compressor skid during active gas compression.",
        "Hot work permit was expired by 3 hours while cutting torch operations continued near fuel storage bund."
    ],
    "Confined Space": [
        "Two workers entered crude slop tank for desludging without calibrated 4-gas atmosphere testing or external standby rescue attendant.",
        "Entry into nitrogen-purged separator vessel occurred while entry permit was expired and forced-air ventilation was offline.",
        "Contractor climbed into 4-meter valve pit with potential H2S accumulation without wearing a personal gas detector.",
        "Cleaning crew entered underground drainage sump without tripod rescue harness or positive communication protocol.",
        "Worker entered water storage tank after internal epoxy painting without verifying volatile solvent vapor levels had dispersed."
    ],
    "Safe Mechanical Lifting": [
        "Crane hoisted 4.2-ton blowout preventer assembly directly over active production manifold while rig crew stood in the drop zone.",
        "Rigging sling showed frayed steel strands and kink damage exceeding safety discard limits during lifting of 3-ton drill collar string.",
        "Mobile crane operated near overhead 11kV power line without dedicated banksman / signalperson or physical clearance limiters.",
        "Lifting tandem operation performed on 12-meter spool piece without an approved critical lift plan or ground stability check.",
        "Load shifted unexpectedly during crane lift due to incorrect center-of-gravity rigging; tag line was not utilized."
    ],
    "Line of Fire": [
        "Roughneck stood in the direct swivel arc while high-torque makeup tongs were engaged on high-pressure drill string.",
        "Hydrostatic pressure testing at 5,000 PSI conducted on manifold without barricading the test danger perimeter or warning signs.",
        "Technician positioned body directly in front of pressurized filter housing cap while unbolting retaining clamps.",
        "Worker walked between moving excavator counterweight and concrete retaining wall with blind spot hazard.",
        "Winch cable tensioned under heavy load while crew member stepped over the active wire rope line."
    ],
    "Working at Height": [
        "Scaffolder working at 18 meters on derrick mast unclipped safety harness lanyard while moving between deck boards.",
        "Contractor climbed external caged ladder on degassing tower carrying 15kg toolbox in hand, failing 3-point contact.",
        "Work performed on fragile roof sheeting over compressor house without crawl boards or fall-arrest safety nets installed.",
        "Painter leaned over handrail on elevated offshore-style walkway at 12m height without dual lanyard connection.",
        "Unsecured scaffolding plank shifted under worker's foot on separator access tower, creating immediate fall risk."
    ],
    "Driving": [
        "Crude road tanker observed traveling at 68 km/h on unpaved gravel access road near well pad during dense morning fog.",
        "Field pickup truck driver operating mobile phone while reversing near high-pressure gas gathering manifold.",
        "Heavy transport truck transporting drill pipe without adequate load strapping or red flag escort vehicle.",
        "Driver failed to perform pre-trip brake inspection on water tanker; vehicle experienced brake fade on plant access slope.",
        "Passenger in field utility vehicle was not wearing seatbelt while traveling across rough terrain wellhead roads."
    ],
    "Bypassing Safety Controls": [
        "Operator jumpered high-level emergency shutdown sensor on condensate separator to prevent automated plant trip during peak production.",
        "Emergency Shutdown (ESD) push button on drilling floor was mechanically wedged open to prevent nuisance tripping.",
        "Safety relief valve on gas line was isolated with closed inlet block valve without an authorized lock-open device.",
        "Flame detector optical sensor was covered with rag to avoid spurious alarm during nearby painting activities.",
        "Pressure safety interlock on booster compressor bypassed during startup without formal Management of Change (MOC)."
    ]
}

ROUTINE_SCENARIOS = [
    "Discarded cardboard packaging and empty plastic sealant containers left near perimeter walkway of administration building, presenting minor housekeeping hazard.",
    "Minor engine oil drip observed under stationary air compressor skid; absorbent drip tray placed immediately by technician.",
    "Safety eyewash station monthly inspection tag was missing the current month's sign-off stamp; inspected and updated by HSE officer.",
    "Contractor observed wearing safety glasses without side shields inside workshop area; standard compliant safety glasses issued.",
    "Loose handrail bolt identified on low ground-level walkway stairway; tightened immediately with hand wrench.",
    "Emergency exit sign bulb was flickering in the electrical storage warehouse; work order submitted to electrician for replacement.",
    "Water cooler drip tray was overflowing in contractor rest shelter, creating slippery floor patch; cleaned and mopped.",
    "Temporary extension cord across site office hallway had floor cable protector missing; rubber protector installed immediately.",
    "Spill response kit cabinet in workshop was missing one box of absorbent wipes; replenished from main stores.",
    "Fire extinguisher pressure gauge showed slightly below optimal green zone; replaced with fresh certified unit from stock."
]


def _seed_realistic_oil_data(conn: sqlite3.Connection):
    now = datetime.now()
    sites = [
        "Duliajan Central Complex",
        "Digboi Refinery Unit #2",
        "Moran Drilling Rig #4",
        "Naharkatiya Gas Plant",
        "Pipeline Pump Station 7",
        "Numaligarh Terminal"
    ]

    # Seed 240 realistic Oil & Gas observations across the past 12 months (~22% SIF rate)
    for i in range(240):
        days_ago = random.randint(1, 365)
        hours_ago = random.randint(0, 23)
        created = now - timedelta(days=days_ago, hours=hours_ago)
        site = random.choice(sites)

        is_sif = random.random() < 0.23  # ~22-23% authentic DEKRA SIF rate

        if is_sif:
            rule_name = random.choice(list(REALISTIC_SCENARIOS.keys()))
            report_text = random.choice(REALISTIC_SCENARIOS[rule_name])
            verdict = "SIF-potential"
            confidence = round(random.uniform(0.86, 0.98), 2)
            iogp_rule = rule_name
            rule_conf = round(random.uniform(0.82, 0.96), 2)
            reasoning = f"High-energy precursor involving {rule_name} controls at {site}. Inadequate barrier integrity creates catastrophic potential."
        else:
            report_text = random.choice(ROUTINE_SCENARIOS)
            verdict = "routine"
            confidence = round(random.uniform(0.88, 0.99), 2)
            iogp_rule = None
            rule_conf = None
            reasoning = f"Low-severity administrative / housekeeping observation at {site}. No fatal energy pathway identified."

        conn.execute("""
            INSERT INTO reports (report_text, verdict, confidence, reasoning, iogp_rule, 
                                 iogp_rule_confidence, site, activity, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_text,
            verdict,
            confidence,
            reasoning,
            iogp_rule,
            rule_conf,
            site,
            iogp_rule if is_sif else "Housekeeping",
            created.isoformat(),
        ))


def save_report(*args, **kwargs) -> int:
    if args and isinstance(args[0], dict):
        report_data = args[0]
    else:
        report_data = kwargs

    conn = get_db_connection()
    with conn:
        cursor = conn.execute("""
            INSERT INTO reports (
                report_text, verdict, confidence, reasoning,
                iogp_rule, iogp_rule_confidence, explanation,
                site, activity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_data.get("report_text"),
            report_data.get("verdict"),
            report_data.get("confidence"),
            report_data.get("reasoning"),
            report_data.get("iogp_rule"),
            report_data.get("iogp_rule_confidence"),
            json.dumps(report_data.get("explanation")) if isinstance(report_data.get("explanation"), (dict, list)) else report_data.get("explanation"),
            report_data.get("site"),
            report_data.get("activity"),
        ))
        report_id = cursor.lastrowid
    conn.close()
    return report_id


def get_reports(
    verdict: Optional[str] = None,
    site: Optional[str] = None,
    rule: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    conn = get_db_connection()
    query = "SELECT * FROM reports WHERE 1=1"
    params = []

    if verdict:
        query += " AND verdict = ?"
        params.append(verdict)
    if site:
        query += " AND site = ?"
        params.append(site)
    if rule:
        query += " AND iogp_rule = ?"
        params.append(rule)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor = conn.execute(query, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()

    for r in rows:
        if r.get("explanation"):
            try:
                r["explanation"] = json.loads(r["explanation"])
            except Exception:
                pass

    return rows


def get_dashboard_stats() -> dict[str, Any]:
    conn = get_db_connection()

    cursor = conn.execute("SELECT COUNT(*) as total FROM reports;")
    total = cursor.fetchone()["total"]

    cursor = conn.execute("SELECT COUNT(*) as sif_count FROM reports WHERE verdict = 'SIF-potential';")
    sif_count = cursor.fetchone()["sif_count"]

    routine_count = total - sif_count
    sif_density = round((sif_count / total * 100), 1) if total > 0 else 0

    cursor = conn.execute("""
        SELECT iogp_rule, COUNT(*) as count 
        FROM reports 
        WHERE verdict = 'SIF-potential' AND iogp_rule IS NOT NULL
        GROUP BY iogp_rule 
        ORDER BY count DESC;
    """)
    by_rule = [{"rule": row["iogp_rule"], "count": row["count"]} for row in cursor.fetchall()]

    cursor = conn.execute("""
        SELECT site, 
               COUNT(*) as total,
               SUM(CASE WHEN verdict = 'SIF-potential' THEN 1 ELSE 0 END) as sif_count
        FROM reports 
        WHERE site IS NOT NULL
        GROUP BY site 
        ORDER BY sif_count DESC;
    """)
    by_site = []
    for row in cursor.fetchall():
        site_total = row["total"]
        site_sif = row["sif_count"]
        density = round((site_sif / site_total * 100), 1) if site_total > 0 else 0
        by_site.append({
            "site": row["site"],
            "total": site_total,
            "sif_count": site_sif,
            "sif_density": density,
        })

    high_risk_sites = sum(1 for s in by_site if s["sif_density"] > 25.0)

    cursor = conn.execute("""
        SELECT strftime('%Y-%m', created_at) as month,
               COUNT(*) as total,
               SUM(CASE WHEN verdict = 'SIF-potential' THEN 1 ELSE 0 END) as sif_count
        FROM reports 
        GROUP BY month 
        ORDER BY month ASC;
    """)
    trend = [{"month": row["month"], "total": row["total"], "sif_count": row["sif_count"]} for row in cursor.fetchall()]

    conn.close()

    return {
        "total_reports": total,
        "sif_count": sif_count,
        "routine_count": routine_count,
        "sif_density": sif_density,
        "high_risk_sites": high_risk_sites,
        "by_rule": by_rule,
        "by_site": by_site,
        "trend": trend,
    }


def get_precursor_patterns() -> list[dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.execute("""
        SELECT site, activity, iogp_rule as rule, 
               COUNT(*) as count,
               AVG(confidence) as avg_confidence
        FROM reports 
        WHERE verdict = 'SIF-potential' AND site IS NOT NULL AND iogp_rule IS NOT NULL
        GROUP BY site, activity, iogp_rule
        HAVING count >= 2
        ORDER BY count DESC
        LIMIT 10;
    """)
    patterns = [
        {
            "site": row["site"],
            "activity": row["activity"],
            "rule": row["rule"],
            "count": row["count"],
            "avg_confidence": round(row["avg_confidence"], 2),
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return patterns


get_patterns = get_precursor_patterns

