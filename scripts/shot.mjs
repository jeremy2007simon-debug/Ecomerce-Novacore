/**
 * Screenshot helper for visual QA.
 *   node scripts/shot.mjs <route> <out> [w] [h] [full|scrollPx]
 * Passing a number as the last argument scrolls there first, which is how the
 * scroll-linked scenes get verified — a full-page capture of a pinned scene
 * shows the scene's scroll track, not its composition.
 * Reports console errors so hydration mismatches surface rather than ship.
 */
import { chromium } from 'playwright';

/*
  Chromium does not read HTTPS_PROXY from the environment the way curl does.
  Without this, hitting an external URL (the deployed site) fails with
  ERR_CONNECTION_RESET while localhost works fine.
*/
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
// `bypass` is NOT optional. Playwright's proxy option ignores the environment's
// no_proxy list, so without it Chromium routes 127.0.0.1 through the agent
// proxy, which answers non-CONNECT requests with 405 — every local page then
// loads as an empty error document and any audit run against it is silently
// measuring nothing.
const PROXY_OPTS = proxyUrl
  ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } }
  : {};

const [, , route = '/es', out = 'shot.png', w = '390', h = '844', mode = 'false'] = process.argv;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...PROXY_OPTS,
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
  // Pin this explicitly so a headless default cannot silently put us on the
  // reduced-motion path and make a broken animation look intentional.
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference',
});

const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));

await page.goto(`http://127.0.0.1:3100${route}`, { waitUntil: 'networkidle', timeout: 45000 });

const scrollTo = Number(mode);
if (!Number.isNaN(scrollTo) && scrollTo > 0) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollTo);
  // Let the springs settle before capturing.
  await page.waitForTimeout(1400);
} else {
  await page.waitForTimeout(900);
}

await page.screenshot({ path: out, fullPage: mode === 'true' });
await browser.close();

const real = [...new Set(problems)].filter((p) => !p.includes('404'));
if (real.length) {
  console.log('CONSOLE PROBLEMS:');
  for (const p of real) console.log('  ' + p);
} else {
  console.log('console clean (ignoring favicon 404)');
}
console.log('saved ' + out);
