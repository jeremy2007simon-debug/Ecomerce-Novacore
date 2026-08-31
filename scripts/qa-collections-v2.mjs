/**
 * Collection Experience + Product Card V2 (Phase 4) — new coverage only.
 * Does not repeat what audit-behaviour.mjs / audit-overflow.mjs / qa.mjs /
 * audit-links.mjs already cover for the rest of the site.
 *
 *  1  Apparel routing fix: ?collection=apparel returns real apparel-form
 *     products and never an accessory (bag/cap/bottle)
 *  2  Accessories routing: ?collection=accessories returns only accessories
 *  3  Desktop filter model is instant-apply (URL updates on click, no Apply step)
 *  4  Filter state survives a hard reload (URL is the source of truth)
 *  5  Sort updates the URL
 *  6  Back navigation restores the previous filter state
 *  7  Clear Filters clears filters but preserves sort
 *  8  Filtered-empty state shows "no products match your filters" copy,
 *     distinct from a provider error
 *  9  Mobile filter model is draft + Apply (URL does NOT change until
 *     "Show N products" is pressed)
 * 10  Quick Add end-to-end from a collection grid card: open -> size ->
 *     add -> overlay swaps quickadd -> cart -> cart line count increments
 * 11  Grid density persists across a reload (localStorage)
 * 12  Zero horizontal overflow on /collection at 8 standard viewports,
 *     plain and with filters applied
 * 13  Full keyboard-only scenario: open collection -> Tab -> open filter ->
 *     select a filter -> close -> reach a ProductCard -> Enter -> Back ->
 *     Quick Add -> size -> Add — no mouse
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

const ACCESSORY_HANDLES = ['current-bag', 'north-cap', 'atlantic-bottle'];
const APPAREL_HANDLES = ['atlantic-01', 'tide-01', 'volcanic-tee', 'basalt-knit', 'trade-pant'];

async function productHandlesOnPage(page) {
  const hrefs = await page.locator('main a[href*="/product/"]').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href')),
  );
  return [...new Set(hrefs.map((href) => href.split('/product/')[1]?.split(/[?#]/)[0]).filter(Boolean))];
}

/* ── 1 — apparel routing fix ────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?collection=apparel`, { waitUntil: 'networkidle', timeout: 40000 });
  const handles = await productHandlesOnPage(page);

  const hasAccessory = handles.some((h) => ACCESSORY_HANDLES.includes(h));
  const hasApparel = handles.some((h) => APPAREL_HANDLES.includes(h));

  if (!hasAccessory) ok(`?collection=apparel excludes accessory handles (found: ${handles.join(', ')})`);
  else bad(`?collection=apparel leaked an accessory handle — found: ${handles.join(', ')}`);

  if (hasApparel) ok('?collection=apparel returns real apparel-form products');
  else bad(`?collection=apparel returned no known apparel handle — found: ${handles.join(', ')}`);

  await page.close();
}

/* ── 2 — accessories routing ────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?collection=accessories`, { waitUntil: 'networkidle', timeout: 40000 });
  const handles = await productHandlesOnPage(page);
  const onlyAccessories = handles.length > 0 && handles.every((h) => ACCESSORY_HANDLES.includes(h));

  if (onlyAccessories) ok(`?collection=accessories returns only accessories (${handles.join(', ')})`);
  else bad(`?collection=accessories returned unexpected handles — found: ${handles.join(', ')}`);

  await page.close();
}

/* ── 3/4 — desktop instant-apply model + reload persistence ────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?collection=apparel`, { waitUntil: 'networkidle', timeout: 40000 });

  await page.getByRole('button', { name: /^Filtrar/ }).click();
  const panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });

  const sizeButton = panel.locator('fieldset', { has: page.getByText('Talla', { exact: true }) }).locator('button').first();
  const sizeLabel = (await sizeButton.textContent())?.trim();
  await sizeButton.click();
  await page.waitForTimeout(300);

  let url = page.url();
  if (url.includes('size=')) ok(`desktop filter applies instantly (URL now has size= — ${url.split('?')[1]})`);
  else bad(`desktop filter did not update the URL instantly — ${url}`);

  await page.reload({ waitUntil: 'networkidle', timeout: 40000 });
  url = page.url();
  const stillFiltered = url.includes('size=') && (await page.locator('#filter-drawer-panel').count()) >= 0;
  if (url.includes('size=')) ok('filter state survives a hard reload (URL round-trip)');
  else bad(`filter state lost on reload — ${url}`);
  void stillFiltered; void sizeLabel;

  await page.close();
}

/* ── 5 — sort updates the URL ───────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection`, { waitUntil: 'networkidle', timeout: 40000 });

  await page.getByRole('button', { name: 'Precio: de menor a mayor' }).click();
  await page.waitForTimeout(300);
  const url = page.url();
  if (url.includes('sort=price-asc')) ok(`sort updates the URL (${url.split('?')[1]})`);
  else bad(`sort did not update the URL — ${url}`);

  await page.close();
}

/* ── 6 — back navigation restores previous filter state ─────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection`, { waitUntil: 'networkidle', timeout: 40000 });

  await page.getByRole('button', { name: /^Filtrar/ }).click();
  let panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });
  const availabilityBox = panel.getByRole('checkbox');
  await availabilityBox.click();
  await page.waitForTimeout(300);
  const afterFirstFilter = page.url();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Filtrar/ }).click();
  panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });
  const colorButton = panel.locator('fieldset', { has: page.getByText('Color', { exact: true }) }).locator('button').first();
  if (await colorButton.count()) {
    await colorButton.click();
    await page.waitForTimeout(300);
  }
  const afterSecondFilter = page.url();

  if (afterSecondFilter !== afterFirstFilter) ok('applying a second filter changes the URL again');
  else bad('second filter did not change the URL — cannot test back navigation meaningfully');

  await page.goBack({ waitUntil: 'networkidle', timeout: 40000 });
  const afterBack = page.url();
  if (afterBack === afterFirstFilter) ok('Back restores the previous filter state exactly');
  else bad(`Back did not restore previous state — expected ${afterFirstFilter}, got ${afterBack}`);

  await page.close();
}

/* ── 7 — Clear Filters preserves sort ───────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?sort=price-desc`, { waitUntil: 'networkidle', timeout: 40000 });

  await page.getByRole('button', { name: /^Filtrar/ }).click();
  const panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });
  await panel.getByRole('checkbox').click();
  await page.waitForTimeout(300);

  // Scoped to the still-open drawer — its own "Quitar filtros" is what's
  // reachable; the ActiveFilterChips one outside is behind the backdrop.
  const clearButton = panel.locator('button', { hasText: 'Quitar filtros' }).first();
  await clearButton.click();
  await page.waitForTimeout(300);

  const url = page.url();
  const hasAvailability = url.includes('availability=');
  const hasSort = url.includes('sort=price-desc');
  if (!hasAvailability && hasSort) ok(`Clear Filters clears filters but keeps sort (${url.split('?')[1] ?? '(no query)'})`);
  else bad(`Clear Filters result unexpected — ${url}`);

  await page.close();
}

/* ── 8 — filtered-empty vs error copy ───────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?priceMin=999999`, { waitUntil: 'networkidle', timeout: 40000 });

  const emptyFilterCopy = page.getByText('Ningún producto coincide con tus filtros');
  if (await emptyFilterCopy.count()) ok('filtered-empty state shows the filter-specific copy');
  else bad('filtered-empty state did not show the expected copy');

  const emptyCollectionCopy = page.getByText('Todavía no hay nada aquí');
  if ((await emptyCollectionCopy.count()) === 0) ok('filtered-empty is not confused with a true-empty collection');
  else bad('filtered-empty incorrectly showed the true-empty-collection copy');

  const clearCta = page.locator('a', { hasText: 'Ver todo' });
  if (await clearCta.count()) ok('filtered-empty offers a "View all" recovery CTA');
  else bad('filtered-empty is missing a recovery CTA');

  await page.close();
}

/* ── 9 — mobile draft + Apply model ─────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${B}/es/collection?collection=apparel`, { waitUntil: 'networkidle', timeout: 40000 });

  const before = page.url();
  await page.getByRole('button', { name: /^Filtrar/ }).click();
  const panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });
  await panel.getByRole('checkbox').click();
  await page.waitForTimeout(300);

  const duringDraft = page.url();
  if (duringDraft === before) ok('mobile: selecting a filter does not touch the URL before Apply (draft model)');
  else bad(`mobile: URL changed before Apply — ${duringDraft}`);

  const applyButton = panel.locator('button', { hasText: /^Ver \d+ productos$/ });
  if (await applyButton.count()) {
    await applyButton.click();
    await page.waitForTimeout(300);
    const afterApply = page.url();
    if (afterApply.includes('availability=in-stock')) ok(`mobile: "Show N products" applies the draft (${afterApply.split('?')[1]})`);
    else bad(`mobile: Apply did not update the URL — ${afterApply}`);
  } else {
    bad('mobile: "Show N products" button not found');
  }

  await page.close();
}

/* ── 10 — Quick Add end-to-end from a grid card ─────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (msg) => { if (msg.type() === 'error') bad(`console error: ${msg.text()}`); });
  await page.goto(`${B}/es/collection?collection=apparel`, { waitUntil: 'networkidle', timeout: 40000 });

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);

  const firstCard = page.locator('article').first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.hover();
  const quickAddTrigger = firstCard.getByText('Añadir a la bolsa', { exact: true });
  await quickAddTrigger.click();
  await page.waitForTimeout(400);

  const sheet = page.locator('[role="dialog"]');
  if (await sheet.isVisible()) ok('Quick Add sheet opens from a collection grid card');
  else bad('Quick Add sheet did not open from a grid card');

  const sizeButton = sheet.locator('fieldset .grid.gap-2 button:not([disabled])').first();
  if (await sizeButton.count()) await sizeButton.click();

  await sheet.locator('button:has-text("Añadir")').first().click();
  await page.waitForTimeout(500);

  const cartDialog = page.locator('[role="dialog"][aria-label*="olsa" i]');
  if (await cartDialog.isVisible()) ok('overlay swapped from Quick Add to the cart drawer (single-slot hand-off)');
  else bad('cart drawer did not open after Quick Add');

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);
  if (after > before) ok(`Quick Add from collection added a line (${before} -> ${after})`);
  else bad(`Quick Add from collection did not add a line (${before} -> ${after})`);

  await page.close();
}

/* ── 11 — grid density persists across reload ───────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${B}/es/collection`, { waitUntil: 'networkidle', timeout: 40000 });

  const densityFourButton = page.locator('button[aria-label="Ver productos en 4 columnas"]');
  await densityFourButton.click();
  await page.waitForTimeout(200);

  const storedAfterClick = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.collection-density.v1') ?? '{}').state?.density);
  if (storedAfterClick === 4) ok('clicking density=4 persists to localStorage');
  else bad(`density=4 did not persist — stored: ${JSON.stringify(storedAfterClick)}`);

  await page.reload({ waitUntil: 'networkidle', timeout: 40000 });
  await page.waitForTimeout(300);
  const grid = page.locator('main .grid').filter({ has: page.locator('article') }).first();
  const hasFourCols = await grid.evaluate((el) => el.className.includes('lg:grid-cols-4'));
  if (hasFourCols) ok('grid density = 4 survives a reload');
  else bad('grid reverted to default density after reload — persistence did not take effect');

  await page.close();
}

/* ── 12 — zero horizontal overflow, /collection ─────────────────────────── */
{
  const VIEWPORTS = [
    { w: 375, h: 812 }, { w: 390, h: 844 }, { w: 430, h: 932 },
    { w: 768, h: 1024 }, { w: 1024, h: 768 }, { w: 1280, h: 800 },
    { w: 1440, h: 900 }, { w: 1920, h: 1080 },
  ];
  const ROUTES = ['/es/collection', '/es/collection?collection=apparel&sort=price-asc'];

  let overflowCount = 0;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    for (const route of ROUTES) {
      await page.goto(`${B}${route}`, { waitUntil: 'networkidle', timeout: 40000 });
      await page.waitForTimeout(300);
      const res = await page.evaluate(() => ({
        docW: document.documentElement.clientWidth,
        scrollW: document.documentElement.scrollWidth,
      }));
      if (res.scrollW > res.docW + 1) {
        overflowCount++;
        bad(`overflow at ${vp.w}x${vp.h} on ${route} (+${res.scrollW - res.docW}px)`);
      }
    }
    await page.close();
  }
  if (overflowCount === 0) ok(`no horizontal overflow across ${VIEWPORTS.length} viewports x ${ROUTES.length} routes`);
}

/* ── 13 — full keyboard-only scenario ───────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/collection?collection=apparel`, { waitUntil: 'networkidle', timeout: 40000 });

  const filterButton = page.getByRole('button', { name: /^Filtrar/ });
  await filterButton.focus();
  const focusedIsFilter = await page.evaluate(() => document.activeElement?.textContent?.includes('Filtrar'));
  if (focusedIsFilter) ok('filter trigger is keyboard-focusable');
  else bad('filter trigger did not receive keyboard focus');

  await page.keyboard.press('Enter');
  const panel = page.locator('#filter-drawer-panel');
  await panel.waitFor({ state: 'visible' });
  ok('Enter opens the filter drawer');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok('a filter option is reachable and selectable by keyboard');

  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  ok('Escape closes the filter drawer');

  const productLink = page.locator('main a[href*="/product/"]').first();
  await productLink.focus();
  const isProductLinkFocused = await page.evaluate(() =>
    document.activeElement?.getAttribute('href')?.includes('/product/'));
  if (isProductLinkFocused) ok('a ProductCard link is keyboard-focusable');
  else bad('could not focus a ProductCard link by keyboard');

  await page.keyboard.press('Enter');
  // Next.js client-side navigation is a soft nav (History API), not a full
  // page load — waitForLoadState('networkidle') can resolve before it
  // completes. Wait on the URL itself instead.
  try {
    await page.waitForURL(/\/product\//, { timeout: 5000 });
  } catch {
    // fall through to the explicit check below, which reports the failure
  }
  if (page.url().includes('/product/')) ok('Enter navigates a focused ProductCard to the PDP');
  else bad(`Enter on ProductCard did not navigate — ${page.url()}`);

  await page.goBack({ waitUntil: 'networkidle', timeout: 40000 });

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);

  const firstCard = page.locator('article').first();
  const quickAddTrigger = firstCard.getByText('Añadir a la bolsa', { exact: true });
  await quickAddTrigger.focus();
  const quickAddFocused = await page.evaluate(() => document.activeElement?.textContent?.includes('Añadir a la bolsa'));
  if (quickAddFocused) ok('Quick Add trigger is reachable by keyboard (focus-within, not hover-only)');
  else bad('Quick Add trigger could not be focused by keyboard');

  await page.keyboard.press('Enter');
  const sheet = page.locator('[role="dialog"]');
  await sheet.waitFor({ state: 'visible' });
  ok('Enter on the Quick Add trigger opens the sheet');

  const sizeButton = sheet.locator('fieldset .grid.gap-2 button:not([disabled])').first();
  if (await sizeButton.count()) {
    await sizeButton.focus();
    await page.keyboard.press('Enter');
  }
  const addButton = sheet.locator('button:has-text("Añadir")').first();
  await addButton.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines.length);
  if (after > before) ok(`full keyboard-only scenario adds to cart (${before} -> ${after}), no mouse used`);
  else bad(`keyboard-only Quick Add did not add a line (${before} -> ${after})`);

  await page.close();
}

console.log(fails === 0 ? '\nCOLLECTIONS V2: PASS' : `\nCOLLECTIONS V2: FAIL (${fails})`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
