#!/usr/bin/env bash
# ./scripts/preview.sh <prefix> <w> <h> <mode> <route> [route...]
# mode: "false" | "true" (full page) | a scroll offset in px
set -uo pipefail
PORT=3100
PREFIX="$1"; W="$2"; H="$3"; MODE="$4"; shift 4

pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next start"  2>/dev/null
sleep 1

npx next start -p "$PORT" > /tmp/next.log 2>&1 &
SERVER=$!
for _ in $(seq 1 40); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/es" && break
  sleep 0.5
done
if ! curl -sf -o /dev/null "http://127.0.0.1:$PORT/es"; then
  echo "SERVER FAILED"; tail -20 /tmp/next.log; kill $SERVER 2>/dev/null; exit 1
fi

i=0
for route in "$@"; do
  i=$((i+1))
  node scripts/shot.mjs "$route" "/tmp/${PREFIX}-${i}.png" "$W" "$H" "$MODE"
done
kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
