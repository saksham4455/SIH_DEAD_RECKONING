import asyncio
import io
import logging
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.config import Settings, get_settings

logger = logging.getLogger("backend.storage.object_storage")


class ObjectStorageClient(ABC):
    """Abstract object storage interface supporting S3/MinIO and local fallback."""

    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Upload binary data under the specified storage key."""
        pass

    @abstractmethod
    async def get(self, key: str) -> bytes | None:
        """Retrieve binary bytes for the specified key, or None if not found."""
        pass

    @abstractmethod
    async def stream(self, key: str, chunk_size: int = 64 * 1024) -> AsyncIterator[bytes]:
        """Stream chunks of binary bytes for the specified key."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if an object exists at the specified key."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete object at the specified key. Idempotent (returns True even if already deleted)."""
        pass


class S3Boto3StorageClient(ObjectStorageClient):
    """S3-compatible object storage client using Boto3 (supporting AWS S3 and MinIO)."""

    def __init__(
        self,
        bucket: str,
        endpoint_url: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
        region_name: str = "us-east-1",
    ) -> None:
        self.bucket = bucket
        self.endpoint_url = endpoint_url

        session = boto3.Session()
        self.client = session.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key or "minioadmin",
            aws_secret_access_key=secret_key or "minioadmin",
            region_name=region_name,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )

    def _ensure_bucket(self) -> None:
        """Create bucket if it doesn't exist (helpful for local MinIO startup)."""
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code in {"404", "NoSuchBucket"}:
                try:
                    self.client.create_bucket(Bucket=self.bucket)
                    logger.info("Created missing S3 bucket: %s", self.bucket)
                except Exception as create_err:
                    logger.warning("Could not auto-create bucket %s: %s", self.bucket, create_err)

    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        safe_key = key.lstrip("/")

        def _put():
            self._ensure_bucket()
            self.client.put_object(
                Bucket=self.bucket,
                Key=safe_key,
                Body=data,
                ContentType=content_type,
            )
            return safe_key

        return await asyncio.to_thread(_put)

    async def get(self, key: str) -> bytes | None:
        safe_key = key.lstrip("/")

        def _get():
            try:
                response = self.client.get_object(Bucket=self.bucket, Key=safe_key)
                return response["Body"].read()
            except ClientError as exc:
                if exc.response.get("Error", {}).get("Code") in {"404", "NoSuchKey"}:
                    return None
                logger.warning("Error reading S3 object %s: %s", safe_key, exc)
                return None

        return await asyncio.to_thread(_get)

    async def stream(self, key: str, chunk_size: int = 64 * 1024) -> AsyncIterator[bytes]:
        safe_key = key.lstrip("/")

        def _get_body():
            try:
                response = self.client.get_object(Bucket=self.bucket, Key=safe_key)
                return response["Body"]
            except ClientError as exc:
                if exc.response.get("Error", {}).get("Code") in {"404", "NoSuchKey"}:
                    return None
                raise

        body = await asyncio.to_thread(_get_body)
        if body is None:
            return

        while True:
            chunk = await asyncio.to_thread(body.read, chunk_size)
            if not chunk:
                break
            yield chunk

    async def exists(self, key: str) -> bool:
        safe_key = key.lstrip("/")

        def _head():
            try:
                self.client.head_object(Bucket=self.bucket, Key=safe_key)
                return True
            except ClientError as exc:
                if exc.response.get("Error", {}).get("Code") in {"404", "NoSuchKey"}:
                    return False
                logger.warning("Error checking S3 object %s: %s", safe_key, exc)
                return False

        return await asyncio.to_thread(_head)

    async def delete(self, key: str) -> bool:
        safe_key = key.lstrip("/")

        def _delete():
            try:
                self.client.delete_object(Bucket=self.bucket, Key=safe_key)
                return True
            except ClientError as exc:
                logger.warning("Error deleting S3 object %s: %s", safe_key, exc)
                return False

        return await asyncio.to_thread(_delete)


class LocalStorageClient(ObjectStorageClient):
    """Local filesystem object storage client with path traversal prevention."""

    def __init__(self, base_directory: Path) -> None:
        self.base_dir = base_directory.resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_safe_path(self, key: str) -> Path:
        safe_key = key.lstrip("/").replace("\\", "/")
        target = (self.base_dir / safe_key).resolve()
        if self.base_dir != target and self.base_dir not in target.parents:
            raise ValueError(f"Path traversal detected for storage key: {key}")
        return target

    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        target = self._resolve_safe_path(key)

        def _write():
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            return key.lstrip("/")

        return await asyncio.to_thread(_write)

    async def get(self, key: str) -> bytes | None:
        target = self._resolve_safe_path(key)

        def _read():
            if not target.is_file():
                return None
            return target.read_bytes()

        return await asyncio.to_thread(_read)

    async def stream(self, key: str, chunk_size: int = 64 * 1024) -> AsyncIterator[bytes]:
        target = self._resolve_safe_path(key)
        if not target.is_file():
            return

        def _open_file():
            return open(target, "rb")

        f = await asyncio.to_thread(_open_file)
        try:
            while True:
                chunk = await asyncio.to_thread(f.read, chunk_size)
                if not chunk:
                    break
                yield chunk
        finally:
            await asyncio.to_thread(f.close)

    async def exists(self, key: str) -> bool:
        target = self._resolve_safe_path(key)
        return await asyncio.to_thread(target.is_file)

    async def delete(self, key: str) -> bool:
        target = self._resolve_safe_path(key)

        def _remove():
            if target.is_file():
                target.unlink(missing_ok=True)
            return True

        return await asyncio.to_thread(_remove)


_storage_client: ObjectStorageClient | None = None


def get_storage_client(settings: Settings | None = None) -> ObjectStorageClient:
    """Return the active storage client singleton according to application settings."""
    global _storage_client
    if _storage_client is not None:
        return _storage_client

    cfg = settings or get_settings()
    backend_choice = cfg.storage_backend.lower()

    if backend_choice == "s3" or (backend_choice == "auto" and cfg.s3_endpoint_url):
        logger.info("Initializing S3/MinIO storage client (bucket: %s, endpoint: %s)", cfg.s3_bucket, cfg.s3_endpoint_url)
        _storage_client = S3Boto3StorageClient(
            bucket=cfg.s3_bucket,
            endpoint_url=cfg.s3_endpoint_url,
            access_key=cfg.s3_access_key,
            secret_key=cfg.s3_secret_key,
            region_name=cfg.s3_region,
        )
    else:
        base_path = Path(__file__).resolve().parents[3] / cfg.model_directory
        logger.info("Initializing local filesystem storage client at %s", base_path)
        _storage_client = LocalStorageClient(base_path)

    return _storage_client


def set_storage_client(client: ObjectStorageClient | None) -> None:
    """Override global storage client for testing."""
    global _storage_client
    _storage_client = client
