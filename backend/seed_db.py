"""Run this script to create and seed the SQLite database."""

import os
import sqlite3
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "mentions.db"
SEED_PATH = BACKEND_DIR.parent / "seed_data.sql"


def seed() -> None:
    if DB_PATH.exists():
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    with SEED_PATH.open(encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.close()

    print(f"Database created at {DB_PATH}")

    # Verify
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT COUNT(*) FROM mentions").fetchone()
    count = row[0] if row is not None else 0
    print(f"Seeded {count} mention records")
    conn.close()


if __name__ == "__main__":
    seed()
