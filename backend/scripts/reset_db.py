"""
Script to wipe the SQLite database and reset to 0 records.

Run with:
    python -m scripts.reset_db
"""

import sys
import os

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import clear_database, get_dashboard_stats

if __name__ == "__main__":
    print("🧹 Wiping SQLite database (sif_reports.db)...")
    clear_database()
    stats = get_dashboard_stats()
    print(f"✅ Database reset successfully! Total records: {stats['total_reports']}")
