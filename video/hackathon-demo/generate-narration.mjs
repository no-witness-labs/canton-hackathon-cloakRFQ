import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workdir = process.env.CLOAKRFQ_VIDEO_WORKDIR
  ?? resolve(here, 'assets');
const names = ['01-intro', '02-origination', '03-quotes', '04-privacy', '05-settlement', '06-audit', '07-close'];
const voice = 'en-US-AndrewMultilingualNeural';

await mkdir(resolve(workdir, 'narration'), { recursive: true });
await mkdir(resolve(workdir, 'captions'), { recursive: true });

for (const name of names) {
  const result = spawnSync('edge-tts', [
    '--voice', voice,
    '--rate=-4%',
    '--file', resolve(here, 'narration', `${name}.txt`),
    '--write-media', resolve(workdir, 'narration', `${name}.mp3`),
    '--write-subtitles', resolve(workdir, 'narration', `${name}.vtt`),
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

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

for (const name of names) {
  const source = await readFile(resolve(workdir, 'narration', `${name}.vtt`), 'utf8');
  const entries = [...source.matchAll(/\d+\s*\n(\d\d:\d\d:\d\d,\d{3}) --> (\d\d:\d\d:\d\d,\d{3})\s*\n([^\n]+)\s*/g)];
  const cues = [];
  for (const entry of entries) {
    const start = parseTime(entry[1]);
    const end = parseTime(entry[2]);
    const text = entry[3]
      .replace(/CIP fifty-six/g, 'CIP-56')
      .replace(/Receivable Sale Settlement/g, 'ReceivableSaleSettlement');
    const words = text.split(/\s+/);
    for (let index = 0, cursor = start; index < words.length; index += 8) {
      const chunk = words.slice(index, index + 8);
      const next = Math.min(end, cursor + (end - start) * (chunk.length / words.length));
      cues.push({ start: cursor, end: next, text: chunk.join(' ') });
      cursor = next;
    }
  }
  const output = cues
    .map((cue, index) => `${index + 1}\n${formatTime(cue.start)} --> ${formatTime(cue.end)}\n${cue.text}\n`)
    .join('\n');
  await writeFile(resolve(workdir, 'captions', `${name}.vtt`), output);
}

console.log(`Narration and captions generated in ${workdir}`);
