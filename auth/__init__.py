from flask import Blueprint

bp = Blueprint('auth', __name__)

def init_auth():
    """Initialize auth routes and related functionality"""
    from auth import routes  # noqa: F401

# This prevents circular imports