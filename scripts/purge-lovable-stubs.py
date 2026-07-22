#!/usr/bin/env python3
"""Strip Lovable .asset.json stubs that have no local image bytes."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"
PROJECTS = ROOT / "src" / "data" / "projects.ts"
DISCIPLINES = ROOT / "src" / "data" / "disciplines.ts"

# Projects that only reference Lovable remote stubs (no local image files)
REMOVE_PROJECT_IDS = {
    "calligraphy",
    "photos",
    "carpet-lover-club",
    "samanwood",
}

# Import prefixes to drop entirely
REMOVE_IMPORT_PREFIXES = (
    "calligraphy",
    "photos",
    "carpet",
    "samanwood",
)


def delete_asset_jsons() -> int:
    count = 0
    for p in ROOT.rglob("*.asset.json"):
        # skip node_modules / output
        parts = set(p.parts)
        if "node_modules" in parts or ".output" in parts or "dist" in parts:
            continue
        p.unlink()
        count += 1
    return count


def remove_empty_stub_dirs() -> list[str]:
    removed = []
    stub_dirs = [
        ASSETS / "portrait" / "calligraphy",
        ASSETS / "portrait" / "photos",
        ASSETS / "product" / "carpet-lover-club",
        ASSETS / "product" / "samanwood",
    ]
    for d in stub_dirs:
        if d.exists():
            shutil.rmtree(d)
            removed.append(str(d.relative_to(ROOT)))
    # leftover staging if present
    staging = ROOT / "src" / "_assets_reorg"
    if staging.exists():
        shutil.rmtree(staging)
        removed.append("src/_assets_reorg")
    return removed


def strip_projects_ts() -> None:
    text = PROJECTS.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # drop imports for stub series
        if line.startswith("import "):
            m = re.match(r"import\s+(\w+)\s+from", line)
            if m:
                var = m.group(1)
                if any(
                    var == p or var.startswith(p) and var[len(p) :].isdigit()
                    for p in REMOVE_IMPORT_PREFIXES
                ):
                    i += 1
                    continue
            if ".asset.json" in line:
                i += 1
                continue
        out.append(line)
        i += 1

    text = "".join(out)

    # Remove project objects by id
    for pid in REMOVE_PROJECT_IDS:
        pattern = re.compile(
            r"  \{\n    id: \"" + re.escape(pid) + r"\",.*?\n  \},\n",
            re.DOTALL,
        )
        text, n = pattern.subn("", text)
        if n == 0:
            print(f"WARN: project {pid} not found")
        else:
            print(f"Removed project {pid}")

    # Clean leftover blank lines from import section (max 2 consecutive)
    text = re.sub(r"\n{3,}", "\n\n", text)
    PROJECTS.write_text(text, encoding="utf-8")


def patch_disciplines() -> None:
    text = DISCIPLINES.read_text(encoding="utf-8")
    text = text.replace(
        'import portraitAsset from "../assets/portrait/calligraphy/portrait-calligraphy-01.jpg.asset.json";',
        'import portraitAsset from "../assets/portrait/gaze/portrait-gaze-01.jpg";',
    )
    text = text.replace("image: portraitAsset.url,", "image: portraitAsset,")
    DISCIPLINES.write_text(text, encoding="utf-8")


def main() -> None:
    strip_projects_ts()
    patch_disciplines()
    n = delete_asset_jsons()
    removed = remove_empty_stub_dirs()
    print(f"Deleted {n} .asset.json files")
    print("Removed dirs:", removed)

    # verify no remaining asset json imports
    remaining = list(ROOT.rglob("*.asset.json"))
    remaining = [
        p
        for p in remaining
        if "node_modules" not in p.parts and ".output" not in p.parts
    ]
    print("Remaining asset.json:", len(remaining))
    if ".asset.json" in PROJECTS.read_text(encoding="utf-8"):
        print("WARN: projects.ts still references .asset.json")
    if ".asset.json" in DISCIPLINES.read_text(encoding="utf-8"):
        print("WARN: disciplines.ts still references .asset.json")


if __name__ == "__main__":
    main()
