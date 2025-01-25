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

#This section is removed because we are no longer using Flask
#try:
#    from app import create_app
#    app = create_app()
#    logger.info("Successfully imported app and db")
#except Exception as e:
#    logger.error(f"Failed to import app: {str(e)}", exc_info=True)
#    sys.exit(1)

#This section is removed because we are no longer using Flask
#if __name__ == "__main__":
#    app.run(host="0.0.0.0", port=5000, debug=True)