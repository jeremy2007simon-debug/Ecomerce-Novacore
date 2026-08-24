import { chromium } from 'playwright';
const launch = { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] };
const browser = await chromium.launch(launch);

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await page.goto('http://127.0.0.1:3100/es', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const scene = document.querySelector('[data-scene="origin"]');
  const stage = scene?.firstElementChild;
  return {
    mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    sceneInlineHeight: scene?.getAttribute('style'),
    sceneComputedHeight: scene ? getComputedStyle(scene).height : null,
    stagePosition: stage ? getComputedStyle(stage).position : null,
    stageInline: stage?.getAttribute('style'),
    bodyScrollHeight: document.body.scrollHeight,
  };
});
console.log('REDUCED MOTION:', JSON.stringify(info, null, 1));
await browser.close();
