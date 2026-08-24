/**
 * Behavioural checks for the fixes in this QA pass, on real pages.
 *
 *  1  add-to-bag works on ALL EIGHT products, not just Atlantic 01
 *  2  the mobile sticky bar ADDS rather than only scrolling
 *  3  Enter in the search overlay reaches /search?q=…
 *  4  the search overlay focuses the input, not the close button
 *  5  no footer link resolves to /story except the one that says so
 *  6  the branded 404 renders, in the right language, for unmatched URLs
 *  7  the quantity "−" stops at 1 instead of deleting the line
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const HANDLES = ['atlantic-01','tide-01','volcanic-tee','basalt-knit','trade-pant','current-bag','north-cap','atlantic-bottle'];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

let fails = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fails++; console.log('  FAIL ' + m); };

/* ── 1 + 2 — add to bag on every product, desktop panel and mobile bar ────── */
console.log('\n=== ADD TO BAG — all eight products ===');
for (const handle of HANDLES) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });

  // Pick a size if the product has one.
  const sizeButton = page.locator('fieldset .grid.gap-2 button:not([disabled])').first();
  if (await sizeButton.count()) await sizeButton.click();

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);

  await page.locator('#buy button:has-text("Añadir")').first().click();
  await page.waitForTimeout(400);

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);

  if (after > before) ok(`${handle} — panel adds a line`);
  else bad(`${handle} — panel did NOT add (${before} -> ${after})`);

  // Close the drawer, scroll past the CTA so the sticky bar appears.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(600);

  const bar = page.locator('.fixed.bottom-0 button').last();
  if (!(await bar.count())) { bad(`${handle} — sticky bar never appeared`); await page.close(); continue; }

  const label = (await bar.textContent())?.trim() ?? '';
  const beforeBar = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines
      .reduce((n, l) => n + l.quantity, 0));
  await bar.click();
  await page.waitForTimeout(500);
  const afterBar = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines
      .reduce((n, l) => n + l.quantity, 0));

  if (afterBar > beforeBar) ok(`${handle} — sticky bar "${label}" adds (${beforeBar} -> ${afterBar})`);
  else bad(`${handle} — sticky bar "${label}" changed nothing (${beforeBar} -> ${afterBar})`);

  await page.close();
}

/* ── 3 + 4 — search ───────────────────────────────────────────────────────── */
console.log('\n=== SEARCH ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.locator('header button[aria-label*="usca" i], header button:has-text("Buscar")').first().click();
  await page.waitForTimeout(500);

  const focused = await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? 'none');
  if (focused === 'input') ok('overlay focuses the input');
  else bad(`overlay focuses <${focused}>, not the input`);

  await page.keyboard.type('atlantic');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/search\?q=/, { timeout: 8000 }).catch(() => {});
  const url = page.url();
  if (/\/es\/search\?q=atlantic/.test(url)) ok(`Enter navigates to ${url.replace(B, '')}`);
  else bad(`Enter went nowhere — still at ${url.replace(B, '')}`);
  await page.close();
}

/* ── 5 — footer links ─────────────────────────────────────────────────────── */
console.log('\n=== FOOTER ===');
for (const locale of ['es', 'en']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/${locale}`, { waitUntil: 'networkidle', timeout: 40000 });
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('footer a')].map((a) => ({
      label: (a.textContent ?? '').trim(),
      // `search` matters: the four Shop links differ only by ?collection=…,
      // and dropping the query made them look like one destination repeated.
      href: new URL(a.href).pathname + new URL(a.href).search + new URL(a.href).hash,
    })));

  const toStory = links.filter((l) => l.href.endsWith('/story'));
  if (toStory.length === 1) ok(`${locale} — exactly one link to /story ("${toStory[0].label}")`);
  else bad(`${locale} — ${toStory.length} links to bare /story: ${toStory.map((l) => l.label).join(' | ')}`);

  const dupes = new Map();
  for (const l of links) dupes.set(l.href, (dupes.get(l.href) ?? 0) + 1);
  const collisions = [...dupes.entries()].filter(([, n]) => n > 1);
  if (collisions.length === 0) ok(`${locale} — ${links.length} footer links, no duplicate destinations`);
  else bad(`${locale} — duplicate destinations: ${collisions.map(([h, n]) => `${h} x${n}`).join(', ')}`);

  // Every destination must actually resolve.
  for (const l of links) {
    const res = await page.request.get(B + l.href.split('#')[0]);
    if (res.status() >= 400) bad(`${locale} — "${l.label}" -> ${l.href} returns ${res.status()}`);
  }
  ok(`${locale} — every footer destination returns < 400`);
  await page.close();
}

/* ── 6 — branded 404 ──────────────────────────────────────────────────────── */
console.log('\n=== 404 ===');
for (const [path, needle] of [
  ['/es/no-such-page', 'fuera del mapa'],
  ['/en/no-such-page', 'off the map'],
  ['/es/product/bogus', 'fuera del mapa'],
  ['/en/product/bogus', 'off the map'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const response = await page.goto(`${B}${path}`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.waitForTimeout(300);
  const text = await page.locator('body').innerText();
  const lang = await page.evaluate(() => document.documentElement.lang);
  const status = response?.status();
  if (status === 404 && text.includes(needle) && lang === path.split('/')[1]) {
    ok(`${path} — 404, branded, lang="${lang}"`);
  } else {
    bad(`${path} — status ${status}, lang "${lang}", branded ${text.includes(needle)}`);
  }
  await page.close();
}

/* ── 7 — quantity stepper ─────────────────────────────────────────────────── */
console.log('\n=== CART ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.locator('fieldset .grid.gap-2 button:not([disabled])').first().click();
  await page.locator('#buy button:has-text("Añadir")').first().click();
  await page.waitForTimeout(600);

  const minus = page.locator('[aria-label*="educir" i], [aria-label*="ecrease" i]').first();
  const disabled = await minus.isDisabled();
  if (disabled) ok('quantity "−" is disabled at 1 — it can no longer delete the line');
  else {
    await minus.click();
    await page.waitForTimeout(300);
    const lines = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);
    bad(`quantity "−" at 1 is enabled and left ${lines} line(s)`);
  }
  await page.close();
}

await browser.close();
console.log(fails === 0 ? '\nBEHAVIOUR: PASS' : `\nBEHAVIOUR: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
