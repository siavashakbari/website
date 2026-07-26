import type { Discipline } from "./projects";

import foodImg from "../assets/food/gastronomie/food-gastronomie-19-thumb.webp";
import productImg from "../assets/product/objects/product-objects-92-thumb.webp";
import fashionAsset from "../assets/fashion/atlasi/fashion-atlasi-09-thumb.webp";
import portraitAsset from "../assets/portrait/calligraphy/portrait-calligraphy-02-thumb.webp";
import visualIdentityImg from "../assets/graphic-design/ahura-cctv/graphic-design-ahura-cctv-03.jpg";
import bookCoverImg from "../assets/graphic-design/book-covers/graphic-design-book-covers-12.jpg";
import postersImg from "../assets/graphic-design/posters/graphic-design-posters-06.jpg";
import videosImg from "../assets/food/tasting/food-tasting-07.jpg";

export interface DisciplineCard {
  slug: string;
  label: string;
  image?: string;
  disciplines?: Discipline[];
  match: (category: string) => boolean;
  blurb: string;
  /** When true, /$discipline lists project cards linking to /projects/$id instead of a flat photo gallery. */
  browseByProject?: boolean;
  /** Layout for the photo view. "scroll" = full-height horizontal side-scrolling strip. Default = masonry grid. */
  layout?: "scroll";
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
    browseByProject: true,
  },
  {
    slug: "book-covers",
    label: "Book Covers",
    image: bookCoverImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("book cover"),
    blurb: "Cover design and typography that invites the reader before the first page.",
    layout: "scroll",
  },
  {
    slug: "posters",
    label: "Posters",
    image: postersImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("poster"),
    blurb: "Bold, graphic statements for spaces, events, and campaigns.",
    layout: "scroll",
  },
  {
    slug: "videos",
    label: "Videos",
    image: videosImg,
    match: (c) => c.toLowerCase().includes("video"),
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
  },
];
