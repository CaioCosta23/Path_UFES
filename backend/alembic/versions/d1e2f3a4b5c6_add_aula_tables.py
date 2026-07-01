"""add_aula_tables

Adiciona as tabelas aulas, aula_dias e aula_horarios conforme o diagrama de
classes do PathUFES. Também cria os tipos enum DiaSemana e Horario no PostgreSQL.

Revision ID: d1e2f3a4b5c6
Revises: 0d78acc04dcc
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = '0d78acc04dcc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_diasemana = sa.Enum(
    'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA',
    name='diasemana',
)
_horario = sa.Enum(
    'H07_08', 'H08_09', 'H09_10', 'H10_11', 'H11_12', 'H12_13',
    'H13_14', 'H14_15', 'H15_16', 'H16_17', 'H17_18', 'H18_19',
    name='horario',
)


def upgrade() -> None:
    """Cria tabelas e tipos de enum para aulas."""
    _diasemana.create(op.get_bind(), checkfirst=True)
    _horario.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'aulas',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('codigo_disciplina', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['codigo_disciplina'], ['disciplinas.codigo']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'aula_dias',
        sa.Column('aula_id', sa.Integer(), nullable=False),
        sa.Column('dia_semana', _diasemana, nullable=False),
        sa.ForeignKeyConstraint(['aula_id'], ['aulas.id']),
        sa.PrimaryKeyConstraint('aula_id', 'dia_semana'),
    )
    op.create_table(
        'aula_horarios',
        sa.Column('aula_id', sa.Integer(), nullable=False),
        sa.Column('horario', _horario, nullable=False),
        sa.ForeignKeyConstraint(['aula_id'], ['aulas.id']),
        sa.PrimaryKeyConstraint('aula_id', 'horario'),
    )


def downgrade() -> None:
    """Remove tabelas e tipos de enum de aulas."""
    op.drop_table('aula_horarios')
    op.drop_table('aula_dias')
    op.drop_table('aulas')
    _horario.drop(op.get_bind(), checkfirst=True)
    _diasemana.drop(op.get_bind(), checkfirst=True)
