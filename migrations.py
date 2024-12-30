
from app import app, db

def migrate():
    print("Running migrations...")
    with app.app_context():
        # Only create tables that don't exist
        db.create_all()
        print("Database migration completed successfully")
