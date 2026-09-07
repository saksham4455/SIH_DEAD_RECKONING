import asyncio
import getpass
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.core.database import startup_db_client, shutdown_db_client, get_db
from app.core.security import hash_password
from app.models.user import User


async def create_admin():
    print("==================================================")
    print("   SIH Dead Reckoning - Admin Bootstrap CLI      ")
    print("==================================================")

    username = input("Enter admin username: ").strip()
    if not username:
        print("Error: Username cannot be empty.")
        sys.exit(1)

    password = getpass.getpass("Enter admin password: ")
    confirm_password = getpass.getpass("Confirm admin password: ")

    if password != confirm_password:
        print("Error: Passwords do not match.")
        sys.exit(1)

    if len(password) < 6:
        print("Error: Password must be at least 6 characters long.")
        sys.exit(1)

    await startup_db_client()

    try:
        async for db in get_db():
            stmt = select(User).where(User.username == username)
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()

            if existing is not None:
                print(f"Error: User with username '{username}' already exists.")
                sys.exit(1)

            pwd_hash = hash_password(password)
            admin_user = User(
                username=username,
                password_hash=pwd_hash,
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            await db.commit()
            print(f"Successfully created admin user: {username}")
            break
    finally:
        await shutdown_db_client()


if __name__ == "__main__":
    asyncio.run(create_admin())
