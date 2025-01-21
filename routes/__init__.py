from flask import Blueprint

# Create the blueprint
bp = Blueprint('routes', __name__)

# Export the blueprint
__all__ = ['bp']

# Import routes at the end to avoid circular dependencies
from routes import routes  # noqa: F401