import os
import logging
from PIL import Image, ImageDraw

logger = logging.getLogger(__name__)

def generate_pwa_icons():
    """Generate various sized icons for PWA from the source favicon."""
    try:
        # Get absolute paths
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_path = os.path.join(current_dir, '..', 'attached_assets', 'solo-favicon.png')
        static_dir = os.path.join(current_dir, '..', 'static', 'images')

        logger.info(f"Generating PWA icons from source: {source_path}")
        logger.info(f"Output directory: {static_dir}")

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

        if not os.path.exists(source_path):
            logger.error(f"Source favicon not found at: {source_path}")
            return False

        # Open the source image
        with Image.open(source_path) as img:
            logger.info(f"Source image opened successfully: {img.size} {img.mode}")

            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
                logger.info("Converted image to RGBA mode")

            # Generate each size
            for filename, target_size in icon_sizes.items():
                logger.info(f"Generating {filename} ({target_size}x{target_size})")

                # Create a square canvas with transparent background
                icon = Image.new('RGBA', (target_size, target_size), (255, 255, 255, 0))

                # Calculate size to maintain aspect ratio
                aspect_ratio = img.width / img.height
                if aspect_ratio > 1:
                    new_width = target_size
                    new_height = int(target_size / aspect_ratio)
                else:
                    new_height = target_size
                    new_width = int(target_size * aspect_ratio)

                # Add padding to prevent edge touching
                padding = int(target_size * 0.1)  # 10% padding
                new_width = min(new_width, target_size - padding * 2)
                new_height = min(new_height, target_size - padding * 2)

                # Resize the image with high-quality resampling
                resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

                # Calculate position to center
                x = (target_size - new_width) // 2
                y = (target_size - new_height) // 2

                # For larger icons, create circular mask
                if target_size >= 96:
                    # Create circular mask
                    mask = Image.new('L', (target_size, target_size), 0)
                    draw = ImageDraw.Draw(mask)
                    draw.ellipse((0, 0, target_size, target_size), fill=255)

                    # Apply mask to resized image
                    output = Image.new('RGBA', (target_size, target_size), (255, 255, 255, 0))
                    output.paste(resized, (x, y), resized)
                    output.putalpha(mask)
                else:
                    output = icon
                    output.paste(resized, (x, y), resized)

                # Save with high quality
                output_path = os.path.join(static_dir, filename)
                if filename.endswith('.png'):
                    output.save(output_path, 'PNG', quality=95, optimize=True)
                else:
                    output.save(output_path, quality=95, optimize=True)
                logger.info(f"Saved icon: {output_path}")

        logger.info("PWA icons generated successfully")
        return True
    except Exception as e:
        logger.error(f"Error generating PWA icons: {str(e)}")
        return False

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    generate_pwa_icons()