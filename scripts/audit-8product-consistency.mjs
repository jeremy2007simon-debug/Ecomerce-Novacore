/**
 * Cross-product consistency matrix: runs the same checks against all 8
 * products side by side, rather than a representative sample. Everything
 * checked here is governed by SHARED components (purchase-panel,
 * review-summary, related-products, ask-atlantic) — there is no per-product
 * branch anywhere in the code for any of it — so this script's real job is
 * proving that stays true as the catalogue changes: a genuine per-product
 * fork would show up here as an inconsistent row, not as a code review guess.
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const HANDLES = ['atlantic-01', 'tide-01', 'volcanic-tee', 'basalt-knit', 'trade-pant', 'current-bag', 'north-cap', 'atlantic-bottle'];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
  ...PROXY_OPTS,
});

let fails = 0;
const bad = (m) => {
  fails++;
  console.log('  FAIL ' + m);
};

for (const handle of HANDLES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });

  const hasSize = (await page.locator('legend:has-text("Talla")').count()) > 0;

  // Visible-on-screen counts, not raw HTML matches — the global search index
  // (app/[locale]/layout.tsx passes the full catalogue to SearchOverlay on
  // every route) means another product's own text can appear in a page's
  // hydration payload without ever being rendered; only offsetParent !== null
  // elements are actually shown to a visitor.
  const visible = (locator) => locator.evaluateAll((els) => els.filter((el) => el.offsetParent !== null).length);

  const selectSizeVisible = await visible(page.locator('text=Elige una talla'));
  const askSection = page.locator('section[aria-labelledby="ask-atlantic-heading"]');
  const askTagline = (await askSection.locator('text=Asistente de compra con IA').count()) > 0;
  const askDetails = (await askSection.locator('details summary:has-text("Cómo funciona")').count()) > 0;
  const askLongTextLeaked = (await visible(askSection.locator('text=motor local con guion'))) > 0;
  const matchedOnVisible = await visible(page.locator('text=Coincide en'));
  const fitVisible = (await visible(page.locator('#reviews >> text=Tallaje'))) > 0;

  const careDetails = page.locator('details', { hasText: 'Cuidados' }).first();
  await careDetails.locator('summary').click();
  await page.waitForTimeout(150);
  const careText = (await careDetails.innerText()).toLowerCase();
  const mentionsMembrane = careText.includes('membrana');

  const expectedSelectSize = hasSize ? 1 : 0;
  console.log(
    `${handle.padEnd(16)} size=${hasSize ? 'y' : 'n'}  ` +
      `selectSize=${selectSizeVisible}  ask(tagline=${askTagline ? 'y' : 'n'},details=${askDetails ? 'y' : 'n'})  ` +
      `matchedOn=${matchedOnVisible}  fit=${fitVisible ? 'y' : 'n'}  careMembrane=${mentionsMembrane ? 'y' : 'n'}`,
  );

  if (selectSizeVisible !== expectedSelectSize)
    bad(`${handle} — "Elige una talla" visible ${selectSizeVisible}x, expected ${expectedSelectSize}`);
  if (!askTagline || !askDetails) bad(`${handle} — Ask Atlantic presentation missing tagline/details`);
  if (askLongTextLeaked) bad(`${handle} — Ask Atlantic technical explanation visible outside the disclosure`);
  if (matchedOnVisible > 0) bad(`${handle} — "Coincide en" visible ${matchedOnVisible}x`);
  if (fitVisible !== hasSize) bad(`${handle} — fit meter visible=${fitVisible}, expected ${hasSize}`);
  if (mentionsMembrane && handle !== 'atlantic-01') bad(`${handle} — care copy mentions membrana, not a membrane product`);
  if (!mentionsMembrane && handle === 'atlantic-01') bad(`atlantic-01 — care copy dropped its membrane instructions`);

  await page.close();
}

await browser.close();
console.log(fails === 0 ? '\n8-PRODUCT CONSISTENCY: PASS' : `\n8-PRODUCT CONSISTENCY: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
