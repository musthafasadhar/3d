# Builds a labelled character reference sheet from the rendered views.
import sys
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]
def font(sz):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
        try: return ImageFont.truetype(f, sz)
        except OSError: pass
    return ImageFont.load_default()
rows = [
  [("01_front","FRONT"),("02_front_3q_left","FRONT 3/4 L"),("03_side_left","SIDE L"),("04_back_3q_left","BACK 3/4 L"),("05_back","BACK")],
  [("06_back_3q_right","BACK 3/4 R"),("07_side_right","SIDE R"),("08_front_3q_right","FRONT 3/4 R"),("09_top","TOP"),("10_low_angle","LOW ANGLE")],
  [("11_face_front","FACE FRONT"),("12_face_3q","FACE 3/4"),("13_face_side","FACE SIDE"),("14_face_back","FACE BACK"),("00_hero_reel_closeup","REEL CLOSE-UP")],
]
cw, ch, pad, top = 420, 630, 16, 110
W = pad + 5 * (cw + pad); H = top + 3 * (ch + 50 + pad)
sheet = Image.new("RGB", (W, H), (24, 22, 32)); dr = ImageDraw.Draw(sheet)
dr.text((pad, 24), "HOST (MALE) - CHARACTER REFERENCE", font=font(44), fill=(255, 255, 255))
dr.text((pad, 76), "soft low-poly chibi | round glasses | blue puffy jacket over black tee | head = 45% of height", font=font(22), fill=(190, 185, 210))
for r, row in enumerate(rows):
    for c, (name, label) in enumerate(row):
        im = Image.open(f"{d}/{name}.png").convert("RGB")
        im = im.resize((cw, int(im.height * cw / im.width)))
        if im.height > ch:  # center-crop tall images
            o = (im.height - ch) // 2; im = im.crop((0, o, cw, o + ch))
        x = pad + c * (cw + pad); y = top + r * (ch + 50 + pad)
        sheet.paste(im, (x, y))
        dr.text((x + 4, y + ch + 10), label, font=font(26), fill=(255, 210, 31))
sheet.save(f"{d}/../reference-sheet.png", optimize=True)
print("sheet", sheet.size)
