#!/bin/bash
# Renders every clip (with captions + clean), then joins them into one full preview reel.
set -e
cd "$(dirname "$0")"
node render.mjs
node render.mjs --clean
ls out/0*-*.mp4 | grep -v clean | sed "s/^out\//file '/;s/$/'/" > out/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/FULL-REEL.mp4
rm out/list.txt
