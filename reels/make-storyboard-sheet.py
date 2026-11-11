# Combines storyboard stills into one labelled sheet.
# Usage: python3 make-storyboard-sheet.py <dir> <out.png> "shot|time|label" ...
import sys
from PIL import Image, ImageDraw, ImageFont
d, out, items = sys.argv[1], sys.argv[2], sys.argv[3:]
F = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
cw, ch, pad, cols = 480, 853, 24, 3
rows = (len(items) + cols - 1) // cols
W = pad + cols * (cw + pad); H = 130 + rows * (ch + 110 + pad)
im = Image.new("RGB", (W, H), (13, 29, 24)); dr = ImageDraw.Draw(im)
dr.text((pad, 30), "AVNI INTRO REEL - STORYBOARD (60s)", font=F(40), fill=(255, 255, 255))
dr.text((pad, 82), "Male host + Avni heart buddy  |  Telugu dialogue  |  hard cut every 2-3 s", font=F(22), fill=(150, 220, 195))
for i, it in enumerate(items):
    shot, t, label = it.split("|")
    x = pad + (i % cols) * (cw + pad); y = 130 + (i // cols) * (ch + 110 + pad)
    im.paste(Image.open(f"{d}/{shot}.png").convert("RGB").resize((cw, ch)), (x, y))
    dr.rounded_rectangle((x, y + ch + 12, x + 150, y + ch + 52), 10, fill=(22, 163, 123))
    dr.text((x + 12, y + ch + 18), t, font=F(24), fill=(255, 255, 255))
    dr.text((x, y + ch + 64), label, font=F(22), fill=(230, 240, 236))
im.save(out, optimize=True); print(im.size)
