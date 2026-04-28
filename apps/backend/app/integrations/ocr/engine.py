import os
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image
from pillow_heif import register_heif_opener

from app.core.config import get_settings
from app.integrations.ocr.parser import build_extracted_payload
from app.integrations.r2.client import R2Client

register_heif_opener()

_SETTINGS = get_settings()
_STORAGE_ROOT = Path(__file__).resolve().parents[3] / _SETTINGS.LOCAL_STORAGE_DIR
_PADDLE_HOME = _STORAGE_ROOT / "paddle-home"
_PADDLEX_CACHE_HOME = _STORAGE_ROOT / "paddlex"

_PADDLE_HOME.mkdir(parents=True, exist_ok=True)
_PADDLEX_CACHE_HOME.mkdir(parents=True, exist_ok=True)

os.environ["PADDLE_PDX_CACHE_HOME"] = str(_PADDLEX_CACHE_HOME)
os.environ["PADDLE_HOME"] = str(_PADDLE_HOME)
os.environ["HOME"] = str(_PADDLE_HOME)
os.environ["USERPROFILE"] = str(_PADDLE_HOME)
os.environ["XDG_CACHE_HOME"] = str(_PADDLE_HOME)
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

from paddleocr import PaddleOCR


OCR_MAX_SIDE = 2048
PADDLE_ENGINE_CONFIG = {
    "paddle_static": {
        "run_mode": "paddle",
        "cpu_threads": 4,
        "enable_new_ir": False,
        "enable_cinn": False,
    }
}


@lru_cache
def get_paddleocr_reader() -> PaddleOCR:
    return PaddleOCR(
        lang="korean",
        ocr_version="PP-OCRv5",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        device="cpu",
        engine="paddle",
        enable_mkldnn=False,
        enable_cinn=False,
        engine_config=PADDLE_ENGINE_CONFIG,
    )


def _average_axis(points: object, axis: int) -> float:
    point_array = np.asarray(points)
    if point_array.ndim != 2 or point_array.shape[1] != 2:
        return 0.0
    return float(point_array[:, axis].mean())


class OcrEngine:
    def __init__(self) -> None:
        self.reader = get_paddleocr_reader()
        self.r2_client = R2Client()

    def _load_ocr_input(self, image_path: Path) -> np.ndarray:
        with Image.open(image_path) as image:
            rgb_image = image.convert("RGB")
            rgb_image.thumbnail((OCR_MAX_SIDE, OCR_MAX_SIDE))
            return np.array(rgb_image)

    def _extract_text_lines(self, result: object) -> list[str]:
        rec_texts = list(result.get("rec_texts") or [])
        rec_scores = list(result.get("rec_scores") or [])
        rec_polys = list(result.get("rec_polys") or [])

        entries: list[tuple[float, float, str]] = []
        for index, text in enumerate(rec_texts):
            normalized = str(text).strip()
            if not normalized:
                continue

            score = float(rec_scores[index]) if index < len(rec_scores) else 0.0
            if score < 0.2:
                continue

            poly = rec_polys[index] if index < len(rec_polys) else None
            top = _average_axis(poly, 1) if poly is not None else float(index)
            left = _average_axis(poly, 0) if poly is not None else 0.0
            entries.append((top, left, normalized))

        entries.sort(key=lambda item: (round(item[0] / 24), item[0], item[1]))
        return [text for _, _, text in entries]

    def extract_from_object(self, object_key: str) -> dict:
        image_path = self.r2_client.get_local_path(object_key)
        ocr_input = self._load_ocr_input(image_path)
        results = self.reader.predict(
            ocr_input,
            text_det_limit_side_len=OCR_MAX_SIDE,
        )

        first_result = results[0] if results else {}
        text_lines = self._extract_text_lines(first_result)
        raw_text = "\n".join(text_lines)

        payload = build_extracted_payload(text_lines, raw_text)
        payload["engine"] = "paddleocr"
        payload["engine_result_count"] = len(text_lines)
        return payload
