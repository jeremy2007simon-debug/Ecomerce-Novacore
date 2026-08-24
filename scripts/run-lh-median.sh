#!/usr/bin/env bash
# Runs each route N times and reports the median, because Lighthouse's
# simulated throttling has several points of run-to-run variance.
set -uo pipefail
cd /home/user/Ecomerce-Novacore
export CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
RUNS=${RUNS:-3}
pkill -9 -f "next-server" 2>/dev/null; pkill -9 -f "next start" 2>/dev/null; sleep 1
npx next start -p 3100 > /tmp/next.log 2>&1 &
SERVER=$!
for _ in $(seq 1 40); do curl -sf -o /dev/null http://127.0.0.1:3100/es && break; sleep 0.5; done

for route in "$@"; do
  scores=""
  for i in $(seq 1 "$RUNS"); do
    npx lighthouse "http://127.0.0.1:3100$route" \
      --quiet --output=json --output-path="/tmp/lhx.json" \
      --only-categories=performance,accessibility,best-practices,seo \
      --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
      --form-factor=mobile --screenEmulation.mobile --screenEmulation.width=390 \
      --screenEmulation.height=844 --screenEmulation.deviceScaleFactor=2 \
      --throttling-method=simulate > /dev/null 2>&1
    s=$(node -e "const r=require('/tmp/lhx.json');console.log(Math.round(r.categories.performance.score*100))")
    scores="$scores $s"
    cp /tmp/lhx.json "/tmp/lhlast.json"
  done
  node -e "
    const xs='$scores'.trim().split(/\s+/).map(Number).sort((a,b)=>a-b);
    const med = xs[Math.floor(xs.length/2)];
    const r = require('/tmp/lhlast.json');
    const s = (k)=>Math.round((r.categories[k]?.score??0)*100);
    console.log('$route'.padEnd(30),'perf median',String(med).padStart(3),
      '('+xs.join(',')+')','| a11y',s('accessibility'),'| bp',s('best-practices'),'| seo',s('seo'));
  "
done
kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
