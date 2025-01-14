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
    # Add new columns to route table
    op.add_column('route', sa.Column('wall_sector', sa.String(50), nullable=False, server_default='Main Wall'))
    op.add_column('route', sa.Column('route_type', sa.String(20), nullable=False, server_default='top_rope'))
    op.add_column('route', sa.Column('height_meters', sa.Float(), nullable=True))
    op.add_column('route', sa.Column('active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('route', sa.Column('anchor_number', sa.Integer(), nullable=True))
    op.add_column('route', sa.Column('hold_style', sa.String(50), nullable=True))
    op.add_column('route', sa.Column('tags', sa.String(200), nullable=True))
    op.add_column('route', sa.Column('avg_rating', sa.Float(), nullable=False, server_default='0'))
    op.add_column('route', sa.Column('rating_count', sa.Integer(), nullable=False, server_default='0'))

    # Create indexes for efficient querying
    op.create_index('idx_route_location', 'route', ['gym_id', 'wall_sector', 'anchor_number'])
    op.create_index('idx_route_search', 'route', ['gym_id', 'active', 'grade_id', 'color'])

def downgrade():
    # Drop indexes
    op.drop_index('idx_route_search')
    op.drop_index('idx_route_location')

    # Drop columns
    op.drop_column('route', 'rating_count')
    op.drop_column('route', 'avg_rating')
    op.drop_column('route', 'tags')
    op.drop_column('route', 'hold_style')
    op.drop_column('route', 'anchor_number')
    op.drop_column('route', 'active')
    op.drop_column('route', 'height_meters')
    op.drop_column('route', 'route_type')
    op.drop_column('route', 'wall_sector')
