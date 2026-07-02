#!/bin/sh
# Auto-generate sample-manifest.json from Sample directory
# Runs inside Docker build (alpine)

DIR="/usr/share/nginx/html/Sample"
OUT="$DIR/sample-manifest.json"
echo '{"version":1,"samples":{' > "$OUT"
first=1
for t in TypeA TypeB TypeC TypeD TypeE TypeF TypeG TypeH TypeI TypeJ TypeK TypeL TypeM; do
  ids=""
  for f in "$DIR"/*-${t}-sample_compressed*; do
    [ -f "$f" ] || continue
    id=$(basename "$f" | sed "s/-${t}-sample_compressed.*//")
    [ -n "$id" ] && ids="${ids:+$ids,}\"$id\""
  done
  [ -n "$ids" ] && { [ "$first" -eq 0 ] && echo ',' >> "$OUT"; echo "\"$t\":[$ids]" >> "$OUT"; first=0; }
done
echo '}}' >> "$OUT"