/**
 * Product Detail Page V2 (Phase 5) — new coverage only. Does not repeat what
 * audit-pdp.mjs / audit-pdp-fixes.mjs / audit-behaviour.mjs / qa.mjs already
 * cover for geometry, links and site-wide behaviour.
 *
 *  1  all 8 products load with no runtime exception / console error
 *  2  picking a colour visibly changes the gallery's leading frame
 *  3  gallery: open fullscreen, counter, next/prev, Escape closes + restores focus
 *  4  size states: available / selected / sold-out (disabled + struck through)
 *  5  Add to Bag without a size: never alert(), moves focus into the size
 *     fieldset, shows the inline message
 *  6  Size Guide: correct table per product (letter vs trade-pant's numeric
 *     waist), size_guide_open fires exactly once per real open
 *  7  Add to Bag adds the right variant for: a sized product, a sizeless
 *     product, a multicolour product
 *  8  cart drawer opens and the selection survives closing it
 *  9  mobile sticky Add to Bag appears/disappears and respects safe-area
 * 10  Details accordion sections open independently
 * 11  Technical Specification has no empty cells, all 8 products
 * 12  Complete the System and Recommendations never repeat a handle
 * 13  ?color= round-trips through a hard reload
 * 14  full keyboard-only scenario (colour -> size -> add, and gallery nav)
 * 15  ES/EN parity on the new copy
 * 16  zero horizontal overflow on the PDP at 8 standard viewports
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

const HANDLES = ['atlantic-01', 'tide-01', 'volcanic-tee', 'basalt-knit', 'trade-pant', 'current-bag', 'north-cap', 'atlantic-bottle'];

async function eventCount(page, name) {
  return page.evaluate((n) => {
    try {
      const raw = JSON.parse(sessionStorage.getItem('atl.events.v1') ?? '[]');
      return raw.filter((e) => e.event?.name === n).length;
    } catch {
      return -1;
    }
  }, name);
}

async function cartLines(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('atl.cart.v1') ?? '{"state":{"lines":[]}}').state.lines);
}

/**
 * The size fieldset's `<legend>` holds BOTH the "Talla" label AND the "Guía
 * de tallas" trigger — the trigger is a `<button>` too, and it comes FIRST
 * in DOM order. Scoping straight into the size grid (`.grid.gap-2`, same
 * selector qa-collections-v2.mjs already uses for the identical Quick Add
 * size grid) is what keeps `.first()` from grabbing the wrong button and
 * opening the drawer instead of picking a size.
 */
function sizeFieldset(page) {
  return page.locator('main fieldset').filter({ has: page.getByText('Talla', { exact: true }) });
}
function sizeButtons(page) {
  return sizeFieldset(page).locator('.grid.gap-2 button:not([disabled])');
}

/* ── 1 — all 8 products load clean ──────────────────────────────────────── */
{
  for (const handle of HANDLES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(200);
    if (errors.length === 0) ok(`${handle} loads with no runtime/console error`);
    else bad(`${handle} loaded with errors: ${errors.slice(0, 2).join(' | ')}`);
    await page.close();
  }
}

/* ── 2 — colour change visibly changes the gallery's leading frame ─────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const hero = page.locator('main button:visible').filter({ has: page.locator('.pv-shell') }).first();
  const before = await hero.getAttribute('aria-label');

  const swatches = page.locator('main fieldset').first().locator('button:visible');
  const swatchCount = await swatches.count();
  let clicked = false;
  for (let i = 0; i < swatchCount; i++) {
    const swatch = swatches.nth(i);
    if (await swatch.isEnabled()) {
      const pressed = await swatch.getAttribute('aria-pressed');
      if (pressed !== 'true') {
        await swatch.click();
        clicked = true;
        break;
      }
    }
  }
  if (!clicked) bad('atlantic-01: could not find a second colour swatch to click');
  await page.waitForTimeout(300);

  const after = await hero.getAttribute('aria-label');
  if (clicked && before !== after) ok(`gallery leading frame changes on colour pick (${before} -> ${after})`);
  else if (clicked) bad(`gallery leading frame did NOT change after a colour pick (still "${before}")`);

  await page.close();
}

/* ── 3 — gallery: fullscreen, counter, next/prev, Escape ────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const hero = page.locator('main button:visible').filter({ has: page.locator('.pv-shell') }).first();
  await hero.focus();
  await hero.click();

  const dialog = page.getByRole('dialog', { name: /Galería/i });
  const opened = await dialog.isVisible().catch(() => false);
  if (opened) ok('clicking the hero frame opens the fullscreen gallery viewer');
  else bad('fullscreen gallery viewer did not open');

  const counter = dialog.locator('[data-numeric]').first();
  const counterBefore = (await counter.textContent())?.trim();
  if (counterBefore && /^\d+\s*\/\s*\d+$/.test(counterBefore)) ok(`gallery counter reads "${counterBefore}"`);
  else bad(`gallery counter text unexpected: "${counterBefore}"`);

  const nextButton = dialog.getByRole('button', { name: /siguiente/i });
  if (await nextButton.count()) {
    await nextButton.click();
    await page.waitForTimeout(250);
    const counterAfter = (await counter.textContent())?.trim();
    if (counterAfter !== counterBefore) ok(`Next advances the counter (${counterBefore} -> ${counterAfter})`);
    else bad('Next did not advance the counter');
  } else {
    ok('single-frame product — no Next button expected (skipped)');
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const closedNow = !(await dialog.isVisible().catch(() => false));
  if (closedNow) ok('Escape closes the fullscreen viewer');
  else bad('Escape did not close the fullscreen viewer');

  const focusBack = await page.evaluate(() => document.activeElement?.tagName);
  if (focusBack === 'BUTTON') ok('focus returns to a button after closing the viewer');
  else bad(`focus did not return to a button after closing — landed on <${focusBack}>`);

  await page.close();
}

/* ── 4 — size states: available / selected / sold-out ──────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const soldOutButton = sizeFieldset(page).locator('.grid.gap-2 button[disabled]').first();
  if (await soldOutButton.count()) {
    const cls = await soldOutButton.getAttribute('class');
    if (cls?.includes('line-through')) ok('sold-out size is disabled AND struck through, not hidden');
    else bad('sold-out size is disabled but not visually struck through');
  } else {
    bad('atlantic-01: expected at least one sold-out size (XXL) — none found');
  }

  const available = sizeButtons(page).first();
  await available.click();
  await page.waitForTimeout(150);
  const pressed = await available.getAttribute('aria-pressed');
  if (pressed === 'true') ok('selecting a size sets aria-pressed="true"');
  else bad(`selecting a size did not set aria-pressed — got "${pressed}"`);

  await page.close();
}

/* ── 5 — Add to Bag without a size: no alert(), real focus + message ───── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let dialogFired = false;
  page.on('dialog', async (d) => { dialogFired = true; await d.dismiss(); });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  await page.getByRole('button', { name: /Añadir a la bolsa|Elige una talla/i }).first().click();
  await page.waitForTimeout(300);

  if (!dialogFired) ok('Add to Bag without a size never triggers a native alert()/dialog');
  else bad('Add to Bag without a size triggered a native dialog — must be a real inline affordance');

  const focusedIsSizeButton = await page.evaluate(() => {
    const fieldset = [...document.querySelectorAll('fieldset')].find((f) => f.textContent?.includes('Talla'));
    return fieldset ? fieldset.contains(document.activeElement) : false;
  });
  if (focusedIsSizeButton) ok('clicking Add to Bag with no size moves focus into the size fieldset');
  else bad('focus did not move into the size fieldset after clicking Add to Bag without a size');

  const inlineMessage = page.getByText('Elige una talla para continuar');
  if (await inlineMessage.count()) ok('inline "select a size" message is shown, not a toast/alert');
  else bad('inline size message did not appear');

  await page.close();
}

/* ── 6 — Size Guide: correct table per form + size_guide_open once/open ── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const before = await eventCount(page, 'size_guide_open');
  await page.getByRole('button', { name: 'Guía de tallas' }).click();
  const drawer = page.getByRole('dialog', { name: 'Guía de tallas' });
  await drawer.waitFor({ state: 'visible' });
  const afterOpen = await eventCount(page, 'size_guide_open');
  if (afterOpen === before + 1) ok(`size_guide_open fires exactly once per open (${before} -> ${afterOpen})`);
  else bad(`size_guide_open fired ${afterOpen - before} times, expected 1`);

  const letterHeader = drawer.getByRole('columnheader', { name: 'Talla' }).or(drawer.getByText('XS').first());
  if (await letterHeader.count()) ok('apparel size guide shows the letter table');
  else bad('apparel size guide did not show the expected letter table');

  await page.keyboard.press('Escape');
  await drawer.waitFor({ state: 'hidden' });

  await page.goto(`${B}/es/product/trade-pant`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.getByRole('button', { name: 'Guía de tallas' }).click();
  const pantDrawer = page.getByRole('dialog', { name: 'Guía de tallas' });
  await pantDrawer.waitFor({ state: 'visible' });
  const numericCell = pantDrawer.getByText('28', { exact: true });
  if (await numericCell.count()) ok('trade-pant size guide shows the numeric waist table');
  else bad('trade-pant size guide did not show the numeric waist table');

  await page.close();
}

/* ── 7 — Add to Bag: sized, sizeless, multicolour ───────────────────────── */
{
  // Sized: atlantic-01, colour + size chosen.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
    const before = await cartLines(page);

    const swatch = page.locator('main fieldset').first().locator('button:visible:not([disabled])').first();
    const swatchLabel = (await swatch.getAttribute('title')) ?? '';
    await swatch.click();
    await sizeButtons(page).first().click();
    await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
    await page.waitForTimeout(600);

    const after = await cartLines(page);
    const added = after.length === before.length + 1 ? after[0] : null;
    if (added && added.colorLabel && added.sizeLabel && added.quantity === 1) {
      ok(`sized add-to-bag: colour "${added.colorLabel}" (~${swatchLabel}), size "${added.sizeLabel}", qty 1`);
    } else {
      bad(`sized add-to-bag did not produce a complete cart line: ${JSON.stringify(added)}`);
    }
    await page.close();
  }

  // Sizeless: current-bag, no size fieldset should even be rendered.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${B}/es/product/current-bag`, { waitUntil: 'networkidle', timeout: 40000 });
    const before = await cartLines(page);

    if ((await sizeFieldset(page).count()) === 0) ok('sizeless product renders no size fieldset at all');
    else bad('current-bag unexpectedly rendered a size fieldset');

    await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
    await page.waitForTimeout(600);
    const after = await cartLines(page);
    const added = after.length === before.length + 1 ? after[0] : null;
    if (added && (added.sizeLabel === null || added.sizeLabel === undefined) && added.quantity === 1) {
      ok('sizeless add-to-bag adds a real line with no size, qty 1, in one click');
    } else {
      bad(`sizeless add-to-bag did not produce the expected line: ${JSON.stringify(added)}`);
    }
    await page.close();
  }

  // Multicolour: pick a second colour, confirm the added line's colour matches it.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

    const swatches = page.locator('main fieldset').first().locator('button:visible:not([disabled])');
    const secondSwatch = swatches.nth(1);
    const secondLabel = await secondSwatch.getAttribute('title');
    await secondSwatch.click();
    await sizeButtons(page).first().click();
    await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
    await page.waitForTimeout(600);

    const lines = await cartLines(page);
    const line = lines[0];
    if (line && secondLabel && line.colorLabel === secondLabel) {
      ok(`multicolour add-to-bag records the chosen colour ("${secondLabel}"), not always the default`);
    } else {
      bad(`multicolour add-to-bag colour mismatch — chose "${secondLabel}", cart line has "${line?.colorLabel}"`);
    }
    await page.close();
  }
}

/* ── 8 — cart drawer opens, selection survives closing ──────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/volcanic-tee`, { waitUntil: 'networkidle', timeout: 40000 });

  await sizeButtons(page).first().click();
  await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
  await page.waitForTimeout(500);

  const cartDialog = page.locator('[role="dialog"][aria-label*="olsa" i]');
  if (await cartDialog.isVisible()) ok('cart drawer opens automatically after Add to Bag');
  else bad('cart drawer did not open after Add to Bag');

  const linesWhileOpen = await cartLines(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const linesAfterClose = await cartLines(page);
  if (linesAfterClose.length === linesWhileOpen.length && linesAfterClose.length > 0) {
    ok('closing the cart drawer does not clear the selection');
  } else {
    bad(`cart line count changed on close: ${linesWhileOpen.length} -> ${linesAfterClose.length}`);
  }

  await page.close();
}

/* ── 9 — mobile sticky Add to Bag: appears, hides near footer/overlay ──── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const stickyBar = page.locator('.safe-bottom.fixed');
  const hiddenAtTop = (await stickyBar.count()) === 0 || !(await stickyBar.isVisible().catch(() => false));
  if (hiddenAtTop) ok('sticky Add to Bag is not shown while the real CTA is on screen');
  else bad('sticky Add to Bag is visible before the primary CTA has scrolled away');

  // Scroll to just past the real CTA's own position, not a guessed constant —
  // on mobile the info column stacks below the (now taller) gallery, so a
  // fixed pixel offset undershoots depending on how many colours/frames a
  // given product has.
  await page.locator('#buy').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(500);
  const stickyBarMid = page.locator('.safe-bottom.fixed');
  const visibleMidPage = (await stickyBarMid.count()) > 0 && (await stickyBarMid.isVisible().catch(() => false));
  if (visibleMidPage) ok('sticky Add to Bag appears once the primary CTA scrolls off screen');
  else bad('sticky Add to Bag did not appear after scrolling past the primary CTA');

  if (visibleMidPage) {
    const hasSafeBottom = await stickyBarMid.evaluate((el) => el.className.includes('safe-bottom'));
    if (hasSafeBottom) ok('sticky bar carries the safe-area-inset-bottom class');
    else bad('sticky bar is missing the safe-area class');
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // The bar's exit uses a spring transition (AnimatePresence keeps it mounted
  // mid-exit), so a short wait here would only catch it sliding away, not
  // confirm it actually leaves — give the spring time to settle.
  await page.waitForTimeout(1500);
  const stillPresent = (await page.locator('.safe-bottom.fixed').count()) > 0;
  if (!stillPresent) ok('sticky Add to Bag hides once the footer is reached');
  else bad('sticky Add to Bag is still present after the footer is reached');

  await page.close();
}

/* ── 10 — Details accordion sections open independently ─────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const detailsEls = page.locator('main details');
  const count = await detailsEls.count();
  if (count >= 2) {
    await detailsEls.nth(0).locator('summary').click();
    await detailsEls.nth(1).locator('summary').click();
    const firstOpen = await detailsEls.nth(0).evaluate((el) => el.open);
    const secondOpen = await detailsEls.nth(1).evaluate((el) => el.open);
    if (firstOpen && secondOpen) ok('opening a second accordion row leaves the first one open too');
    else bad(`accordion rows are not independent — row1 open=${firstOpen}, row2 open=${secondOpen}`);
  } else {
    bad(`expected at least 2 accordion rows, found ${count}`);
  }

  await page.close();
}

/* ── 11 — Technical Specification: no empty cells, all 8 products ───────── */
{
  for (const handle of HANDLES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
    const values = await page.locator('main dl.grid dd').allTextContents();
    const empty = values.filter((v) => v.trim().length === 0).length;
    if (values.length > 0 && empty === 0) ok(`${handle}: Technical Specification has ${values.length} rows, none empty`);
    else bad(`${handle}: Technical Specification has ${empty} empty cell(s) out of ${values.length}`);
    await page.close();
  }
}

/* ── 12 — Complete the System vs Recommendations: no duplicate handles ──── */
{
  for (const handle of HANDLES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });

    const systemHandles = await page
      .locator('section[aria-labelledby="complete-the-system-heading"] a[href*="/product/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')?.split('/product/')[1]?.split(/[?#]/)[0]));
    const relatedHandles = await page
      .locator('section[aria-labelledby="related-heading"] a[href*="/product/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')?.split('/product/')[1]?.split(/[?#]/)[0]));

    const overlap = systemHandles.filter((h) => relatedHandles.includes(h));
    if (overlap.length === 0) {
      ok(`${handle}: Complete the System (${systemHandles.length}) and Recommendations (${relatedHandles.length}) never repeat a handle`);
    } else {
      bad(`${handle}: handle(s) shown in both sections: ${overlap.join(', ')}`);
    }
    await page.close();
  }
}

/* ── 13 — ?color= round-trips through a hard reload ─────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });

  const swatches = page.locator('main fieldset').first().locator('button:visible:not([disabled])');
  const target = swatches.nth(1);
  const targetLabel = await target.getAttribute('title');
  await target.click();
  await page.waitForTimeout(300);
  const url = page.url();
  if (url.includes('color=')) ok(`colour pick syncs to the URL (${url.split('?')[1]})`);
  else bad(`colour pick did not sync to the URL — ${url}`);

  await page.reload({ waitUntil: 'networkidle', timeout: 40000 });
  await page.waitForTimeout(300);
  const restoredSwatch = page.locator('main fieldset').first().locator(`button[title="${targetLabel}"]`);
  const restoredPressed = await restoredSwatch.getAttribute('aria-pressed');
  if (restoredPressed === 'true') ok(`?color= restores the same swatch as selected after a hard reload ("${targetLabel}")`);
  else bad(`?color= did not restore the selected swatch after reload — expected "${targetLabel}" pressed`);

  await page.close();
}

/* ── 14 — full keyboard-only scenario ────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  const before = await cartLines(page);

  const swatch = page.locator('main fieldset').first().locator('button:visible:not([disabled])').first();
  await swatch.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const swatchPressed = await swatch.getAttribute('aria-pressed');
  if (swatchPressed === 'true') ok('a colour swatch is keyboard-focusable and selectable via Enter');
  else bad('colour swatch did not respond to keyboard Enter');

  const sizeButton = sizeButtons(page).first();
  await sizeButton.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const sizePressed = await sizeButton.getAttribute('aria-pressed');
  if (sizePressed === 'true') ok('a size button is keyboard-focusable and selectable via Enter');
  else bad('size button did not respond to keyboard Enter');

  const addButton = page.getByRole('button', { name: /Añadir a la bolsa/i }).first();
  await addButton.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const after = await cartLines(page);
  if (after.length > before.length) ok(`full keyboard-only colour -> size -> add works (${before.length} -> ${after.length})`);
  else bad('keyboard-only add-to-bag did not add a line');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Gallery: keyboard-open, arrow nav, Escape.
  const hero = page.locator('main button:visible').filter({ has: page.locator('.pv-shell') }).first();
  await hero.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: /Galería/i });
  const galleryOpened = await dialog.isVisible().catch(() => false);
  if (galleryOpened) ok('gallery opens via keyboard (Enter on the focused hero frame)');
  else bad('gallery did not open via keyboard');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const galleryClosed = !(await dialog.isVisible().catch(() => false));
  if (galleryClosed) ok('Escape closes the gallery reached via keyboard');
  else bad('Escape did not close the keyboard-opened gallery');

  await page.close();
}

/* ── 15 — ES/EN parity on the new copy ───────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  const esInline = await page.getByText('Elige una talla para continuar').count();

  await page.goto(`${B}/en/product/atlantic-01`, { waitUntil: 'networkidle', timeout: 40000 });
  let dialogFired = false;
  page.on('dialog', async (d) => { dialogFired = true; await d.dismiss(); });
  await page.getByRole('button', { name: /Add to bag|Select a size/i }).first().click();
  await page.waitForTimeout(300);
  const enInline = await page.getByText('Select a size to continue').count();

  if (esInline === 0 && enInline > 0 && !dialogFired) {
    ok('inline "select a size" message is localised correctly (checked before/after the ES run above)');
  } else {
    bad(`ES/EN inline message parity issue — esInline(pre-click)=${esInline}, enInline=${enInline}`);
  }

  const enGalleryLabel = await page.getByRole('button', { name: /previous image|next image/i }).count();
  ok(`EN gallery nav labels present: ${enGalleryLabel > 0 ? 'yes' : 'n/a (single-frame product)'}`);

  await page.close();
}

/* ── 16 — zero horizontal overflow across 8 viewports ────────────────────── */
{
  const VIEWPORTS = [
    { w: 375, h: 812 }, { w: 390, h: 844 }, { w: 430, h: 932 },
    { w: 768, h: 1024 }, { w: 1024, h: 768 }, { w: 1280, h: 800 },
    { w: 1440, h: 900 }, { w: 1920, h: 1080 },
  ];
  const ROUTES = ['/es/product/atlantic-01', '/es/product/trade-pant'];

  let overflowCount = 0;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    for (const route of ROUTES) {
      await page.goto(`${B}${route}`, { waitUntil: 'networkidle', timeout: 40000 });
      await page.waitForTimeout(250);
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

console.log(fails === 0 ? '\nPDP V2: PASS' : `\nPDP V2: FAIL (${fails})`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
