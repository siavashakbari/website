/**
 * Site-wide SEO helpers for Siavash Akbari's portfolio.
 *
 * Set VITE_SITE_URL (e.g. https://siavashakbari.com) so Google, social
 * previews, the sitemap, and canonical URLs all use absolute links.
 */

export const SITE_NAME = "Siavash Akbari";
export const SITE_TITLE_DEFAULT =
  "Siavash Akbari — Photographer, Designer & Creative Director";
export const SITE_DESCRIPTION =
  "Portfolio of Siavash Akbari — multidisciplinary photographer, graphic designer, and product designer based in Esfahan, Iran. Fashion, food, portrait, and product work.";
export const TWITTER_HANDLE = "@siavashakbari";
export const OG_IMAGE_PATH = "/og.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Live production origin (prefer www). Override with VITE_SITE_URL if needed. */
const FALLBACK_SITE_URL = "https://www.siavashakbari.ir";

/** Production origin without trailing slash. */
export function getSiteUrl(request?: Request): string {
  const fromEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta as ImportMeta & { env?: Record<string, string> }).env
        ?.VITE_SITE_URL) ||
    (typeof process !== "undefined"
      ? process.env.VITE_SITE_URL || process.env.SITE_URL
      : undefined);

  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");

  if (request) {
    try {
      const url = new URL(request.url);
      const host =
        request.headers.get("x-forwarded-host") ||
        request.headers.get("host") ||
        url.host;
      const proto =
        request.headers.get("x-forwarded-proto") ||
        url.protocol.replace(":", "") ||
        "https";
      if (host && !host.includes("localhost") && !host.startsWith("127.")) {
        return `${proto}://${host}`.replace(/\/$/, "");
      }
    } catch {
      /* ignore */
    }
  }

  return FALLBACK_SITE_URL;
}

export function absoluteUrl(path: string, request?: Request): string {
  const base = getSiteUrl(request);
  if (!path || path === "/") return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

/** Meta + link tags for a page (TanStack Router `head` shape). */
export function pageHead(input: PageSeoInput) {
  const title = input.title;
  const description = input.description;
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(input.image ?? OG_IMAGE_PATH);
  const type = input.type ?? "website";

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(input.noIndex
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : [{ name: "robots", content: "index, follow, max-image-preview:large" }]),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:creator", content: TWITTER_HANDLE },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

/** Person + WebSite schema for the document root. */
export function siteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${url}/#person` },
        inLanguage: ["en", "fa"],
      },
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: SITE_NAME,
        url,
        jobTitle: "Photographer, Graphic Designer, Product Designer, Creative Director",
        description: SITE_DESCRIPTION,
        email: "mailto:Siavakbari@gmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Esfahan",
          addressCountry: "IR",
        },
        sameAs: [
          "https://www.instagram.com/siavashakbari",
          "https://www.behance.net/siavashakbari",
        ],
        image: absoluteUrl(OG_IMAGE_PATH),
      },
    ],
  };
}

/** CreativeWork / VisualArtwork for a project detail page. */
export function projectJsonLd(project: {
  id: string;
  title: string;
  description: string;
  image: string;
  year: string;
  category: string;
}) {
  const url = absoluteUrl(`/projects/${project.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: absoluteUrl(project.image),
    url,
    dateCreated: project.year,
    genre: project.category,
    creator: {
      "@type": "Person",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}
