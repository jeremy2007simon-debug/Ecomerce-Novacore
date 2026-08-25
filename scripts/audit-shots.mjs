import { chromium } from 'playwright';
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const B = 'http://127.0.0.1:3100';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});
const shots = [
  { route: '/es/product/atlantic-01', w: 1440, h: 900, scroll: 3400, name: 'pdp-material-desktop' },
  { route: '/es/product/atlantic-01', w: 390,  h: 844, scroll: 2600, name: 'pdp-gallery-mobile' },
  { route: '/es/collection',          w: 1024, h: 768, scroll: 0,    name: 'collection-1024' },
];
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  await page.goto(`${B}${s.route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
    }
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.scroll);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/tmp/audit/before-${s.name}.png` });
  console.log('shot', s.name);
  await page.close();
}
await browser.close();
