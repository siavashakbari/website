#!/usr/bin/env python3
"""Import root portrait/ folder into categorized, renamed assets."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "portrait"
DEST_BASE = ROOT / "src" / "assets" / "portrait"

CALLIGRAPHY_ORDER = [
    "Calligraphy HQ 2.jpg",
    "DSC09821.jpg",
    "DSC09820.jpg",
    "DSC09810.jpg",
    "DSC09794.jpg",
    "DSC09792.jpg",
]


def clean_name(name: str) -> str:
    return re.sub(r"\s+copy$", "", name, flags=re.I).replace(" copy", "")


def find_file(wanted: str) -> Path:
    direct = SRC / wanted
    if direct.exists():
        return direct
    # fuzzy: ignore " copy" and case
    wanted_clean = clean_name(wanted).lower()
    for p in SRC.iterdir():
        if p.is_file() and clean_name(p.name).lower() == wanted_clean:
            return p
    raise FileNotFoundError(wanted)


def move_series(series: str, files: list[Path]) -> list[Path]:
    dest_dir = DEST_BASE / series
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    out = []
    for i, src in enumerate(files, start=1):
        ext = src.suffix.lower()
        dest = dest_dir / f"portrait-{series}-{i:02d}{ext}"
        shutil.copy2(src, dest)
        out.append(dest)
        print(f"  {src.name} -> {dest.relative_to(ROOT)}")
    return out


def main() -> None:
    calligraphy_files = [find_file(n) for n in CALLIGRAPHY_ORDER]
    calligraphy_set = {p.resolve() for p in calligraphy_files}

    # Remaining files (except anything already used), stable sort by cleaned name
    rest = sorted(
        [p for p in SRC.iterdir() if p.is_file() and p.resolve() not in calligraphy_set],
        key=lambda p: clean_name(p.name).lower(),
    )

    print("calligraphy:")
    move_series("calligraphy", calligraphy_files)
    print("photos:")
    move_series("photos", rest)

    # remove source folder
    shutil.rmtree(SRC)
    print("Removed root portrait/")


if __name__ == "__main__":
    main()
