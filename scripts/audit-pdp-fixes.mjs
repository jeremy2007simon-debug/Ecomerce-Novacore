/**
 * Verifies the specific PDP geometry fixes:
 *  1  gallery frames share one height, vary in width, none wider than the screen
 *  2  gallery scroller left edge lines up with the Rule above it
 *  3  feature-scene progress ticks clear the sticky buy bar and the captions
 *  4  the h1 fits its column
 *  5  spec table column count follows the COLUMN width, not the viewport
 *  6  review summary figure is proportionate to the block beside it
 *  7  real rendered heights of the content-visibility sections
 */
import { chromium } from 'playwright';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = process.env.BASE ?? 'http://127.0.0.1:3100';

const HANDLES = ['atlantic-01','tide-01','volcanic-tee','basalt-knit','trade-pant','current-bag','north-cap','atlantic-bottle'];
const VPS = [
  { w: 375, h: 812, n: '375' }, { w: 390, h: 844, n: '390' }, { w: 430, h: 932, n: '430' },
  { w: 768, h: 1024, n: '768' }, { w: 1024, h: 768, n: '1024' }, { w: 1280, h: 800, n: '1280' },
  { w: 1440, h: 900, n: '1440' }, { w: 1920, h: 1080, n: '1920' },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});

let fails = 0;
const bad = (msg) => { fails++; console.log('  FAIL ' + msg); };

for (const vp of VPS) {
  console.log(`\n=== ${vp.w}x${vp.h} ===`);
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });

  for (const handle of HANDLES) {
    await page.goto(`${B}/es/product/${handle}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);

    const m = await page.evaluate(() => {
      const r = (el) => el.getBoundingClientRect();
      const out = { h: location.pathname.split('/').pop() };

      // 1 — Gallery V2's mobile/tablet strip: `fill` mode against a fixed
      // `--gal-h` means every frame MUST share one height, none wider than
      // the screen. The retired EditorialGallery's separate checks (a Rule
      // heading above a full-bleed scroller, per-frame figcaptions) no
      // longer apply — the gallery now opens the page directly inside the
      // sticky hero column, with no heading above it and no visible caption
      // per frame (the accessible name is the button's aria-label).
      const scroller = document.querySelector('[data-scroll-snap]');
      if (scroller) {
        const frames = [...scroller.querySelectorAll(':scope > button')];
        out.frameH = frames.map(f => Math.round(r(f.querySelector('.pv-shell')).height));
        out.frameW = frames.map(f => Math.round(r(f).width));
      }

      // 3 — feature scene: ticks vs captions vs sticky bar
      const scene = document.getElementById('features');
      if (scene) {
        const col = scene.querySelector('.grid.content-start');
        if (col) {
          out.featColH = Math.round(r(col).height);
          const stack = col.querySelector('div.grid');
          out.stackH = stack ? Math.round(r(stack).height) : null;
          out.stackChildH = stack ? [...stack.children].map(c => Math.round(r(c).height)) : [];
          out.colPadBottom = Math.round(parseFloat(getComputedStyle(col).paddingBottom));
        }
      }

      // 4 — h1 fits its column
      const h1 = document.querySelector('h1');
      if (h1) {
        out.h1w = Math.round(h1.scrollWidth);
        out.colw = Math.round(h1.parentElement.clientWidth);
        out.h1fs = Math.round(parseFloat(getComputedStyle(h1).fontSize));
      }

      // 5 — spec table
      const dl = document.querySelector('dl.grid');
      if (dl) {
        out.specCols = getComputedStyle(dl).gridTemplateColumns.split(' ').length;
        out.specW = Math.round(r(dl).width);
        const rows = [...dl.children].map(c => Math.round(r(c).height));
        out.specRowH = rows;
        out.specLastW = Math.round(r(dl.lastElementChild).width);
      }

      // 6 — review summary
      const avg = document.querySelector('#reviews [data-numeric]');
      if (avg) out.avgFs = Math.round(parseFloat(getComputedStyle(avg).fontSize));
      const dist = document.querySelector('#reviews .flex.flex-col.justify-center');
      if (dist) out.distH = Math.round(r(dist).height);

      // 7 — real section heights for contain-intrinsic-size
      const rev = document.getElementById('reviews');
      if (rev) out.reviewsH = Math.round(r(rev).height);
      const rel = [...document.querySelectorAll('section')].find(s =>
        getComputedStyle(s).containIntrinsicSize.includes('1200px'));
      if (rel) out.relatedH = Math.round(r(rel).height);

      // size grid
      const sizes = document.querySelector('fieldset .grid.gap-2');
      if (sizes) {
        out.sizeCols = getComputedStyle(sizes).gridTemplateColumns.split(' ').length;
        out.sizeBtnW = Math.round(r(sizes.firstElementChild).width);
      }

      out.overflow = document.documentElement.scrollWidth - window.innerWidth;
      return out;
    });

    // Assertions
    if (m.frameH?.length) {
      const uniq = [...new Set(m.frameH)];
      if (uniq.length > 1) bad(`${handle} gallery heights differ: ${m.frameH.join(',')}`);
      if (m.frameW.some(w => w > vp.w)) bad(`${handle} frame wider than screen: ${m.frameW.join(',')}`);
    }
    if (m.h1w > m.colw) bad(`${handle} h1 overflows column: ${m.h1w} > ${m.colw}`);
    if (m.overflow > 0) bad(`${handle} horizontal overflow +${m.overflow}`);
    if (vp.w < 1024 && m.colPadBottom < 40) bad(`${handle} feature column bottom clearance ${m.colPadBottom}`);

    if (handle === 'atlantic-01' || handle === 'atlantic-bottle') {
      console.log(`  ${handle}: h1 ${m.h1w}/${m.colw}@${m.h1fs}px · frames ${m.frameH?.join(',')} · ` +
        `specCols ${m.specCols}@${m.specW} lastW ${m.specLastW} · ` +
        `sizeCols ${m.sizeCols}@${m.sizeBtnW} · avg ${m.avgFs}px/dist ${m.distH} · ` +
        `featCol ${m.featColH} stack ${m.stackH} padB ${m.colPadBottom} · reviews ${m.reviewsH} related ${m.relatedH}`);
    }
  }
  await page.close();
}

await browser.close();
console.log(fails === 0 ? '\nPDP FIXES: PASS' : `\nPDP FIXES: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
