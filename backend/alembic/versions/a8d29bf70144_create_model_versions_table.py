"""create model_versions table

Revision ID: a8d29bf70144
Revises: 5ce78c13bfc6
Create Date: 2026-09-07 20:46:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a8d29bf70144'
down_revision: Union[str, None] = '5ce78c13bfc6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'model_versions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('model_type', sa.String(length=64), nullable=False),
        sa.Column('version', sa.String(length=32), nullable=False),
        sa.Column('storage_key', sa.String(length=512), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('checksum_sha256', sa.String(length=64), nullable=True),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_type', 'version', name='uq_model_versions_type_version'),
    )
    op.create_index(op.f('ix_model_versions_model_type'), 'model_versions', ['model_type'], unique=False)
    op.create_index(op.f('ix_model_versions_is_active'), 'model_versions', ['is_active'], unique=False)
    op.create_index(op.f('ix_model_versions_uploaded_at'), 'model_versions', ['uploaded_at'], unique=False)
    op.create_index(
        'uq_active_model_per_type',
        'model_versions',
        ['model_type'],
        unique=True,
        postgresql_where=sa.text('is_active = true'),
        sqlite_where=sa.text('is_active = 1'),
    )


def downgrade() -> None:
    op.drop_index('uq_active_model_per_type', table_name='model_versions')
    op.drop_index(op.f('ix_model_versions_uploaded_at'), table_name='model_versions')
    op.drop_index(op.f('ix_model_versions_is_active'), table_name='model_versions')
    op.drop_index(op.f('ix_model_versions_model_type'), table_name='model_versions')
    op.drop_table('model_versions')
