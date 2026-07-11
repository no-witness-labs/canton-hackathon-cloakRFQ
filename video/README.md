# Hackathon Demo Video

Reusable, image-sequenced production assets for the CloakRFQ hackathon demo.
The directory is self-contained; no machine-local media directory is required.

[Watch the final video](cloakrfq-hackathon-demo.mp4).

## Layout

- `raw-images/`: 31 ordered screenshots from one complete workflow.
- `raw-images/README.md`: ordered mapping from each image to its UI step.
- `narration/`: source text for all seven narration scenes.
- `assets/narration/`: final synthetic narration audio and source cue files.
- `assets/captions/`: display captions aligned to the narration.
- `image-steps.json` and `image-catalog.json`: capture metadata and image ordering.
- `scene-plan.json`: image timing, audio, captions, and scene durations.
- `capture-images.mjs` and `finalize-images.mjs`: reproducible screenshot capture tools.
- `generate-narration.mjs`: regenerates narration and captions.
- `validate-image-plan.mjs`: verifies complete, unique, ordered image usage.
- `render.mjs`: renders and validates the final MP4.
- `cloakrfq-hackathon-demo.mp4`: final reviewable render.

Intermediate scene renders are written to the ignored `work/` directory.

## Render

Prerequisites: `node`, `ffmpeg`, `ffprobe`, and `edge-tts`.

```bash
npm --prefix video run narrate
npm --prefix video run validate
npm --prefix video run render
```

Edit picture synchronization in `scene-plan.json`. Each scene references
one ordered workflow image and defines its output duration. The validation step
checks that every image is used exactly once and in workflow order before the
final render is generated.
