import os
from flask import current_app
import shutil

def generate_logo():
    """Use the SVG logo"""
    return 'images/logo.svg'

def get_logo_path():
    """Get the path to the logo image."""
    return 'images/logo.svg'