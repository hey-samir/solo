import os
import logging
from flask import Flask, request, g, render_template, session, jsonify
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix
import time
from database import db
from health_checks import check_database_health
from flask_migrate import Migrate
from datetime import timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO if not os.environ.get("FLASK_DEBUG") else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize extensions
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    """Application factory function"""
    app = Flask(__name__)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TEMPLATES_AUTO_RELOAD'] = False
    app.config['JSON_SORT_KEYS'] = False

    # Basic configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 5,
        "max_overflow": 2,
        "pool_recycle": 300,
        "pool_pre_ping": True,
        "pool_timeout": 30
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "development_key_only")

    # Enable debug mode for development
    app.debug = bool(os.environ.get("FLASK_DEBUG", False))

    # Session configuration for development
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = 'Lax'
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=31)
    app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=31)
    app.config["REMEMBER_COOKIE_SECURE"] = False
    app.config["REMEMBER_COOKIE_HTTPONLY"] = True

    # CSRF configuration for development
    app.config["WTF_CSRF_TIME_LIMIT"] = None  # No time limit for CSRF tokens
    app.config["WTF_CSRF_SSL_STRICT"] = False  # Disable SSL-only for CSRF
    app.config["WTF_CSRF_CHECK_DEFAULT"] = False  # Only check CSRF for unsafe methods

    # Enable proxy support
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Configure Flask-Login
    login_manager.session_protection = "basic"  # Changed from "strong" to "basic" for development
    login_manager.login_view = "login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"
    login_manager.refresh_view = "login"
    login_manager.needs_refresh_message = "Please log in again to confirm your identity."
    login_manager.needs_refresh_message_category = "info"

    # User loader callback
    @login_manager.user_loader
    def load_user(id):
        try:
            from models import User
            return User.query.get(int(id))
        except Exception as e:
            logger.error(f"Error loading user {id}: {str(e)}", exc_info=True)
            return None

    return app

# Create the Flask application instance
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")

    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)  # Explicitly enable debug mode

# Initialize database tables within app context
with app.app_context():
    try:
        import models
        logger.info("Models imported successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)
        raise