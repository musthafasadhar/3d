---
name: analyze-reel
description: Frame-by-frame analysis of a reference Reel/Short/TikTok (URL or uploaded file) - extracts every frame at native fps, cut list, per-shot motion, contact sheets and a timestamped transcript, then writes a style breakdown (characters, camera, lighting, captions, pacing). Use when the user shares a reference video to copy the style of.
---

# Analyze a reference reel

1. Dependencies (once per session): `pip install -q yt-dlp faster-whisper` (ffmpeg is preinstalled).
2. Run: `bash .claude/skills/analyze-reel/scripts/analyze.sh "<url-or-file>" <scratchpad>/reels/<id>`
   - Instagram public reels download directly.
   - YouTube often answers "Sign in to confirm you're not a bot". Do NOT try to get around it;
     use the oEmbed endpoint for title/author only
     (`curl "https://www.youtube.com/oembed?url=<url>&format=json"`) and ask the user to upload the file.
3. "Frame by frame": the source fps (usually 30) is the true frame count. Sampling at higher
   fps (e.g. 300) only duplicates frames, so analyse at native fps.
   - All frames are measured numerically (`motion.txt`: cuts, shot lengths, motion energy).
   - Look at the contact sheets (`sheets/*.jpg`, 2 fps) for content, then tile 30 consecutive
     frames (`ffmpeg -ss T -i video.mp4 -vf "scale=160:-1,tile=6x5" -frames:v 1 x.jpg`) to read
     the micro-animation: blinks, mouth shapes, head bob, camera drift.
   - Pull a few full-res stills (`-ss T -frames:v 1`) for character/material/lighting detail.
4. Write the breakdown into `docs/` using the same headings as `docs/reel-analysis.md`:
   format, shot list with timings, character design, animation, camera, lighting/background,
   captions/typography, audio/voice, pacing, and how it was probably made.
