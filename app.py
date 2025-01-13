import os
import logging
from flask import Flask, redirect, url_for, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from werkzeug.exceptions import NotFound
import logging
from datetime import datetime
from errors import LOGIN_REQUIRED_MESSAGE, INTERNAL_SERVER_ERROR

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
    login_manager.login_message = LOGIN_REQUIRED_MESSAGE
    
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

@app.route('/update_send/<int:send_id>', methods=['POST'])
@login_required
def update_send(send_id):
    try:
        from models import Send
        send = Send.query.get_or_404(send_id)

        # Verify send belongs to current user
        if send.user_id != current_user.id:
            return "Unauthorized", 403

        # Update send details
        send.tries = int(request.form.get('tries', send.tries))
        send.status = request.form.get('status') == 'true'

        db.session.commit()
        logger.info(f"Send {send_id} updated successfully")
        return redirect(url_for('sends'))

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating send {send_id}: {str(e)}")
        return str(e), 500

@app.errorhandler(Exception)
def handle_error(error):
    db.session.rollback()
    if isinstance(error, NotFound):
        return render_template('404.html'), 404
    app.logger.error(f'Error: {str(error)}')
    return render_template('404.html', error=INTERNAL_SERVER_ERROR), 500

@app.route('/error_404')
def error_404():
    return render_template('404.html'), 404