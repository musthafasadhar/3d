import sys,os,time,numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
from PIL import Image
M=sys.argv[1]; outd=sys.argv[2]; os.makedirs(outd,exist_ok=True)
frames=[int(x) for x in sys.argv[3:]] or range(1,897)
opts=vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=M),
    running_mode=vision.RunningMode.IMAGE, output_confidence_masks=True, output_category_mask=False)
seg=vision.ImageSegmenter.create_from_options(opts)
t=time.time()
for i in frames:
    im=np.asarray(Image.open(f"fr/{i:04d}.jpg").convert("RGB"))
    r=seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.ascontiguousarray(im)))
    cms=[c.numpy_view() for c in r.confidence_masks]
    if len(cms)==1: fg=cms[0]
    else: fg=1-cms[0]   # multiclass: 0=background
    fg=np.squeeze(np.asarray(fg,np.float32))
    Image.fromarray((np.clip(fg,0,1)*255).astype(np.uint8)).save(f"{outd}/{i:04d}.png")
print("per frame",(time.time()-t)/len(frames))
