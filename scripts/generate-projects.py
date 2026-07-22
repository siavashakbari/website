#!/usr/bin/env python3
"""Generate projects.ts and patch other imports after asset reorg."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = json.loads((ROOT / "scripts" / "asset-rename-map.json").read_text(encoding="utf-8"))


def by_project(project: str) -> list[dict]:
    return [m for m in MAP if m["project"] == project]


def import_line(var: str, entry: dict) -> str:
    return f'import {var} from "{entry["import_path"]}";'


def gallery_expr(vars_: list[str], uses_url: bool) -> str:
    if uses_url:
        return ",\n      ".join(f"{v}.url" for v in vars_)
    return ",\n      ".join(vars_)


def main() -> None:
    lines: list[str] = []
    # misc single assets
    vi = by_project("visual-identity")[0]
    bc = by_project("book-cover")[0]
    aurelia = by_project("aurelia")[0]
    hero = by_project("hero")[0]
    portrait_about = by_project("portrait")[0]

    lines.append(import_line("visualIdentityImg", vi))
    lines.append(import_line("bookCoverImg", bc))
    lines.append(import_line("productImg", aurelia))

    series_defs = [
        ("gastronomie", "gastronomie", False),
        ("cuisine", "cuisine", False),
        ("tasting", "tasting", False),
        ("atlasi", "atlasi", False),
        ("sepidar", "sepidar", False),
        ("zeeen", "zeeen", False),
        ("atelier", "atelier", False),
        ("calligraphy", "calligraphy", True),
        ("photos", "photos", True),
        ("gaze", "gaze", False),
        ("carpet-lover-club", "carpet", True),
        ("samanwood", "samanwood", True),
        ("objects", "objects", False),
    ]

    series_vars: dict[str, list[str]] = {}
    series_url: dict[str, bool] = {}

    for project, prefix, uses_url in series_defs:
        entries = by_project(project)
        vars_ = []
        for e in entries:
            var = f"{prefix}{e['index']}"
            vars_.append(var)
            lines.append(import_line(var, e))
        series_vars[project] = vars_
        series_url[project] = uses_url

    lines.append("")
    lines.append('export type Discipline = "photography" | "graphic-design" | "product-design";')
    lines.append("")
    lines.append("export interface Project {")
    lines.append("  id: string;")
    lines.append("  title: string;")
    lines.append("  discipline: Discipline;")
    lines.append("  category: string;")
    lines.append("  year: string;")
    lines.append("  description: string;")
    lines.append("  image: string;")
    lines.append('  aspect: "portrait" | "landscape";')
    lines.append("  gallery?: string[];")
    lines.append("  client?: string;")
    lines.append("  credits?: string[];")
    lines.append("}")
    lines.append("")
    lines.append("export const disciplines: { id: Discipline; label: string; description: string }[] = [")
    lines.append("  {")
    lines.append('    id: "photography",')
    lines.append('    label: "Photography",')
    lines.append('    description: "Food, portrait, and fashion stories told through light and shadow.",')
    lines.append("  },")
    lines.append("  {")
    lines.append('    id: "graphic-design",')
    lines.append('    label: "Graphic Design",')
    lines.append('    description: "Visual identities and book covers that carry a brand\'s voice.",')
    lines.append("  },")
    lines.append("  {")
    lines.append('    id: "product-design",')
    lines.append('    label: "Product Design",')
    lines.append('    description: "Objects shaped by purpose, material, and quiet detail.",')
    lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export const projects: Project[] = [")

    def project_block(
        pid: str,
        title: str,
        discipline: str,
        category: str,
        year: str,
        description: str,
        series: str,
        aspect: str = "portrait",
        cover_index: int = 1,
    ) -> None:
        vars_ = series_vars[series]
        uses_url = series_url[series]
        cover = vars_[cover_index - 1]
        cover_expr = f"{cover}.url" if uses_url else cover
        gal = gallery_expr(vars_, uses_url)
        lines.append("  {")
        lines.append(f'    id: "{pid}",')
        lines.append(f'    title: "{title}",')
        lines.append(f'    discipline: "{discipline}",')
        lines.append(f'    category: "{category}",')
        lines.append(f'    year: "{year}",')
        lines.append(f"    description:{chr(10) if len(description) > 80 else ' '}{json.dumps(description) if len(description) > 80 else json.dumps(description)},")
        # fix description formatting
        lines[-1] = f"    description: {json.dumps(description)},"
        lines.append(f"    image: {cover_expr},")
        lines.append(f'    aspect: "{aspect}",')
        lines.append("    gallery: [")
        lines.append(f"      {gal},")
        lines.append("    ],")
        lines.append("  },")

    project_block(
        "gastronomie",
        "Gastronomie",
        "photography",
        "Food Photography",
        "2024",
        "A fine-dining editorial exploring texture, shadow, and the ritual of the plate.",
        "gastronomie",
    )
    project_block(
        "cuisine",
        "Cuisine",
        "photography",
        "Food Photography",
        "2024",
        "A culinary series of plated moments — steam, glaze, and the quiet geometry of the table.",
        "cuisine",
    )
    project_block(
        "tasting",
        "Tasting",
        "photography",
        "Food Photography",
        "2024",
        "A tasting-menu story of color, glaze, and close-cropped appetite.",
        "tasting",
    )
    project_block(
        "atlasi",
        "Atlasi",
        "photography",
        "Fashion Photography",
        "2024",
        "A studio fashion story built around hand-woven textiles, sculptural silhouettes, and quiet gesture.",
        "atlasi",
    )
    project_block(
        "sepidar",
        "Sepidar",
        "photography",
        "Fashion Photography",
        "2024",
        "A fashion story weaving heritage textiles, tailored silhouettes, and quiet portraiture.",
        "sepidar",
    )
    project_block(
        "zeeen",
        "Zeeen",
        "photography",
        "Fashion Photography",
        "2024",
        "A fashion story rooted in place — handwoven color, heritage textiles, and the architecture of Persian light.",
        "zeeen",
    )
    project_block(
        "atelier",
        "Atelier",
        "photography",
        "Fashion Photography",
        "2024",
        "A compact fashion study — silhouette, fabric, and restrained studio light.",
        "atelier",
    )
    project_block(
        "calligraphy",
        "Calligraphy",
        "photography",
        "Portrait Photography",
        "2024",
        "A studio portrait series pairing quiet gesture with Persian calligraphy — script as halo, script as light.",
        "calligraphy",
    )
    project_block(
        "photos",
        "Photos",
        "photography",
        "Portrait Photography",
        "2024",
        "A quiet studio portrait series — warm light, paisley silk, and steady gaze.",
        "photos",
    )
    project_block(
        "gaze",
        "Gaze",
        "photography",
        "Portrait Photography",
        "2024",
        "A single portrait held in soft light — presence without distraction.",
        "gaze",
    )

    # graphic / product design without galleries of series
    lines.append("  {")
    lines.append('    id: "velmore-atelier",')
    lines.append('    title: "Velmore Atelier",')
    lines.append('    discipline: "graphic-design",')
    lines.append('    category: "Visual Identity",')
    lines.append('    year: "2024",')
    lines.append('    description: "A complete visual identity system for a bespoke leather goods house.",')
    lines.append("    image: visualIdentityImg,")
    lines.append('    aspect: "landscape",')
    lines.append("  },")
    lines.append("  {")
    lines.append('    id: "the-wild-hours",')
    lines.append('    title: "The Wild Hours",')
    lines.append('    discipline: "graphic-design",')
    lines.append('    category: "Book Cover",')
    lines.append('    year: "2023",')
    lines.append('    description: "Cover design and typography for a poetry collection on nature and stillness.",')
    lines.append("    image: bookCoverImg,")
    lines.append('    aspect: "portrait",')
    lines.append("  },")
    lines.append("  {")
    lines.append('    id: "aurelia-h1",')
    lines.append('    title: "Aurelia H1",')
    lines.append('    discipline: "product-design",')
    lines.append('    category: "Product Design",')
    lines.append('    year: "2024",')
    lines.append('    description: "A premium over-ear headphone designed for acoustic warmth and daily ritual.",')
    lines.append("    image: productImg,")
    lines.append('    aspect: "landscape",')
    lines.append("  },")

    project_block(
        "carpet-lover-club",
        "Carpet Lover Club",
        "photography",
        "Product Photography",
        "2024",
        "A product photography series celebrating hand-woven Persian carpets — texture, pattern, and heritage brought to light.",
        "carpet-lover-club",
    )
    project_block(
        "samanwood",
        "Samanwood",
        "photography",
        "Product Photography",
        "2024",
        "A product photography series of hand-crafted wooden chairs — sculpted joinery, warm timber, and quiet studio light.",
        "samanwood",
    )
    project_block(
        "objects",
        "Objects",
        "photography",
        "Product Photography",
        "2024",
        "A product photography series of crafted objects — form, material, and careful studio light.",
        "objects",
    )

    lines.append("];")
    lines.append("")
    lines.append("export function projectsByDiscipline(discipline: Discipline): Project[] {")
    lines.append("  return projects.filter((p) => p.discipline === discipline);")
    lines.append("}")
    lines.append("")

    out = ROOT / "src" / "data" / "projects.ts"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")

    # disciplines.ts
    disc = f'''import type {{ Discipline }} from "./projects";

import foodImg from "../assets/food/gastronomie/food-gastronomie-19.jpg";
import productImg from "../assets/product/objects/product-objects-01.jpg";
import visualIdentityImg from "../assets/graphic/visual-identity/graphic-visual-identity-01.jpg";
import bookCoverImg from "../assets/graphic/book-cover/graphic-book-cover-01.jpg";
import fashionAsset from "../assets/fashion/atlasi/fashion-atlasi-11.jpg";
import portraitAsset from "../assets/portrait/calligraphy/portrait-calligraphy-01.jpg.asset.json";

export interface DisciplineCard {{
  slug: string;
  label: string;
  image?: string;
  disciplines?: Discipline[];
  match: (category: string) => boolean;
  blurb: string;
}}

export const DISCIPLINES: DisciplineCard[] = [
  {{
    slug: "fashion-photography",
    label: "Fashion Photography",
    image: fashionAsset,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("fashion"),
    blurb: "Studio fashion stories — silhouette, texture, and quiet gesture.",
  }},
  {{
    slug: "food-photography",
    label: "Food Photography",
    image: foodImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("food"),
    blurb: "Culinary narratives built from light, shadow, and the ritual of the plate.",
  }},
  {{
    slug: "portrait-photography",
    label: "Portrait Photography",
    image: portraitAsset.url,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("portrait"),
    blurb: "Portraits that hold a person still enough to be seen.",
  }},
  {{
    slug: "product-photography",
    label: "Product Photography",
    image: productImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("product"),
    blurb: "Objects photographed with intent — light, form, material.",
  }},
  {{
    slug: "visual-identity",
    label: "Visual Identity",
    image: visualIdentityImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("visual identity"),
    blurb: "Identity systems that carry a brand's voice across every touchpoint.",
  }},
  {{
    slug: "book-covers",
    label: "Book Covers",
    image: bookCoverImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("book cover"),
    blurb: "Cover design and typography that invites the reader before the first page.",
  }},
  {{
    slug: "posters",
    label: "Posters",
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("poster"),
    blurb: "Bold, graphic statements for spaces, events, and campaigns.",
  }},
  {{
    slug: "videos",
    label: "Videos",
    match: (c) => c.toLowerCase().includes("video"),
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
  }},
];
'''
    (ROOT / "src" / "data" / "disciplines.ts").write_text(disc, encoding="utf-8")
    print("Wrote disciplines.ts")

    # patch index.tsx and about.tsx
    index = ROOT / "src" / "routes" / "index.tsx"
    index_txt = index.read_text(encoding="utf-8")
    index_txt = index_txt.replace(
        'import heroPortrait from "../assets/hero-portrait.jpg";',
        'import heroPortrait from "../assets/brand/hero/brand-hero-01.jpg";',
    )
    index.write_text(index_txt, encoding="utf-8")

    about = ROOT / "src" / "routes" / "about.tsx"
    about_txt = about.read_text(encoding="utf-8")
    about_txt = about_txt.replace(
        'import portraitImg from "../assets/portrait.jpg";',
        'import portraitImg from "../assets/brand/portrait/brand-portrait-01.jpg";',
    )
    about.write_text(about_txt, encoding="utf-8")
    print("Patched index.tsx and about.tsx")

    # note unused hero/portrait vars to silence - they're used in those files


if __name__ == "__main__":
    main()
