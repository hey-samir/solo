import os
from flask import current_app
import shutil

def generate_logo():
    """Copy the Solo icon PNG to the static images directory."""
    static_dir = os.path.join('static', 'images')
    os.makedirs(static_dir, exist_ok=True)

    # Copy the provided PNG to static directory
    source_path = os.path.join('attached_assets', 'Solo-icon.png')
    dest_path = os.path.join(static_dir, 'logo.png')
    shutil.copy2(source_path, dest_path)
    return 'images/logo.png'

def get_logo_path():
    """Get the path to the logo image."""
    return 'images/logo.png'