from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.core.database import get_db
from app.core.security import create_device_token, derive_device_id_hash, require_admin
from app.models.device import Device
from app.models.model_version import ModelVersion
from app.schemas.auth_schema import DeviceAdminUpdate, DeviceOut, DeviceRegisterRequest

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/register", response_model=DeviceOut, status_code=status.HTTP_200_OK)
async def register_device(
    payload: DeviceRegisterRequest,
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> DeviceOut:
    """Register or refresh hardware device registration using deterministic SHA-256 keyed device ID hash.
    
    Raw device ID is immediately hashed and never stored or returned.
    """
    if not settings.jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication configuration missing: SIH_JWT_SECRET required",
        )

    device_hash = derive_device_id_hash(payload.device_id, settings.jwt_secret)

    stmt = select(Device).where(Device.device_id_hash == device_hash)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if device is None:
        device = Device(
            device_id_hash=device_hash,
            registered_at=now,
            last_seen_at=now,
            is_active=True,
        )
        db.add(device)
    else:
        device.last_seen_at = now

    await db.commit()
    await db.refresh(device)

    if not device.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device account has been deactivated by administrator",
        )

    access_token = create_device_token(device.id, settings)

    return DeviceOut(
        id=device.id,
        registered_at=device.registered_at,
        last_seen_at=device.last_seen_at,
        is_active=device.is_active,
        pinned_model_version_id=device.pinned_model_version_id,
        access_token=access_token,
    )


@router.get("", response_model=list[DeviceOut])
async def list_devices(
    admin_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[DeviceOut]:
    """List registered devices (Admin privileges required)."""
    stmt = select(Device).order_by(Device.registered_at.desc())
    result = await db.execute(stmt)
    devices = result.scalars().all()
    return [DeviceOut.model_validate(d) for d in devices]


@router.patch("/{device_id}", response_model=DeviceOut)
async def update_device(
    device_id: str,
    payload: DeviceAdminUpdate,
    admin_user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> DeviceOut:
    """Update device activation status or pinned model version (Admin privileges required)."""
    stmt = select(Device).where(Device.id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()

    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    if payload.pinned_model_version_id is not None:
        model_stmt = select(ModelVersion).where(ModelVersion.id == payload.pinned_model_version_id)
        model_res = await db.execute(model_stmt)
        model_ver = model_res.scalar_one_or_none()
        if model_ver is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model version '{payload.pinned_model_version_id}' does not exist",
            )
        device.pinned_model_version_id = payload.pinned_model_version_id

    if payload.is_active is not None:
        device.is_active = payload.is_active

    await db.commit()
    await db.refresh(device)
    return DeviceOut.model_validate(device)
