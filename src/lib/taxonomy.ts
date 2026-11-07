// Taxonomy & Slug Generation Helpers for Siavash Akbari Studio
import {
  DISCIPLINE_CODE_MAP,
  type DisciplineCode,
  type DisciplineSlug,
} from "@/types/portfolio-schema";

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
