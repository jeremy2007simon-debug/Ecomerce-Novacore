/**
 * Detects horizontal overflow and cut-off elements across viewports and routes.
 * Reports the specific offending elements, not just "there is overflow".
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

const VIEWPORTS = [
  { w: 375, h: 812, n: 'iPhone SE/X' },
  { w: 390, h: 844, n: 'iPhone 14' },
  { w: 430, h: 932, n: 'iPhone Pro Max' },
  { w: 768, h: 1024, n: 'iPad portrait' },
  { w: 1024, h: 768, n: 'iPad landscape' },
  { w: 1280, h: 800, n: 'laptop' },
  { w: 1440, h: 900, n: 'desktop' },
  { w: 1920, h: 1080, n: 'wide' },
];

const ROUTES = [
  '/es', '/es/collection', '/es/product/atlantic-01', '/es/product/atlantic-bottle',
  '/es/story', '/es/checkout', '/es/demo/dashboard', '/es/search?q=atl',
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

const findings = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  for (const route of ROUTES) {
    try {
      await page.goto(`${B}${route}`, { waitUntil: 'networkidle', timeout: 40000 });
      await page.waitForTimeout(500);
      // Scroll through the whole page so lazy/scroll-linked content lays out.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);

      const res = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const offenders = [];
        if (scrollW > docW + 1) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed') continue;
            if (r.right > docW + 1 || r.left < -1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className?.toString?.() ?? '').slice(0, 70),
                left: Math.round(r.left), right: Math.round(r.right),
              });
            }
          }
        }
        return { docW, scrollW, overflow: scrollW - docW, offenders: offenders.slice(0, 4) };
      });

      if (res.overflow > 1) {
        findings.push({ vp: `${vp.w}x${vp.h}`, route, overflow: res.overflow, offenders: res.offenders });
      }
    } catch (e) {
      findings.push({ vp: `${vp.w}x${vp.h}`, route, error: e.message.split('\n')[0].slice(0, 60) });
    }
  }
  await page.close();
}

await browser.close();

if (findings.length === 0) {
  console.log('NO HORIZONTAL OVERFLOW across', VIEWPORTS.length, 'viewports x', ROUTES.length, 'routes');
} else {
  console.log(`HORIZONTAL OVERFLOW: ${findings.length} case(s)`);
  for (const f of findings) {
    if (f.error) { console.log(`  ${f.vp} ${f.route} ERROR ${f.error}`); continue; }
    console.log(`  ${f.vp.padEnd(10)} ${f.route.padEnd(30)} +${f.overflow}px`);
    for (const o of f.offenders) console.log(`      <${o.tag}> [${o.left}..${o.right}] ${o.cls}`);
  }
}
