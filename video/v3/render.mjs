import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const demoRoot = resolve(here, '..');
const plan = JSON.parse(await readFile(resolve(here, 'scene-plan.json'), 'utf8'));
const version = String(plan.version);
const outputDir = resolve(demoRoot, 'work', `v${version}`);
const rawImages = resolve(here, 'raw-images');
const { width, height, contentWidth, contentHeight, fps } = plan.video;

await mkdir(outputDir, { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function parseTimestamp(value) {
  const [hours, minutes, rest] = value.split(':');
  const [seconds, milliseconds] = rest.split(',');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
}

function formatTimestamp(value) {
  const milliseconds = Math.max(0, Math.round(value * 1000));
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const remainder = milliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(remainder).padStart(3, '0')}`;
}

run(process.execPath, [resolve(here, 'validate-image-plan.mjs')]);

for (const scene of plan.scenes) {
  const inputs = [];
  const filters = [];

  scene.beats.forEach((beat, index) => {
    inputs.push('-loop', '1', '-framerate', String(fps), '-t', String(beat.duration), '-i', resolve(rawImages, beat.image));
    filters.push(
      `[${index}:v]fps=${fps},scale=${contentWidth}:${contentHeight}:flags=lanczos,` +
      `pad=${width}:${height}:40:0:color=0x080a0d,format=yuv420p,` +
      `trim=duration=${beat.duration.toFixed(3)},setpts=PTS-STARTPTS[v${index}]`,
    );
  });

  const audioIndex = scene.beats.length;
  inputs.push('-i', resolve(here, scene.audio));

  const sourceCaptions = await readFile(resolve(here, scene.captions), 'utf8');
  const shiftedCaptions = scene.audioDelay > 0
    ? sourceCaptions.replace(/\d\d:\d\d:\d\d,\d{3}/g, (time) => formatTimestamp(parseTimestamp(time) + scene.audioDelay))
    : sourceCaptions;
  const captionPath = resolve(outputDir, `${scene.id}.vtt`);
  await writeFile(captionPath, shiftedCaptions);

  const concatenated = scene.beats.map((_, index) => `[v${index}]`).join('');
  const fadeOut = scene.duration - 0.35;
  const delayMs = Math.round(scene.audioDelay * 1000);
  filters.push(
    `${concatenated}concat=n=${scene.beats.length}:v=1:a=0[sequence]`,
    `[sequence]trim=duration=${scene.duration},fade=t=in:st=0:d=0.25,` +
      `fade=t=out:st=${fadeOut.toFixed(3)}:d=0.35,subtitles=${captionPath}:` +
      `force_style='FontName=DejaVu Sans,FontSize=12,PrimaryColour=&H00FFFFFF,` +
      `BackColour=&HA6080A0D,BorderStyle=3,Outline=0,Shadow=0,Alignment=2,MarginV=4'[video]`,
    `[${audioIndex}:a]loudnorm=I=-16:TP=-1.5:LRA=11,adelay=${delayMs}:all=1,` +
      `apad=pad_dur=2,atrim=duration=${scene.duration},` +
      `afade=t=in:st=${scene.audioDelay.toFixed(3)}:d=0.15,` +
      `afade=t=out:st=${fadeOut.toFixed(3)}:d=0.35[audio]`,
  );

  run('ffmpeg', [
    '-y', '-v', 'warning', ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[video]', '-map', '[audio]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-c:a', 'aac', '-b:a', '192k', '-r', String(fps), '-ar', '48000',
    '-movflags', '+faststart', resolve(outputDir, `${scene.id}.mp4`),
  ]);
}

const concatPath = resolve(outputDir, 'concat.txt');
await writeFile(
  concatPath,
  plan.scenes.map((scene) => `file '${resolve(outputDir, `${scene.id}.mp4`)}'`).join('\n') + '\n',
);

const finalPath = resolve(demoRoot, 'cloakrfq-hackathon-demo.mp4');
run('ffmpeg', [
  '-y', '-v', 'warning', '-f', 'concat', '-safe', '0', '-i', concatPath,
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-af', 'aresample=async=1:first_pts=0',
  '-metadata', 'title=CloakRFQ Receipts - Private Invoice Financing on Canton',
  '-metadata', 'comment=Image-first hackathon demo with cue-aligned synthetic narration',
  '-movflags', '+faststart', finalPath,
]);

run('ffprobe', [
  '-v', 'error', '-show_entries',
  'format=duration,size,bit_rate:stream=index,codec_name,width,height,r_frame_rate,sample_rate,channels',
  '-of', 'json', finalPath,
]);
run('ffmpeg', ['-v', 'error', '-i', finalPath, '-f', 'null', '-']);
console.log(`Rendered and validated ${finalPath}`);
