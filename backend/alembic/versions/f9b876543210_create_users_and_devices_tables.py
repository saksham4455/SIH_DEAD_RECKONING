"""create users and devices tables

Revision ID: f9b876543210
Revises: a8d29bf70144
Create Date: 2026-09-08 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f9b876543210'
down_revision: Union[str, None] = 'a8d29bf70144'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('username', sa.String(length=64), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create devices table
    op.create_table(
        'devices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('device_id_hash', sa.String(length=64), nullable=False),
        sa.Column('registered_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('pinned_model_version_id', sa.String(length=36), nullable=True),
        sa.ForeignKeyConstraint(['pinned_model_version_id'], ['model_versions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('device_id_hash'),
    )
    op.create_index(op.f('ix_devices_device_id_hash'), 'devices', ['device_id_hash'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_devices_device_id_hash'), table_name='devices')
    op.drop_table('devices')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_table('users')
