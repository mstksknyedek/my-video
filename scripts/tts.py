#!/usr/bin/env python3
"""Generate a video's voiceover with Google Cloud Text-to-Speech (Chirp 3 HD, Turkish).

Input: a JSON list of lines, each {"kim": "<character>", "metin": "<text>"}; characters are
mapped to voices in voice/sesler.json. Output, in public/voice/<video>/:
  - NN-<character>.mp3 for every line
  - zamanlama.json: each line's file, duration and per-word timings
Leading silence is trimmed from every file. Video 1 (01-aile-grubu) was made before this
and trims its untrimmed files in the composition instead; do not regenerate its audio.
Word timings are estimated by spreading the measured line duration over the words in
proportion to their length (Chirp 3 HD returns no timestamps). Good enough for word-highlight
captions; replace with forced alignment if it ever drifts noticeably.

The API key is never stored here: the environment's network secret adds the X-Goog-Api-Key
header to requests for texttospeech.googleapis.com.

  python3 scripts/tts.py strategy/senaryolar/03-satirlar.json 01-aile-grubu
"""
import base64
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = "https://texttospeech.googleapis.com/v1/text:synthesize"


def synth(text, voice, rate):
    body = {
        "input": {"text": text},
        "voice": {"languageCode": "tr-TR", "name": voice},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": rate},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return base64.b64decode(json.load(r)["audioContent"])


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def word_times(text, dur):
    words = text.split()
    weights = [len(w.strip(".,!?…:;\"'")) + 1 for w in words]
    total, t, out = sum(weights), 0.0, []
    for w, k in zip(words, weights):
        d = dur * k / total
        out.append({"kelime": w, "baslangic": round(t, 3), "bitis": round(t + d, 3)})
        t += d
    return out


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    lines = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    voices = json.loads((ROOT / "voice" / "sesler.json").read_text(encoding="utf-8"))
    out_dir = ROOT / "public" / "voice" / sys.argv[2]
    out_dir.mkdir(parents=True, exist_ok=True)
    result, chars = [], 0
    for i, line in enumerate(lines, 1):
        kim, metin = line["kim"], line["metin"]
        if kim not in voices:
            sys.exit(f"no voice for '{kim}' in voice/sesler.json")
        f = out_dir / f"{i:02d}-{kim}.mp3"
        raw = out_dir / f"{i:02d}-{kim}.raw.mp3"
        raw.write_bytes(synth(metin, voices[kim], line.get("hiz", 1.0)))
        # Chirp 3 HD files start with 0.1-0.7 s of silence; cut it (keep 50 ms) so word times line up.
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05",
                        str(f)], check=True)
        raw.unlink()
        chars += len(metin)
        d = duration(f)
        result.append({"dosya": f"voice/{sys.argv[2]}/{f.name}", "kim": kim, "metin": metin,
                       "sure": round(d, 3), "kelimeler": word_times(metin, d)})
        print(f"{f.name}: {d:.2f}s  {metin}")
    (out_dir / "zamanlama.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(result)} lines, {chars} characters, total speech {sum(r['sure'] for r in result):.1f}s")


if __name__ == "__main__":
    main()
