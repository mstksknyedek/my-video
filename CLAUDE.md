# my-video

A Remotion video project with sound-effect tools.

## Sound effects

- `sounds/sfx/`: recordings downloaded from Openverse. Every one is listed with its licence in
  `sounds/sfx/LICENSES.json` and `sounds/sfx/CREDITS.md`. CC BY sounds must be credited where the video is published.
- `sounds/generated/`: sounds made with earshot (`earshot make "a soft whoosh" -o sounds/generated/x.wav`).
  These are ours to use commercially with no credit.
- Add a recording: `python scripts/openverse_sfx.py get "<english query>" --cc0 --count 2`.
  Only commercial-use licences are downloaded; never add a sound whose licence contains NC or ND.

## Before using the real-sfx skill

Real SFX stores its library as an absolute path, so on a fresh clone or another computer, first run:

```bash
python scripts/setup_sounds.py
```

It points Real SFX at this project's `sounds/` folder and rebuilds its index (`--check` only reports).
Run it again after adding sounds, so Real SFX can find them.

## Placing sounds in Remotion

In a Remotion composition the frame of every animation is already known, so place sounds directly rather than
detecting moments with Real SFX: copy the chosen file into `public/sfx/` (`staticFile()` only reads `public/`) and
use `<Sequence from={frame}><Audio src={staticFile("sfx/<file>")} /></Sequence>`.
Real SFX is for videos that were rendered or recorded outside this project.
