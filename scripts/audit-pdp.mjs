/**
 * Measures product-page geometry to find the proportion/alignment defects:
 * gallery figures with mismatched heights, columns that end at different
 * points, elements escaping their container, and sticky that isn't sticking.
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const HANDLES = ['atlantic-01','tide-01','volcanic-tee','basalt-knit','trade-pant','current-bag','north-cap','atlantic-bottle'];
const VPS = [{ w: 390, h: 844, n: 'mobile' }, { w: 768, h: 1024, n: 'tablet' }, { w: 1440, h: 900, n: 'desktop' }];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

for (const vp of VPS) {
  console.log(`\n=== ${vp.n} ${vp.w}x${vp.h} ===`);
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });

  for (const handle of HANDLES) {
    await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);

    const m = await page.evaluate(() => {
      const out = {};
      // Gallery figures: same width row => heights must match unless intentional
      const figs = [...document.querySelectorAll('figure')];
      out.gallery = figs.map(f => {
        const r = f.getBoundingClientRect();
        const img = f.querySelector('.pv-shell');
        const ir = img?.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(ir?.height ?? 0) };
      });
      // Any element wider than its parent (a real clipping/misfit signal)
      const escapes = [];
      for (const el of document.querySelectorAll('main *')) {
        const p = el.parentElement; if (!p) continue;
        const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
        if (r.width === 0 || pr.width === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.position === 'absolute' || cs.position === 'fixed') continue;
        if (r.width > pr.width + 2) {
          escapes.push({ tag: el.tagName.toLowerCase(), cls: (el.className?.toString?.()??'').slice(0,52),
                         w: Math.round(r.width), pw: Math.round(pr.width) });
        }
      }
      out.escapes = escapes.slice(0, 3);
      return out;
    });

    const heights = m.gallery.map(g => g.h);
    const uniq = [...new Set(heights)];
    const mismatch = uniq.length > 1;
    const esc = m.escapes.length;
    if (mismatch || esc) {
      console.log(`  ${handle.padEnd(17)} gallery heights: ${heights.join(', ')}${mismatch ? '  <-- MISMATCH' : ''}`);
      for (const e of m.escapes) console.log(`      escapes parent: <${e.tag}> ${e.w}px in ${e.pw}px | ${e.cls}`);
    } else {
      console.log(`  ${handle.padEnd(17)} ok (gallery ${heights.join(', ') || 'n/a'})`);
    }
  }
  await page.close();
}
await browser.close();
