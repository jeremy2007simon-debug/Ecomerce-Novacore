/**
 * Drives the real purchase flow: PDP → select size → add to bag → drawer →
 * checkout → three steps → confirmation. Fails loudly on console errors.
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: 'no-preference',
});

const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('404')) problems.push(m.text());
});
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

const step = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    console.log(`  FAIL ${name}: ${e.message.split('\n')[0]}`);
    throw e;
  }
};

const B = 'http://127.0.0.1:3100';
// Scope to <main>: the footer newsletter input also has an "email" label.
const main = page.locator('main');

await step('open PDP', async () => {
  await page.goto(`${B}/es/product/atlantic-01`, { waitUntil: 'networkidle' });
});

await step('select size M', async () => {
  await page.getByRole('button', { name: 'M', exact: true }).first().click();
});

await step('add to bag', async () => {
  await page.getByRole('button', { name: /Añadir a la bolsa/i }).first().click();
  await page.waitForTimeout(700);
});

await step('cart drawer open with 1 line', async () => {
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 4000 });
  const text = await dialog.textContent();
  if (!text.includes('ATLANTIC 01')) throw new Error('line item missing');
});

await page.screenshot({ path: '/tmp/flow-cart.png' });

await step('go to checkout', async () => {
  await page.getByRole('link', { name: /Finalizar compra/i }).click();
  await page.waitForURL('**/checkout*', { timeout: 8000 });
  await page.waitForTimeout(600);
});

await step('step 1 validation blocks empty submit', async () => {
  await main.getByRole('button', { name: /Continuar a entrega/i }).click();
  await page.waitForTimeout(300);
  const alerts = await page.getByRole('alert').count();
  if (alerts === 0) throw new Error('expected validation errors');
});

await step('fill contact', async () => {
  await main.getByLabel('Correo electrónico').fill('demo@atlantic.test');
  await main.getByLabel('Nombre', { exact: true }).fill('Jeremy');
  await main.getByLabel('Apellidos').fill('Simon');
  await main.getByRole('button', { name: /Continuar a entrega/i }).click();
  await page.waitForTimeout(500);
});

await step('fill delivery', async () => {
  await main.getByLabel('Dirección', { exact: true }).fill('Calle del Castillo 12');
  await main.getByLabel('Código postal').fill('38002');
  await main.getByLabel('Ciudad').fill('Santa Cruz de Tenerife');
  await main.getByLabel('Provincia').fill('Tenerife');
  await main.getByRole('button', { name: /Continuar a pago/i }).click();
  await page.waitForTimeout(500);
});

await page.screenshot({ path: '/tmp/flow-payment.png' });

await step('payment step shows DEMO badge', async () => {
  const body = await page.textContent('body');
  if (!body.includes('DEMO')) throw new Error('DEMO badge missing on payment step');
});

await step('complete order', async () => {
  await main.getByRole('button', { name: /Completar pedido/i }).click();
  await page.waitForTimeout(1800);
});

await step('confirmation shows ATL-2048', async () => {
  const body = await page.textContent('body');
  if (!body.includes('ATL-2048')) throw new Error('order id missing');
  if (!body.includes('Pedido confirmado')) throw new Error('confirmation heading missing');
});

await page.screenshot({ path: '/tmp/flow-confirm.png' });

await step('cart cleared after order', async () => {
  const count = await page.evaluate(() => {
    const raw = localStorage.getItem('atl.cart.v1');
    return raw ? JSON.parse(raw).state.lines.length : 0;
  });
  if (count !== 0) throw new Error(`cart still has ${count} lines`);
});

await browser.close();
console.log(problems.length ? `\nCONSOLE ERRORS:\n  ${problems.join('\n  ')}` : '\nconsole clean');
