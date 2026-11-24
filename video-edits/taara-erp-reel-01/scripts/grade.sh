#!/bin/bash
# HDR (iPhone HLG / BT.2020) -> SDR BT.709 with natural skin tones, written as raw RGB24 frames.
# hable tonemap keeps highlights on the forehead, curves add a gentle lift, light sharpening.
SRC="$1"; OUT="$2"
ffmpeg -v error -y -i "$SRC" -vf "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv:dither=error_diffusion,format=yuv444p,curves=all='0/0 0.25/0.29 0.5/0.56 0.75/0.80 1/0.98',eq=saturation=1.03,unsharp=5:5:0.25:5:5:0,scale=out_color_matrix=bt709:in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24" -f rawvideo "$OUT"
