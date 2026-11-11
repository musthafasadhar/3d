#!/usr/bin/env bash
# Downloads CC0 assets used by the reels (not committed: large files).
# hospital_room HDRI - Poly Haven (CC0): https://polyhaven.com/a/hospital_room
set -e
cd "$(dirname "$0")"
mkdir -p hdri
[ -f hdri/hospital_room_4k.hdr ] || curl -sS -o hdri/hospital_room_4k.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/hospital_room_4k.hdr
echo ok
