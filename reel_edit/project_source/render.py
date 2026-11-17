import sys, os, subprocess, numpy as np, cv2, math, time
from multiprocessing import Pool
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from lib import W, H, FPS
import timeline as TL

SRC_W, SRC_H = 720, 1280
MODE = sys.argv[1] if len(sys.argv) > 1 else "test"   # test | full
OUT = "out"; os.makedirs(OUT, exist_ok=True)

def load_src():
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "src/in.mp4", "-vf", "scale=in_color_matrix=bt709:in_range=tv,format=rgb24",
                        "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(p, np.uint8).reshape(-1, SRC_H, SRC_W, 3)
def load_alpha():
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "matte/alpha.avi", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                       capture_output=True, check=True).stdout
    return np.frombuffer(p, np.uint8).reshape(-1, SRC_H, SRC_W)

SRC = ALPHA = None
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H * .45) / (H * .62)) ** 2)
VIGN = (1 - .38 * np.clip(_r - .45, 0, 1) ** 1.6 / .55 ** 1.6).clip(.55, 1)[..., None].astype(np.float32)

def render_frame(i):
    t = i / FPS
    M, z = TL.camera(t)
    Ms = M.copy(); Ms[:, :2] *= 1.5
    fr = cv2.warpAffine(SRC[i], Ms, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT).astype(np.float32) / 255
    al = cv2.warpAffine(ALPHA[i], Ms, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)[..., None] / 255
    # gentle detail recovery after upscale
    bl = cv2.GaussianBlur(fr, (0, 0), 1.3); fr = np.clip(fr + .32 * (fr - bl), 0, 1)
    # background-only grade: slightly darker, less saturated, vignette (person untouched)
    lum = fr @ np.array([.2126, .7152, .0722], np.float32)
    bg = (fr * .88 + lum[..., None] * .12) * .86 * VIGN
    base = fr * al + bg * (1 - al)
    comp = base.copy()
    layers = {}
    act = [e for e in TL.ELEMENTS if e["t0"] <= t < e["t1"]]
    for e in [e for e in act if e["layer"] == "back"] + [e for e in act if e["layer"] == "front"]:
        cv = np.zeros((H, W, 4), np.float32)
        e["draw"](cv, t)
        if e["layer"] == "back":
            cv = cv2.warpAffine(cv, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
            cv *= (1 - al)
        cv = np.clip(cv, 0, 1)
        comp = comp * (1 - cv[..., 3:4]) + cv[..., :3]
        if MODE == "full": layers[e["name"]] = cv
    to8 = lambda x: (np.clip(x, 0, 1) * 255 + .5).astype(np.uint8)
    lay8 = {}
    for k, cv in layers.items():
        a = cv[..., 3:4]; rgb = np.where(a > 1e-4, cv[..., :3] / np.maximum(a, 1e-4), 0)
        lay8[k] = to8(np.concatenate([rgb, a], -1))
    return i, to8(base), to8(comp), lay8

def init():
    global SRC, ALPHA
    SRC, ALPHA = load_src(), load_alpha()

def enc(path):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                             "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
                             "-c:v", "libx264", "-preset", "slow", "-crf", "13", "-profile:v", "high", "-tune", "film",
                             "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
                             "-movflags", "+faststart", path], stdin=subprocess.PIPE)

if __name__ == "__main__":
    init()
    n = len(SRC)
    if MODE == "test":
        fr = [int(float(x) * FPS) for x in sys.argv[2].split(",")]
        os.makedirs("test", exist_ok=True)
        for f in fr:
            _, b, c, _ = render_frame(f)
            cv2.imwrite(f"test/f{f:04d}.jpg", cv2.cvtColor(c, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
        print("ok"); sys.exit()
    eb, ec = enc(f"{OUT}/base_video.mp4"), enc(f"{OUT}/final_video.mp4")
    os.makedirs("layers", exist_ok=True)
    t0 = time.time()
    with Pool(4) as pool:
        for i, b, c, lay in pool.imap(render_frame, range(n), chunksize=2):
            eb.stdin.write(b.tobytes()); ec.stdin.write(c.tobytes())
            for k, v in lay.items():
                os.makedirs(f"layers/{k}", exist_ok=True)
                cv2.imwrite(f"layers/{k}/{i:05d}.png", cv2.cvtColor(v, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 1])
            if i % 60 == 0: print(i, round(time.time() - t0, 1), flush=True)
    for e in (eb, ec): e.stdin.close(); e.wait()
    print("done", time.time() - t0)
