from flask import Blueprint

bp = Blueprint('routes', __name__)

def init_routes():
    """Initialize routes and related functionality"""
    from routes import routes  # noqa: F401