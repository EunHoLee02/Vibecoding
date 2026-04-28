import uuid
from pathlib import Path

from app.core.config import get_settings


class R2Client:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def _storage_root(self) -> Path:
        root = Path(__file__).resolve().parents[3] / self.settings.LOCAL_STORAGE_DIR
        root.mkdir(parents=True, exist_ok=True)
        return root

    def build_object_key(self, user_id: str, file_name: str) -> str:
        return f"ocr/{user_id}/{uuid.uuid4()}-{file_name}"

    def _resolve_local_path(self, object_key: str) -> Path:
        safe_parts = [part for part in Path(object_key).parts if part not in {"..", "."}]
        return self._storage_root.joinpath(*safe_parts)

    def create_presigned_upload_url(
        self,
        object_key: str,
        mime_type: str,
        ocr_job_id: str | None = None,
    ) -> str:
        if ocr_job_id is None:
            raise ValueError("ocr_job_id is required for local upload URLs.")

        return (
            f"{self.settings.BACKEND_PUBLIC_BASE_URL}/api/v1/ocr/jobs/"
            f"{ocr_job_id}/file?content_type={mime_type}"
        )

    def upload_object(
        self,
        object_key: str,
        content: bytes,
    ) -> None:
        path = self._resolve_local_path(object_key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def object_exists(self, object_key: str) -> bool:
        return self._resolve_local_path(object_key).exists()

    def get_local_path(self, object_key: str) -> Path:
        path = self._resolve_local_path(object_key)
        if not path.exists():
            raise FileNotFoundError(f"Stored object was not found: {object_key}")
        return path

    def delete_object(self, object_key: str) -> None:
        path = self._resolve_local_path(object_key)
        if path.exists():
            path.unlink()
