import os
from PIL import Image

def generate_pwa_icons():
    """Generate various sized icons for PWA from the source favicon."""
    source_path = os.path.join('attached_assets', 'solo-favicon.png')
    static_dir = os.path.join('static', 'images')
    os.makedirs(static_dir, exist_ok=True)

    # Define the required sizes for different purposes
    icon_sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'android-chrome-96x96.png': 96,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512
    }

    # Open the source image
    with Image.open(source_path) as img:
        # Generate each size
        for filename, size in icon_sizes.items():
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = os.path.join(static_dir, filename)
            resized.save(output_path, 'PNG', quality=95)

if __name__ == '__main__':
    generate_pwa_icons()
