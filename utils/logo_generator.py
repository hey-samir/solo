import svgwrite
from flask import current_app
import os

def generate_logo(output_path='static/images/logo.svg', size=100):
    """Generate the Solo app logo as an SVG file.

    Args:
        output_path (str): Path where the SVG file will be saved
        size (int): Size of the logo in pixels
    """
    # Create a new SVG drawing with transparent background
    dwg = svgwrite.Drawing(output_path, size=(size * 2, size))

    # Calculate text and circle dimensions
    text_y = size * 0.65  # Vertical position of text
    circle_radius = size * 0.25  # Size of the O circles
    o1_x = size * 0.95  # First O position
    o2_x = size * 1.45  # Second O position

    # Add the base text elements (s, l)
    text_style = 'font-family: Arial, sans-serif; font-weight: normal;'
    dwg.add(dwg.text('s', insert=(size * 0.45, text_y),
                     font_size=size * 0.8,
                     style=text_style,
                     fill='white'))
    dwg.add(dwg.text('l', insert=(size * 0.75, text_y),
                     font_size=size * 0.8,
                     style=text_style,
                     fill='white'))

    # Create the first O with mountain
    # White circle background
    dwg.add(dwg.circle(center=(o1_x, text_y - circle_radius * 0.8),
                      r=circle_radius,
                      fill='white'))

    # Mountain silhouette (dark triangle)
    mountain_height = circle_radius * 1.4
    mountain_width = circle_radius * 1.6
    mountain_x = o1_x
    mountain_y = text_y - circle_radius * 0.8
    mountain_points = [
        (mountain_x - mountain_width/2, mountain_y + circle_radius * 0.5),  # Left base
        (mountain_x, mountain_y - mountain_height/2),  # Peak
        (mountain_x + mountain_width/2, mountain_y + circle_radius * 0.5),  # Right base
    ]
    dwg.add(dwg.polygon(points=mountain_points, fill='black'))

    # Create the second O (simple white circle)
    dwg.add(dwg.circle(center=(o2_x, text_y - circle_radius * 0.8),
                      r=circle_radius,
                      fill='white'))

    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the SVG file
    dwg.save()
    return 'images/logo.svg'

def get_logo_path():
    """Get the path to the generated logo."""
    return 'images/logo.svg'