
from app import db

def migrate():
    print("Recreating database tables...")
    # Drop everything
    db.drop_all()
    
    # Create fresh tables
    db.create_all()
    
    print("Database migration completed successfully")
