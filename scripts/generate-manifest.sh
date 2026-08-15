#!/bin/sh
# Auto-generate sample-manifest.json from Sample directory
# Runs inside Docker build (alpine)
# 扫描式生成：从文件名提取样式类型，避免手写列表遗漏（曾遗漏 TypeN）

DIR="/usr/share/nginx/html/Sample"
OUT="/usr/share/nginx/html/sample-manifest.json"
echo '{"version":1,"samples":{' > "$OUT"

# 扫描所有 *_sample_compressed* 文件，提取去重的样式类型列表（如 TypeA...TypeN）
types=""
for f in "$DIR"/*-sample_compressed*; do
  [ -f "$f" ] || continue
  t=$(basename "$f" | sed -n 's/^[0-9][0-9]*-\(Type[A-Z]\)-sample_compressed.*/\1/p')
  [ -z "$t" ] && continue
  case "$types" in
    *" $t "*) ;;
    *) types="$types $t " ;;
  esac
done

first=1
for t in $types; do
  ids=""
  for f in "$DIR"/*-${t}-sample_compressed*; do
    [ -f "$f" ] || continue
    id=$(basename "$f" | sed "s/-${t}-sample_compressed.*//")
    [ -n "$id" ] && ids="${ids:+$ids,}\"$id\""
  done
  [ -n "$ids" ] && { [ "$first" -eq 0 ] && echo ',' >> "$OUT"; echo "\"$t\":[$ids]" >> "$OUT"; first=0; }
done
echo '}}' >> "$OUT"
