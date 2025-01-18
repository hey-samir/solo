from datetime import datetime
from flask import current_app
from database import db
from models import Gym, Route, RouteGrade

def check_database_health():
    """Check database connectivity and basic health metrics"""
    try:
        with current_app.app_context():
            # Test database connection
            db.session.execute('SELECT 1')

            # Get table statistics
            stats = {
                'gyms': Gym.query.count(),
                'routes': Route.query.count(),
                'grades': RouteGrade.query.count()
            }

            return {
                'status': 'healthy',
                'tables': stats,
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }