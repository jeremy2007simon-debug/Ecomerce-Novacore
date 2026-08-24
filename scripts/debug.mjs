import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{width:390,height:844} });
p.on('pageerror', e=>console.log('PAGEERROR', e.message));
p.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE', m.text()); });
await p.goto('http://127.0.0.1:3100/es', { waitUntil:'networkidle' });
await p.evaluate(()=>window.scrollTo({top:1500,behavior:'instant'}));
await p.waitForTimeout(1200);
const info = await p.evaluate(() => {
  const scene = document.querySelector('[data-scene="origin"]');
  const stage = scene?.firstElementChild;
  const cs = stage ? getComputedStyle(stage) : null;
  const h2 = scene?.querySelector('h2');
  return {
    scrollY: window.scrollY,
    sceneRect: scene?.getBoundingClientRect(),
    sceneHeight: scene?.getBoundingClientRect().height,
    stageClass: stage?.className,
    stagePosition: cs?.position,
    stageTop: cs?.top,
    stageRect: stage?.getBoundingClientRect(),
    h2Text: h2?.textContent?.slice(0,40),
    h2Rect: h2?.getBoundingClientRect(),
    h2Opacity: h2 ? getComputedStyle(h2).opacity : null,
    bodyOverflow: getComputedStyle(document.body).overflow,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
  };
});
console.log(JSON.stringify(info,null,1));
await b.close();
