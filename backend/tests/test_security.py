import os
import sys
from datetime import timedelta

import jwt
import pytest
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import Settings
from app.core.security import (
    create_access_token,
    create_device_token,
    create_refresh_token,
    decode_token,
    derive_device_id_hash,
    hash_password,
    verify_password,
)


def test_password_hashing():
    pwd = "SecretPassword123!"
    hash1 = hash_password(pwd)
    hash2 = hash_password(pwd)

    # Plaintext differs from hash
    assert hash1 != pwd
    # Random bcrypt salt -> same password produces different hashes
    assert hash1 != hash2

    # Correct password verifies
    assert verify_password(pwd, hash1) is True
    assert verify_password(pwd, hash2) is True

    # Incorrect password fails
    assert verify_password("WrongPassword!", hash1) is False


def test_device_id_keyed_hashing():
    raw_id = "device-uuid-abcd-1234"
    secret = "test-jwt-secret-key-123"

    hash_val1 = derive_device_id_hash(raw_id, secret)
    hash_val2 = derive_device_id_hash(raw_id, secret)

    # 64-character hexadecimal SHA-256 digest
    assert len(hash_val1) == 64
    # Deterministic -> same raw ID + secret produces identical hash
    assert hash_val1 == hash_val2

    # Different raw ID produces different hash
    assert derive_device_id_hash("different-device", secret) != hash_val1


def test_jwt_token_lifecycle():
    settings = Settings(jwt_secret="super-secret-key", jwt_algorithm="HS256")

    # Access Token
    access_token = create_access_token("user-123", "admin", settings)
    decoded_access = decode_token(access_token, settings)
    assert decoded_access["sub"] == "user-123"
    assert decoded_access["role"] == "admin"
    assert decoded_access["type"] == "access"
    assert decoded_access["identity"] == "user"

    # Refresh Token
    refresh_token = create_refresh_token("user-123", settings)
    decoded_refresh = decode_token(refresh_token, settings)
    assert decoded_refresh["sub"] == "user-123"
    assert decoded_refresh["type"] == "refresh"
    assert decoded_refresh["identity"] == "user"

    # Device Token
    device_token = create_device_token("device-456", settings)
    decoded_device = decode_token(device_token, settings)
    assert decoded_device["sub"] == "device-456"
    assert decoded_device["type"] == "access"
    assert decoded_device["identity"] == "device"


def test_jwt_token_rejections():
    settings = Settings(jwt_secret="super-secret-key", jwt_algorithm="HS256")

    # Expired token rejection
    expired_token = create_access_token("user-123", "user", settings, expires_delta=timedelta(seconds=-10))
    with pytest.raises(HTTPException) as exc:
        decode_token(expired_token, settings)
    assert exc.value.status_code == 401
    assert "Token has expired" in exc.value.detail

    # Invalid signature rejection
    wrong_settings = Settings(jwt_secret="wrong-secret-key", jwt_algorithm="HS256")
    with pytest.raises(HTTPException) as exc:
        decode_token(access_token := create_access_token("user-123", "user", settings), wrong_settings)
    assert exc.value.status_code == 401
    assert "Invalid authentication token" in exc.value.detail

    # Malformed token rejection
    with pytest.raises(HTTPException) as exc:
        decode_token("not.a.valid.jwt.string", settings)
    assert exc.value.status_code == 401
