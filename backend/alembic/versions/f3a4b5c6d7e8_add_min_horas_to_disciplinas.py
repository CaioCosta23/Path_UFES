"""add_min_horas_to_disciplinas

Adiciona coluna min_horas INTEGER nullable à tabela disciplinas.
Usada para exigir um mínimo de horas cursadas no currículo antes de
cursar a disciplina (ex: TCC I exige 2000 horas).

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-07-09 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3a4b5c6d7e8'
down_revision: Union[str, Sequence[str], None] = 'e2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Adiciona coluna min_horas à tabela disciplinas."""
    op.add_column('disciplinas', sa.Column('min_horas', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove coluna min_horas da tabela disciplinas."""
    op.drop_column('disciplinas', 'min_horas')
