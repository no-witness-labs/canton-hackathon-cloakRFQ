import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, 'raw-images');
const steps = JSON.parse(await readFile(resolve(here, 'image-steps.json'), 'utf8'));
const appUrl = process.env.CLOAKRFQ_APP_URL ?? 'http://127.0.0.1:3000';
const chromePath = process.env.CLOAKRFQ_CHROME
  ?? resolve(homedir(), '.cache/ms-playwright/chromium-1223/chrome-linux64/chrome');
const captured = [];
let sequence = 0;

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, colorScheme: 'dark' });
const page = await context.newPage();
const sleep = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));
const roleButton = (label) => page.locator('.role-switch .role-btn').filter({ hasText: label }).first();

async function click(locator, pause = 700) {
  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await sleep(200);
  await locator.click();
  await sleep(pause);
}

async function capture(slug) {
  const metadata = steps[sequence];
  if (!metadata || metadata.slug !== slug) {
    throw new Error(`Expected image ${metadata?.slug ?? 'none'}, received ${slug}`);
  }
  sequence += 1;
  const file = `${String(sequence).padStart(3, '0')}-${slug}.png`;
  await page.screenshot({ path: resolve(outputDir, file), animations: 'disabled' });
  captured.push({ order: sequence, file, ...metadata });
  console.log(`CAPTURED ${file}`);
}

// Keep one authentic loading state, then capture only stable workflow states.
await page.route('**/ledger-config.json', async (route) => {
  await sleep(1200);
  await route.continue();
});
await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
await page.getByText('Setting up your demo…').waitFor({ timeout: 5000 });
await capture('loading');
await page.getByRole('heading', { name: 'Welcome to CloakRFQ' }).waitFor({ timeout: 30000 });
await capture('welcome');

await click(page.getByRole('button', { name: 'Got it — start the demo' }));
await page.getByRole('button', { name: 'Register Receivable' }).waitFor();
await capture('seller-register-receivable');
await click(page.getByRole('button', { name: 'Register Receivable' }), 1100);
await capture('seller-receivable-registered');

await roleButton('Compliance').click();
await page.getByRole('button', { name: 'Approve compliance' }).waitFor();
await capture('compliance-review');
await click(page.getByRole('button', { name: 'Approve compliance' }), 1100);
await capture('compliance-approved');

await roleButton('Risk Assessor').click();
await page.getByRole('button', { name: 'Submit risk rating' }).waitFor();
await capture('risk-review');
await click(page.getByRole('button', { name: 'Submit risk rating' }), 1100);
await capture('risk-rated');

await roleButton('Seller').click();
const openRfq = page.getByRole('button', { name: /Open RFQ to 3 Funders/ });
await openRfq.waitFor();
await capture('seller-open-rfq-enabled');
await click(openRfq, 1400);
await page.getByText('RFQ open — waiting for offers.').waitFor();
await capture('seller-rfq-opened');

await roleButton('Funder').click();
await page.getByRole('button', { name: 'Submit private offer' }).waitFor();
await capture('funder-a-compose-offer');
await click(page.getByRole('button', { name: 'Submit private offer' }), 1100);
await capture('funder-a-offer-submitted');

await page.locator('.ftab').filter({ hasText: 'Funder B' }).click();
await page.getByRole('button', { name: 'Submit private offer' }).waitFor();
await page.locator('.netbox input').fill('470400');
await page.getByRole('button', { name: 'With recourse' }).click();
await page.getByRole('button', { name: 'Required', exact: true }).click();
await capture('funder-b-compose-offer');
await click(page.getByRole('button', { name: 'Submit private offer' }), 1100);
await capture('funder-b-offer-submitted');

await roleButton('Seller').click();
await page.getByText('2 in', { exact: true }).waitFor();
await capture('seller-compares-open-offers');

await page.unroute('**/ledger-config.json');
await page.goto(`${appUrl}/ledger`, { waitUntil: 'domcontentloaded' });
await page.getByRole('heading', { name: 'Live ledger' }).waitFor();
await capture('ledger-seller-view');
await click(roleButton('Funder A'));
await capture('ledger-funder-a-view');
await click(roleButton('Funder B'));
await capture('ledger-funder-b-view');
await click(roleButton('Coordinator'));
await capture('ledger-coordinator-view');
await click(roleButton('Auditor'));
await capture('ledger-auditor-before-settlement');
await click(roleButton('Outsider'));
await capture('ledger-outsider-view');

await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
await page.getByText('2 in', { exact: true }).waitFor({ timeout: 30000 });
await page.getByText('offers closed · settle now').waitFor({ timeout: 180000 });
await capture('seller-settlement-enabled');

await click(page.getByRole('button', { name: 'Accept & settle →' }).first(), 1200);
await page.getByRole('heading', { name: 'Invoice sold — settlement recorded' }).waitFor({ timeout: 30000 });
await capture('seller-settlement-recorded');

await roleButton('Funder').click();
await page.getByRole('button', { name: 'Accept receivable transfer' }).waitFor();
await capture('winner-transfer-ready');
await click(page.getByRole('button', { name: 'Accept receivable transfer' }), 1100);
await page.getByText('Ownership accepted — invoice is yours').waitFor();
await capture('winner-ownership-accepted');

await roleButton('Auditor').click();
await page.getByRole('heading', { name: 'Scoped settlement evidence' }).waitFor();
await capture('auditor-scoped-evidence');
await page.getByRole('link', { name: /^Activity ·/ }).click();
await sleep(900);
await capture('activity-ledger-transactions');

await page.setContent(`<!doctype html><html><head><style>
  *{box-sizing:border-box}body{margin:0;background:#0b0d10;color:#eef0f3;font-family:Arial,sans-serif;height:100vh;display:grid;place-items:center}
  .frame{width:100%;height:100%;padding:76px 92px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 85% 15%,rgba(87,227,160,.10),transparent 32%),#0b0d10}
  .brand{font-size:24px;font-weight:700}.brand span{color:#57e3a0}.eyebrow{color:#57e3a0;text-transform:uppercase;font-size:14px;font-weight:700;letter-spacing:.12em}
  h1{font-size:62px;line-height:1.05;max-width:1080px;margin:18px 0 0}.sub{font-size:24px;color:#aeb4bd;max-width:960px;line-height:1.45}
  .pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.p{border-top:2px solid #57e3a0;padding-top:16px;font-size:18px;font-weight:700}.p small{display:block;color:#858c96;font-size:14px;line-height:1.45;margin-top:7px;font-weight:400}
</style></head><body><main class="frame"><div><div class="brand">Cloak<span>RFQ</span> Receipts</div><div class="eyebrow" style="margin-top:70px">Private invoice financing on Canton</div><h1>Privacy shapes the marketplace.</h1><p class="sub">A working Receivable Sale RFQ with private competition, coordinated settlement, and scoped audit evidence.</p></div><div class="pillars"><div class="p">Private competition<small>Funders never inspect competing Quotes.</small></div><div class="p">Funding-backed offers<small>Committed CIP-56 demo allocation evidence.</small></div><div class="p">Purpose-limited evidence<small>Auditor sees the outcome, not the marketplace.</small></div></div></main></body></html>`);
await capture('closing-value-proposition');

if (captured.length !== steps.length) {
  throw new Error(`Captured ${captured.length} images, expected ${steps.length}`);
}
const escapeCell = (value) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = captured.map((image) =>
  `| ${String(image.order).padStart(3, '0')} | [${image.file}](${image.file}) | ${escapeCell(image.role)} | ${escapeCell(image.step)} | ${escapeCell(image.description)} | ${escapeCell(image.narrationCue)} |`,
);
const readme = `# V3 Ordered Raw Images

These screenshots were captured from one fresh end-to-end workflow. They are the
ordered visual source for V3.

## Usage Rule

- Use images strictly in the order below.
- Use every selected image at most once.
- Do not duplicate an image to fill narration time; adjust scene duration or use
  the next ordered image instead.
- Keep the existing narration unless the final column calls for a short,
  UI-specific clarification.

| Order | Image | Role/View | UI step | What the image establishes | Narration cue |
| ---: | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(resolve(outputDir, 'README.md'), readme);
await writeFile(resolve(here, 'image-catalog.json'), JSON.stringify(captured, null, 2) + '\n');
await browser.close();
console.log(`Captured ${captured.length} ordered images in ${outputDir}`);
