from datetime import datetime
import os
import subprocess
from flask import current_app
from flask_migrate import Migrate, upgrade, downgrade
from database import db
from errors import ErrorCodes, log_error

# Initialize Flask-Migrate
migrate = Migrate()

def backup_database():
    """Create a backup of the database before running migrations"""
    try:
        # Get database URL from environment
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            log_error(
                current_app.logger,
                ErrorCodes.DB_BACKUP_FAILED[0],
                error_details="DATABASE_URL not found"
            )
            raise ValueError("DATABASE_URL not found in environment variables")

        # Create backups directory if it doesn't exist
        backup_dir = 'db_backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"{backup_dir}/backup_{timestamp}.sql"

        # Create backup using pg_dump
        subprocess.run([
            'pg_dump',
            '-f', backup_file,
            db_url
        ], check=True)

        current_app.logger.info(f"Database backup created successfully: {backup_file}")
        return True
    except Exception as e:
        log_error(
            current_app.logger,
            ErrorCodes.DB_BACKUP_FAILED[0],
            exc_info=True,
            error_details=str(e)
        )
        return False

def migrate_database():
    """Run database migrations with backup and failover protection"""
    try:
        # Verify database health before migration
        from health_checks import check_database_health
        health_status = check_database_health()

        if health_status['status'] != 'healthy':
            log_error(
                current_app.logger,
                ErrorCodes.DB_CONNECTION_ERROR[0],
                health_status=health_status
            )
            raise Exception("Database health check failed, aborting migration")

        # Create backup before migration
        if not backup_database():
            raise Exception("Database backup failed, aborting migration")

        # Run migrations
        with current_app.app_context():
            upgrade()

        current_app.logger.info("Database migration completed successfully")
        return True
    except Exception as e:
        log_error(
            current_app.logger,
            ErrorCodes.DB_MIGRATION_ERROR[0],
            exc_info=True,
            error_details=str(e)
        )
        return False

def rollback_migration():
    """Rollback the last database migration with failover protection"""
    try:
        # Create backup before rollback
        if not backup_database():
            raise Exception("Backup failed before rollback, operation aborted")

        with current_app.app_context():
            downgrade()

        current_app.logger.info("Migration rollback completed successfully")
        return True
    except Exception as e:
        log_error(
            current_app.logger,
            ErrorCodes.DB_MIGRATION_ERROR[0],
            exc_info=True,
            error_details=str(e)
        )
        return False

def list_migration_history():
    """List all available migrations with enhanced error handling"""
    try:
        from alembic.config import Config
        from alembic.script import ScriptDirectory

        config = Config("migrations/alembic.ini")
        script = ScriptDirectory.from_config(config)

        migrations = []
        for revision in script.walk_revisions():
            migrations.append({
                'revision': revision.revision,
                'down_revision': revision.down_revision,
                'description': revision.doc,
                'created_date': revision.date
            })

        return migrations
    except Exception as e:
        log_error(
            current_app.logger,
            ErrorCodes.DB_MIGRATION_ERROR[0],
            exc_info=True,
            error_details=str(e)
        )
        return []

def init_db():
    """Initialize database with required data"""
    current_app.logger.info("Initializing database with required data...")
    with current_app.app_context():
        try:
            from models import RouteGrade, Gym, Route

            # Initialize route grades if they don't exist
            grades_data = [
                # Solo/Top Rope grades (5.0 - 5.15d)
                {'grade': '5.0', 'climbing_type': 'solo', 'points': 10, 'difficulty_rank': 1},
                {'grade': '5.1', 'climbing_type': 'solo', 'points': 20, 'difficulty_rank': 2},
                {'grade': '5.2', 'climbing_type': 'solo', 'points': 30, 'difficulty_rank': 3},
                {'grade': '5.3', 'climbing_type': 'solo', 'points': 40, 'difficulty_rank': 4},
                {'grade': '5.4', 'climbing_type': 'solo', 'points': 50, 'difficulty_rank': 5},
                {'grade': '5.5', 'climbing_type': 'solo', 'points': 60, 'difficulty_rank': 6},
                {'grade': '5.6', 'climbing_type': 'solo', 'points': 70, 'difficulty_rank': 7},
                {'grade': '5.7', 'climbing_type': 'solo', 'points': 80, 'difficulty_rank': 8},
                {'grade': '5.8', 'climbing_type': 'solo', 'points': 100, 'difficulty_rank': 9},
                {'grade': '5.9', 'climbing_type': 'solo', 'points': 150, 'difficulty_rank': 10},
                {'grade': '5.10a', 'climbing_type': 'solo', 'points': 200, 'difficulty_rank': 11},
                {'grade': '5.10b', 'climbing_type': 'solo', 'points': 250, 'difficulty_rank': 12},
                {'grade': '5.10c', 'climbing_type': 'solo', 'points': 300, 'difficulty_rank': 13},
                {'grade': '5.10d', 'climbing_type': 'solo', 'points': 350, 'difficulty_rank': 14},
                {'grade': '5.11a', 'climbing_type': 'solo', 'points': 400, 'difficulty_rank': 15},
                {'grade': '5.11b', 'climbing_type': 'solo', 'points': 500, 'difficulty_rank': 16},
                {'grade': '5.11c', 'climbing_type': 'solo', 'points': 600, 'difficulty_rank': 17},
                {'grade': '5.11d', 'climbing_type': 'solo', 'points': 700, 'difficulty_rank': 18},
                {'grade': '5.12a', 'climbing_type': 'solo', 'points': 800, 'difficulty_rank': 19},
                {'grade': '5.12b', 'climbing_type': 'solo', 'points': 900, 'difficulty_rank': 20},
                {'grade': '5.12c', 'climbing_type': 'solo', 'points': 1000, 'difficulty_rank': 21},
                {'grade': '5.12d', 'climbing_type': 'solo', 'points': 1100, 'difficulty_rank': 22},
                {'grade': '5.13a', 'climbing_type': 'solo', 'points': 1250, 'difficulty_rank': 23},
                {'grade': '5.13b', 'climbing_type': 'solo', 'points': 1400, 'difficulty_rank': 24},
                {'grade': '5.13c', 'climbing_type': 'solo', 'points': 1550, 'difficulty_rank': 25},
                {'grade': '5.13d', 'climbing_type': 'solo', 'points': 1700, 'difficulty_rank': 26},
                {'grade': '5.14a', 'climbing_type': 'solo', 'points': 2000, 'difficulty_rank': 27},
                {'grade': '5.14b', 'climbing_type': 'solo', 'points': 2500, 'difficulty_rank': 28},
                {'grade': '5.14c', 'climbing_type': 'solo', 'points': 3000, 'difficulty_rank': 29},
                {'grade': '5.14d', 'climbing_type': 'solo', 'points': 3500, 'difficulty_rank': 30},
                {'grade': '5.15a', 'climbing_type': 'solo', 'points': 4000, 'difficulty_rank': 31},
                {'grade': '5.15b', 'climbing_type': 'solo', 'points': 5000, 'difficulty_rank': 32},
                {'grade': '5.15c', 'climbing_type': 'solo', 'points': 6000, 'difficulty_rank': 33},
                {'grade': '5.15d', 'climbing_type': 'solo', 'points': 7500, 'difficulty_rank': 34},
            ]

            for grade_data in grades_data:
                grade = RouteGrade.query.filter_by(
                    grade=grade_data['grade'],
                    climbing_type=grade_data['climbing_type']
                ).first()

                if not grade:
                    grade = RouteGrade(**grade_data)
                    db.session.add(grade)

            db.session.commit()
            current_app.logger.info("Route grades initialized successfully")

        except Exception as e:
            db.session.rollback()
            log_error(
                current_app.logger,
                ErrorCodes.DB_INTEGRITY_ERROR[0],
                exc_info=True,
                error_details=str(e)
            )
            return False

        # Add Movement Gowanus if it doesn't exist
        movement_gowanus = Gym.query.filter_by(name='Movement Gowanus').first()
        if not movement_gowanus:
            movement_gowanus = Gym(
                name='Movement Gowanus',
                location='Brooklyn, NY'
            )
            db.session.add(movement_gowanus)
            try:
                db.session.commit()
                current_app.logger.info("Added Movement Gowanus gym")
            except Exception as e:
                db.session.rollback()
                log_error(
                    current_app.logger,
                    ErrorCodes.DB_INTEGRITY_ERROR[0],
                    exc_info=True,
                    error_details=str(e)
                )
                return False

            # Initial routes for Movement Gowanus (all set on 10/28/2024)
            routes_data = [
                ('MG001', 'Pink', '5.5'),
                ('MG002', 'Red', '5.10d'),
                ('MG003', 'Blue', '5.9'),
                ('MG004', 'White', '5.11b'),
                ('MG005', 'Orange', '5.7'),
                ('MG006', 'Pink', '5.8'),
                ('MG007', 'Black', '5.11d'),
                ('MG008', 'Green', '5.11c'),
                ('MG009', 'Yellow', '5.10b'),
                ('MG010', 'Blue', '5.12a'),
                ('MG011', 'Red', '5.9'),
                ('MG012', 'Orange', '5.10a'),
                ('MG013', 'White', '5.11a')
            ]

            set_date = datetime(2024, 10, 28)
            for route_id, color, grade in routes_data:
                # Find corresponding grade_id
                grade_info = RouteGrade.query.filter_by(
                    grade=grade,
                    climbing_type='solo'
                ).first()

                if not grade_info:
                    current_app.logger.warning(f"Warning: Grade {grade} not found in RouteGrade table")
                    continue

                route = Route(
                    route_id=route_id,
                    color=color,
                    grade=grade,
                    grade_id=grade_info.id,
                    date_set=set_date,
                    gym_id=movement_gowanus.id,
                    wall_sector='Main Wall',
                    route_type='top_rope',
                    active=True
                )
                db.session.add(route)

            try:
                db.session.commit()
                current_app.logger.info("Added Movement Gowanus routes successfully")
            except Exception as e:
                db.session.rollback()
                log_error(
                    current_app.logger,
                    ErrorCodes.DB_INTEGRITY_ERROR[0],
                    exc_info=True,
                    error_details=str(e)
                )
                return False

        current_app.logger.info("Database initialization completed successfully")
        return True