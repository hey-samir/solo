import os
import logging
from flask import Flask, request, g, render_template, session, jsonify
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix
import time
from database import db
from health_checks import check_database_health
from flask_migrate import Migrate

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

    # Basic configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "development_key_only")

    # Enable proxy support
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Configure Flask-Login
    login_manager.session_protection = "strong"
    login_manager.login_view = "login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"

    # User loader callback
    @login_manager.user_loader
    def load_user(id):
        try:
            from models import User
            return User.query.get(int(id))
        except Exception as e:
            logger.error(f"Error loading user {id}: {str(e)}", exc_info=True)
            return None

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

    @app.route('/health')
    def health_check():
        """Endpoint to check database health"""
        try:
            health_status = check_database_health()
            status_code = 200 if health_status['status'] == 'healthy' else 500
            return jsonify(health_status), status_code
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}", exc_info=True)
            return jsonify({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': time.time()
            }), 500

    return app

# Create the Flask application instance
app = create_app()

port = int(os.environ.get("PORT", 80))
app.run(host='0.0.0.0', port=port)


# Initialize database tables within app context
with app.app_context():
    try:
        import models  # Import here to avoid circular imports
        logger.info("Models imported successfully")
        db.create_all()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)
        raise