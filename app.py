import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate
from utils.icon_generator import generate_pwa_icons

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
migrate = Migrate()

# create the app
app = Flask(__name__)

# setup a secret key, required by sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev_key_solo_climbing"

# configure the database
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
migrate.init_app(app, db)

# Configure Flask-Login
login_manager.session_protection = "strong"
login_manager.login_view = "login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"

@login_manager.user_loader
def load_user(id):
    from models import User
    return User.query.get(int(id))

# Import models and create tables
def init_app():
    with app.app_context():
        from models import User, Gym, Route, Climb, Feedback, FeedbackVote, RouteGrade
        try:
            # Ensure static/images directory exists
            os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)

            # Generate PWA icons from favicon
            if generate_pwa_icons():
                logger.info("PWA icons generated successfully")
            else:
                logger.warning("Failed to generate PWA icons")

        except Exception as e:
            logger.error(f"Initialization error: {e}")
            raise

init_app()