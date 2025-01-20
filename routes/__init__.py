from flask import Blueprint

bp = Blueprint('routes', __name__)

# Import routes after creating blueprint to avoid circular imports
from routes.routes import *  # noqa: F401, F403