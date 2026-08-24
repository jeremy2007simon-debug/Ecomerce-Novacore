/**
 * Verifies the dashboard, and specifically that the live event stream really
 * reflects the visitor's own session: browse first, then open the dashboard.
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

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...PROXY_OPTS,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) problems.push(m.text()); });
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

const B = 'http://127.0.0.1:3100';

// Generate a real session first.
await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle' });
await page.locator('main').getByRole('button', { name: 'M', exact: true }).first().click();
await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
await page.waitForTimeout(600);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// Now open the dashboard in the SAME tab so the in-memory buffer survives.
await page.goto(`${B}/es/demo/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);

const body = await page.textContent('body');
const checks = [
  ['demo banner', body.includes('DATOS DE DEMOSTRACIÓN')],
  ['KPI revenue', body.includes('Ingresos')],
  ['automation', body.includes('automatizaciones')],
  ['top products', body.includes('ATLANTIC 01')],
  ['insights', body.includes('NovaCore AI')],
  ['event stream', body.includes('Flujo de eventos')],
  ['live event captured', body.includes('add_to_cart')],
];
for (const [name, ok] of checks) console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}`);

await page.screenshot({ path: '/tmp/dash-top.png' });

// Exercise the range toggle.
await page.getByRole('button', { name: '7D', exact: true }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/dash-7d.png' });

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/dash-mid.png' });

await browser.close();
console.log(problems.length ? `\nCONSOLE ERRORS:\n  ${problems.join('\n  ')}` : '\nconsole clean');
