import subprocess,sys
P=[(3.55,.22,.45),(22.45,.18,.40),(27.70,.14,.40),(31.67,.16,.40),(36.00,.14,.40),(39.40,.14,.40),(41.60,.12,.40)]
Z='(1+0.045*t/44.2+'+'+'.join(f'if(between(t,{t},{t+d}),{a}*pow(1-(t-{t})/{d},2),0)' for t,a,d in P)+')'
vf=(f"[0:v]tpad=stop_mode=clone:stop_duration=1.7,format=yuv420p,"
    f"scale=w='trunc(1080*{Z}/2)*2':h='trunc(1920*{Z}/2)*2':eval=frame:flags=lanczos,"
    f"crop=1080:1920:'540*({Z}-1)':'780*({Z}-1)',"
    "eq=contrast=1.05:brightness=0.005:saturation=0.99:gamma=0.99,"
    "colorbalance=rs=.02:rm=.015:bs=-.015:bm=-.01,"
    "noise=alls=5:allf=t,vignette=angle=PI/6[v0];"
    "[1:v]setpts=N/30/TB[ov];[v0]setpts=N/30/TB[v0b];[v0b][ov]overlay=0:0:format=auto,format=yuv420p[vo];"
    "[0:a]apad=pad_dur=1.7,atrim=0:45.7,aformat=sample_rates=44100:channel_layouts=stereo[va];"
    "[2:a]aformat=sample_rates=44100:channel_layouts=stereo[sf];"
    "[va][sf]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89:level=disabled[ao]")
cmd=['ffmpeg','-v','error','-y','-i','base/edited.mp4','-i','overlay.mkv','-i','sfx_track.wav',
     '-filter_complex',vf,'-map','[vo]','-map','[ao]','-t','45.7','-c:v','libx264','-preset','medium','-crf','16','-r','30','-pix_fmt','yuv420p',
     '-c:a','aac','-b:a','256k','-movflags','+faststart','final_v3.mp4']
subprocess.run(cmd,check=True)
