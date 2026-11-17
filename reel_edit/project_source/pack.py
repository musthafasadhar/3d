import os, subprocess, glob, sys
sys.argv=[sys.argv[0]]
import timeline as TL
D="/home/user/3d/reel_edit"; os.makedirs(f"{D}/overlays",exist_ok=True); os.makedirs(f"{D}/sfx_library",exist_ok=True)
run=lambda c: subprocess.run(c,check=True)
# final: rendered video + voice/SFX mix
run(["ffmpeg","-v","error","-y","-i","out/final_video.mp4","-i","audio/final_mix.wav","-map","0:v","-map","1:a","-c:v","copy",
     "-c:a","aac","-b:a","320k","-ar","48000","-movflags","+faststart","-shortest",f"{D}/FINAL_reel_1080x1920.mp4"])
# base: zooms + background grade only, ORIGINAL audio stream copied untouched
run(["ffmpeg","-v","error","-y","-i","out/base_video.mp4","-i","src/in.mp4","-map","0:v","-map","1:a","-c","copy",
     "-movflags","+faststart",f"{D}/BASE_zooms_only_no_graphics_1080x1920.mp4"])
lines=[]
for e in TL.ELEMENTS:
    fs=sorted(glob.glob(f"layers/{e['name']}/*.png"))
    if not fs: print("no frames",e["name"]); continue
    f0=int(os.path.basename(fs[0])[:5]); t0=f0/30; dur=len(fs)/30
    out=f"{D}/overlays/{e['name']}__start_{t0:05.2f}s.mov"
    cmd=["ffmpeg","-v","error","-y","-framerate","30","-start_number",str(f0),"-i",f"layers/{e['name']}/%05d.png"]
    wav=f"audio/{e['name']}.wav"
    if os.path.exists(wav): cmd+=["-ss",f"{t0:.4f}","-t",f"{dur:.4f}","-i",wav,"-map","0:v","-map","1:a","-c:a","pcm_s16le"]
    cmd+=["-c:v","prores_ks","-profile:v","4444","-pix_fmt","yuva444p10le","-alpha_bits","16","-qscale:v","8","-vendor","apl0",out]
    run(cmd)
    lines.append(f"{t0:6.2f}s  -> {t0+dur:6.2f}s   {e['layer']:5s}  {os.path.basename(out)}")
open(f"{D}/overlays/_PLACEMENT_GUIDE.txt","w").write(
"Each overlay is full-frame 1080x1920 ProRes 4444 WITH transparency (and its own sound effects).\n"
"Place it on a track above BASE_zooms_only_no_graphics_1080x1920.mp4 at the start time in its filename.\n"
"'back' = behind-head element (your silhouette is already cut out of it), 'front' = sits on top of you.\n"
"Stack all 'back' overlays below all 'front' overlays. Delete any one you don't like - nothing else changes.\n\n"
+"\n".join(lines)+"\n")
for f in glob.glob("sfx/*.wav"): run(["cp",f,f"{D}/sfx_library/"])
run(["cp","audio/ALL_SFX_stem.wav",f"{D}/sfx_library/_ALL_SFX_timeline_stem_starts_at_0s.wav"])
print("\n".join(lines))
