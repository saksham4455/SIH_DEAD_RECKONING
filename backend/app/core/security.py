import hashlib
import logging
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.core.database import get_db
from app.models.device import Device
from app.models.user import User

logger = logging.getLogger("backend.security")

security_scheme = HTTPBearer(auto_error=False)


# --- Legacy Security Support ---
def require_api_key(settings: Settings = Depends(get_settings), x_api_key: str | None = Header(default=None)) -> None:
    if settings.api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


# --- Password Hashing & Verification ---
def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with a unique salt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


# --- Deterministic Keyed Device Hashing ---
def derive_device_id_hash(raw_device_id: str, jwt_secret: str) -> str:
    """Derive deterministic 64-char SHA-256 hex digest from raw device ID and JWT secret.
    
    Never log or return the raw device ID.
    """
    if not jwt_secret:
        raise ValueError("JWT secret is required to derive device ID hash")
    combined = (raw_device_id + jwt_secret).encode("utf-8")
    return hashlib.sha256(combined).hexdigest()


# --- JWT Token Lifecycle ---
def get_secret_key(settings: Settings) -> str:
    if not settings.jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication disabled or SIH_JWT_SECRET is not configured.",
        )
    return settings.jwt_secret


def create_access_token(user_id: str, role: str, settings: Settings, expires_delta: timedelta | None = None) -> str:
    secret = get_secret_key(settings)
    expire_minutes = settings.jwt_expire_minutes if expires_delta is None else int(expires_delta.total_seconds() / 60)
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=expire_minutes))
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "identity": "user",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: str, settings: Settings, expires_delta: timedelta | None = None) -> str:
    secret = get_secret_key(settings)
    expire_minutes = settings.jwt_refresh_expire_minutes if expires_delta is None else int(expires_delta.total_seconds() / 60)
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=expire_minutes))
    payload = {
        "sub": user_id,
        "type": "refresh",
        "identity": "user",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def create_device_token(device_id: str, settings: Settings, expires_delta: timedelta | None = None) -> str:
    secret = get_secret_key(settings)
    expire_minutes = settings.device_token_expire_minutes if expires_delta is None else int(expires_delta.total_seconds() / 60)
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=expire_minutes))
    payload = {
        "sub": device_id,
        "type": "access",
        "identity": "device",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str, settings: Settings) -> dict:
    secret = get_secret_key(settings)
    try:
        return jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- FastAPI Authorization Dependencies ---
async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials, settings)
    if payload.get("type") != "access" or payload.get("identity") != "user":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for user authentication",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account does not exist or is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_device(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> Device:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials, settings)
    if payload.get("type") != "access" or payload.get("identity") != "device":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for device authentication",
            headers={"WWW-Authenticate": "Bearer"},
        )

    device_id = payload.get("sub")
    if not device_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    stmt = select(Device).where(Device.id == device_id)
    res = await db.execute(stmt)
    device = res.scalar_one_or_none()

    if device is None or not device.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device is not registered or is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Touch last_seen_at timestamp asynchronously
    device.last_seen_at = datetime.now(timezone.utc)
    await db.commit()
    return device


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource",
        )
    return current_user
