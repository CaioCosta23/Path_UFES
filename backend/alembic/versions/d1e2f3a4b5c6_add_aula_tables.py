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


def upgrade() -> None:
    """Cria tabelas e tipos de enum para aulas via SQL puro."""
    # SQL puro evita que SQLAlchemy tente recriar os tipos enum via eventos de tabela.
    op.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'diasemana') THEN
                CREATE TYPE diasemana AS ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA');
            END IF;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'horario') THEN
                CREATE TYPE horario AS ENUM (
                    'H07_08', 'H08_09', 'H09_10', 'H10_11', 'H11_12', 'H12_13',
                    'H13_14', 'H14_15', 'H15_16', 'H16_17', 'H17_18', 'H18_19'
                );
            END IF;
        END $$
    """))
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS aulas (
            id               SERIAL      PRIMARY KEY,
            codigo_disciplina VARCHAR     NOT NULL REFERENCES disciplinas(codigo)
        )
    """))
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS aula_dias (
            aula_id    INTEGER    NOT NULL REFERENCES aulas(id),
            dia_semana diasemana  NOT NULL,
            PRIMARY KEY (aula_id, dia_semana)
        )
    """))
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS aula_horarios (
            aula_id INTEGER  NOT NULL REFERENCES aulas(id),
            horario horario  NOT NULL,
            PRIMARY KEY (aula_id, horario)
        )
    """))


def downgrade() -> None:
    """Remove tabelas e tipos de enum de aulas."""
    op.execute(sa.text("DROP TABLE IF EXISTS aula_horarios"))
    op.execute(sa.text("DROP TABLE IF EXISTS aula_dias"))
    op.execute(sa.text("DROP TABLE IF EXISTS aulas"))
    op.execute(sa.text("DROP TYPE IF EXISTS horario"))
    op.execute(sa.text("DROP TYPE IF EXISTS diasemana"))
