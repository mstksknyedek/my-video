#!/usr/bin/env bash
# Master a rendered Short's audio to YouTube's loudness (about -14 LUFS, true peak below -1 dBTP).
# The video stream is copied untouched; only the audio is compressed lightly and normalised.
#
#   scripts/master_audio.sh out/ham.mp4 out/video.mp4
#
# The last lines print the mastered file's measured loudness ("Input" = the file being measured).
set -euo pipefail
in="$1"; out="$2"
ffmpeg -y -loglevel error -i "$in" -c:v copy \
  -af "acompressor=threshold=-18dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.5:LRA=7" \
  -c:a aac -b:a 192k -ar 48000 "$out"
ffmpeg -hide_banner -i "$out" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
