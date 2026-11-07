import os
import zlib
import struct
import math

def create_png(width, height, draw_func):
    """Creates a PNG buffer using only standard library (zlib, struct)."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend((r, g, b, a))
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return bytes(png)

def draw_island_icon(x, y, w, h, maskable=False):
    # Background: dark obsidian (#09090b)
    bg_r, bg_g, bg_b = 9, 9, 11
    
    # Center coordinates
    cx, cy = w / 2, h / 2
    
    # Scale factor
    scale = (0.65 if maskable else 0.85)
    
    # Island pill dimensions
    pill_w = w * 0.6 * scale
    pill_h = h * 0.28 * scale
    radius = pill_h / 2
    
    # Camera dot
    cam_x = cx - pill_w * 0.25
    cam_r = pill_h * 0.2
    
    # Sound wave indicator on right
    wave_x = cx + pill_w * 0.25
    
    # Distance to pill rounded rectangle
    dx = max(abs(x - cx) - (pill_w / 2 - radius), 0)
    dy = max(abs(y - cy) - (pill_h / 2 - radius), 0)
    dist = math.sqrt(dx * dx + dy * dy) - radius
    
    # Check if inside pill
    if dist <= 0:
        # Inside the island pill: jet black (#000000) with subtle silver rim (#3f3f46)
        if dist >= -1.5:
            # Silver border
            return (160, 160, 165, 255)
        
        # Check camera dot
        d_cam = math.sqrt((x - cam_x)**2 + (y - cy)**2)
        if d_cam <= cam_r:
            if d_cam <= cam_r * 0.4:
                return (20, 25, 45, 255) # Deep blue lens center
            return (15, 15, 18, 255)
            
        # Check sound wave bars on right
        d_wave = abs(x - wave_x)
        if d_wave <= pill_w * 0.12 and abs(y - cy) <= pill_h * 0.3:
            bar_spacing = pill_w * 0.04
            bar_idx = round((x - wave_x) / bar_spacing)
            if abs(x - (wave_x + bar_idx * bar_spacing)) <= 1.2:
                heights = [pill_h * 0.15, pill_h * 0.28, pill_h * 0.2]
                idx_clamped = min(max(bar_idx + 1, 0), 2)
                if abs(y - cy) <= heights[idx_clamped]:
                    return (230, 230, 235, 255) # white sound bar
                    
        return (0, 0, 0, 255) # Pure black island body
        
    # Outer subtle glow / background
    glow_dist = dist
    if glow_dist < 8:
        t = 1.0 - (glow_dist / 8.0)
        alpha = int(t * 30)
        return (bg_r + alpha, bg_g + alpha, bg_b + alpha, 255)
        
    return (bg_r, bg_g, bg_b, 255)

os.makedirs('public', exist_ok=True)

# Generate 192x192
print("Generating pwa-192x192.png...")
png_192 = create_png(192, 192, lambda x, y, w, h: draw_island_icon(x, y, w, h, False))
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(png_192)

# Generate 512x512
print("Generating pwa-512x512.png...")
png_512 = create_png(512, 512, lambda x, y, w, h: draw_island_icon(x, y, w, h, False))
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(png_512)

# Generate maskable 512x512 (with safe-zone padding)
print("Generating pwa-maskable-512x512.png...")
png_maskable = create_png(512, 512, lambda x, y, w, h: draw_island_icon(x, y, w, h, True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(png_maskable)

# Generate apple-touch-icon 180x180
print("Generating apple-touch-icon.png...")
png_apple = create_png(180, 180, lambda x, y, w, h: draw_island_icon(x, y, w, h, False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)

print("All PNG icons generated successfully!")
