"""
Centralized error and notification handling for the climbing application.
This module combines both error codes and notification messages.
"""

class ErrorCodes:
    """Error codes for the application"""
    INVALID_CREDENTIALS = "AUTH001"
    USERNAME_INVALID = "AUTH002"
    USERNAME_TAKEN = "AUTH003"
    EMAIL_TAKEN = "AUTH004"
    PROFILE_UPDATE_FAILED = "PROF001"
    PHOTO_UPLOAD_FAILED = "PROF002"
    DATABASE_ERROR = "DB001"
    FILE_ERROR = "FILE001"
    SERVER_ERROR = "SRV001"

# Success Messages
SEND_UPDATE_SUCCESS = "Send logged and chalked!"
PROFILE_UPDATE_SUCCESS = "Beta updated - your profile is looking solid!"
AVATAR_UPDATE_SUCCESS = "New profile pic is locked in and looking crisp!"
PROFILE_PHOTO_UPDATE_SUCCESS = "Your new profile shot is framed perfectly!"
REGISTRATION_SUCCESS = "Welcome to the crag! Your account is ready for some epic sends!"
FEEDBACK_SUBMIT_SUCCESS = "Your beta has been shared with the crew! Thanks for helping us level up!"
VOTE_ADDED_SUCCESS = "Beta approved! Thanks for the vote!"
VOTE_REMOVED_SUCCESS = "Beta vote removed - keeping it real!"

# Info Messages
LOGIN_REQUIRED = "Please clip in (log in) to access this route!"
GYM_SUBMISSION_INFO = "Help us map out your local crag! Drop the beta in our feedback form."
OFFLINE_INFO = "You're off the grid! Some features might be sketchy until you reconnect."
PENDING_SYNC_INFO = "Your sends will be logged once you're back online - keep crushing!"

# Warning Messages
NO_ROUTE_SELECTED = "Psst... you need to pick a route first!"
NO_FILE_UPLOADED = "Can't send without beta! Upload a photo and let's get climbing!"
NO_FILE_SELECTED = "No photo selected - pick your best angle and let's capture that send!"
GYM_NOT_FOUND = "This gym seems off the map. Pick another or help us add it!"
INVALID_FILE_TYPE = "That file type isn't in our guidebook. Stick to JPEGs and PNGs for the cleanest beta!"

# Error Messages
LOGIN_ERROR = "Whoops! That beta isn't matching our guidebook. Double-check and try again!"
REGISTRATION_USERNAME_ERROR = "Keep your username clean like a nice jug - letters and numbers only!"
REGISTRATION_USERNAME_TAKEN_ERROR = "That username's already on the wall! Pick another and crush it!"
REGISTRATION_EMAIL_TAKEN_ERROR = "This email's already tied in! Maybe log in instead?"
UPDATE_PROFILE_USERNAME_ERROR = "Username needs to stick to the basics - just letters and numbers!"
UPDATE_PROFILE_USERNAME_TAKEN_ERROR = "That username's already taken - like a proj that's been sent! Try another!"
PROFILE_UPDATE_ERROR = "Profile update took a whipper! Let's try that again."
PROFILE_PHOTO_ERROR = "This photo's not sticking the landing. Mind trying another?"
AVATAR_UPDATE_ERROR = "Avatar update ran into some choss. Give it another go!"
SEND_UPDATE_ERROR = "Send logging hit a sketchy section. Want to try that again?"
INTERNAL_SERVER_ERROR = "Our systems took a whipper! We're working on the rescue."
DATABASE_ERROR = "The beta database is a bit sketchy right now. Mind trying again?"
FILE_UPLOAD_ERROR = "File upload lost its grip. Let's give it another try!"
PHOTO_PROCESSING_ERROR = "This photo's beta is too complex. Can you try a different one?"

def get_error_message(error_code: str, **kwargs) -> str:
    """
    Get an error message based on the error code and optional parameters.
    
    Args:
        error_code: The error code to look up
        **kwargs: Optional parameters to format into the message
    
    Returns:
        str: The formatted error message
    """
    error_messages = {
        ErrorCodes.INVALID_CREDENTIALS: LOGIN_ERROR,
        ErrorCodes.USERNAME_INVALID: REGISTRATION_USERNAME_ERROR,
        ErrorCodes.USERNAME_TAKEN: REGISTRATION_USERNAME_TAKEN_ERROR,
        ErrorCodes.EMAIL_TAKEN: REGISTRATION_EMAIL_TAKEN_ERROR,
        ErrorCodes.PROFILE_UPDATE_FAILED: PROFILE_UPDATE_ERROR,
        ErrorCodes.PHOTO_UPLOAD_FAILED: PROFILE_PHOTO_ERROR,
        ErrorCodes.DATABASE_ERROR: DATABASE_ERROR,
        ErrorCodes.FILE_ERROR: FILE_UPLOAD_ERROR,
        ErrorCodes.SERVER_ERROR: INTERNAL_SERVER_ERROR
    }
    
    message = error_messages.get(error_code, INTERNAL_SERVER_ERROR)
    try:
        return message.format(**kwargs) if kwargs else message
    except KeyError:
        return message
