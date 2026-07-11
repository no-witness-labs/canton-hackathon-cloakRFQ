import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sources = [
  { name: '02-origination', expectedCues: 7 },
  { name: '03-quotes', expectedCues: 4 },
  { name: '04-privacy', expectedCues: 6 },
  { name: '06-audit', expectedCues: 2 },
];
const narrationDir = resolve(here, 'assets', 'narration');
const captionDir = resolve(here, 'assets', 'captions');
const voice = 'en-US-AndrewMultilingualNeural';

await mkdir(narrationDir, { recursive: true });
await mkdir(captionDir, { recursive: true });

const parseTime = (value) => {
  const [hours, minutes, rest] = value.split(':');
  const [seconds, milliseconds] = rest.split(',');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
};
const formatTime = (value) => {
  const milliseconds = Math.max(0, Math.round(value * 1000));
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const remainder = milliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(remainder).padStart(3, '0')}`;
};

const requested = new Set(process.argv.slice(2));
const selectedSources = requested.size > 0
  ? sources.filter(({ name }) => requested.has(name))
  : sources;
if (requested.size > 0 && selectedSources.length !== requested.size) {
  throw new Error('Unknown V3 narration source requested');
}

for (const { name, expectedCues } of selectedSources) {
  const media = resolve(narrationDir, `${name}.mp3`);
  const subtitles = resolve(narrationDir, `${name}.vtt`);
  const result = spawnSync('edge-tts', [
    '--voice', voice,
    '--rate=-4%',
    '--file', resolve(here, 'narration', `${name}.txt`),
    '--write-media', media,
    '--write-subtitles', subtitles,
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);

  const raw = (await readFile(subtitles, 'utf8')).trimEnd() + '\n';
  await writeFile(subtitles, raw);
  const entries = [...raw.matchAll(/\d+\s*\n(\d\d:\d\d:\d\d,\d{3}) --> (\d\d:\d\d:\d\d,\d{3})\s*\n([^\n]+)\s*/g)];
  if (entries.length !== expectedCues) {
    throw new Error(`${name}: expected ${expectedCues} narration cues, received ${entries.length}`);
  }

  const cues = [];
  for (const entry of entries) {
    const start = parseTime(entry[1]);
    const end = parseTime(entry[2]);
    const words = entry[3].split(/\s+/);
    for (let index = 0, cursor = start; index < words.length; index += 8) {
      const chunk = words.slice(index, index + 8);
      const next = Math.min(end, cursor + (end - start) * (chunk.length / words.length));
      cues.push({ start: cursor, end: next, text: chunk.join(' ') });
      cursor = next;
    }
  }

  const captions = cues
    .map((cue, index) => `${index + 1}\n${formatTime(cue.start)} --> ${formatTime(cue.end)}\n${cue.text}\n`)
    .join('\n');
  await writeFile(resolve(captionDir, `${name}.vtt`), captions);
}

console.log(`Generated V3 narration overrides in ${resolve(here, 'assets')}`);
