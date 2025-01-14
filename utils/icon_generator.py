import os
from PIL import Image, ImageDraw

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
            for filename, target_size in icon_sizes.items():
                # Create a new image with white background
                background = Image.new('RGBA', (target_size, target_size), (255, 255, 255, 255))

                # Calculate the size to maintain aspect ratio with padding
                padding_factor = 0.9  # 10% padding
                available_size = int(target_size * padding_factor)

                # Calculate new dimensions maintaining aspect ratio
                ratio = min(available_size / img.width, available_size / img.height)
                new_width = int(img.width * ratio)
                new_height = int(img.height * ratio)

                # Resize the image with high-quality resampling
                resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

                # Calculate position to center
                x = (target_size - new_width) // 2
                y = (target_size - new_height) // 2

                # Create a circular mask if size is large enough
                if target_size >= 96:
                    mask = Image.new('L', (target_size, target_size), 0)
                    draw = ImageDraw.Draw(mask)
                    draw.ellipse((0, 0, target_size, target_size), fill=255)
                    background.putalpha(mask)

                # Paste the resized image onto the background
                background.paste(resized, (x, y), resized)

                # Save the final icon with high quality
                output_path = os.path.join(static_dir, filename)
                background.save(output_path, 'PNG', quality=95)

        return True
    except Exception as e:
        print(f"Error generating PWA icons: {str(e)}")
        return False

if __name__ == '__main__':
    generate_pwa_icons()