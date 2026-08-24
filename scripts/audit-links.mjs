/**
 * Collects every link and button on every route, resolves each href, and
 * reports console errors. Distinguishes "different labels, same destination"
 * which is the classic dead-CTA smell.
 */
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
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const ROUTES = ['/es', '/es/collection', '/es/product/atlantic-01', '/es/story',
                '/es/checkout', '/es/demo/dashboard', '/es/search?q=atl', '/en',
                '/es/shipping', '/es/returns', '/es/size-guide', '/es/contact', '/es/terms', '/es/privacy',
                '/en/shipping', '/en/size-guide', '/en/privacy'];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

const consoleIssues = [];
const allLinks = new Map();   // href -> Set(labels)
const buttons = [];

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      const t = m.text();
      if (!t.includes('favicon')) consoleIssues.push(`${route} [${m.type()}] ${t.slice(0, 130)}`);
    }
  });
  page.on('pageerror', (e) => consoleIssues.push(`${route} [pageerror] ${e.message.slice(0, 130)}`));

  await page.goto(`${B}${route}`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const data = await page.evaluate(() => {
    const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 46);
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({
      href: a.getAttribute('href'),
      label: norm(a.textContent) || norm(a.getAttribute('aria-label')) || '(icon)',
    }));
    const btns = [...document.querySelectorAll('button')].map((b) => ({
      label: norm(b.textContent) || norm(b.getAttribute('aria-label')) || '(icon)',
      type: b.getAttribute('type'),
      disabled: b.disabled,
    }));
    return { links, btns };
  });

  for (const l of data.links) {
    if (!allLinks.has(l.href)) allLinks.set(l.href, new Set());
    allLinks.get(l.href).add(l.label);
  }
  for (const b of data.btns) buttons.push(`${route} | ${b.label}${b.disabled ? ' [disabled]' : ''}`);

  await page.close();
}
await browser.close();

console.log('=== LINK DESTINATIONS ===');
console.log('unique hrefs:', allLinks.size);
const collisions = [];
for (const [href, labels] of [...allLinks].sort()) {
  const ls = [...labels];
  console.log(`  ${href.padEnd(34)} <- ${ls.join(' / ')}`);
  if (ls.length > 2) collisions.push({ href, labels: ls });
}

console.log('\n=== SAME DESTINATION, DIFFERENT LABELS (likely dead CTAs) ===');
if (collisions.length === 0) console.log('  none');
for (const c of collisions) console.log(`  ${c.href}  <- ${c.labels.length} different labels: ${c.labels.join(' | ')}`);

console.log('\n=== BUTTON INVENTORY ===');
console.log('total button elements found across routes:', buttons.length);

console.log('\n=== CONSOLE ===');
if (consoleIssues.length === 0) console.log('  clean across all routes');
else [...new Set(consoleIssues)].forEach((c) => console.log('  ' + c));
