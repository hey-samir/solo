
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('climb', sa.Column('tries', sa.Integer(), nullable=False, server_default='1'))

def downgrade():
    op.drop_column('climb', 'tries')
