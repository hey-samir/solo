
from app import app, db
from models import User, Climb

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database reset complete!")
