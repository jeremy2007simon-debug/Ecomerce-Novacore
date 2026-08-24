/**
 * Screenshot helper for visual QA during development.
 *   node scripts/shot.mjs <path> <outfile> [width] [height] [fullPage]
 * Also fails loudly on any console error, which is how hydration mismatches
 * get caught rather than shipped.
 */
import { chromium } from 'playwright';

const [, , route = '/es', out = 'shot.png', w = '390', h = '844', full = 'false'] = process.argv;

// The preinstalled Chromium build number does not always match what this
// Playwright version looks for, so point at it explicitly rather than
// downloading a second copy.
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
});

const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));

await page.goto(`http://127.0.0.1:3100${route}`, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(900);
await page.screenshot({ path: out, fullPage: full === 'true' });
await browser.close();

if (problems.length) {
  console.log('CONSOLE PROBLEMS:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
} else {
  console.log('console clean');
}
console.log('saved ' + out);
