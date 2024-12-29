
from flask_migrate import Migrate
from app import app, db

migrate = Migrate(app, db)

def migrate():
    print("Starting database migration...")
    from migrations.versions.add_caliber_column import upgrade as recreate_table
    recreate_table()
    print("Database migration completed")
