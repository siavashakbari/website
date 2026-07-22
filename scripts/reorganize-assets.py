#!/usr/bin/env python3
"""Reorganize portfolio assets into category folders with consistent names."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"
STAGING = ROOT / "src" / "_assets_reorg"


def clean_stem(name: str) -> str:
    stem = Path(name).name
    stem = re.sub(r"\s+copy$", "", stem, flags=re.I)
    stem = stem.replace(" copy", "")
    return stem


def is_asset_json(path: Path) -> bool:
    return path.name.endswith(".asset.json")


def media_key(path: Path) -> str:
    """Key used to pair foo.jpg with foo.jpg.asset.json."""
    if is_asset_json(path):
        return path.name[: -len(".asset.json")]
    return path.name


def ext_for(path: Path) -> str:
    if is_asset_json(path):
        # e.g. DSC.jpg.asset.json -> keep .jpg.asset.json after new stem
        inner = path.name[: -len(".asset.json")]
        return Path(inner).suffix + ".asset.json"
    return path.suffix.lower()


def ensure_empty(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True)


def copy_rename(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if is_asset_json(src):
        data = json.loads(src.read_text(encoding="utf-8"))
        # Keep remote url/r2 keys; update filename metadata to match new name
        new_media = dest.name[: -len(".asset.json")]
        data["original_filename"] = new_media
        dest.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    else:
        shutil.copy2(src, dest)


def list_images(folder: Path) -> list[Path]:
    files = []
    for p in sorted(folder.iterdir()):
        if not p.is_file():
            continue
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} or is_asset_json(p):
            files.append(p)
    return files


def ordered_existing(folder: Path, names: list[str]) -> list[Path]:
    out = []
    for name in names:
        p = folder / name
        if p.exists():
            out.append(p)
        else:
            # try asset json only
            aj = folder / f"{name}.asset.json"
            if aj.exists():
                out.append(aj)
            else:
                raise FileNotFoundError(f"Missing {p}")
    return out


def move_series(
    category: str,
    project: str,
    sources: list[Path],
    *,
    prefer_local: bool = True,
) -> list[dict]:
    """
    Copy sources into STAGING/{category}/{project}/{category}-{project}-NN.ext
    For pairs of local image + .asset.json, keep the local image (projects import .jpg)
    and also rename the sidecar .asset.json to match.
    Returns mapping entries.
    """
    dest_dir = STAGING / category / project
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Group by media key
    by_key: dict[str, dict[str, Path]] = {}
    order_keys: list[str] = []
    for src in sources:
        key = media_key(src)
        if key not in by_key:
            by_key[key] = {}
            order_keys.append(key)
        if is_asset_json(src):
            by_key[key]["json"] = src
        else:
            by_key[key]["file"] = src

    results = []
    n = 1
    for key in order_keys:
        pair = by_key[key]
        local = pair.get("file")
        sidecar = pair.get("json")
        primary = local if (prefer_local and local) else (local or sidecar)
        assert primary is not None
        num = f"{n:02d}"
        new_stem = f"{category}-{project}-{num}"
        primary_ext = ext_for(primary)
        dest_primary = dest_dir / f"{new_stem}{primary_ext}"
        copy_rename(primary, dest_primary)
        entry = {
            "category": category,
            "project": project,
            "index": n,
            "import_path": f"../assets/{category}/{project}/{dest_primary.name}",
            "uses_url": is_asset_json(dest_primary),
            "var": f"{project.replace('-', '_')}{n}",
            "src": str(primary.relative_to(ROOT)),
        }
        results.append(entry)
        if local and sidecar and prefer_local:
            # keep sidecar alongside renamed to match new media name
            dest_side = dest_dir / f"{new_stem}{Path(media_key(sidecar)).suffix}.asset.json"
            # media_key of sidecar is like foo.jpg, so suffix .jpg + .asset.json
            copy_rename(sidecar, dest_side)
        n += 1
    return results


def main() -> None:
    ensure_empty(STAGING)
    all_maps: list[dict] = []

    # ---- FOOD ----
    food_gastronomie = ordered_existing(
        ASSETS / "food",
        [
            "003.jpg",
            "006.jpg",
            "014.jpg",
            "016.jpg",
            "018.jpg",
            "021.jpg",
            "022.jpg",
            "031.jpg",
            "033.jpg",
            "034.jpg",
            "DSC01533.jpg",
            "DSC01564.jpg",
            "DSC01579.jpg",
            "DSC01624.jpg",
            "DSC01630.jpg",
            "DSC01706.jpg",
            "DSC01724.jpg",
            "DSC01734.jpg",
            "DSC01751.jpg",
            "DSC01788.jpg",
        ],
    )
    all_maps += move_series("food", "gastronomie", food_gastronomie)

    food_cuisine = ordered_existing(
        ASSETS / "food-2",
        [
            "03.jpg",
            "04.jpg",
            "DSC021072.jpg",
            "DSC02119.jpg",
            "DSC02227.jpg",
            "DSC02230.jpg",
            "DSC02232.jpg",
            "DSC02473.jpg",
            "DSC02478.jpg",
            "DSC02500.jpg",
            "Untitled-1.jpg",
        ],
    )
    all_maps += move_series("food", "cuisine", food_cuisine)

    # food3 incoming
    food3_dir = ROOT / "food3"
    food3_files = []
    preferred = [
        "DSC01970 copy.jpg",
        "DSC01990 copy.jpg",
        "DSC02263.jpg",
        "DSC02467.jpg",
        "DSC02496.jpg",
        "_PIC2036 copy.png",
        "_PIC2129 copy.png",
        "_PIC3448 copy.png",
        "_PIC9389 copy.jpg",
    ]
    for name in preferred:
        p = food3_dir / name
        if not p.exists():
            # try cleaned
            alt = food3_dir / clean_stem(name)
            # also try without leading underscore quirks
            matches = [x for x in food3_dir.iterdir() if x.is_file() and clean_stem(x.name) == clean_stem(name)]
            if matches:
                p = matches[0]
            else:
                raise FileNotFoundError(name)
        food3_files.append(p)
    all_maps += move_series("food", "tasting", food3_files)

    # ---- FASHION ----
    atlasi = ordered_existing(
        ASSETS / "atlasi",
        [
            "DSC09694.jpg",
            "DSC08584.jpg",
            "DSC08249.jpg",
            "DSC08324.jpg",
            "DSC08424.jpg",
            "DSC08436.jpg",
            "DSC08443.jpg",
            "DSC08464.jpg",
            "DSC08494.jpg",
            "DSC08547.jpg",
            "DSC08563.jpg",
            "DSC09610.jpg",
            "DSC09615.jpg",
            "DSC09712.jpg",
            "Untitled-1_01.jpg",
            "Untitled-1_02.jpg",
            "Untitled-1_03.jpg",
        ],
    )
    # also attach sidecars if present
    atlasi_with_side = []
    for p in atlasi:
        atlasi_with_side.append(p)
        side = p.parent / f"{p.name}.asset.json"
        if side.exists():
            atlasi_with_side.append(side)
    all_maps += move_series("fashion", "atlasi", atlasi_with_side)

    sepidar = ordered_existing(
        ASSETS / "sepidar",
        [
            "DSC09296.jpg",
            "DSC09299.jpg",
            "DSC09341.jpg",
            "DSC09275.jpg",
            "DSC07337.jpg",
            "DSC07382.jpg",
            "DSC07395.jpg",
            "DSC07452.jpg",
            "DSC03471.jpg",
            "DSC03419.jpg",
            "DSC03629.jpg",
            "DSC03489.jpg",
            "DSC00343.jpg",
            "DSC00278.jpg",
            "DSC00398.jpg",
            "DSC00305.jpg",
            "DSC00319.jpg",
            "DSC00360.jpg",
        ],
    )
    sepidar_with_side = []
    for p in sepidar:
        sepidar_with_side.append(p)
        side = p.parent / f"{p.name}.asset.json"
        if side.exists():
            sepidar_with_side.append(side)
    all_maps += move_series("fashion", "sepidar", sepidar_with_side)

    zeeen = ordered_existing(ASSETS / "zeeen", ["PIC1001.jpg", "PIC12242.jpg"])
    zeeen_with_side = []
    for p in zeeen:
        zeeen_with_side.append(p)
        side = p.parent / f"{p.name}.asset.json"
        if side.exists():
            zeeen_with_side.append(side)
    all_maps += move_series("fashion", "zeeen", zeeen_with_side)

    fashion_new = ordered_existing(
        ROOT / "fashion",
        ["DSC02051.jpg", "DSC03260.jpg", "DSC03281.jpg"],
    )
    all_maps += move_series("fashion", "atelier", fashion_new)

    # ---- PORTRAIT ----
    calligraphy_names = [
        "Calligraphy_HQ_2.jpg.asset.json",
        "DSC09821.jpg.asset.json",
        "DSC09820.jpg.asset.json",
        "DSC09810.jpg.asset.json",
        "DSC09794.jpg.asset.json",
        "DSC09792.jpg.asset.json",
    ]
    calligraphy = [ASSETS / "calligraphy" / n for n in calligraphy_names]
    all_maps += move_series("portrait", "calligraphy", calligraphy, prefer_local=False)

    portrait_studies_names = [
        "DSC06893.jpg.asset.json",
        "PIC7830.jpg.asset.json",
        "DSC02829.png.asset.json",
        "DSC02854.png.asset.json",
        "DSC06885.jpg.asset.json",
        "PIC7221.jpg.asset.json",
        "DSC09054.jpg.asset.json",
    ]
    portrait_studies = [ASSETS / "portrait-studies" / n for n in portrait_studies_names]
    all_maps += move_series("portrait", "photos", portrait_studies, prefer_local=False)

    portrait_new = ordered_existing(ROOT / "portrait", ["DSC01076.jpg"])
    all_maps += move_series("portrait", "gaze", portrait_new)

    # ---- PRODUCT PHOTOGRAPHY ----
    carpet = ordered_existing(
        ASSETS / "carpet-lover-club",
        [f"carpet-{i}.jpg.asset.json" for i in range(1, 9)],
    )
    all_maps += move_series("product", "carpet-lover-club", carpet, prefer_local=False)

    samanwood = ordered_existing(
        ASSETS / "samanwood",
        [f"samanwood-{i}.jpg.asset.json" for i in range(1, 47)],
    )
    all_maps += move_series("product", "samanwood", samanwood, prefer_local=False)

    # products folder — stable ASCII names first, then remaining
    products_dir = ROOT / "products"
    ascii_order = [
        "DSC00183.jpg",
        "DSC00211.jpg",
        "DSC002112.jpg",
        "DSC00462.jpg",
        "DSC00472.jpg",
        "DSC00479.jpg",
        "DSC00540.jpg",
        "DSC00550.jpg",
        "DSC05240.jpg",
        "DSC06834.jpg",
        "DSC06838.jpg",
        "DSC06839.jpg",
        "DSC06840.jpg",
        "DSC06841.jpg",
        "DSC06843.jpg",
        "DSC06844.jpg",
        "DSC06846.jpg",
        "DSC06847.jpg",
        "DSC06849.jpg",
        "Untitled-1_01.png",
        "Untitled-1_02.png",
        "Untitled-1_03.png",
        "Untitled-1_04.png",
        "Untitled-1_05.png",
        "_PIC5289.jpg",
        "_PIC5381.jpg",
        "_PIC5488.jpg",
        "_PIC5495 2.jpg",
    ]
    products_files = []
    used = set()
    for name in ascii_order:
        p = products_dir / name
        if p.exists():
            products_files.append(p)
            used.add(p.name)
    # remaining (persian / other) sorted by size desc then name
    rest = [p for p in products_dir.iterdir() if p.is_file() and p.name not in used]
    rest.sort(key=lambda p: (-p.stat().st_size, p.name))
    products_files.extend(rest)
    all_maps += move_series("product", "objects", products_files)

    # ---- GRAPHIC / MISC root assets ----
    misc = [
        ("graphic", "visual-identity", ASSETS / "visual-identity.jpg"),
        ("graphic", "book-cover", ASSETS / "book-cover.jpg"),
        ("product-design", "aurelia", ASSETS / "product.jpg"),
        ("brand", "hero", ASSETS / "hero-portrait.jpg"),
        ("brand", "portrait", ASSETS / "portrait.jpg"),
        ("brand", "fashion-legacy", ASSETS / "fashion.jpg"),
        ("brand", "food-legacy", ASSETS / "food.jpg"),
        ("brand", "logo", ASSETS / "logo.svg"),
    ]
    for category, project, src in misc:
        if src.exists():
            all_maps += move_series(category, project, [src])

    # Write mapping
    map_path = ROOT / "scripts" / "asset-rename-map.json"
    map_path.write_text(json.dumps(all_maps, indent=2), encoding="utf-8")
    print(f"Staged {len(all_maps)} images -> {STAGING}")
    print(f"Map written -> {map_path}")


if __name__ == "__main__":
    main()
