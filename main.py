import logging
import sys

# Initialize logging with proper formatting
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

try:
    from app import app
    logger.info("Successfully imported app")
except Exception as e:
    logger.error(f"Failed to import app: {str(e)}", exc_info=True)
    sys.exit(1)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)