import type { Discipline } from "./projects";

import foodImg from "../assets/food/gastronomie/food-gastronomie-19-thumb.webp";
import productImg from "../assets/product/objects/product-objects-92-thumb.webp";
import fashionAsset from "../assets/fashion/atlasi/fashion-atlasi-09-thumb.webp";
import portraitAsset from "../assets/portrait/calligraphy/portrait-calligraphy-02-thumb.webp";
import visualIdentityImg from "../assets/graphic-design/shekarchian/graphic-design-shekarchian-01.jpg";
import bookCoverImg from "../assets/graphic-design/book-covers/graphic-design-book-covers-12.jpg";
import postersImg from "../assets/graphic-design/posters/graphic-design-posters-06.jpg";
import { echoPrimeVideos } from "./video-assets";
const videoCover = echoPrimeVideos[0];

export interface DisciplineCard {
  slug: string;
  disciplineSlug: string;
  specialtySlug: string;
  path: string;
  label: string;
  labelFa?: string;
  image?: string;
  disciplines?: Discipline[];
  match: (category: string) => boolean;
  blurb: string;
  blurbFa?: string;
  /** When true, lists project cards linking to project page instead of a flat photo gallery. */
  browseByProject?: boolean;
  /** Layout for the photo view. "scroll" = full-height horizontal side-scrolling strip. Default = masonry grid. */
  layout?: "scroll";
}

export const DISCIPLINES: DisciplineCard[] = [
  {
    slug: "fashion-photography",
    disciplineSlug: "photography",
    specialtySlug: "fashion-photography",
    path: "/photography/fashion-photography",
    label: "Fashion Photography",
    labelFa: "عکاسی مد",
    image: fashionAsset,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("fashion"),
    blurb: "Studio fashion stories — silhouette, texture, and quiet gesture.",
    blurbFa: "روایت‌های مد در استودیو؛ فرم، بافت و حرکت‌های ظریف.",
  },
  {
    slug: "food-photography",
    disciplineSlug: "photography",
    specialtySlug: "food-photography",
    path: "/photography/food-photography",
    label: "Food Photography",
    labelFa: "عکاسی غذا",
    image: foodImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("food"),
    blurb: "Culinary narratives built from light, shadow, and the ritual of the plate.",
    blurbFa: "روایت‌های خوراک با نور، سایه و آیین غذا.",
  },
  {
    slug: "portrait-photography",
    disciplineSlug: "photography",
    specialtySlug: "portrait-photography",
    path: "/photography/portrait-photography",
    label: "Portrait Photography",
    labelFa: "عکاسی پرتره",
    image: portraitAsset,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("portrait"),
    blurb: "Portraits that hold a person still enough to be seen.",
    blurbFa: "پرتره‌هایی برای دیدن شخصیت و حضور انسان.",
  },
  {
    slug: "product-photography",
    disciplineSlug: "photography",
    specialtySlug: "product-photography",
    path: "/photography/product-photography",
    label: "Product Photography",
    labelFa: "عکاسی محصول",
    image: productImg,
    disciplines: ["photography"],
    match: (c) => c.toLowerCase().includes("product photo") || (c.toLowerCase().includes("product") && !c.toLowerCase().includes("design")),
    blurb: "Objects photographed with intent — light, form, material.",
    blurbFa: "عکاسی هدفمند از اشیا؛ نور، فرم و ماده.",
  },
  {
    slug: "visual-identity",
    disciplineSlug: "graphic-design",
    specialtySlug: "visual-identity",
    path: "/graphic-design/visual-identity",
    label: "Visual Identity",
    labelFa: "هویت بصری",
    image: visualIdentityImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("visual identity"),
    blurb: "Identity systems that carry a brand's voice across every touchpoint.",
    blurbFa: "سیستم‌های هویت که صدای برند را در هر نقطه منتقل می‌کنند.",
    browseByProject: true,
  },
  {
    slug: "book-covers",
    disciplineSlug: "graphic-design",
    specialtySlug: "book-covers",
    path: "/graphic-design/book-covers",
    label: "Book Covers",
    labelFa: "جلد کتاب",
    image: bookCoverImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("book cover"),
    blurb: "Cover design and typography that invites the reader before the first page.",
    blurbFa: "طراحی جلد و تایپوگرافی که خواننده را پیش از صفحه نخست دعوت می‌کند.",
    layout: "scroll",
  },
  {
    slug: "posters",
    disciplineSlug: "graphic-design",
    specialtySlug: "posters",
    path: "/graphic-design/posters",
    label: "Posters",
    labelFa: "پوسترها",
    image: postersImg,
    disciplines: ["graphic-design"],
    match: (c) => c.toLowerCase().includes("poster"),
    blurb: "Bold, graphic statements for spaces, events, and campaigns.",
    blurbFa: "بیانیه‌های گرافیکی برای فضاها، رویدادها و کمپین‌ها.",
    layout: "scroll",
  },
  {
    slug: "videos",
    disciplineSlug: "video",
    specialtySlug: "videos",
    path: "/video",
    label: "Videos",
    labelFa: "ویدیوها",
    image: videoCover,
    match: (c) => c.toLowerCase().includes("video"),
    blurb: "Moving image work — rhythm, atmosphere, and story in time.",
    blurbFa: "تصاویر متحرک؛ ریتم، فضا و روایت در زمان.",
  },
  {
    slug: "product-design",
    disciplineSlug: "product-design",
    specialtySlug: "products",
    path: "/product-design",
    label: "Product Design",
    labelFa: "طراحی محصول",
    image: productImg,
    disciplines: ["product-design"],
    match: (c) => c.toLowerCase().includes("product design") || c.toLowerCase().includes("object"),
    blurb: "Objects shaped by purpose, material, and quiet detail.",
    blurbFa: "اشیایی شکل‌گرفته از کارکرد، ماده و جزئیات دقیق.",
    browseByProject: true,
  },
];
