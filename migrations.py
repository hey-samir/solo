
from app import app, db

def migrate():
    print("Recreating database tables...")
    with app.app_context():
        # Drop everything
        db.drop_all()
        
        # Create fresh tables
        db.create_all()
        
        print("Database migration completed successfully")
