import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(await readFile(resolve(here, 'image-catalog.json'), 'utf8'));
const plan = JSON.parse(await readFile(resolve(here, 'scene-plan.json'), 'utf8'));
const known = new Set(catalog.map((image) => image.file));
const used = new Set();

for (const scene of plan.scenes) {
  for (const image of scene.images) {
    if (!known.has(image)) throw new Error(`${scene.id}: unknown image ${image}`);
    if (used.has(image)) throw new Error(`${scene.id}: image reused ${image}`);
    used.add(image);
  }
}

const ordered = catalog.map((image) => image.file).filter((file) => used.has(file));
const planned = plan.scenes.flatMap((scene) => scene.images);
if (ordered.join('\n') !== planned.join('\n')) {
  throw new Error('Images are not used in catalog order');
}

console.log(`Validated ${planned.length} uniquely ordered images across ${plan.scenes.length} scenes`);
