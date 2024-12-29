from flask_migrate import Migrate
from app import app, db

# Initialize Flask-Migrate
migrate = Migrate(app, db)

def migrate():
    # Add migrations here
    from migrations.versions.add_caliber_column import upgrade as add_caliber
    from migrations.versions.add_attempts_column import upgrade as add_attempts
    add_caliber()
    add_attempts()