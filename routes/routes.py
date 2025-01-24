# This file is deprecated. Routes have been migrated to Express.js server.
# See src/server/server.ts for current implementation.
from flask import Blueprint

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    """Deprecated - See Express.js implementation"""
    return '', 404