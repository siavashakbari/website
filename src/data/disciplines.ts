import type { Discipline } from "./projects";

import foodImg from "../assets/food/gastronomie/food-gastronomie-19.jpg";
import productImg from "../assets/product/objects/product-objects-03.jpg";
import visualIdentityImg from "../assets/graphic/visual-identity/graphic-visual-identity-01.jpg";
import bookCoverImg from "../assets/graphic/book-cover/graphic-book-cover-01.jpg";
import fashionAsset from "../assets/fashion/atlasi/fashion-atlasi-09.jpg";
import portraitAsset from "../assets/portrait/calligraphy/portrait-calligraphy-02.jpg";

export interface DisciplineCard {
  slug: string;
  label: string;
  image?: string;
  disciplines?: Discipline[];
  match: (category: string) => boolean;
  blurb: string;
}

export const DISCIPLINES: DisciplineCard[] = [
  {
    slug: "fashion-photography",
    label: "Fashion Photography",
    image: fashionAsset,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("fashion"),
    blurb: "Studio fashion stories — silhouette, texture, and quiet gesture.",
  },
  {
    slug: "food-photography",
    label: "Food Photography",
    image: foodImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("food"),
    blurb: "Culinary narratives built from light, shadow, and the ritual of the plate.",
  },
  {
    slug: "portrait-photography",
    label: "Portrait Photography",
    image: portraitAsset,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("portrait"),
    blurb: "Portraits that hold a person still enough to be seen.",
  },
  {
    slug: "product-photography",
    label: "Product Photography",
    image: productImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("product"),
    blurb: "Objects photographed with intent — light, form, material.",
  },
  {
    slug: "visual-identity",
    label: "Visual Identity",
    image: visualIdentityImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("visual identity"),
    blurb: "Identity systems that carry a brand's voice across every touchpoint.",
  },
  {
    slug: "book-covers",
    label: "Book Covers",
    image: bookCoverImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("book cover"),
    blurb: "Cover design and typography that invites the reader before the first page.",
  },
  {
    slug: "posters",
    label: "Posters",
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("poster"),
    blurb: "Bold, graphic statements for spaces, events, and campaigns.",
  },
  {
    slug: "videos",
    label: "Videos",
    match: (c) => c.toLowerCase().includes("video"),
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
  },
];
