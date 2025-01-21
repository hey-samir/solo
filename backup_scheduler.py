"""
Automated database backup scheduling and failover configuration for the climbing application.
"""
import os
import time
from datetime import datetime, timedelta
import threading
from flask import current_app
from errors import ErrorCodes, log_error

class BackupScheduler:
    """Manages automated database backups and failover"""

    def __init__(self, app, backup_interval_hours=24):
        self.app = app
        self.backup_interval = backup_interval_hours * 3600  # Convert to seconds
        self.last_backup = None
        self.is_running = False
        self.backup_thread = None

    def start(self):
        """Start the backup scheduler"""
        if self.is_running:
            return

        self.is_running = True
        self.backup_thread = threading.Thread(target=self._backup_loop)
        self.backup_thread.daemon = True
        self.backup_thread.start()

        current_app.logger.info("Backup scheduler started")

    def stop(self):
        """Stop the backup scheduler"""
        self.is_running = False
        if self.backup_thread:
            self.backup_thread.join()
        current_app.logger.info("Backup scheduler stopped")

    def _backup_loop(self):
        """Main backup scheduling loop"""
        while self.is_running:
            try:
                with self.app.app_context():
                    # Check if backup is needed
                    if self._should_backup():
                        # Verify database health before backup
                        from health_checks import check_database_health
                        health_status = check_database_health()
                        if health_status['status'] != 'healthy':
                            log_error(
                                current_app.logger,
                                ErrorCodes.DB_CONNECTION_ERROR[0],
                                health_status=health_status
                            )
                            time.sleep(300)  # Wait 5 minutes before retry
                            continue

                        # Perform backup
                        from migrations import backup_database
                        if backup_database():
                            self.last_backup = datetime.now()
                            current_app.logger.info("Scheduled backup completed successfully")
                        else:
                            log_error(
                                current_app.logger,
                                ErrorCodes.DB_BACKUP_FAILED[0],
                                retry_scheduled=True
                            )

            except Exception as e:
                log_error(
                    current_app.logger,
                    ErrorCodes.SYSTEM_CONFIGURATION_ERROR[0],
                    exc_info=True,
                    error_details=str(e)
                )

            # Sleep for 1 hour before next check
            time.sleep(3600)

    def _should_backup(self):
        """Determine if backup is needed based on interval"""
        if not self.last_backup:
            return True

        time_since_backup = datetime.now() - self.last_backup
        return time_since_backup.total_seconds() >= self.backup_interval

    def force_backup(self):
        """Force an immediate backup"""
        with self.app.app_context():
            from migrations import backup_database
            if backup_database():
                self.last_backup = datetime.now()
                return True
        return False

def init_backup_scheduler(app, interval_hours=24):
    """Initialize the backup scheduler"""
    scheduler = BackupScheduler(app, interval_hours)
    scheduler.start()
    return scheduler