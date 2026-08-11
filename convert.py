from pathlib import Path
from PIL import Image

# Automatically use the folder containing this script
PROJECT_FOLDER = Path(__file__).parent

# Search the entire project
EXTENSIONS = {".png", ".jpg", ".jpeg"}

print("Scanning:")
print(PROJECT_FOLDER)
print()

image_files = [
    path
    for path in PROJECT_FOLDER.rglob("*")
    if path.is_file() and path.suffix.lower() in EXTENSIONS
]

print(f"Found {len(image_files)} images.\n")

if not image_files:
    print("No PNG/JPG/JPEG images found.")
    input("\nPress Enter to exit...")
    exit()

QUALITY = 85

for image_path in image_files:
    webp_path = image_path.with_suffix(".webp")

    try:
        with Image.open(image_path) as image:

            # Preserve transparency for PNGs
            if image.mode not in ("RGB", "RGBA"):
                if "A" in image.getbands():
                    image = image.convert("RGBA")
                else:
                    image = image.convert("RGB")

            image.save(
                webp_path,
                "WEBP",
                quality=QUALITY,
                method=6
            )

        original_size = image_path.stat().st_size
        new_size = webp_path.stat().st_size
        reduction = (1 - new_size / original_size) * 100

        print(
            f"[OK] {image_path.relative_to(PROJECT_FOLDER)}"
            f" -> {webp_path.name}"
            f" | {reduction:.1f}% smaller"
        )

    except Exception as e:
        print(f"[ERROR] {image_path}: {e}")

print("\nConversion complete.")
input("Press Enter to exit...")