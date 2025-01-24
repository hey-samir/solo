import os
import logging
from datetime import timedelta
from flask import Flask, render_template, send_from_directory
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from database import db

# Configure logging
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
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='dist',
                static_url_path='')
    logger.info("Creating Flask application")

    if test_config is None:
        # Database configuration
        app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_size": 10,
            "max_overflow": 5,
            "pool_recycle": 1800,
            "pool_pre_ping": True,
            "pool_timeout": 60,
            "pool_use_lifo": True
        }
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        # Security configuration
        app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", os.urandom(24))
        app.config["SESSION_COOKIE_SECURE"] = True
        app.config["SESSION_COOKIE_HTTPONLY"] = True
        app.config["SESSION_COOKIE_SAMESITE"] = 'Lax'
        app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=31)
        app.config["REMEMBER_COOKIE_SECURE"] = True
        app.config["REMEMBER_COOKIE_HTTPONLY"] = True
        app.config["WTF_CSRF_TIME_LIMIT"] = 3600
        app.config["WTF_CSRF_SSL_STRICT"] = True
    else:
        app.config.update(test_config)

    # Enable CORS for development
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    logger.info("Initializing Flask extensions")
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    # Configure Flask-Login
    login_manager.session_protection = "strong"
    login_manager.login_view = "auth.login"

    @login_manager.user_loader
    def load_user(id):
        try:
            from models import User
            return User.query.get(int(id))
        except Exception as e:
            logger.error(f"Error loading user {id}: {str(e)}", exc_info=True)
            return None

    with app.app_context():
        # Import models
        import models  # noqa: F401

        # Create database tables
        db.create_all()
        logger.info("Database tables created successfully")

        # Register blueprints
        from auth import bp as auth_bp
        from routes.routes import bp as routes_bp
        from api import bp as api_bp

        app.register_blueprint(auth_bp)
        app.register_blueprint(routes_bp)
        app.register_blueprint(api_bp)

        logger.info("Successfully registered blueprints")

        # Serve React app for non-API routes
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve(path):
            if path.startswith('api/'):
                return {"error": "Not Found"}, 404

            if path and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)

            # Always return index.html for client-side routing
            return send_from_directory(app.static_folder, 'index.html')

    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    logger.info("Starting Flask development server")
    app.run(host="0.0.0.0", port=5000)