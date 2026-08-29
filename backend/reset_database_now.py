import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "app", "data", "sif_reports.db")

print(f"Connecting to {DB_PATH}...")
conn = sqlite3.connect(DB_PATH)
conn.execute("DELETE FROM reports;")
try:
    conn.execute("DELETE FROM sqlite_sequence WHERE name='reports';")
except Exception:
    pass
conn.commit()
conn.execute("VACUUM;")

cursor = conn.execute("SELECT COUNT(*) FROM reports;")
count = cursor.fetchone()[0]
print(f"✅ Success! Reports in database now: {count}")
conn.close()
