
from app import db

def migrate():
    print("Recreating database tables...")
    db.drop_all()
    db.create_all()
    print("Database migration completed")
