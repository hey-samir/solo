import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(
    level=logging.INFO if not os.environ.get("FLASK_DEBUG") else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Initialize core extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

# create the app
app = Flask(__name__)
# setup a secret key, required by sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev_key_solo_climbing"
# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
}

# Initialize extensions with app
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = "Please log in to access this page."

@login_manager.user_loader
def load_user(id):
    from models import User
    return User.query.get(int(id))

# Create all tables after importing models
with app.app_context():
    # Import models here to avoid circular imports
    from models import User, Gym, Route, Climb, Feedback, FeedbackVote, RouteGrade
    try:
        db.create_all()
        logger.info("Database tables created successfully")
        # Run migrations
        from migrations import migrate
        migrate()
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise