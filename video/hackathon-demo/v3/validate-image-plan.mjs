import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(await readFile(resolve(here, 'image-catalog.json'), 'utf8'));
const plan = JSON.parse(await readFile(resolve(here, 'scene-plan.json'), 'utf8'));
const known = new Set(catalog.map((image) => image.file));
const used = new Set();
const planned = [];
let totalDuration = 0;

for (const scene of plan.scenes) {
  const visualDuration = scene.beats.reduce((total, beat) => total + beat.duration, 0);
  if (Math.abs(visualDuration - scene.duration) > 0.002) {
    throw new Error(`${scene.id}: beat duration ${visualDuration} does not match scene duration ${scene.duration}`);
  }
  totalDuration += scene.duration;

  for (const beat of scene.beats) {
    if (!known.has(beat.image)) throw new Error(`${scene.id}: unknown image ${beat.image}`);
    if (used.has(beat.image)) throw new Error(`${scene.id}: image reused ${beat.image}`);
    if (!(beat.duration > 0)) throw new Error(`${scene.id}: invalid duration for ${beat.image}`);
    used.add(beat.image);
    planned.push(beat.image);
  }
}

const ordered = catalog.map((image) => image.file);
if (planned.length !== ordered.length) {
  const missing = ordered.filter((file) => !used.has(file));
  throw new Error(`Scene plan must use all catalog images; missing: ${missing.join(', ')}`);
}
if (ordered.join('\n') !== planned.join('\n')) {
  throw new Error('Images are not used in catalog order');
}
if (totalDuration > plan.maxDurationSeconds) {
  throw new Error(`Planned duration ${totalDuration.toFixed(3)} exceeds ${plan.maxDurationSeconds} seconds`);
}

console.log(`Validated ${planned.length} unique ordered images across ${plan.scenes.length} scenes (${totalDuration.toFixed(3)}s)`);
