from datetime import datetime
from flask import current_app, jsonify
from database import db
from models import Gym, Route, RouteGrade, User

def check_database_health():
    """Check database connectivity and basic health metrics"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')

        # Get table statistics
        stats = {
            'users': User.query.count(),
            'gyms': Gym.query.count(),
            'routes': Route.query.count(),
            'grades': RouteGrade.query.count()
        }

        # Get database version
        version_info = db.session.execute('SELECT version()').scalar()

        # Get connection pool info
        pool_info = {
            'pool_size': db.engine.pool.size(),
            'pool_overflow': db.engine.pool.overflow(),
            'pool_timeout': db.engine.pool.timeout()
        }

        return {
            'status': 'healthy',
            'message': 'Database connection successful',
            'database_version': version_info,
            'tables': stats,
            'connection_pool': pool_info,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        current_app.logger.error(f"Database health check failed: {str(e)}")
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }