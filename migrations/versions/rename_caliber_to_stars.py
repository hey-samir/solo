"""rename caliber to stars

Revision ID: rename_caliber_to_stars
Revises: 
Create Date: 2025-01-01 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'rename_caliber_to_stars'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Rename column from caliber to stars
    op.alter_column('send', 'caliber',
               new_column_name='stars',
               existing_type=sa.String())

def downgrade():
    # Rename column back to caliber
    op.alter_column('send', 'stars',
               new_column_name='caliber',
               existing_type=sa.String())
