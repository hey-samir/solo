
import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from werkzeug.exceptions import NotFound

# Configure logging once
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

def create_app():
    app = Flask(__name__)
    
    # Config settings
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev_key_solo_climbing")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    
    with app.app_context():
        from models import User
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Database initialization error: {e}")

    return app

# Create the application instance
app = create_app()

@login_manager.user_loader
def load_user(id):
    from models import User
    return User.query.get(int(id))

# Error handlers
@app.errorhandler(Exception)
def handle_error(error):
    db.session.rollback()
    if isinstance(error, NotFound):
        return render_template('404.html'), 404
    app.logger.error(f'Error: {str(error)}')
    return render_template('404.html', error="Internal server error"), 500
