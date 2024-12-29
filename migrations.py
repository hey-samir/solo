from flask_migrate import Migrate
from app import app, db

# Initialize Flask-Migrate
migrate = Migrate(app, db)

def migrate():
    # Add migrations here
    print("Starting database migrations...")
    from migrations.versions.add_caliber_column import upgrade as add_caliber
    from migrations.versions.add_attempts_column import upgrade as add_attempts
    add_caliber()
    print("Caliber column migration complete")
    add_attempts()
    print("Attempts column migration complete")
    print("All migrations finished successfully")