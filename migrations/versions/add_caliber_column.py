
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Drop and recreate the table with the new column
    op.drop_table('climb')
    op.create_table('climb',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('color', sa.String(length=50), nullable=False),
        sa.Column('caliber', sa.String(length=10), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('status', sa.Boolean(), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('climb')
