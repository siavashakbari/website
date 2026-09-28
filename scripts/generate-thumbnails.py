import os
from PIL import Image

ASSETS_ROOT = "src/assets"
THUMBS_ROOT = "public/thumbs"
TARGET_MAX_BYTES = 20 * 1024  # Under 20KB each
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def generate_all_thumbs():
    os.makedirs(THUMBS_ROOT, exist_ok=True)
    count = 0
    for root, dirs, files in os.walk(ASSETS_ROOT):
        if "_assets_reorg" in root or "node_modules" in root:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in EXTS and not f.endswith("-thumb.webp"):
                src_path = os.path.join(root, f)
                stem = os.path.splitext(f)[0]
                out_path = os.path.join(THUMBS_ROOT, stem + ".webp")
                
                try:
                    with Image.open(src_path) as im:
                        im = im.convert("RGB")
                        im.thumbnail((450, 450), Image.Resampling.LANCZOS)
                        im.save(out_path, "WEBP", quality=60, method=4)
                        
                        # Guard to ensure under 20KB
                        size = os.path.getsize(out_path)
                        q = 55
                        max_dim = 400
                        while size > TARGET_MAX_BYTES and q >= 20:
                            im_copy = im.copy()
                            im_copy.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                            im_copy.save(out_path, "WEBP", quality=q, method=6)
                            size = os.path.getsize(out_path)
                            q -= 8
                            max_dim -= 30
                        count += 1
                except Exception as e:
                    print(f"Error {src_path}: {e}")
                    
    print(f"Successfully generated {count} thumbnails (< 20KB each) into {THUMBS_ROOT}")

if __name__ == "__main__":
    generate_all_thumbs()
