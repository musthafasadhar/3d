#!/usr/bin/env bash
# Frame-by-frame analysis of a short-form video (Reel / Short / TikTok).
# Usage: analyze.sh <url-or-local-file> <out-dir> [scene-threshold]
# Produces in <out-dir>:
#   video.mp4            source (downloaded with yt-dlp if a URL was given)
#   probe.txt            resolution, fps, frame count, duration
#   frames/f%05d.jpg     EVERY frame at native fps (240px wide, for measurement)
#   cuts.txt             hard-cut timestamps (seconds)
#   motion.txt           per-shot length + mean/max frame-to-frame motion
#   sheets/sNN.jpg       contact sheets, 2 fps, 6x4 grid (for visual review)
#   transcript.txt       timestamped dialogue (faster-whisper base.en)
set -euo pipefail
SRC="$1"; OUT="$2"; THR="${3:-0.2}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT/frames" "$OUT/sheets"

if [[ -f "$SRC" ]]; then
  cp "$SRC" "$OUT/video.mp4"
else
  # Works for public Instagram reels. YouTube may demand sign-in (bot check);
  # if so, ask the user to upload the file instead of trying to bypass it.
  yt-dlp --no-playlist -f "best[height<=1080]/best" -o "$OUT/video.%(ext)s" "$SRC"
  [[ -f "$OUT/video.mp4" ]] || ffmpeg -v error -y -i "$OUT"/video.* "$OUT/video.mp4"
fi
V="$OUT/video.mp4"

ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,nb_frames:format=duration \
  -of compact "$V" | tee "$OUT/probe.txt"

ffmpeg -v error -y -i "$V" -vf scale=240:-1 "$OUT/frames/f%05d.jpg"
ffmpeg -i "$V" -vf "select='gt(scene,$THR)',showinfo" -f null - 2>&1 \
  | grep -o "pts_time:[0-9.]*" | sed 's/pts_time://' | tr '\n' ' ' > "$OUT/cuts.txt"
python3 -I "$HERE/motion.py" "$OUT/frames" "$(cat "$OUT/cuts.txt")" | tee "$OUT/motion.txt"
ffmpeg -v error -y -i "$V" -vf "fps=2,scale=180:-1,tile=6x4" "$OUT/sheets/s%02d.jpg"

ffmpeg -v error -y -i "$V" -ac 1 -ar 16000 -f s16le "$OUT/audio.pcm"
python3 -I "$HERE/transcribe.py" "$OUT/audio.pcm" 2>/dev/null | tee "$OUT/transcript.txt" || \
  echo "transcription skipped (pip install faster-whisper)"
echo "done -> $OUT"
