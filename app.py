import os
import logging
from flask import Flask, request, g, render_template, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO if not os.environ.get("FLASK_DEBUG") else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    """Application factory function"""
    app = Flask(__name__)

    # Basic configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
        "pool_size": 20,
        "max_overflow": 30,
        "pool_timeout": 30,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "development_key_only")

    # Enable proxy support
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Configure Flask-Login
    login_manager.session_protection = "strong"
    login_manager.login_view = "login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Request timing middleware
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

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        logger.error(f"Internal Server Error: {error}", exc_info=True)
        return render_template('500.html', error="Internal Server Error"), 500

    # User loader
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

# Initialize database tables
with app.app_context():
    try:
        # Import models here to avoid circular imports
        import models
        logger.info("Models imported successfully")

        # Create all tables
        db.create_all()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)
        raise

if __name__ == '__main__':
    # Run the app on port 5000 with improved error handling
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except OSError as e:
        logger.error(f"Failed to start server: {str(e)}", exc_info=True)
        raise SystemExit(1)