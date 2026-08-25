import { chromium } from 'playwright';
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
// `bypass` is NOT optional. Playwright's proxy option ignores the environment's
// no_proxy list, so without it Chromium routes 127.0.0.1 through the agent
// proxy, which answers non-CONNECT requests with 405 — every local page then
// loads as an empty error document and any audit run against it is silently
// measuring nothing.
const PROXY_OPTS = proxyUrl
  ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } }
  : {};
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const failed = [];
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.request().method()} ${r.url().slice(0, 110)}`); });
page.on('requestfailed', (r) => failed.push(`FAILED ${r.method()} ${r.url().slice(0, 110)} :: ${r.failure()?.errorText}`));

await page.goto('http://127.0.0.1:3100/es', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

console.log('=== FAILING REQUESTS ===');
[...new Set(failed)].forEach(f => console.log('  ' + f));

const counts = await page.evaluate(() => ({
  anchors: document.querySelectorAll('a[href]').length,
  buttons: document.querySelectorAll('button').length,
  sample: [...document.querySelectorAll('a[href]')].slice(0, 3).map(a => a.getAttribute('href')),
}));
console.log('\n=== DOM COUNTS ON /es ===');
console.log(JSON.stringify(counts, null, 1));
await browser.close();
