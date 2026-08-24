#!/usr/bin/env bash
set -uo pipefail
cd /home/user/Ecomerce-Novacore
export CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
pkill -9 -f "next-server" 2>/dev/null; pkill -9 -f "next start" 2>/dev/null; sleep 1
npx next start -p 3100 > /tmp/next.log 2>&1 &
SERVER=$!
for _ in $(seq 1 40); do curl -sf -o /dev/null http://127.0.0.1:3100/es && break; sleep 0.5; done

for route in "$@"; do
  slug=$(echo "$route" | tr '/' '_')
  npx lighthouse "http://127.0.0.1:3100$route" \
    --quiet --output=json --output-path="/tmp/lh${slug}.json" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
    --form-factor=mobile --screenEmulation.mobile --screenEmulation.width=390 --screenEmulation.height=844 --screenEmulation.deviceScaleFactor=2 --throttling-method=simulate > /tmp/lh-err.log 2>&1 || { echo "lighthouse failed for $route"; tail -5 /tmp/lh-err.log; continue; }
  node -e "
    const r = require('/tmp/lh${slug}.json');
    const s = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
    console.log('$route'.padEnd(34),
      'perf', String(s('performance')).padStart(3),
      '| a11y', String(s('accessibility')).padStart(3),
      '| bp', String(s('best-practices')).padStart(3),
      '| seo', String(s('seo')).padStart(3));
  "
done

kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null
