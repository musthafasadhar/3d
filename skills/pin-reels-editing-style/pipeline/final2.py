import subprocess,sys
out=sys.argv[1] if len(sys.argv)>1 else 'final_taara_v1.mp4'
vf="[0:v]scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p[vo]"
af="[1:a]apad=pad_dur=2.6,atrim=0:46.7,aformat=sample_rates=44100:channel_layouts=stereo[va];[2:a]aformat=sample_rates=44100:channel_layouts=stereo[sf];[va][sf]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89:level=disabled[ao]"
cmd=['ffmpeg','-v','error','-y','-framerate','30','-start_number','0','-i','frames2/f_%05d.png','-i','base_sdr/edited.mp4','-i','sfx_track2.wav','-filter_complex',vf+';'+af,
 '-map','[vo]','-map','[ao]','-t','46.7','-c:v','libx264','-preset','medium','-crf','15','-r','30','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv',
 '-c:a','aac','-b:a','256k','-movflags','+faststart',out]
subprocess.run(cmd,check=True)
