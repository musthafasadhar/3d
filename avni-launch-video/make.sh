#!/usr/bin/env bash
# Builds the Avni launch film end-to-end.
#   requirements: node + playwright (chromium), python3 + numpy + scipy, ffmpeg
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build output
node render.js cues build/cues.json                 # SFX cue sheet straight from the animation timeline
python3 audio.py build/cues.json build/score.wav    # original score + sound design
node render.js video build/video_silent.mp4 60 4    # 1920x1080 @ 60fps, frame-accurate
ffmpeg -v error -y -i build/video_silent.mp4 -i build/score.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -tune grain -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart \
  -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 320k -ar 48000 -shortest \
  output/Avni_Launch_Film_1080p60.mp4
echo "done -> output/Avni_Launch_Film_1080p60.mp4"
