import os
from PIL import Image, ImageDraw
import svg2png_py

LOGO_PATH = os.path.join("html", "assets", "sadax-logo.svg")
OUTPUT_DIR = os.path.join("html", "assets", "icons")

def svg_to_pil(svg_path, size):
    """تحويل SVG إلى صورة PIL بالحجم المطلوب"""
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_content = f.read()
    
    db = svg2png_py.FontDatabase.system()
    png_bytes = svg2png_py.svg_to_png(svg_content, db)
    
    # تحويل البايتات إلى صورة PIL
    import io
    img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img

def create_icon(size, filename, maskable=False):
    # خلفية سوداء
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    
    # تدرج قطري بسيط
    for y in range(size):
        for x in range(size):
            factor = (x + y) / (2 * size)
            r = g = b = int(26 * (1 - factor))
            bg.putpixel((x, y), (r, g, b, 255))
    
    # حدود داخلية زجاجية
    draw = ImageDraw.Draw(bg)
    border_width = max(1, int(size * 0.015))
    draw.rectangle([0, 0, size-1, size-1], outline=(255, 255, 255, 30), width=border_width)
    
    # تحميل الشعار
    logo_size = int(size * 0.6) if maskable else int(size * 0.7)
    logo = svg_to_pil(LOGO_PATH, logo_size)
    offset = ((size - logo.width) // 2, (size - logo.height) // 2)
    bg.paste(logo, offset, logo)
    
    # زوايا دائرية (لغير maskable)
    if not maskable:
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        radius = int(size * 0.22)
        mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)
        bg.putalpha(mask)
    
    bg.save(filename, "PNG")
    print(f"Created: {filename}")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    create_icon(192, os.path.join(OUTPUT_DIR, "icon-192.png"))
    create_icon(512, os.path.join(OUTPUT_DIR, "icon-512.png"))
    create_icon(512, os.path.join(OUTPUT_DIR, "icon-maskable-512.png"), maskable=True)
    
    # Apple icon (بدون شفافية)
    apple_img = Image.open(os.path.join(OUTPUT_DIR, "icon-512.png")).convert("RGB")
    apple_img = apple_img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_img.save(os.path.join(OUTPUT_DIR, "apple-180.png"), "PNG")
    print("Created: apple-180.png")

if __name__ == "__main__":
    main()