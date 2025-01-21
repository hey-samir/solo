import os
import logging
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import timedelta

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()
csrf = CSRFProtect()

def create_app(test_config=None):
    """Application factory function"""
    app = Flask(__name__)
    logger.info("Creating Flask application")

    if test_config is None:
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
        app.config["TEMPLATES_AUTO_RELOAD"] = True
        app.config["JSON_SORT_KEYS"] = False
        app.config["DEBUG"] = True

        # Security configuration
        app.secret_key = os.environ.get("FLASK_SECRET_KEY", "development_key_only")

        # Session configuration
        app.config["SESSION_COOKIE_SECURE"] = False
        app.config["SESSION_COOKIE_HTTPONLY"] = True
        app.config["SESSION_COOKIE_SAMESITE"] = 'Lax'
        app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_SECURE"] = False
        app.config["REMEMBER_COOKIE_HTTPONLY"] = True

        # CSRF configuration
        app.config["WTF_CSRF_TIME_LIMIT"] = None
        app.config["WTF_CSRF_SSL_STRICT"] = False
        app.config["WTF_CSRF_CHECK_DEFAULT"] = False
    else:
        # Load test config if passed in
        app.config.update(test_config)

    # Enable proxy support
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Initialize extensions with app
    logger.info("Initializing Flask extensions")
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    # Configure Flask-Login
    login_manager.session_protection = "basic"
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"
    login_manager.refresh_view = "auth.login"
    login_manager.needs_refresh_message = "Please log in again to confirm your identity."
    login_manager.needs_refresh_message_category = "info"

    # Register blueprints
    logger.info("Registering blueprints")
    from auth import bp as auth_bp, init_auth
    from routes import bp as routes_bp, init_routes

    # Initialize routes before registering blueprints
    init_auth()
    init_routes()

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(routes_bp)

    # User loader callback
    @login_manager.user_loader
    def load_user(id):
        try:
            from models import User
            return User.query.get(int(id))
        except Exception as e:
            logger.error(f"Error loading user {id}: {str(e)}", exc_info=True)
            return None

    # Create tables within app context
    with app.app_context():
        try:
            import models  # noqa: F401
            db.create_all()
            logger.info("Database tables created successfully")

        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)
            raise

    return app

# Create the application instance
app = create_app()

# Initialize backup scheduler after app creation
try:
    from backup_scheduler import init_backup_scheduler
    backup_scheduler = init_backup_scheduler(app)
    logger.info("Backup scheduler initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize backup scheduler: {str(e)}", exc_info=True)

if __name__ == "__main__":
    logger.info("Starting Flask development server")
    app.run(host="0.0.0.0", port=5000, debug=True)