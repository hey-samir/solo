
from app import app, db
from models import User, Climb
from migrations.versions.add_attempts_column import upgrade

with app.app_context():
    db.drop_all()
    db.create_all()
    upgrade()
    print("Database setup complete!")
