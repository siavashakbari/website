/**
 * Site-wide SEO helpers for Siavash Akbari's portfolio.
 *
 * Set VITE_SITE_URL (e.g. https://siavashakbari.com) so Google, social
 * previews, the sitemap, and canonical URLs all use absolute links.
 */

export const SITE_NAME = "Siavash Akbari";
export const SITE_TITLE_DEFAULT =
  "Siavash Akbari — Photographer, Graphic Designer, Videographer & Content Creator | عکاسی و طراحی گرافیک در اصفهان";
export const SITE_DESCRIPTION =
  "Portfolio of Siavash Akbari — multidisciplinary photographer, graphic designer, videographer, and social media content creator based in Isfahan (Esfahan), Iran. عکاسی تبلیغاتی، صنعتی، فشن، طراحی گرافیک، هویت بصری، ساخت تیزر و تولید محتوای اینستاگرام در اصفهان و ایران.";
export const TWITTER_HANDLE = "@siavashakbari";
export const OG_IMAGE_PATH = "/og.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const SITE_KEYWORDS = [
  // English Disciplines
  "photo",
  "photography",
  "photographer",
  "commercial photography",
  "advertising photography",
  "fashion photography",
  "portrait photography",
  "food photography",
  "product photography",
  "industrial photography",
  "graphic design",
  "graphic designer",
  "graphics",
  "visual identity",
  "brand identity",
  "branding",
  "logo design",
  "poster design",
  "book cover design",
  "videography",
  "videographer",
  "video production",
  "motion design",
  "video editor",
  "content creation",
  "content creator",
  "social media content",
  "social media content creator",
  "instagram content creation",
  "creative director",
  "art direction",
  // Locations (English)
  "Isfahan",
  "Esfahan",
  "Iran",
  "Isfahan photographer",
  "photographer in Isfahan",
  "graphic designer in Isfahan",
  "videographer in Isfahan",
  "content creator in Isfahan",
  "content creator in Iran",
  // Farsi Variations & Locations
  "عکاسی",
  "عکس",
  "عکاس",
  "عکاسی اصفهان",
  "عکاس در اصفهان",
  "عکاس اصفهان",
  "عکاسی تبلیغاتی",
  "عکاسی تبلیغاتی در اصفهان",
  "عکاسی صنعتی",
  "عکاسی صنعتی اصفهان",
  "عکاسی فشن",
  "عکاسی مد",
  "عکاسی پرتره",
  "عکاسی پرتره در اصفهان",
  "عکاسی غذا",
  "عکاسی محصولات",
  "طراحی گرافیک",
  "طراح گرافیک",
  "گرافیک",
  "طراح گرافیک در اصفهان",
  "طراحی گرافیک در اصفهان",
  "طراحی گرافیک اصفهان",
  "هویت بصری",
  "طراحی لوگو",
  "طراحی پوستر",
  "طراحی جلد کتاب",
  "فیلمبرداری",
  "تصویربرداری",
  "فیلمبردار",
  "تصویربردار در اصفهان",
  "ساخت تیزر",
  "ساخت تیزر تبلیغاتی",
  "ساخت ویدیو",
  "ویدیوگرافی",
  "تولید محتوا",
  "تولید محتوا اصفهان",
  "تولید محتوا در اصفهان",
  "تولید محتوای اینستاگرام",
  "تولید محتوای شبکه‌های اجتماعی",
  "تولید محتوا در ایران",
  "مدیریت هنری",
  "کارگردانی هنری",
  "اصفهان",
  "ایران",
  "سیاوش اکبری",
].join(", ");

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
      { name: "keywords", content: SITE_KEYWORDS },
      { name: "geo.region", content: "IR-04" },
      { name: "geo.placename", content: "Isfahan" },
      { name: "geo.position", content: "32.6546;51.6680" },
      { name: "ICBM", content: "32.6546, 51.6680" },
      ...(input.noIndex
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : [{ name: "robots", content: "index, follow, max-image-preview:large" }]),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "fa_IR" },
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

/** Person + WebSite + ProfessionalService schema for the document root. */
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
        alternateName: [
          "سیاوش اکبری",
          "Siavash Akbari Studio",
          "استودیو عکاسی و طراحی گرافیک سیاوش اکبری",
        ],
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${url}/#person` },
        inLanguage: ["en", "fa"],
      },
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: SITE_NAME,
        alternateName: ["سیاوش اکبری", "Siavash Akbari"],
        url,
        jobTitle:
          "Photographer, Graphic Designer, Videographer, Content Creator & Creative Director",
        description: SITE_DESCRIPTION,
        email: "mailto:Siavakbari@gmail.com",
        telephone: "+989386087846",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Isfahan",
          addressRegion: "Isfahan Province",
          addressCountry: "IR",
        },
        sameAs: [
          "https://www.instagram.com/siavashakbari",
          "https://www.behance.net/siavashakbari",
        ],
        knowsAbout: [
          "Photography",
          "Commercial Photography",
          "Advertising Photography",
          "Fashion Photography",
          "Portrait Photography",
          "Food Photography",
          "Product Photography",
          "Industrial Photography",
          "Graphic Design",
          "Brand Identity",
          "Logo Design",
          "Poster Design",
          "Book Cover Design",
          "Videography",
          "Video Production",
          "Motion Design",
          "Content Creation",
          "Social Media Content",
          "Instagram Content Creation",
          "Creative Direction",
          "عکاسی",
          "عکاسی تبلیغاتی",
          "عکاسی صنعتی",
          "عکاسی فشن",
          "عکاسی پرتره",
          "عکاسی غذا",
          "طراحی گرافیک",
          "هویت بصری",
          "طراحی لوگو",
          "فیلمبرداری",
          "ساخت تیزر",
          "تولید محتوا",
          "تولید محتوای اینستاگرام",
          "اصفهان",
          "ایران",
        ],
        image: absoluteUrl(OG_IMAGE_PATH),
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${url}/#studio`,
        name: "Siavash Akbari Studio | استودیو عکاسی و طراحی گرافیک سیاوش اکبری",
        alternateName: [
          "استودیو عکاسی و تبلیغات سیاوش اکبری در اصفهان",
          "Siavash Akbari Creative Studio",
          "عکاسی و گرافیک اصفهان",
        ],
        url,
        logo: absoluteUrl("/favicon.svg"),
        image: absoluteUrl(OG_IMAGE_PATH),
        description:
          "Professional photography, graphic design, videography, and social media content creation studio based in Isfahan, Iran. ارائه خدمات تخصصی عکاسی صنعتی و تبلیغاتی، طراحی گرافیک، هویت بصری، فیلمبرداری، تیزر و تولید محتوای اینستاگرام در اصفهان و سراسر ایران.",
        telephone: "+989386087846",
        email: "mailto:Siavakbari@gmail.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Isfahan",
          addressRegion: "Isfahan Province",
          addressCountry: "IR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 32.6546,
          longitude: 51.668,
        },
        areaServed: [
          { "@type": "City", "name": "Isfahan" },
          { "@type": "City", "name": "Esfahan" },
          { "@type": "City", "name": "اصفهان" },
          { "@type": "Country", "name": "Iran" },
          { "@type": "Country", "name": "ایران" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services / خدمات",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Photography Services / خدمات عکاسی در اصفهان",
                description:
                  "Commercial, fashion, food, portrait, and product photography in Isfahan and across Iran. عکاسی تبلیغاتی، صنعتی، فشن، پرتره و غذا در اصفهان.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Graphic Design & Branding / طراحی گرافیک و هویت بصری در اصفهان",
                description:
                  "Visual identity, branding, logo design, book covers, and poster design. هویت بصری، طراحی لوگو، پوستر و جلد کتاب در اصفهان.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Videography & Teaser Production / فیلمبرداری و ساخت تیزر تبلیغاتی",
                description:
                  "Cinematic video production, commercial teasers, and dynamic motion design. فیلمبرداری، تصویربرداری و ساخت ویدیو و تیزر تبلیغاتی در اصفهان.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Social Media Content Creation / تولید محتوای شبکه‌های اجتماعی و اینستاگرام",
                description:
                  "Comprehensive social media content creation, visual storytelling, and creative strategy. تولید محتوای تخصصی اینستاگرام و شبکه‌های اجتماعی در اصفهان و ایران.",
              },
            },
          ],
        },
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
