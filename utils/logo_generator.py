import svgwrite
from flask import current_app
import os

def generate_logo(output_path='static/images/logo.svg', size=100):
    """Generate the Solo app logo as an SVG file.
    
    Args:
        output_path (str): Path where the SVG file will be saved
        size (int): Size of the logo in pixels
    """
    # Create a new SVG drawing
    dwg = svgwrite.Drawing(output_path, size=(size, size))
    
    # Define colors
    purple = '#6f42c1'  # Bootstrap purple
    
    # Create the background circle
    circle = dwg.circle(center=(size/2, size/2), r=size/2.2)
    circle.fill(purple)
    dwg.add(circle)
    
    # Add the text "solo"
    text = dwg.text('solo',
                   insert=(size/2, size/2 + size/8),
                   font_family='Samsung Sans',
                   font_weight='bold',
                   font_size=size/2.5,
                   fill='white',
                   text_anchor='middle')
    dwg.add(text)
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the SVG file
    dwg.save()
    return output_path

def get_logo_path():
    """Get the path to the generated logo."""
    return 'images/logo.svg'
