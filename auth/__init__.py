from flask import Blueprint

# Create the blueprint
bp = Blueprint('auth', __name__)

# Export only the blueprint
__all__ = ['bp']

def register_auth_routes(app):
    from auth.routes import login, logout, register
    app.register_blueprint(bp)