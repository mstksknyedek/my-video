#!/usr/bin/env python3
"""Point Real SFX at this project's sounds/ folder, wherever the project lives.

Real SFX stores its sound library as an absolute path (in its config.json and
library_index.json), so a clone on another computer would still point at the
old location. Run this once after cloning, or any time sounds are added:

  python scripts/setup_sounds.py          # fix the path if needed, rebuild the index
  python scripts/setup_sounds.py --check  # only report whether it is correct

Works on Windows, macOS and Linux. Needs Python and FFmpeg (ffprobe) on PATH.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / ".agents" / "skills" / "real-sfx"
SOUNDS = ROOT / "sounds"
CONFIG = SKILL / "config.json"
INDEX = SKILL / "library_index.json"


def configured_path():
    try:
        libs = json.loads(CONFIG.read_text(encoding="utf-8")).get("libraries", [])
    except (OSError, ValueError):
        return None
    main = next((l for l in libs if l.get("name") == "main"), None)
    return Path(main["path"]) if main else None


def is_current():
    cur = configured_path()
    if cur is None or not INDEX.exists():
        return False
    try:
        return cur.resolve() == SOUNDS.resolve()
    except OSError:
        return False


def main():
    if not SKILL.is_dir():
        sys.exit(f"Real SFX skill not found at {SKILL}")
    SOUNDS.mkdir(exist_ok=True)

    if "--check" in sys.argv:
        print(f"library: {configured_path()}")
        print("ok: points at this project's sounds/" if is_current()
              else f"needs setup: should be {SOUNDS}")
        return 0 if is_current() else 1

    action = "rebuilding index for" if is_current() else "pointing Real SFX at"
    print(f"{action} {SOUNDS}")
    cmd = [sys.executable, str(SKILL / "scripts" / "setup.py"), "init",
           "--library", f"main={SOUNDS}", "--uisfx", "--index", "--force"]
    result = subprocess.run(cmd, cwd=SKILL)
    if result.returncode != 0:
        return result.returncode
    return 0 if is_current() else 1


if __name__ == "__main__":
    sys.exit(main())
