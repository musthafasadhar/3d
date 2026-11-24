"""Compositor: graded A-roll + framing + person matte + motion-graphics layers -> video.

usage:
  python composite.py timeline.json graded.rgb overlays_dir preview  outdir  f1,f2,...
  python composite.py timeline.json graded.rgb overlays_dir full     out_video.mp4
"""
import sys, os, json, subprocess
import numpy as np, cv2

W, H = 1080, 1920
ANCHOR = (540.0, 800.0)  # face/eye line: zooms keep the face in place

tl = json.load(open(sys.argv[1]))
src = np.memmap(sys.argv[2], dtype=np.uint8, mode="r").reshape(-1, H, W, 3)
OV = sys.argv[3]
mode = sys.argv[4]

_seg = None


def person_mask(rgb):
    global _seg
    if _seg is None:
        from rembg import new_session
        _seg = new_session("u2net_human_seg")
    from rembg import remove
    from PIL import Image
    small = Image.fromarray(cv2.resize(rgb, (540, 960), interpolation=cv2.INTER_AREA))
    m = np.asarray(remove(small, session=_seg, only_mask=True), dtype=np.float32) / 255.0
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC)
    m = np.clip((m - 0.15) / 0.7, 0, 1)            # tighten the soft edge
    m = cv2.GaussianBlur(m, (0, 0), 2.0)
    return m[..., None]


def load_rgba(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if im is None:
        return None
    rgb = im[..., 2::-1].astype(np.float32) / 255.0
    if im.ndim == 3 and im.shape[2] == 4:
        a = im[..., 3:4].astype(np.float32) / 255.0
    else:
        a = np.ones(im.shape[:2] + (1,), np.float32)
    return rgb * a, a  # premultiplied


def over_layer(i, blur):
    name = f"{i:05d}"
    if blur > 1:
        acc_c = None
        for k in range(blur):
            r = load_rgba(os.path.join(OV, "over", f"{name}_{k}.png"))
            if acc_c is None:
                acc_c, acc_a = r[0].copy(), r[1].copy()
            else:
                acc_c += r[0]; acc_a += r[1]
        return acc_c / blur, acc_a / blur
    return load_rgba(os.path.join(OV, "over", name + ".png"))


def zoomed(frame, z, shake=(0, 0)):
    ax, ay = ANCHOR
    if shake and (shake[0] or shake[1]):
        z = max(z, 1.03)  # keep edges covered while shaking
    M = np.float32([[z, 0, ax * (1 - z) + shake[0]], [0, z, ay * (1 - z) + shake[1]]])
    if abs(z - 1) < 1e-4 and not (shake[0] or shake[1]):
        return frame.copy()
    return cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)


def rounded_mask(w, h, r):
    m = np.zeros((h, w), np.float32)
    r = int(max(0, min(r, w // 2, h // 2)))
    ss = 4  # supersampled for smooth corners
    big = np.zeros((h * ss, w * ss), np.uint8)
    cv2.rectangle(big, (r * ss, 0), ((w - r) * ss - 1, h * ss - 1), 255, -1)
    cv2.rectangle(big, (0, r * ss), (w * ss - 1, (h - r) * ss - 1), 255, -1)
    for cx, cy in [(r, r), (w - r, r), (r, h - r), (w - r, h - r)]:
        cv2.circle(big, (cx * ss, cy * ss), r * ss, 255, -1, lineType=cv2.LINE_AA)
    m = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    return m[..., None]


def render(i):
    f = tl["frames"][i]
    base = zoomed(src[f["src"]], f["zoom"], f.get("shake", (0, 0))).astype(np.float32) / 255.0
    # text behind the subject
    bp = os.path.join(OV, "behind", f"{i:05d}.png")
    if os.path.exists(bp):
        c, a = load_rgba(bp)
        m = person_mask((base * 255).astype(np.uint8))
        withtext = c + base * (1 - a)
        base = base * m + withtext * (1 - m)
    # end card: A-roll shrinks into a rounded card on the brand background
    if f["card"]:
        cx, cy, sc, rad, op = f["card"]
        up = load_rgba(os.path.join(OV, "under", f"{i:05d}.png"))
        canvas = up[0] + 0 * up[1]  # under layer is opaque
        w, h = max(2, int(round(W * sc))), max(2, int(round(H * sc)))
        card = cv2.resize(base, (w, h), interpolation=cv2.INTER_AREA if sc < 1 else cv2.INTER_LINEAR)
        m = rounded_mask(w, h, rad) * op
        x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
        xs, ys = max(0, x0), max(0, y0)
        xe, ye = min(W, x0 + w), min(H, y0 + h)
        sub = card[ys - y0:ye - y0, xs - x0:xe - x0]; mm = m[ys - y0:ye - y0, xs - x0:xe - x0]
        canvas[ys:ye, xs:xe] = sub * mm + canvas[ys:ye, xs:xe] * (1 - mm)
        base = canvas
    c, a = over_layer(i, f["blur"])
    out = c + base * (1 - a)
    return (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)


if mode == "preview":
    outdir = sys.argv[5]; os.makedirs(outdir, exist_ok=True)
    for i in map(int, sys.argv[6].split(",")):
        cv2.imwrite(os.path.join(outdir, f"p{i:05d}.jpg"), render(i)[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 92])
else:
    out = sys.argv[5]
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(tl["fps"]),
           "-i", "-", "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p",
           "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-profile:v", "high", "-tune", "film",
           "-x264-params", "aq-mode=3:aq-strength=0.85", "-g", "30",
           "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = tl["n"]
    for i in range(n):
        p.stdin.write(render(i).tobytes())
        if i % 60 == 0:
            print(f"frame {i}/{n}", flush=True)
    p.stdin.close(); p.wait()
    print("video done", out)
