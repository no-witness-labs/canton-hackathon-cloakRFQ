import { chromium } from 'playwright-core';
import { access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, 'raw-images');
const steps = JSON.parse(await readFile(resolve(here, 'image-steps.json'), 'utf8'));
const chromePath = process.env.CLOAKRFQ_CHROME
  ?? resolve(homedir(), '.cache/ms-playwright/chromium-1223/chrome-linux64/chrome');
const exists = async (path) => access(path, constants.F_OK).then(() => true, () => false);

const closingIndex = steps.findIndex((step) => step.slug === 'closing-value-proposition');
if (closingIndex < 0) throw new Error('Missing closing-value-proposition metadata');
const closingFile = `${String(closingIndex + 1).padStart(3, '0')}-closing-value-proposition.png`;
const closingPath = resolve(outputDir, closingFile);
if (!(await exists(closingPath))) {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, colorScheme: 'dark' });

  await page.setContent(`<!doctype html><html><head><style>
      *{box-sizing:border-box}body{margin:0;background:#0b0d10;color:#eef0f3;font-family:Arial,sans-serif;height:100vh;display:grid;place-items:center}
      .frame{width:100%;height:100%;padding:76px 92px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 85% 15%,rgba(87,227,160,.10),transparent 32%),#0b0d10}
      .brand{font-size:24px;font-weight:700}.brand span{color:#57e3a0}.eyebrow{color:#57e3a0;text-transform:uppercase;font-size:14px;font-weight:700;letter-spacing:.12em}
      h1{font-size:62px;line-height:1.05;max-width:1080px;margin:18px 0 0}.sub{font-size:24px;color:#aeb4bd;max-width:960px;line-height:1.45}
      .pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.p{border-top:2px solid #57e3a0;padding-top:16px;font-size:18px;font-weight:700}.p small{display:block;color:#858c96;font-size:14px;line-height:1.45;margin-top:7px;font-weight:400}
    </style></head><body><main class="frame"><div><div class="brand">Cloak<span>RFQ</span> Receipts</div><div class="eyebrow" style="margin-top:70px">Private invoice financing on Canton</div><h1>Privacy shapes the marketplace.</h1><p class="sub">A working Receivable Sale RFQ with private competition, coordinated settlement, and scoped audit evidence.</p></div><div class="pillars"><div class="p">Private competition<small>Funders never inspect competing Quotes.</small></div><div class="p">Funding-backed offers<small>Committed CIP-56 demo allocation evidence.</small></div><div class="p">Purpose-limited evidence<small>Auditor sees the outcome, not the marketplace.</small></div></div></main></body></html>`);
    await page.screenshot({ path: closingPath, animations: 'disabled' });
  console.log(`CAPTURED ${closingFile}`);
  await browser.close();
}

const catalog = [];
for (const [index, metadata] of steps.entries()) {
  const file = `${String(index + 1).padStart(3, '0')}-${metadata.slug}.png`;
  if (!(await exists(resolve(outputDir, file)))) throw new Error(`Missing ${file}`);
  catalog.push({ order: index + 1, file, ...metadata });
}

const escapeCell = (value) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = catalog.map((image) =>
  `| ${String(image.order).padStart(3, '0')} | [${image.file}](${image.file}) | ${escapeCell(image.role)} | ${escapeCell(image.step)} | ${escapeCell(image.description)} | ${escapeCell(image.narrationCue)} |`,
);
const readme = `# Ordered Raw Images

These screenshots were captured from one fresh end-to-end workflow. They are the
ordered visual source for the final demo.

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
await writeFile(resolve(here, 'image-catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(`Finalized ${catalog.length} ordered images`);
