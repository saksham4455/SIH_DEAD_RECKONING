from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Registered username")
    password: str = Field(..., min_length=1, description="Account password")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT refresh token")


class DeviceRegisterRequest(BaseModel):
    device_id: str = Field(..., min_length=1, description="Hardware device identifier string")


class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    registered_at: datetime
    last_seen_at: datetime
    is_active: bool
    pinned_model_version_id: str | None = None
    access_token: str | None = None


class DeviceAdminUpdate(BaseModel):
    is_active: bool | None = None
    pinned_model_version_id: str | None = None
