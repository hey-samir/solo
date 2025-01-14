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

    try:
        # Open the source image
        with Image.open(source_path) as img:
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')

            # Generate each size
            for filename, size in icon_sizes.items():
                # Create a new image with white background
                background = Image.new('RGBA', (size, size), (255, 255, 255, 0))

                # Resize maintaining aspect ratio
                aspect = img.size[0] / img.size[1]
                if aspect > 1:
                    new_size = (size, int(size / aspect))
                else:
                    new_size = (int(size * aspect), size)

                resized = img.resize(new_size, Image.Resampling.LANCZOS)

                # Calculate position to center the image
                position = ((size - new_size[0]) // 2, (size - new_size[1]) // 2)

                # Paste the resized image onto the background
                background.paste(resized, position, resized)

                output_path = os.path.join(static_dir, filename)
                background.save(output_path, 'PNG', quality=95)

        return True
    except Exception as e:
        print(f"Error generating PWA icons: {str(e)}")
        return False

if __name__ == '__main__':
    generate_pwa_icons()