from typing import Any

def success_response(data: Any, meta: dict | None = None) -> dict:
    return {
        "success": True,
        "data": data,
        "meta": meta or {},
    }