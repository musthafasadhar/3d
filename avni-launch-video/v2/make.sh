#!/usr/bin/env bash
# Builds the v2 retention cut (60 s, 1080p60).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p v2/build output
FILM_DIR=$PWD/v2 node render.js cues v2/build/cues.json
python3 v2/audio2.py v2/build/cues.json v2/build/score.wav
FILM_DIR=$PWD/v2 node render.js video v2/build/video_silent.mp4 60 4
ffmpeg -v error -y -i v2/build/video_silent.mp4 -i v2/build/score.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 19 -tune grain -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart \
  -af "volume=-1.3dB" -c:a aac -b:a 320k -ar 48000 -shortest output/Avni_Launch_Film_v2_1080p60.mp4
echo "done -> output/Avni_Launch_Film_v2_1080p60.mp4"
