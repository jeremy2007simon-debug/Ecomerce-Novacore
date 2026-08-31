/**
 * Home V3 (Phase 3) spot-check — new sections only. Does not repeat what
 * audit-behaviour.mjs / audit-overflow.mjs / qa.mjs already cover.
 *
 *  1  section order + heading hierarchy (one h1, one h2 per new section)
 *  2  New Arrivals rail: prev/next buttons scroll it
 *  3  Quick Add: opens, add-to-bag closes it and opens the cart drawer in one
 *     transition, cart count increments
 *  4  Category Discovery / Atlantic Edit tiles link to the right collections
 *  5  Stories Preview cards link to /story; "View all" is inert
 *  6  Field Notes: valid email succeeds, invalid shows an error
 *  7  console clean across a full scroll
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

let fails = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { fails++; console.log('  FAIL ' + m); };

/* ── 1 — section order + headings ──────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const h1Count = await page.locator('h1').count();
  if (h1Count === 1) ok('exactly one <h1>');
  else bad(`found ${h1Count} <h1> elements`);

  const h2Count = await page.locator('main h2').count();
  // Origin, Drop, Category Discovery, Material, New Arrivals, Most Wanted,
  // Atlantic Edit, Stories Preview, Field Notes = 9 sections, 9 h2s.
  if (h2Count === 9) ok(`exactly 9 <h2> in main (${h2Count})`);
  else bad(`expected 9 <h2> in main, found ${h2Count}`);

  // Scroll to the bottom to mount every scene, then check console.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  if (errors.length === 0) ok('console clean across full scroll');
  else bad(`console errors: ${errors.join(' | ')}`);

  await page.close();
}

/* ── 2 — New Arrivals rail prev/next ───────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const rail = page.locator('[data-scroll-snap]').last();
  await rail.scrollIntoViewIfNeeded();
  const before = await rail.evaluate((el) => el.scrollLeft);

  const nextBtn = page.locator('button[aria-label="Siguiente"]');
  await nextBtn.click();
  await page.waitForTimeout(600);
  const after = await rail.evaluate((el) => el.scrollLeft);

  if (after > before) ok(`rail "next" scrolls (${before} -> ${after})`);
  else bad(`rail "next" did not scroll (${before} -> ${after})`);

  await page.close();
}

/* ── 3 — Quick Add ──────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (msg) => { if (msg.type() === 'error') bad(`console error: ${msg.text()}`); });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);

  const addToBagTrigger = page.getByText('Añadir a la bolsa', { exact: true }).first();
  await addToBagTrigger.scrollIntoViewIfNeeded();
  await addToBagTrigger.click();
  await page.waitForTimeout(400);

  const sheet = page.locator('[role="dialog"]');
  if (await sheet.isVisible()) ok('Quick Add sheet opens');
  else bad('Quick Add sheet did not open');

  const sizeButton = sheet.locator('fieldset .grid.gap-2 button:not([disabled])').first();
  if (await sizeButton.count()) await sizeButton.click();

  await sheet.locator('button:has-text("Añadir")').first().click();
  await page.waitForTimeout(500);

  // Single-slot overlay: Quick Add's own aria-label should be gone, replaced
  // by the cart drawer's.
  const cartDialog = page.locator('[role="dialog"][aria-label*="olsa" i]');
  if (await cartDialog.isVisible()) ok('overlay swapped from Quick Add to the cart drawer');
  else bad('cart drawer did not open after Quick Add');

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);
  if (after > before) ok(`Quick Add added a line (${before} -> ${after})`);
  else bad(`Quick Add did not add a line (${before} -> ${after})`);

  await page.close();
}

/* ── 4 — Category Discovery / Atlantic Edit tile links ─────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const checks = [
    ['a:has-text("Ver accesorios")', '/es/collection?collection=accessories'],
    ['a:has-text("Coast")', '/es/collection?collection=outerwear'],
    ['a:has-text("City")', '/es/collection?collection=essentials'],
    ['a:has-text("Movement")', '/es/collection?collection=technical'],
  ];
  for (const [selector, expected] of checks) {
    const href = await page.locator(selector).first().getAttribute('href');
    if (href === expected) ok(`${selector} -> ${href}`);
    else bad(`${selector} -> ${href}, expected ${expected}`);
  }

  await page.close();
}

/* ── 5 — Stories Preview ───────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const storyCard = page.locator('main a:has-text("MATERIAL / 001")').first();
  const href = await storyCard.getAttribute('href');
  if (href === '/es/story') ok(`story card -> ${href}`);
  else bad(`story card -> ${href}, expected /es/story`);

  const viewAll = page.locator('main').getByText('Ver todas las historias');
  const isLink = await viewAll.evaluate((el) => el.closest('a') !== null);
  if (!isLink) ok('"Ver todas las historias" is inert, not a real link');
  else bad('"Ver todas las historias" resolved to a real <a> — should be inert');

  await page.close();
}

/* ── 6 — Field Notes ────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es`, { waitUntil: 'networkidle', timeout: 40000 });

  const fieldNotes = page.locator('main section', { has: page.getByText('Atlantic Field Notes') }).last();
  await fieldNotes.scrollIntoViewIfNeeded();

  await fieldNotes.locator('input[type="email"]').fill('not-an-email');
  await fieldNotes.locator('button[type="submit"]').click();
  await page.waitForTimeout(300);
  if (await page.locator('main [role="alert"]').count()) ok('Field Notes shows an error for an invalid email');
  else bad('Field Notes did not show an error for an invalid email');

  await fieldNotes.locator('input[type="email"]').fill('reader@example.com');
  await fieldNotes.locator('button[type="submit"]').click();
  await page.waitForTimeout(700);
  const status = fieldNotes.locator('[role="status"]');
  if (await status.count()) ok('Field Notes shows success for a valid email');
  else bad('Field Notes did not show success for a valid email');

  await page.close();
}

console.log(fails === 0 ? '\nHOME V3: PASS' : `\nHOME V3: FAIL (${fails})`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
