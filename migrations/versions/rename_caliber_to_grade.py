from alembic import op
import sqlalchemy as sa

def upgrade():
    op.alter_column('climb', 'caliber', new_column_name='grade')

def downgrade():
    op.alter_column('climb', 'grade', new_column_name='caliber')
