import json
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "prototype.sqlite3"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (
                analysis_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def save_analysis(analysis_id: str, status: str, payload: dict) -> None:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO analyses (analysis_id, status, payload_json)
            VALUES (?, ?, ?)
            """,
            (analysis_id, status, json.dumps(payload, ensure_ascii=False)),
        )
        connection.commit()


def load_analysis(analysis_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT payload_json FROM analyses WHERE analysis_id = ?",
            (analysis_id,),
        ).fetchone()

    if row is None:
        return None

    return json.loads(row["payload_json"])
