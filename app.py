import os
import logging
from datetime import timedelta
from flask import Flask
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging once at the application level
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize extensions
login_manager = LoginManager()
migrate = Migrate()
csrf = CSRFProtect()

def create_app(test_config=None):
    """Application factory function"""
    app = Flask(__name__)
    logger.info("Creating Flask application")

    if test_config is None:
        # Database configuration with optimized connection pooling
        app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_size": 10,  # Increased for better concurrent handling
            "max_overflow": 5,
            "pool_recycle": 1800,  # Increased to 30 minutes
            "pool_pre_ping": True,
            "pool_timeout": 60,  # Increased timeout
            "pool_use_lifo": True  # Better performance under load
        }
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        # Performance optimizations
        app.config["TEMPLATES_AUTO_RELOAD"] = False  # Disable in production
        app.config["JSON_SORT_KEYS"] = False

        # Security and session configuration
        app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", os.urandom(24))
        app.config["SESSION_COOKIE_SECURE"] = True
        app.config["SESSION_COOKIE_HTTPONLY"] = True
        app.config["SESSION_COOKIE_SAMESITE"] = 'Lax'
        app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_SECURE"] = True
        app.config["REMEMBER_COOKIE_HTTPONLY"] = True

        # CSRF configuration
        app.config["WTF_CSRF_TIME_LIMIT"] = 3600  # 1 hour
        app.config["WTF_CSRF_SSL_STRICT"] = True
        app.config["WTF_CSRF_CHECK_DEFAULT"] = True
    else:
        app.config.update(test_config)

    # Enable proxy support with secure headers
    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_proto=1,
        x_host=1,
        x_port=1,
        x_prefix=1
    )

    # Initialize extensions with app
    logger.info("Initializing Flask extensions")
    from database import db
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    # Configure Flask-Login with enhanced security
    login_manager.session_protection = "strong"
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"
    login_manager.refresh_view = "auth.login"
    login_manager.needs_refresh_message = "Please log in again to confirm your identity."
    login_manager.needs_refresh_message_category = "info"

    # User loader callback with error handling
    @login_manager.user_loader
    def load_user(id):
        try:
            from models import User
            return User.query.get(int(id))
        except Exception as e:
            logger.error(f"Error loading user {id}: {str(e)}", exc_info=True)
            return None

    with app.app_context():
        # Import models first to ensure they're available
        import models  # noqa: F401

        # Create database tables
        db.create_all()
        logger.info("Database tables created successfully")

        # Register blueprints
        from auth import bp as auth_bp
        from routes import bp as routes_bp

        app.register_blueprint(auth_bp)
        app.register_blueprint(routes_bp)

        logger.info("Successfully registered blueprints")

    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    logger.info("Starting Flask development server")
    app.run(host="0.0.0.0", port=5000)