/**
 * Regression checks for the product-polish pass: category-correct PDP
 * modules, no visible internal recommendation metadata, category-aware Ask
 * Atlantic answers, the size guide drawer, cart/checkout for a sizeless
 * product, and demo disclosure on the operational-sounding pages.
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl
  ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } }
  : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...PROXY_OPTS,
});

let fails = 0;
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => {
  fails++;
  console.log('  FAIL ' + m);
};

/* ── 1 — no duplicate "select a size" on any sized product ─────────────── */
console.log('\n=== SELECT A SIZE — no duplicate ===');
for (const handle of ['atlantic-01', 'tide-01', 'volcanic-tee', 'basalt-knit', 'trade-pant']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
  const count = await page.locator('text=Elige una talla').count();
  if (count <= 1) ok(`${handle} — "Elige una talla" appears ${count}x`);
  else bad(`${handle} — "Elige una talla" appears ${count}x (expected at most 1)`);
  await page.close();
}

/* ── 2 — fit meter hidden on non-apparel, shown on apparel ──────────────── */
console.log('\n=== FIT METER — category-gated ===');
for (const [handle, expectFit] of [
  ['atlantic-01', true],
  ['trade-pant', true],
  ['current-bag', false],
  ['north-cap', false],
  ['atlantic-bottle', false],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
  const hasFit = (await page.locator('#reviews >> text=Tallaje').count()) > 0;
  if (hasFit === expectFit) ok(`${handle} — fit meter ${expectFit ? 'shown' : 'hidden'} as expected`);
  else bad(`${handle} — fit meter ${hasFit ? 'shown' : 'hidden'}, expected ${expectFit ? 'shown' : 'hidden'}`);

  // The "recommend %" line must survive regardless — it's generic, not apparel-only.
  const hasRecommend = (await page.locator('#reviews >> text=lo recomienda').count()) > 0;
  if (hasRecommend) ok(`${handle} — recommend % still present`);
  else bad(`${handle} — recommend % missing`);
  await page.close();
}

/* ── 3 — no "Matched on" visible in related products ─────────────────────── */
console.log('\n=== RELATED PRODUCTS — no internal metadata ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  const matches = await page.locator('text=Coincide en').count();
  if (matches === 0) ok('no "Coincide en" text visible on the page');
  else bad(`"Coincide en" still visible ${matches}x`);
  await page.close();
}

/* ── 4 — care copy is category-correct, not copy-pasted ──────────────────── */
console.log('\n=== CARE COPY — category-correct ===');
for (const [handle, mustNotContain, mustContain] of [
  ['tide-01', 'membrana', 'tendedero'],
  ['trade-pant', 'membrana', 'elastano'],
  ['north-cap', 'lavavajillas', 'visera'],
  ['current-bag', 'lavavajillas', 'hebilla'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
  // Open the "Cuidados" accordion section.
  const details = page.locator('details', { hasText: 'Cuidados' }).first();
  await details.locator('summary').click();
  await page.waitForTimeout(200);
  // Scoped to the Care disclosure itself — the page also carries a fixed Ask
  // Atlantic suggestion chip ("¿Cómo se lava la membrana?") that mentions
  // "membrana" on every product regardless of its own care copy, which a
  // whole-page text search would wrongly pick up as this product's own care
  // instructions.
  const careText = (await details.innerText()).toLowerCase();
  const hasBad = careText.includes(mustNotContain.toLowerCase());
  const hasGood = careText.includes(mustContain.toLowerCase());
  if (!hasBad && hasGood) ok(`${handle} — care copy is category-correct`);
  else bad(`${handle} — care copy wrong (contains "${mustNotContain}": ${hasBad}, contains "${mustContain}": ${hasGood})`);
  await page.close();
}

/* ── 5 — Ask Atlantic is category-aware ──────────────────────────────────── */
console.log('\n=== ASK ATLANTIC — category-aware ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-bottle`, { waitUntil: 'networkidle', timeout: 40000 });
  const input = page.locator('#ask-atlantic-heading').locator('..').locator('..').locator('input[type="text"]');
  await input.fill('¿Qué talla elijo?');
  await input.press('Enter');
  await page.waitForTimeout(500);
  const answerText = await page.locator('section[aria-labelledby="ask-atlantic-heading"]').innerText();
  const mentionsApparel = /hombros|cintura|trade pant/i.test(answerText);
  const mentionsBottle = /talla única|capacidad|500 ml/i.test(answerText);
  if (!mentionsApparel && mentionsBottle) ok('bottle sizing question answered with bottle-specific text');
  else bad(`bottle sizing question — apparel language present: ${mentionsApparel}, bottle language present: ${mentionsBottle}`);
  await page.close();
}

/* ── 6 — size guide opens as a drawer, not a navigation ──────────────────── */
console.log('\n=== SIZE GUIDE DRAWER ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  const before = page.url();
  await page.locator('button:has-text("Guía de tallas")').first().click();
  await page.waitForTimeout(400);
  const dialog = page.locator('[role="dialog"]');
  const dialogVisible = (await dialog.count()) > 0;
  const urlUnchanged = page.url() === before;
  if (dialogVisible && urlUnchanged) ok('size guide opens as an in-page drawer, URL unchanged');
  else bad(`size guide — dialog visible: ${dialogVisible}, URL unchanged: ${urlUnchanged}`);

  if (dialogVisible) {
    await page.keyboard.press('Escape');
    // The drawer's exit is a spring, not a fixed-duration tween — AnimatePresence
    // keeps it mounted until the spring settles, which can take longer than a
    // flat 400ms.
    await page.waitForTimeout(800);
    const stillOpen = (await page.locator('[role="dialog"]').count()) > 0;
    if (!stillOpen) ok('Escape closes the drawer');
    else bad('Escape did not close the drawer');
  }
  await page.close();
}

/* ── 7 — cart/checkout with a sizeless product ───────────────────────────── */
console.log('\n=== CART — sizeless product ===');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-bottle`, { waitUntil: 'networkidle', timeout: 40000 });
  const sizeFieldset = await page.locator('legend:has-text("Talla")').count();
  if (sizeFieldset === 0) ok('no size fieldset rendered for a sizeless product');
  else bad('a size fieldset rendered on the bottle PDP');

  await page.locator('#buy button:has-text("Añadir")').first().click();
  await page.waitForTimeout(500);
  const lines = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines,
  );
  if (lines.length === 1 && !lines[0].sizeLabel) ok('bottle added to cart with no size label');
  else bad(`bottle cart line unexpected: ${JSON.stringify(lines)}`);
  await page.close();
}

/* ── 8 — demo disclosure on shipping/returns/contact ─────────────────────── */
console.log('\n=== DEMO DISCLOSURE ===');
for (const [path, needle] of [
  ['/es/shipping', 'Tienda de demostración'],
  ['/es/returns', 'Tienda de demostración'],
  ['/es/contact', 'Formulario de demostración'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}${path}`, { waitUntil: 'networkidle', timeout: 40000 });
  const hasBadge = (await page.locator('text=DEMO').count()) > 0;
  const hasText = (await page.locator(`text=${needle}`).count()) > 0;
  if (hasBadge && hasText) ok(`${path} — demo badge and disclosure present`);
  else bad(`${path} — badge: ${hasBadge}, text "${needle}": ${hasText}`);
  await page.close();
}

/* ── 9 — reduced review counts, all 8 products ───────────────────────────── */
console.log('\n=== REVIEW COUNTS — reduced ===');
for (const handle of [
  'atlantic-01',
  'tide-01',
  'volcanic-tee',
  'basalt-knit',
  'trade-pant',
  'current-bag',
  'north-cap',
  'atlantic-bottle',
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
  const text = await page.locator('#reviews').innerText();
  const match = text.match(/sobre (\d+) opiniones/i);
  const count = match ? Number(match[1]) : null;
  if (count !== null && count <= 50) ok(`${handle} — ${count} reviews (credible)`);
  else bad(`${handle} — review count ${count} (expected <= 50)`);
  await page.close();
}

/* ── console clean across changed surfaces ───────────────────────────────── */
console.log('\n=== CONSOLE ===');
{
  const issues = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push(msg.text());
  });
  page.on('pageerror', (err) => issues.push(err.message));
  for (const path of [
    '/es/product/atlantic-01',
    '/es/product/current-bag',
    '/es/product/north-cap',
    '/es/product/atlantic-bottle',
    '/es/shipping',
    '/es/returns',
    '/es/contact',
  ]) {
    await page.goto(`${B}${path}`, { waitUntil: 'networkidle', timeout: 40000 });
  }
  await page.close();
  const real = issues.filter((m) => !m.includes('ERR_ABORTED'));
  if (real.length === 0) ok('console clean across all changed routes');
  else bad(`console errors: ${real.join(' | ')}`);
}

await browser.close();
console.log(fails === 0 ? '\nPRODUCT POLISH: PASS' : `\nPRODUCT POLISH: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
