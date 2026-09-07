import os
import sys

import httpx
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app.core.database
from app.config import Settings, get_settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password
from app.main import create_app
from app.models.base import Base
from app.models.user import User
from geoalchemy2.admin.dialects import sqlite as geo_sqlite

geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None


@pytest_asyncio.fixture
async def test_env():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    test_settings = Settings(jwt_secret="test-secret-key-123456789")

    # Seed admin and standard user
    async with factory() as db:
        admin = User(
            username="adminuser",
            password_hash=hash_password("AdminPass123!"),
            role="admin",
            is_active=True,
        )
        norm_user = User(
            username="standarduser",
            password_hash=hash_password("UserPass123!"),
            role="user",
            is_active=True,
        )
        inactive_user = User(
            username="disableduser",
            password_hash=hash_password("UserPass123!"),
            role="user",
            is_active=False,
        )
        db.add_all([admin, norm_user, inactive_user])
        await db.commit()

    async def override_get_db():
        async with factory() as session:
            yield session

    async def override_get_settings():
        return test_settings

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = override_get_settings

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, factory, test_settings

    await engine.dispose()


@pytest.mark.asyncio
async def test_user_login_success_and_failure(test_env):
    client, _, _ = test_env

    # Valid Login
    res = await client.post("/api/v1/auth/login", json={"username": "standarduser", "password": "UserPass123!"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

    # Invalid Password -> Generic 401
    bad_pwd = await client.post("/api/v1/auth/login", json={"username": "standarduser", "password": "WrongPassword"})
    assert bad_pwd.status_code == 401
    assert bad_pwd.json()["error"]["message"] == "Invalid username or password"

    # Nonexistent User -> Generic 401
    bad_user = await client.post("/api/v1/auth/login", json={"username": "nonexistent", "password": "UserPass123!"})
    assert bad_user.status_code == 401
    assert bad_user.json()["error"]["message"] == "Invalid username or password"

    # Inactive User -> Generic 401
    dis_res = await client.post("/api/v1/auth/login", json={"username": "disableduser", "password": "UserPass123!"})
    assert dis_res.status_code == 401
    assert dis_res.json()["error"]["message"] == "Invalid username or password"



@pytest.mark.asyncio
async def test_auth_me_endpoint(test_env):
    client, _, _ = test_env

    # 1. Unauthenticated -> 401
    unauth = await client.get("/api/v1/auth/me")
    assert unauth.status_code == 401

    # 2. Login & get token
    login_res = await client.post("/api/v1/auth/login", json={"username": "standarduser", "password": "UserPass123!"})
    token = login_res.json()["access_token"]

    # 3. Authenticated -> 200 OK
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["username"] == "standarduser"
    assert user_data["role"] == "user"
    assert "password_hash" not in user_data


@pytest.mark.asyncio
async def test_refresh_token_flow(test_env):
    client, _, _ = test_env

    login_res = await client.post("/api/v1/auth/login", json={"username": "standarduser", "password": "UserPass123!"})
    refresh_token = login_res.json()["refresh_token"]

    # 1. Valid Refresh -> New Access Token
    ref_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    assert "access_token" in ref_res.json()

    # 2. Access Token used as Refresh Token -> Rejected
    access_token = login_res.json()["access_token"]
    bad_ref = await client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
    assert bad_ref.status_code == 401
