"""
Internal error handling and logging for the climbing application.
This module handles system-level errors and technical logging.
"""
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ErrorSeverity:
    """Define error severity levels for internal error handling"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class ErrorCodes:
    """System error codes with severity levels"""
    # Authentication System Errors
    AUTH_INVALID_TOKEN = ("AUTH001", ErrorSeverity.ERROR)
    AUTH_EXPIRED_TOKEN = ("AUTH002", ErrorSeverity.WARNING)
    AUTH_MISSING_CREDENTIALS = ("AUTH003", ErrorSeverity.ERROR)
    AUTH_INVALID_SCOPE = ("AUTH004", ErrorSeverity.ERROR)

    # Database System Errors
    DB_CONNECTION_ERROR = ("DB001", ErrorSeverity.CRITICAL)
    DB_QUERY_ERROR = ("DB002", ErrorSeverity.ERROR)
    DB_INTEGRITY_ERROR = ("DB003", ErrorSeverity.ERROR)
    DB_MIGRATION_ERROR = ("DB004", ErrorSeverity.CRITICAL)
    DB_DEADLOCK_ERROR = ("DB005", ErrorSeverity.ERROR)
    DB_CONNECTION_POOL_EXHAUSTED = ("DB006", ErrorSeverity.CRITICAL)
    DB_REPLICATION_LAG = ("DB007", ErrorSeverity.WARNING)
    DB_BACKUP_FAILED = ("DB008", ErrorSeverity.ERROR)

    # File System Errors
    FS_PERMISSION_ERROR = ("FS001", ErrorSeverity.ERROR)
    FS_STORAGE_FULL = ("FS002", ErrorSeverity.CRITICAL)
    FS_IO_ERROR = ("FS003", ErrorSeverity.ERROR)

    # API System Errors
    API_RATE_LIMIT = ("API001", ErrorSeverity.WARNING)
    API_TIMEOUT = ("API002", ErrorSeverity.ERROR)
    API_INVALID_RESPONSE = ("API003", ErrorSeverity.ERROR)

    # Cache System Errors
    CACHE_MISS = ("CACHE001", ErrorSeverity.INFO)
    CACHE_INVALID = ("CACHE002", ErrorSeverity.WARNING)
    CACHE_EVICTION = ("CACHE003", ErrorSeverity.WARNING)

    # Resource Monitoring Errors
    RESOURCE_CPU_THRESHOLD = ("RES001", ErrorSeverity.WARNING)
    RESOURCE_MEMORY_THRESHOLD = ("RES002", ErrorSeverity.WARNING)
    RESOURCE_DISK_THRESHOLD = ("RES003", ErrorSeverity.WARNING)
    RESOURCE_NETWORK_THRESHOLD = ("RES004", ErrorSeverity.WARNING)

    # General System Errors
    SYSTEM_RESOURCE_EXHAUSTED = ("SYS001", ErrorSeverity.CRITICAL)
    SYSTEM_CONFIGURATION_ERROR = ("SYS002", ErrorSeverity.ERROR)

def get_error_details(error_code: str, severity_override: Optional[str] = None) -> tuple:
    """
    Get technical error details for system logging.

    Args:
        error_code: The error code to look up
        severity_override: Optional override for the severity level

    Returns:
        tuple: (error description, severity level, log_level)
    """
    # Technical error descriptions for system logging
    error_details = {
        ErrorCodes.AUTH_INVALID_TOKEN[0]: ("Invalid authentication token provided", ErrorSeverity.ERROR),
        ErrorCodes.AUTH_EXPIRED_TOKEN[0]: ("Authentication token has expired", ErrorSeverity.WARNING),
        ErrorCodes.DB_CONNECTION_ERROR[0]: ("Failed to establish database connection", ErrorSeverity.CRITICAL),
        ErrorCodes.DB_QUERY_ERROR[0]: ("Database query execution failed", ErrorSeverity.ERROR),
        ErrorCodes.DB_DEADLOCK_ERROR[0]: ("Database deadlock detected", ErrorSeverity.ERROR),
        ErrorCodes.DB_CONNECTION_POOL_EXHAUSTED[0]: ("Database connection pool exhausted", ErrorSeverity.CRITICAL),
        ErrorCodes.DB_REPLICATION_LAG[0]: ("Database replication lag detected", ErrorSeverity.WARNING),
        ErrorCodes.DB_BACKUP_FAILED[0]: ("Database backup operation failed", ErrorSeverity.ERROR),
        ErrorCodes.FS_PERMISSION_ERROR[0]: ("Insufficient filesystem permissions", ErrorSeverity.ERROR),
        ErrorCodes.API_RATE_LIMIT[0]: ("API rate limit exceeded", ErrorSeverity.WARNING),
        ErrorCodes.SYSTEM_RESOURCE_EXHAUSTED[0]: ("System resources exhausted", ErrorSeverity.CRITICAL),
        ErrorCodes.RESOURCE_CPU_THRESHOLD[0]: ("CPU usage threshold exceeded", ErrorSeverity.WARNING),
        ErrorCodes.RESOURCE_MEMORY_THRESHOLD[0]: ("Memory usage threshold exceeded", ErrorSeverity.WARNING),
        ErrorCodes.RESOURCE_DISK_THRESHOLD[0]: ("Disk usage threshold exceeded", ErrorSeverity.WARNING),
        ErrorCodes.RESOURCE_NETWORK_THRESHOLD[0]: ("Network usage threshold exceeded", ErrorSeverity.WARNING)
    }

    description, severity = error_details.get(error_code, ("Unknown system error", ErrorSeverity.ERROR))
    if severity_override:
        severity = severity_override

    return description, severity

def format_error_context(context: Dict[str, Any]) -> str:
    """Format error context for structured logging"""
    try:
        return json.dumps(context, default=str)
    except Exception:
        return str(context)

def log_error(logger, error_code: str, exc_info=None, **kwargs):
    """
    Log a system error with appropriate severity and structured context.

    Args:
        logger: The logger instance to use
        error_code: The error code to log
        exc_info: Optional exception info to include
        **kwargs: Additional logging context
    """
    description, severity = get_error_details(error_code)

    # Build structured log context
    log_context = {
        'error_code': error_code,
        'timestamp': datetime.now().isoformat(),
        'severity': severity
    }

    # Add any additional context
    if kwargs:
        log_context['details'] = kwargs

    # Format the structured log message
    log_message = f"{description} | {format_error_context(log_context)}"

    # Log with appropriate severity level
    if severity == ErrorSeverity.CRITICAL:
        logger.critical(log_message, exc_info=exc_info)
    elif severity == ErrorSeverity.ERROR:
        logger.error(log_message, exc_info=exc_info)
    elif severity == ErrorSeverity.WARNING:
        logger.warning(log_message)
    else:
        logger.info(log_message)