// Taxonomy & Slug Generation Helpers for Siavash Akbari Studio
import { DISCIPLINE_CODE_MAP } from "@/types/portfolio-schema";

/**
 * Normalizes any string to a clean kebab-case URL slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "");            // Trim - from end of text
}

// -------------------------------------------------------------
// 4-Letter Structured Hierarchy Coding (PHOT-FASH-SEPI-0001)
// -------------------------------------------------------------

export const DISCIPLINE_4_MAP: Record<string, string> = {
  photography: "PHOT",
  photo: "PHOT",
  "fashion-photography": "PHOT",
  "food-photography": "PHOT",
  "portrait-photography": "PHOT",
  "product-photography": "PHOT",
  "graphic-design": "DSGN",
  "graphic design": "DSGN",
  graphics: "DSGN",
  design: "DSGN",
  video: "VIDO",
  videos: "VIDO",
  motion: "VIDO",
  "product-design": "PROD",
  "product design": "PROD",
};

export const SPECIALTY_4_MAP: Record<string, string> = {
  fashion: "FASH",
  "fashion-photography": "FASH",
  food: "FOOD",
  "food-photography": "FOOD",
  portrait: "PORT",
  "portrait-photography": "PORT",
  product: "PROD",
  "product-photography": "PROD",
  "visual-identity": "VIID",
  "visual identity": "VIID",
  branding: "VIID",
  identity: "VIID",
  "book-covers": "BOOK",
  "book covers": "BOOK",
  books: "BOOK",
  posters: "POST",
  poster: "POST",
  videos: "VIDO",
  video: "VIDO",
  "brand-films": "FILM",
  products: "PROD",
  "product-design": "PROD",
};

export const PROJECT_4_MAP: Record<string, string> = {
  sepidar: "SEPI",
  atlasi: "ATLA",
  zeeen: "ZEEE",
  gastronomie: "GAST",
  cuisine: "CUIS",
  tasting: "GAST",
  calligraphy: "CALL",
  photos: "PHOT",
  gaze: "GAZE",
  objects: "OBJE",
  "shekarchian-sweets": "SHEK",
  shekarchian: "SHEK",
  "shekarchian-honey": "SHEK",
  dobareh: "DOBA",
  dodareh: "DOBA",
  "dobareh-accesories": "DOBA",
  "dobareh-accessories": "DOBA",
  "ahura-cctv": "AHUR",
  femiq: "FEMI",
  polarity: "POLA",
  "polarity-atelier": "POLA",
  "echo-supplements": "ECHO",
  goats: "GOAT",
  "goats-coffee": "GOAT",
  "nozad-publication-visual-identity": "NOZA",
  "nozad-publications": "NOZA",
  "nozad-publication": "NOZA",
  onswipe: "ONSW",
  "on-swipe": "ONSW",
  "zen-studio": "ZENS",
  "zen-studio-products": "ZENS",
  artemis: "ARTE",
  cichon: "CICH",
  "farshid-rahimi": "FARS",
  maanaar: "MAAN",
  mamrezz: "MAMR",
  "snow-snack": "SNOW",
  "zeee-products": "ZEEE",
  awli: "AWLI",
  meatlab: "MEAT",
  "signature-restaurant": "SIGN",
  posters: "POST",
  "echo-prime": "ECHO",
};

/**
 * Standardizes any string to a 4-letter uppercase code.
 */
export function to4LetterCode(text: string, fallback = "GENR"): string {
  if (!text) return fallback;
  const clean = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!clean) return fallback;
  if (clean.length < 4) {
    return (clean + "XXXX").slice(0, 4);
  }
  return clean.slice(0, 4);
}

// Exact-match canonical tables. Custom/user-created slugs are PRESERVED as-is
// (slugify only) so a page a user renames to e.g. "/graphic-design/posters-2"
// no longer snaps back to a built-in route via substring matching.
const KNOWN_DISCIPLINES = new Set([
  "photography",
  "graphic-design",
  "video",
  "product-design",
]);

const DISCIPLINE_ALIASES: Record<string, string> = {
  photo: "photography",
  photos: "photography",
  photography: "photography",
  "fashion-photography": "photography",
  "food-photography": "photography",
  "portrait-photography": "photography",
  "product-photography": "photography",
  graphic: "graphic-design",
  graphics: "graphic-design",
  design: "graphic-design",
  "graphic design": "graphic-design",
  "visual-identity": "graphic-design",
  "visual identity": "graphic-design",
  "book-covers": "graphic-design",
  "book covers": "graphic-design",
  books: "graphic-design",
  book: "graphic-design",
  posters: "graphic-design",
  poster: "graphic-design",
  video: "video",
  videos: "video",
  motion: "video",
  "product-design": "product-design",
  "product design": "product-design",
  products: "product-design",
};

const KNOWN_SPECIALTIES = new Set([
  "fashion-photography",
  "food-photography",
  "portrait-photography",
  "product-photography",
  "visual-identity",
  "book-covers",
  "posters",
  "videos",
  "products",
]);

const SPECIALTY_ALIASES: Record<string, string> = {
  fashion: "fashion-photography",
  "fashion photography": "fashion-photography",
  food: "food-photography",
  "food photography": "food-photography",
  portrait: "portrait-photography",
  "portrait photography": "portrait-photography",
  product: "product-photography",
  "product photography": "product-photography",
  identity: "visual-identity",
  branding: "visual-identity",
  brand: "visual-identity",
  "visual identity": "visual-identity",
  "visual-identity": "visual-identity",
  book: "book-covers",
  books: "book-covers",
  "book covers": "book-covers",
  "book-covers": "book-covers",
  poster: "posters",
  posters: "posters",
  video: "videos",
  videos: "videos",
  products: "products",
  "product-design": "products",
  "product design": "products",
};

const PROJECT_ALIASES: Record<string, string> = {
  tasting: "gastronomie",
  signature: "signature-restaurant",
  "signature-cafe": "signature-restaurant",
  "signature-cafe-restaurant": "signature-restaurant",
  "signature-restaurant": "signature-restaurant",
  dodareh: "dobareh",
  "dobareh-accesories": "dobareh",
  "dobareh-accessories": "dobareh",
  shekarchian: "shekarchian-sweets",
  "shekarchian-honey": "shekarchian-sweets",
  "on-swipe": "onswipe",
  "polarity-atelier": "polarity",
  "nozad-publication": "nozad-publication-visual-identity",
  "nozad-publication-visual-identity": "nozad-publication-visual-identity",
  "nozad-vi": "nozad-publication-visual-identity",
  goats: "goats-coffee",
  "zen-studio-products": "zen-studio",
};

/**
 * Maps any discipline text to its canonical URL slug (e.g. "Photography" -> "photography").
 * Exact matches and known aliases win; anything else is kept as a clean slug so
 * user-created disciplines are never rewritten into a built-in one.
 */
export function normalizeDisciplineSlug(discipline: string): string {
  const q = (discipline || "").toLowerCase().trim();
  if (!q) return "photography";
  const slug = slugify(q);
  if (KNOWN_DISCIPLINES.has(slug)) return slug;
  return DISCIPLINE_ALIASES[slug] ?? DISCIPLINE_ALIASES[q] ?? (slug || "photography");
}

/**
 * Maps any specialty text to its canonical URL slug (e.g. "Fashion Photography" -> "fashion-photography").
 * Exact matches and known aliases win; anything else is kept as a clean slug so
 * user-created specialties (e.g. "posters-2") are never rewritten into built-ins.
 */
export function normalizeSpecialtySlug(specialty: string): string {
  const q = (specialty || "").toLowerCase().trim();
  if (!q) return "general";
  const slug = slugify(q);
  if (KNOWN_SPECIALTIES.has(slug)) return slug;
  return SPECIALTY_ALIASES[slug] ?? SPECIALTY_ALIASES[q] ?? (slug || "general");
}

/**
 * Maps any project name to its canonical URL slug (e.g. "Sepidar" -> "sepidar").
 * Only exact known aliases are rewritten; custom project slugs are preserved.
 */
export function normalizeProjectSlug(project: string): string {
  const base = slugify(project);
  if (!base) return "";
  return PROJECT_ALIASES[base] ?? base;
}

/**
 * Resolves the 4-letter discipline code (e.g. "photography" -> "PHOT").
 */
export function getDiscipline4Code(discipline: string): string {
  const slug = normalizeDisciplineSlug(discipline);
  return DISCIPLINE_4_MAP[slug] || to4LetterCode(discipline, "PHOT");
}

/**
 * Resolves the 4-letter specialty code (e.g. "fashion" -> "FASH").
 */
export function getSpecialty4Code(specialty: string): string {
  const slug = normalizeSpecialtySlug(specialty);
  return SPECIALTY_4_MAP[slug] || to4LetterCode(specialty, "SPEC");
}

/**
 * Resolves the 4-letter project code (e.g. "Sepidar" -> "SEPI").
 */
export function getProject4Code(project: string): string {
  const slug = normalizeProjectSlug(project);
  return PROJECT_4_MAP[slug] || to4LetterCode(project, "PROJ");
}

/**
 * Generates the standardized 4-part photo naming code:
 * [DISC 4 letters]-[SPEC 4 letters]-[PROJ 4 letters]-[NUM 4 digits]
 * e.g., PHOT-FASH-SEPI-0001
 */
export function generate4PartPhotoCode(
  discipline: string,
  specialty: string,
  project: string,
  sequenceNumber: number | string,
): string {
  const discCode = getDiscipline4Code(discipline);
  const specCode = getSpecialty4Code(specialty);
  const projCode = getProject4Code(project);
  const num = String(sequenceNumber).padStart(4, "0");
  return `${discCode}-${specCode}-${projCode}-${num}`;
}

/**
 * Parses a 4-part photo code into its segments.
 */
export function parse4PartPhotoCode(code: string): {
  discCode: string;
  specCode: string;
  projCode: string;
  num: string;
} | null {
  if (!code) return null;
  const parts = code.trim().toUpperCase().split("-");
  if (parts.length === 4) {
    return {
      discCode: parts[0],
      specCode: parts[1],
      projCode: parts[2],
      num: parts[3],
    };
  }
  return null;
}

/**
 * Builds canonical photo URL:
 * /photography/fashion-photography/sepidar/PHOT-FASH-SEPI-0001
 */
export function buildPhotoUrl(
  discipline: string,
  specialty: string,
  project: string,
  photoCode: string,
): string {
  const dSlug = normalizeDisciplineSlug(discipline);
  const sSlug = specialty ? normalizeSpecialtySlug(specialty) : "";
  const pSlug = project ? normalizeProjectSlug(project) : "";
  if (dSlug === "product-design") {
    return pSlug ? `/product-design/${pSlug}/${photoCode}` : `/product-design/${photoCode}`;
  }
  if (dSlug === "video") {
    return pSlug ? `/video/${pSlug}` : `/video`;
  }
  if (dSlug === "graphic-design" && sSlug === "posters" && (!pSlug || pSlug === "posters")) {
    return `/graphic-design/posters/${photoCode}`;
  }
  if (sSlug && pSlug) {
    return `/${dSlug}/${sSlug}/${pSlug}/${photoCode}`;
  }
  if (sSlug) {
    return `/${dSlug}/${sSlug}/${photoCode}`;
  }
  if (pSlug) {
    return `/${dSlug}/${pSlug}/${photoCode}`;
  }
  return `/${dSlug}/${photoCode}`;
}

/**
 * Builds canonical project URL:
 * /photography/fashion-photography/sepidar
 */
export function buildProjectUrl(
  discipline: string,
  specialty: string,
  project: string,
): string {
  const dSlug = normalizeDisciplineSlug(discipline);
  const sSlug = normalizeSpecialtySlug(specialty);
  const pSlug = normalizeProjectSlug(project);
  if (dSlug === "product-design") {
    return `/product-design/${pSlug}`;
  }
  if (dSlug === "video") {
    return `/video/${pSlug}`;
  }
  return `/${dSlug}/${sSlug}/${pSlug}`;
}

/**
 * Builds canonical specialty URL:
 * /Photography/Fashion
 */
export function buildSpecialtyUrl(discipline: string, specialty: string): string {
  const dSlug = normalizeDisciplineSlug(discipline);
  const sSlug = normalizeSpecialtySlug(specialty);
  return `/${dSlug}/${sSlug}`;
}

/**
 * Builds canonical discipline URL:
 * /Photography
 */
export function buildDisciplineUrl(discipline: string): string {
  const dSlug = normalizeDisciplineSlug(discipline);
  return `/${dSlug}`;
}

/**
 * Computes a standardized 3-letter project code from title (e.g., "Atlasi" -> "ATL", "Echo Supplements" -> "ECH").
 */
export function generateProjectCode(projectTitle: string): string {
  if (!projectTitle) return "GEN";
  const cleaned = projectTitle.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length < 3) {
    return (cleaned + "XXX").slice(0, 3);
  }
  return cleaned.slice(0, 3);
}

/**
 * Generates an immutable Asset Code: SA-[DISC]-[PROJ]-[SEQ]
 * e.g., SA-FASH-ATL-01
 */
export function generateAssetCode(
  disciplineSlug: string,
  projectCode: string,
  sequenceNumber: number | string,
): string {
  const discCode = DISCIPLINE_CODE_MAP[disciplineSlug] || "FASH";
  const projCode = (projectCode || "GEN").toUpperCase().slice(0, 3);
  const seqStr = String(sequenceNumber).padStart(2, "0");
  return `SA-${discCode}-${projCode}-${seqStr}`;
}

/**
 * Generates an SEO URL Slug: [project-slug]-[sub-specialty-or-title]-[sequence]
 * e.g., "atlasi-editorial-01"
 */
export function generateSeoSlug(
  projectTitle: string,
  subDiscipline: string,
  sequenceNumber: number | string,
): string {
  const projSlug = slugify(projectTitle || "work");
  const subSlug = slugify(subDiscipline || "showcase");
  const seqStr = String(sequenceNumber).padStart(2, "0");

  // Avoid repetitive words (e.g. if project name already contains subSlug)
  if (projSlug.includes(subSlug)) {
    return `${projSlug}-${seqStr}`;
  }
  return `${projSlug}-${subSlug}-${seqStr}`;
}

/**
 * Generates rich, deterministic alt text:
 * "{Project} — {Sub-Discipline} {Discipline} by Siavash Akbari{if Client: ' for ' + Client}{if Model: ', featuring ' + Model} ({Year}) — {AssetCode}"
 */
export function generateAltText(params: {
  projectTitle: string;
  subDiscipline?: string;
  disciplineLabel: string;
  client?: string;
  model?: string;
  year?: string | number;
  assetCode: string;
}): string {
  const { projectTitle, subDiscipline, disciplineLabel, client, model, year, assetCode } = params;
  const parts: string[] = [];

  const specialty = subDiscipline ? `${subDiscipline} ` : "";
  parts.push(`${projectTitle} — ${specialty}${disciplineLabel} by Siavash Akbari`);

  if (client) {
    parts.push(` for ${client}`);
  }
  if (model) {
    parts.push(`, featuring ${model}`);
  }
  if (year) {
    parts.push(` (${year})`);
  }
  parts.push(` — ${assetCode}`);

  return parts.join("");
}

/**
 * Generates dynamic meta title & description for <head>.
 */
export function generateAssetMetadata(params: {
  projectTitle: string;
  sequenceNumber: number | string;
  subDiscipline?: string;
  disciplineLabel: string;
  year?: string | number;
  assetCode: string;
  client?: string;
  creditsSummary?: string;
}) {
  const {
    projectTitle,
    sequenceNumber,
    subDiscipline,
    disciplineLabel,
    year,
    assetCode,
    client,
    creditsSummary,
  } = params;

  const seqFormatted = String(sequenceNumber).padStart(2, "0");
  const subDisp = subDiscipline ? `${subDiscipline} & ` : "";
  const metaTitle = `${projectTitle} (${seqFormatted}) — ${subDisp}${disciplineLabel} | Siavash Akbari`;

  const clientText = client ? ` for ${client}` : "";
  const creditsText = creditsSummary ? ` Credits: ${creditsSummary}.` : "";
  const metaDescription = `Explore ${projectTitle} (${assetCode}), a ${year || "2025"} ${subDiscipline || ""} ${disciplineLabel} work by multidisciplinary creative director Siavash Akbari${clientText}.${creditsText}`.slice(
    0,
    160,
  );

  const keywords = [
    projectTitle,
    disciplineLabel,
    subDiscipline || "",
    "Siavash Akbari",
    client || "",
  ].filter(Boolean);

  return { metaTitle, metaDescription, keywords };
}
