import { chromium } from 'playwright';
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const PROXY_OPTS = proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1,::1' } } : {};
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'], ...PROXY_OPTS,
});
for (const [w, handle] of [[375,'atlantic-bottle'],[390,'atlantic-bottle'],[390,'volcanic-tee'],[768,'atlantic-bottle'],[1024,'atlantic-bottle'],[1440,'atlantic-bottle']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(`http://127.0.0.1:3100/es/product/${handle}`, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const col = h1?.closest('.flex.flex-col');
    const inner = h1?.querySelector('span span') ?? h1;
    return {
      fontSize: h1 ? getComputedStyle(h1).fontSize : null,
      textW: Math.round(inner?.getBoundingClientRect().width ?? 0),
      textScrollW: inner?.scrollWidth ?? 0,
      colW: Math.round(col?.getBoundingClientRect().width ?? 0),
      h1Right: Math.round(h1?.getBoundingClientRect().right ?? 0),
      colRight: Math.round(col?.getBoundingClientRect().right ?? 0),
    };
  });
  const over = r.textScrollW > r.colW + 2;
  console.log(`  ${w}px ${handle.padEnd(16)} font=${r.fontSize}  text=${r.textScrollW}px  column=${r.colW}px  ${over ? '<-- OVERFLOWS COLUMN' : 'fits'}`);
  await page.close();
}
await browser.close();
