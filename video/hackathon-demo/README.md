# Hackathon Demo Video

Reusable, cue-aligned editing assets for the CloakRFQ hackathon demo. The branch
is self-contained; no machine-local media directory is required.

[Watch the current v2 video](cloakrfq-hackathon-demo-v2.mp4).

## Layout

- `narration/`: narration source text committed to Git.
- `assets/clips/`: reusable raw screen recordings.
- `assets/narration/`: unchanged synthetic narration and source cue files.
- `assets/captions/`: shorter display captions derived from the source cues.
- `timeline.json`: source clip ranges and exact output durations for each visual beat.
- `generate-narration.mjs`: regenerates synthetic narration and cue captions.
- `render.mjs`: renders each cue-aligned scene and the final MP4.
- `cloakrfq-hackathon-demo-v2.mp4`: current reviewable render.

Intermediate scene renders are written to the ignored `work/` directory.

## Render

Prerequisites: `node`, `ffmpeg`, `ffprobe`, and `edge-tts`.

```bash
node video/hackathon-demo/generate-narration.mjs
node video/hackathon-demo/render.mjs
```

Edit picture synchronization by changing only `timeline.json`. Each segment
identifies a raw clip range and its intended output duration. This avoids
stretching a complete scene when only one visual action needs adjustment. The
narration audio remains unchanged unless `generate-narration.mjs` is explicitly
run.
