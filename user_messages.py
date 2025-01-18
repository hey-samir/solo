"""
User-facing messages and notifications for the climbing application.
All customer-visible text should be maintained here to ensure consistent voice and branding.
"""

class MessageType:
    """Define message types for proper UI presentation"""
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"

# Success Messages - Positive reinforcement with climbing terminology
SUCCESS_MESSAGES = {
    'SEND_LOGGED': ("Send logged and chalked!", MessageType.SUCCESS),
    'PROFILE_UPDATED': ("Beta updated - your profile is looking solid!", MessageType.SUCCESS),
    'AVATAR_UPDATED': ("New profile pic is locked in and looking crisp!", MessageType.SUCCESS),
    'PHOTO_UPDATED': ("Your new profile shot is framed perfectly!", MessageType.SUCCESS),
    'REGISTRATION': ("Welcome to the crag! Your account is ready for some epic sends!", MessageType.SUCCESS),
    'FEEDBACK_SUBMITTED': ("Your beta has been shared with the crew! Thanks for helping us level up!", MessageType.SUCCESS),
    'VOTE_ADDED': ("Beta approved! Thanks for the vote!", MessageType.SUCCESS),
    'VOTE_REMOVED': ("Beta vote removed - keeping it real!", MessageType.SUCCESS)
}

# Info Messages - Helpful guidance and navigation
INFO_MESSAGES = {
    'LOGIN_REQUIRED': ("Please clip in (log in) to access this route!", MessageType.INFO),
    'GYM_SUBMISSION': ("Help us map out your local crag! Drop the beta in our feedback form.", MessageType.INFO),
    'OFFLINE_MODE': ("You're off the grid! Some features might be sketchy until you reconnect.", MessageType.INFO),
    'PENDING_SYNC': ("Your sends will be logged once you're back online - keep crushing!", MessageType.INFO)
}

# Warning Messages - User attention needed but not critical
WARNING_MESSAGES = {
    'NO_ROUTE': ("Psst... you need to pick a route first!", MessageType.WARNING),
    'NO_PHOTO_UPLOAD': ("Can't send without beta! Upload a photo and let's get climbing!", MessageType.WARNING),
    'NO_PHOTO_SELECTED': ("No photo selected - pick your best angle and let's capture that send!", MessageType.WARNING),
    'GYM_NOT_FOUND': ("This gym seems off the map. Pick another or help us add it!", MessageType.WARNING),
    'INVALID_FILE': ("That file type isn't in our guidebook. Stick to JPEGs and PNGs for the cleanest beta!", MessageType.WARNING),
    'LOGIN_FAILED': ("Whoops! That beta isn't matching our guidebook. Double-check and try again!", MessageType.WARNING),
    'USERNAME_INVALID': ("Keep your username clean like a nice jug - letters and numbers only!", MessageType.WARNING),
    'USERNAME_TAKEN': ("That username's already on the wall! Pick another and crush it!", MessageType.WARNING),
    'EMAIL_TAKEN': ("This email's already tied in! Maybe log in instead?", MessageType.WARNING)
}

# User Error Messages - Friendly error messages for user-facing issues
USER_ERROR_MESSAGES = {
    'PROFILE_UPDATE': ("Profile update took a whipper! Let's try that again.", MessageType.ERROR),
    'PHOTO_UPLOAD': ("This photo's not sticking the landing. Mind trying another?", MessageType.ERROR),
    'AVATAR_UPDATE': ("Avatar update ran into some choss. Give it another go!", MessageType.ERROR),
    'SEND_UPDATE': ("Send logging hit a sketchy section. Want to try that again?", MessageType.ERROR)
}

def get_user_message(message_key: str, message_type: str = None) -> tuple:
    """
    Get a user-facing message by its key and optional type override.
    
    Args:
        message_key: The key for the message to retrieve
        message_type: Optional override for the message type
    
    Returns:
        tuple: (message text, message type)
    """
    # Search in all message dictionaries
    all_messages = {
        **SUCCESS_MESSAGES,
        **INFO_MESSAGES,
        **WARNING_MESSAGES,
        **USER_ERROR_MESSAGES
    }
    
    message = all_messages.get(message_key)
    if not message:
        return ("An unexpected error occurred.", MessageType.ERROR)
    
    text, type_ = message
    return text, message_type if message_type else type_
