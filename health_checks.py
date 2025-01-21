from datetime import datetime
from flask import current_app, jsonify
from database import db
from models import Gym, Route, RouteGrade, User
from errors import ErrorCodes, log_error

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

        # Check for connection pool exhaustion
        if pool_info['pool_overflow'] > 0:
            log_error(
                current_app.logger,
                ErrorCodes.DB_CONNECTION_POOL_EXHAUSTED[0],
                pool_stats=pool_info
            )

        # Check for replication lag if applicable
        try:
            replication_lag = db.session.execute(
                "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::INT"
            ).scalar()
            if replication_lag and replication_lag > 300:  # 5 minutes lag
                log_error(
                    current_app.logger,
                    ErrorCodes.DB_REPLICATION_LAG[0],
                    lag_seconds=replication_lag
                )
        except Exception:
            # Not a replica or can't check replication lag
            replication_lag = None

        return {
            'status': 'healthy',
            'message': 'Database connection successful',
            'database_version': version_info,
            'tables': stats,
            'connection_pool': pool_info,
            'replication_lag': replication_lag,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        error_context = {'error': str(e)}
        log_error(
            current_app.logger,
            ErrorCodes.DB_CONNECTION_ERROR[0],
            exc_info=True,
            **error_context
        )
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }