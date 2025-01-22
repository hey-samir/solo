import os
import logging
import sys
from datetime import datetime, timedelta
from flask import render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

# Import both user messages and system errors
from user_messages import get_user_message, MessageType
from errors import ErrorSeverity, ErrorCodes, get_error_details, log_error

# Initialize logging with proper formatting
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import app and db after logging configuration
try:
    from app import create_app
    app = create_app()
    logger.info("Successfully imported app and db")
except Exception as e:
    logger.error(f"Failed to import app: {str(e)}", exc_info=True)
    sys.exit(1)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)