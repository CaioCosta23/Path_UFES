"""add_tipo_semestre_to_aulas

Adiciona coluna tipo_semestre VARCHAR(6) nullable à tabela aulas.
NULL indica que a aula ocorre em ambos os semestres (PAR e ÍMPAR).

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-07-02 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e2f3a4b5c6d7'
down_revision: Union[str, Sequence[str], None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Adiciona coluna tipo_semestre à tabela aulas."""
    op.add_column('aulas', sa.Column('tipo_semestre', sa.String(6), nullable=True))


def downgrade() -> None:
    """Remove coluna tipo_semestre da tabela aulas."""
    op.drop_column('aulas', 'tipo_semestre')
