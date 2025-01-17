import os
import logging
from flask import Flask, request, g, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix
import time

# Configure logging with more detailed format
logging.basicConfig(
    level=logging.INFO if not os.environ.get("FLASK_DEBUG") else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Initialize extensions without app context
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    """Application factory function to create and configure the Flask app"""
    app = Flask(__name__)

    # Enable proxy support for proper client IP handling
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Configure Flask app with enhanced database settings
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,  # Recycle connections every 5 minutes
        "pool_pre_ping": True,  # Enable connection health checks
        "pool_size": 20,  # Increase pool size for better concurrency
        "max_overflow": 30,  # Allow more connections when pool is full
        "pool_timeout": 30,  # Connection timeout in seconds
    }
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "development_key_only"

    # Configure Flask-Login with enhanced security
    login_manager.session_protection = "strong"
    login_manager.login_view = "login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Register error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return "Page not found", 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        logger.error(f"Internal Server Error: {error}", exc_info=True)
        return "Internal Server Error", 500

    # Add request timing middleware
    @app.before_request
    def start_timer():
        g.start = time.time()

    @app.after_request
    def log_request(response):
        if hasattr(g, 'start'):
            total_time = time.time() - g.start
            logger.info(
                f'Request: {request.method} {request.path} '
                f'Status: {response.status_code} '
                f'Duration: {total_time:.2f}s'
            )
        return response

    with app.app_context():
        try:
            # Import models here to avoid circular imports
            import models  # noqa: F401
            logger.info("Models imported successfully")

            # Create database tables if they don't exist
            db.create_all()
            logger.info("Database tables initialized")

        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)
            raise

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

if __name__ == '__main__':
    # Run the app on port 5000 with improved error handling
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except OSError as e:
        logger.error(f"Failed to start server: {str(e)}", exc_info=True)
        raise SystemExit(1)