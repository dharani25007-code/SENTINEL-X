"""
Instantly populate balanced, realistic 12-month enterprise safety telemetry into SQLite.
Produces realistic monthly curves (18-30 observations/month with ~22% SIF density).
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import reseed_database, get_dashboard_stats

def main():
    print("=" * 65)
    print("⚡ POPULATING BALANCED 12-MONTH ENTERPRISE SAFETY TELEMETRY")
    print("=" * 65)
    
    reseed_database()
    stats = get_dashboard_stats()
    
    print("✅ Successfully populated database!")
    print(f"📊 Total Field Observations : {stats['total_reports']}")
    print(f"🔴 SIF Precursors Detected  : {stats['sif_count']} ({stats['sif_density']}%)")
    print(f"🟢 Routine Observations     : {stats['routine_count']}")
    print(f"🏭 High Risk Sites          : {stats['high_risk_sites']}")
    print("=" * 65)
    print("🌐 Refresh http://localhost:5173 to view clean, smooth curves!")
    print("=" * 65)

if __name__ == "__main__":
    main()
