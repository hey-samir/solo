"""enhance route identification

Revision ID: 001
Create Date: 2025-01-14 03:45:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns for enhanced route identification
    op.add_column('route', sa.Column('wall_sector', sa.String(50), nullable=False, server_default='Main Wall'))
    op.add_column('route', sa.Column('route_type', sa.String(20), nullable=False, server_default='top_rope'))
    op.add_column('route', sa.Column('height_meters', sa.Float(), nullable=True))
    op.add_column('route', sa.Column('active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('route', sa.Column('anchor_number', sa.Integer(), nullable=True))
    op.add_column('route', sa.Column('hold_style', sa.String(50), nullable=True))

    # Rename existing rating columns to stars for consistency
    op.alter_column('route', 'avg_rating', 
                    new_column_name='avg_stars',
                    existing_type=sa.Float(),
                    existing_nullable=True)
    op.alter_column('route', 'rating_count', 
                    new_column_name='stars_count',
                    existing_type=sa.Integer(),
                    existing_nullable=True)

    # Create indexes for efficient querying
    op.create_index('idx_route_location', 'route', ['gym_id', 'wall_sector', 'anchor_number'])
    op.create_index('idx_route_search', 'route', ['gym_id', 'active', 'grade_id', 'color'])

def downgrade():
    # Drop indexes first to avoid dependency issues
    op.drop_index('idx_route_search')
    op.drop_index('idx_route_location')

    # Rename stars columns back to rating
    op.alter_column('route', 'avg_stars', 
                    new_column_name='avg_rating',
                    existing_type=sa.Float(),
                    existing_nullable=True)
    op.alter_column('route', 'stars_count', 
                    new_column_name='rating_count',
                    existing_type=sa.Integer(),
                    existing_nullable=True)

    # Drop added columns in reverse order
    op.drop_column('route', 'hold_style')
    op.drop_column('route', 'anchor_number')
    op.drop_column('route', 'active')
    op.drop_column('route', 'height_meters')
    op.drop_column('route', 'route_type')
    op.drop_column('route', 'wall_sector')