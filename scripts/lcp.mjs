/** Reports the real LCP element and the slowest resources, from the browser. */
import { chromium } from 'playwright';

/*
  Chromium does not read HTTPS_PROXY from the environment the way curl does.
  Without this, hitting an external URL (the deployed site) fails with
  ERR_CONNECTION_RESET while localhost works fine.
*/
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl } } : {};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...PROXY_OPTS,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

const resources = [];
page.on('response', async (res) => {
  const req = res.request();
  const timing = req.timing();
  resources.push({
    url: res.url().replace('http://127.0.0.1:3100', ''),
    type: req.resourceType(),
    status: res.status(),
    dur: Math.round(timing.responseEnd - timing.requestStart),
  });
});

await page.goto(`http://127.0.0.1:3100${process.argv[2] ?? '/es'}`, { waitUntil: 'networkidle' });

const lcp = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        resolve({
          time: Math.round(last.startTime),
          tag: last.element?.tagName,
          cls: last.element?.className?.toString().slice(0, 90),
          src: last.url || last.element?.currentSrc || '',
          size: last.size,
        });
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve({ time: -1 }), 2500);
    }),
);

console.log('LCP:', JSON.stringify(lcp, null, 1));
console.log('\nSlowest resources:');
resources.sort((a, b) => b.dur - a.dur).slice(0, 8)
  .forEach((r) => console.log(String(r.dur).padStart(6), 'ms', r.type.padEnd(10), r.url.slice(0, 82)));

await browser.close();
