"""renomeia_semestre_ingresso_para_periodo_ingresso

Revision ID: 0d78acc04dcc
Revises: ba7697b8affd
Create Date: 2026-06-28 13:20:07.247892

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d78acc04dcc'
down_revision: Union[str, Sequence[str], None] = 'ba7697b8affd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('alunos', 'semestre_ingresso',
                    new_column_name='periodo_ingresso',
                    type_=sa.String(),
                    existing_type=sa.Integer(),
                    postgresql_using='semestre_ingresso::text')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('alunos', 'periodo_ingresso',
                    new_column_name='semestre_ingresso',
                    type_=sa.Integer(),
                    existing_type=sa.String(),
                    postgresql_using="split_part(periodo_ingresso, '/', 2)::integer")
