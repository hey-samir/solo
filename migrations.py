from flask_migrate import Migrate
from app import app, db

# Initialize Flask-Migrate
migrate = Migrate(app, db)
