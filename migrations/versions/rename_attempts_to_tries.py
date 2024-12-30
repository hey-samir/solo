
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.alter_column('climb', 'attempts', new_column_name='tries')

def downgrade():
    op.alter_column('climb', 'tries', new_column_name='attempts')
