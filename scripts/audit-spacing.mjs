import { chromium } from 'playwright';
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:3100/es/product/atlantic-01', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const out = [];
  for (const sel of ['section', 'footer']) {
    document.querySelectorAll(sel).forEach((el, i) => {
      const cs = getComputedStyle(el);
      const pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), pl = parseFloat(cs.paddingLeft);
      const label = (el.querySelector('h1,h2,p')?.textContent ?? '').replace(/\s+/g,' ').trim().slice(0, 26);
      out.push(`${sel}[${i}] pt=${pt} pb=${pb} pl=${pl}  "${label}"`);
    });
  }
  const gal = document.querySelector('[data-scroll-snap]');
  out.push(`gallery scroller paddingLeft = ${gal ? getComputedStyle(gal).paddingLeft : 'n/a'}`);
  return out;
});
r.forEach(l => console.log('  ' + l));
await browser.close();
