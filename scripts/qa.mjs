/**
 * QA sweep: reduced motion, keyboard access, locale switch, cart persistence.
 * These are the checks a build cannot make for you.
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

const B = 'http://127.0.0.1:3100';
const launch = {
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...PROXY_OPTS,
};
let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ── 1. REDUCED MOTION: scenes must collapse, no dead scroll ────────────── */
{
  const browser = await chromium.launch(launch);
  const normal = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  await normal.goto(`${B}/es`, { waitUntil: 'networkidle' });
  const tallHeight = await normal.evaluate(() => document.body.scrollHeight);

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reduced.goto(`${B}/es`, { waitUntil: 'networkidle' });
  const shortHeight = await reduced.evaluate(() => document.body.scrollHeight);

  check('reduced motion collapses scenes', shortHeight < tallHeight * 0.75,
        `${tallHeight}px -> ${shortHeight}px`);

  // Under reduced motion the finished composition must be visible immediately.
  const originText = await reduced.evaluate(() => {
    const scene = document.querySelector('[data-scene="origin"]');
    return scene ? getComputedStyle(scene.querySelector('h2')).opacity : '0';
  });
  check('reduced motion shows end state', Number(originText) > 0.9, `opacity ${originText}`);

  await reduced.screenshot({ path: '/tmp/qa-reduced.png', fullPage: false });
  await browser.close();
}

/* ── 2. KEYBOARD: overlays open, trap, Escape, restore focus ────────────── */
{
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /Buscar/i }).first().focus();
  const before = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
  check('search overlay opens via keyboard', dialogVisible);

  const focusInside = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? dialog.contains(document.activeElement) : false;
  });
  check('focus moves into dialog', focusInside);

  const inert = await page.evaluate(() => document.getElementById('app-root')?.hasAttribute('inert'));
  check('app root marked inert', inert === true);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  check('Escape closes and restores focus', before === after, `${before} -> ${after}`);

  await browser.close();
}

/* ── 3. CART survives reload AND locale switch ──────────────────────────── */
{
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const hydrationWarnings = [];
  page.on('console', (m) => {
    const text = m.text();
    if (/hydrat|did not match|Text content does not match/i.test(text)) hydrationWarnings.push(text);
  });

  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle' });
  // The size button's accessible name grew a descriptive aria-label in
  // Phase 5 ("Talla M, disponible", not just "M") — its own text content is
  // still exactly "M", so match on that instead of the accessible name.
  await page.locator('main fieldset .grid.gap-2 button', { hasText: /^M$/ }).first().click();
  await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const afterReload = await page.evaluate(() => {
    const raw = localStorage.getItem('atl.cart.v1');
    return raw ? JSON.parse(raw).state.lines.length : 0;
  });
  check('cart survives reload', afterReload === 1, `${afterReload} line(s)`);

  // Switch language via the UI (soft navigation) and confirm the cart persists.
  await page.getByRole('button', { name: /Español → English|English → Español/i }).first().click();
  await page.waitForTimeout(1200);
  const url = page.url();
  const afterLocale = await page.evaluate(() => {
    const raw = localStorage.getItem('atl.cart.v1');
    return raw ? JSON.parse(raw).state.lines.length : 0;
  });
  check('locale switched', url.includes('/en/'), url.split('3100')[1]);
  check('cart survives locale switch', afterLocale === 1, `${afterLocale} line(s)`);
  check('no hydration warnings', hydrationWarnings.length === 0, hydrationWarnings[0] ?? '');

  await browser.close();
}

console.log(failures === 0 ? '\nQA PASS' : `\nQA FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
