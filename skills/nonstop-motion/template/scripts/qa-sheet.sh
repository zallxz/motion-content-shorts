#!/usr/bin/env bash
# Contact sheet: 2 frames per second, 8 per row → <video>-sheet.png
# Usage: bash scripts/qa-sheet.sh out/video.mp4
set -euo pipefail
in="$1"
out="${in%.*}-sheet.png"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
rows=$(python3 -c "import math;print(math.ceil(float('$dur')*2/8))")
ffmpeg -v error -y -i "$in" -vf "fps=2,scale=240:-1,tile=8x${rows}:padding=4:color=black" -frames:v 1 "$out"
echo "$out  (duration ${dur}s)"
