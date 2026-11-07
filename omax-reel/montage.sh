#!/usr/bin/env bash
# Join the rendered clips into one preview reel with short crossfades.
#   ./montage.sh text   -> out/omax_full_text.mp4
#   ./montage.sh clean  -> out/omax_full_clean.mp4
set -euo pipefail
cd "$(dirname "$0")/out"
V=${1:-text}
FADE=0.4
files=(s1_$V.mp4 s2_$V.mp4 s3_$V.mp4 s4_$V.mp4 s5_$V.mp4 s6_$V.mp4)
inputs=(); for f in "${files[@]}"; do inputs+=(-i "$f"); done
# build xfade chain
filter=""; prev="0:v"; offset=0
for i in $(seq 1 $((${#files[@]} - 1))); do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${files[$((i - 1))]}")
  offset=$(python3 -c "print(round($offset + $d - $FADE, 3))")
  out="v$i"
  filter+="[$prev][$i:v]xfade=transition=fade:duration=$FADE:offset=$offset[$out];"
  prev=$out
done
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "${filter%;}" -map "[$prev]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "omax_full_$V.mp4"
echo "-> out/omax_full_$V.mp4"
