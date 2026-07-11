import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const workdir = process.env.CLOAKRFQ_VIDEO_WORKDIR
  ?? resolve(here, 'assets');
const timeline = JSON.parse(await readFile(resolve(here, 'timeline.json'), 'utf8'));
const outputDir = resolve(here, 'work', 'v' + timeline.version);
const { width, height, contentWidth, contentHeight, fps } = timeline.video;

await mkdir(outputDir, { recursive: true });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const scene of timeline.scenes) {
  const visualDuration = scene.segments.reduce((total, segment) => total + segment.duration, 0);
  if (Math.abs(visualDuration - scene.duration) > 0.002) {
    throw new Error(scene.id + ': visual duration ' + visualDuration + ' does not match ' + scene.duration);
  }
  const inputs = [];
  const filters = [];
  scene.segments.forEach((segment, index) => {
    inputs.push('-ss', String(segment.in), '-to', String(segment.out), '-i', resolve(workdir, 'clips', segment.clip));
    const sourceDuration = segment.out - segment.in;
    const ratio = segment.duration / sourceDuration;
    filters.push(
      `[${index}:v]fps=${fps},scale=${contentWidth}:${contentHeight}:flags=lanczos,` +
      `pad=${width}:${height}:40:0:color=0x080a0d,format=yuv420p,` +
      `trim=duration=${sourceDuration.toFixed(3)},setpts=(PTS-STARTPTS)*${ratio.toFixed(8)}[v${index}]`,
    );
  });

  const audioIndex = scene.segments.length;
  inputs.push('-i', resolve(workdir, 'narration', `${scene.id}.mp3`));
  const concatenated = scene.segments.map((_, index) => `[v${index}]`).join('');
  const fadeOut = scene.duration - 0.35;
  filters.push(
    `${concatenated}concat=n=${scene.segments.length}:v=1:a=0[sequence]`,
    `[sequence]trim=duration=${scene.duration},fade=t=in:st=0:d=0.3,` +
      `fade=t=out:st=${fadeOut}:d=0.35,subtitles=${resolve(workdir, 'captions', `${scene.id}.vtt`)}:` +
      `force_style='FontName=DejaVu Sans,FontSize=12,PrimaryColour=&H00FFFFFF,` +
      `BackColour=&HA6080A0D,BorderStyle=3,Outline=0,Shadow=0,Alignment=2,MarginV=4'[video]`,
    `[${audioIndex}:a]loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=4,` +
      `atrim=duration=${scene.duration},afade=t=in:st=0:d=0.15,` +
      `afade=t=out:st=${fadeOut}:d=0.35[audio]`,
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

const concatFile = resolve(outputDir, 'concat.txt');
await writeFile(
  concatFile,
  timeline.scenes.map((scene) => `file '${resolve(outputDir, `${scene.id}.mp4`)}'`).join('\n') + '\n',
);

const finalPath = resolve(here, 'cloakrfq-hackathon-demo-v2.mp4');
run('ffmpeg', [
  '-y', '-v', 'warning', '-f', 'concat', '-safe', '0', '-i', concatFile,
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-af', 'aresample=async=1:first_pts=0',
  '-metadata', 'title=CloakRFQ Receipts - Private Invoice Financing on Canton',
  '-metadata', 'comment=Cue-aligned hackathon demo with synthetic narration',
  '-movflags', '+faststart', finalPath,
]);

run('ffprobe', [
  '-v', 'error', '-show_entries',
  'format=duration,size,bit_rate:stream=index,codec_name,width,height,r_frame_rate,sample_rate,channels',
  '-of', 'json', finalPath,
]);
run('ffmpeg', ['-v', 'error', '-i', finalPath, '-f', 'null', '-']);
console.log(`Rendered and validated ${finalPath}`);
