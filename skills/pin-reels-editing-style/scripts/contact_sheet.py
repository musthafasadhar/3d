import sys, glob
from PIL import Image, ImageDraw
d, out, step, cols, rows, w = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
start = int(sys.argv[7]) if len(sys.argv)>7 else 0
fs = sorted(glob.glob(d+'/*.jpg'))
sel = list(range(start, len(fs), step))[:cols*rows]
im0 = Image.open(fs[0]); h = int(w*im0.height/im0.width)
sh = Image.new('RGB',(cols*w, rows*h),'white')
for k,i in enumerate(sel):
    t = Image.open(fs[i]).resize((w,h))
    ImageDraw.Draw(t).text((4,4), '%.2fs'%(i/12), fill='yellow')
    sh.paste(t,((k%cols)*w,(k//cols)*h))
sh.save(out, quality=85)
print(out, len(sel), sh.size)
