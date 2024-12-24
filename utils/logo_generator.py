import svgwrite
from flask import current_app
import os

def generate_logo(output_path='static/images/logo.svg', width=400, height=200):
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

    # Path data for "solo" text - matches the provided PNG design
    solo_path = dwg.path(d="""
        M80 140 
        c-10 0 -20 -4 -28 -12 
        c-8 -8 -12 -18 -12 -28 
        c0 -10 4 -20 12 -28 
        c8 -8 18 -12 28 -12 
        c10 0 20 4 28 12 
        c8 8 12 18 12 28 
        c0 10 -4 20 -12 28 
        c-8 8 -18 12 -28 12z

        M160 140
        c0 -30 5 -60 15 -80
        l10 0
        l0 160
        l-25 0
        l0 -80z

        M240 140
        c-10 0 -20 -4 -28 -12
        c-8 -8 -12 -18 -12 -28
        c0 -10 4 -20 12 -28
        c8 -8 18 -12 28 -12
        c10 0 20 4 28 12
        c8 8 12 18 12 28
        c0 10 -4 20 -12 28
        c-8 8 -18 12 -28 12z

        M320 140
        c-10 0 -20 -4 -28 -12
        c-8 -8 -12 -18 -12 -28
        c0 -10 4 -20 12 -28
        c8 -8 18 -12 28 -12
        c10 0 20 4 28 12
        c8 8 12 18 12 28
        c0 10 -4 20 -12 28
        c-8 8 -18 12 -28 12z
    """, fill="white")

    dwg.add(solo_path)

    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the SVG file
    dwg.save()
    return 'images/logo.svg'

def get_logo_path():
    """Get the path to the generated logo."""
    return 'images/logo.svg'