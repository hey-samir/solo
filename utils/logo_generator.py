import svgwrite
from flask import current_app
import os

def generate_logo(output_path='static/images/logo.svg', width=200, height=100):
    """Generate the Solo app logo as an SVG file.

    Args:
        output_path (str): Path where the SVG file will be saved
        width (int): Width of the logo
        height (int): Height of the logo
    """
    # Create a new SVG drawing with the exact proportions
    dwg = svgwrite.Drawing(output_path, size=(width, height))

    # Add purple background rectangle
    dwg.add(dwg.rect(insert=(0, 0), size=(width, height), fill="#9747FF"))

    # Add the "solo" text as white paths
    # Text styling for "solo" in lowercase
    text = dwg.text("solo", 
                   insert=(width * 0.1, height * 0.75),
                   fill='white',
                   style="font-family: Arial, sans-serif; font-size: 60px; font-weight: bold;")
    dwg.add(text)

    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the SVG file
    dwg.save()
    return 'images/logo.svg'

def get_logo_path():
    """Get the path to the generated logo."""
    return 'images/logo.svg'