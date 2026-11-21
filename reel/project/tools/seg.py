import subprocess, numpy as np, sys
from rembg import new_session, remove
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
s = new_session('u2net_human_seg')
p = subprocess.Popen(['ffmpeg','-v','error','-i',src,'-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
i=0; N=1080*1920*3
while True:
    b = p.stdout.read(N)
    if len(b)<N: break
    im = Image.frombuffer('RGB',(1080,1920),b).resize((540,960), Image.BILINEAR)
    m = remove(im, session=s, only_mask=True, post_process_mask=False)
    m.save(f'{out}/{i:05d}.png'); i+=1
    if i%100==0: print(i, flush=True)
print('done', i)
