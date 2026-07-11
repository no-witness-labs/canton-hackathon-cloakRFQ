# Hackathon Demo Video

Reusable, cue-aligned editing assets for the CloakRFQ hackathon demo. The branch
is self-contained; no machine-local media directory is required.

[Watch the final video](cloakrfq-hackathon-demo.mp4).

## Layout

- `narration/`: narration source text committed to Git.
- `assets/clips/`: reusable raw screen recordings.
- `assets/narration/`: unchanged synthetic narration and source cue files.
- `assets/captions/`: shorter display captions derived from the source cues.
- `timeline.json`: source clip ranges and exact output durations for each visual beat.
- `generate-narration.mjs`: regenerates synthetic narration and cue captions.
- `render.mjs`: renders each cue-aligned scene and the final MP4.
- `v3/`: ordered workflow images, narration overrides, scene plan, and final renderer.
- `cloakrfq-hackathon-demo.mp4`: final reviewable render.

Intermediate scene renders are written to the ignored `work/` directory.

## Render

Prerequisites: `node`, `ffmpeg`, `ffprobe`, and `edge-tts`.

```bash
npm --prefix video run narrate:v3
npm --prefix video run validate:v3
npm --prefix video run render
```

Edit picture synchronization in `v3/scene-plan.json`. Each scene references
one ordered workflow image and defines its output duration. The validation step
checks that every image is used exactly once and in workflow order before the
final render is generated.
