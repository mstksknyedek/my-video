#!/usr/bin/env python3
"""Search Openverse for sound effects and download them into sounds/sfx/.

Only commercial-use licences are requested (CC0, CC BY, CC BY-SA). Every
download is recorded in sounds/sfx/LICENSES.json and sounds/sfx/CREDITS.md,
so you always know where a sound came from and whether it needs a credit.

Usage:
  python3 scripts/openverse_sfx.py search "whoosh"            # list results
  python3 scripts/openverse_sfx.py get "whoosh" --count 2     # download top results
  python3 scripts/openverse_sfx.py get "logo hit" --cc0       # CC0 only (no credit needed)
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.openverse.org/v1/audio/"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "sounds" / "sfx"
LEDGER = OUT / "LICENSES.json"
CREDITS = OUT / "CREDITS.md"
UA = {"User-Agent": "remotion-sfx-helper/1.0"}


def search(query, count, cc0_only, max_seconds):
    params = {
        "q": query,
        "license_type": "commercial",
        "source": "freesound",  # Freesound holds most of Openverse's sound effects
        "page_size": 20,
    }
    if cc0_only:
        params["license"] = "cc0"
    url = API + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        data = json.load(r)
    results = []
    for item in data.get("results", []):
        lic = item.get("license", "")
        if "nc" in lic or "nd" in lic:  # belt and braces: never non-commercial / no-derivatives
            continue
        dur = (item.get("duration") or 0) / 1000
        if max_seconds and dur > max_seconds:
            continue
        results.append(item)
        if len(results) >= count:
            break
    return results, data.get("result_count", 0)


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40] or "sound"


def load_ledger():
    return json.loads(LEDGER.read_text()) if LEDGER.exists() else []


def write_credits(ledger):
    lines = ["# Sound credits", "",
             "Sounds downloaded from Openverse (Freesound). CC0 needs no credit;",
             "CC BY / CC BY-SA must be credited wherever the video is published.", ""]
    need = [e for e in ledger if e["license"] != "cc0"]
    free = [e for e in ledger if e["license"] == "cc0"]
    if need:
        lines += ["## Credit required", ""]
        lines += [f"- \"{e['title']}\" by {e['creator']} ({e['license'].upper()} {e['license_version']}) - {e['landing_url']}" for e in need]
        lines.append("")
    if free:
        lines += ["## CC0 (no credit required)", ""]
        lines += [f"- `{e['file']}`: \"{e['title']}\" by {e['creator']} - {e['landing_url']}" for e in free]
        lines.append("")
    CREDITS.write_text("\n".join(lines))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("action", choices=["search", "get"])
    ap.add_argument("query")
    ap.add_argument("--count", type=int, default=5)
    ap.add_argument("--cc0", action="store_true", help="CC0 only (no credit needed)")
    ap.add_argument("--max-seconds", type=float, default=8.0, help="skip longer recordings (0 = no limit)")
    ap.add_argument("--name", help="file name prefix (default: from the query)")
    a = ap.parse_args()

    results, total = search(a.query, a.count, a.cc0, a.max_seconds)
    print(f"{total} results on Openverse for '{a.query}' (commercial use); showing {len(results)}")
    for i, r in enumerate(results, 1):
        print(f"{i}. [{r['license'].upper()} {r['license_version']}] {r['title'][:50]} - "
              f"{(r.get('duration') or 0) / 1000:.1f}s - {r['creator']}")
    if a.action == "search" or not results:
        return

    OUT.mkdir(parents=True, exist_ok=True)
    ledger = load_ledger()
    known = {e["id"] for e in ledger}
    prefix = slug(a.name or a.query)
    for r in results:
        if r["id"] in known:
            print(f"   already have {r['title'][:40]}")
            continue
        ext = Path(urllib.parse.urlparse(r["url"]).path).suffix or ".mp3"
        n = 1
        while (OUT / f"{prefix}-{n:02d}{ext}").exists():
            n += 1
        dest = OUT / f"{prefix}-{n:02d}{ext}"
        body = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(r["url"], headers=UA), timeout=60) as resp:
                    body = resp.read()
                break
            except urllib.error.URLError as e:
                err = e
                time.sleep(2 * (attempt + 1))
        if body is None:
            print(f"   skipped {r['title'][:40]} (download failed: {err})")
            continue
        dest.write_bytes(body)
        ledger.append({
            "file": dest.name, "id": r["id"], "title": r["title"], "creator": r["creator"],
            "license": r["license"], "license_version": r["license_version"],
            "license_url": r.get("license_url"), "landing_url": r.get("foreign_landing_url"),
            "source": r.get("source"), "query": a.query,
        })
        print(f"   saved {dest.relative_to(ROOT)}")
    LEDGER.write_text(json.dumps(ledger, indent=2, ensure_ascii=False))
    write_credits(ledger)


if __name__ == "__main__":
    sys.exit(main())
