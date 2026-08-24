#!/usr/bin/env bash
set -uo pipefail
PORT=3100
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next start"  2>/dev/null
sleep 1
npx next start -p "$PORT" > /tmp/next.log 2>&1 &
SERVER=$!
for _ in $(seq 1 40); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/es" && break; sleep 0.5; done
if ! curl -sf -o /dev/null "http://127.0.0.1:$PORT/es"; then
  echo "SERVER FAILED"; tail -20 /tmp/next.log; kill $SERVER 2>/dev/null; exit 1
fi
node scripts/flow.mjs
CODE=$?
kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
exit $CODE
