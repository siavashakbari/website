import { contentStorage, isContentReady, queueContentSave } from "./published-store";
import { localizedText, type Locale } from "./locale";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "./seo";

export const SITE_CONTENT_KEY = "siavash_site_content_v1";
export type SitePageId = "landing" | "about" | "contact";
export type Localized = { en: string; fa: string };
export type SiteField = { id: string; section: string; label: string; value: Localized };
export type SiteLink = { id: string; label: Localized; href: string };
export interface SitePageContent {
  fields: SiteField[];
  links: SiteLink[];
  imageUrl?: string;
}
export interface SiteContent {
  version: 1;
  landing: SitePageContent;
  about: SitePageContent;
  contact: SitePageContent;
}

export const SITE_SEED: SiteContent = {
  version: 1,
  landing: {
    fields: [
      {
        id: "heading",
        section: "Hero",
        label: "Accessible heading",
        value: { en: "Siavash Akbari — Photographer, Designer & Creative Director", fa: "" },
      },
      {
        id: "heroAlt",
        section: "Hero",
        label: "Hero image alternative text",
        value: { en: "Siavash Akbari, multidisciplinary designer and photographer", fa: "" },
      },
      {
        id: "role1",
        section: "Hero",
        label: "Role 1",
        value: { en: "Multi-disciplinary Designer", fa: "" },
      },
      { id: "role2", section: "Hero", label: "Role 2", value: { en: "Photographer", fa: "" } },
      { id: "role3", section: "Hero", label: "Role 3", value: { en: "Creative Director", fa: "" } },
      { id: "scrollHint", section: "Hero", label: "Scroll hint", value: { en: "scroll", fa: "" } },
      {
        id: "disciplineLabel",
        section: "Disciplines",
        label: "Section label",
        value: { en: "Disciplines", fa: "" },
      },
      {
        id: "seoTitle",
        section: "SEO",
        label: "Page title",
        value: { en: SITE_TITLE_DEFAULT, fa: "" },
      },
      {
        id: "seoDescription",
        section: "SEO",
        label: "Page description",
        value: { en: SITE_DESCRIPTION, fa: "" },
      },
    ],
    links: [],
  },
  about: {
    fields: [
      {
        id: "journey",
        section: "Introduction",
        label: "Eyebrow",
        value: { en: "The Journey", fa: "مسیر" },
      },
      {
        id: "heroTitle",
        section: "Introduction",
        label: "Heading",
        value: { en: "More than A decade of", fa: "بیش از یک دهه" },
      },
      {
        id: "heroAccent",
        section: "Introduction",
        label: "Heading accent",
        value: { en: "creating images.", fa: "خلق تصویر." },
      },
      {
        id: "heroBody",
        section: "Introduction",
        label: "Introduction",
        value: {
          en: "From the first photo edit in 2013 to art direction and brand building.",
          fa: "از اولین ادیت عکس در ۱۳ سالگی تا خلق هویت برند و کارگردانی هنری؛",
        },
      },
      {
        id: "period",
        section: "Introduction",
        label: "Period",
        value: { en: "2013 — Present", fa: "۲۰۱۳ — اکنون" },
      },
      {
        id: "capabilities",
        section: "Skills",
        label: "Capabilities heading",
        value: { en: "Capabilities", fa: "توانمندی‌ها" },
      },
      {
        id: "skills",
        section: "Skills",
        label: "Skills heading",
        value: { en: "Skills", fa: "مهارت‌ها" },
      },
      {
        id: "creative",
        section: "Skills",
        label: "Creative heading",
        value: { en: "Creative", fa: "خلاقانه" },
      },
      {
        id: "software",
        section: "Skills",
        label: "Software heading",
        value: { en: "Software", fa: "نرم‌افزار" },
      },
      {
        id: "seoTitle",
        section: "SEO",
        label: "Page title",
        value: { en: "About — Siavash Akbari", fa: "" },
      },
      {
        id: "seoDescription",
        section: "SEO",
        label: "Page description",
        value: {
          en: "Meet Siavash Akbari — designer, photographer, and art director from Esfahan. A decade of multidisciplinary work across photography, branding, and creative direction.",
          fa: "",
        },
      },
    ],
    links: [],
  },
  contact: {
    fields: [
      {
        id: "eyebrow",
        section: "Introduction",
        label: "Eyebrow",
        value: { en: "Contact", fa: "ارتباط با من" },
      },
      {
        id: "headline",
        section: "Introduction",
        label: "Headline",
        value: { en: "Let's build something lasting.", fa: "بیایید چیزی ماندگار خلق کنیم." },
      },
      {
        id: "intro",
        section: "Introduction",
        label: "Introduction",
        value: {
          en: "Whether you're looking to create a brand, craft a digital experience, or collaborate on something ambitious, I'd love to hear about your project. Send me the details, and I'll get back to you within two business days.",
          fa: "اگر برای ساخت یک برند، طراحی یک تجربه‌ی دیجیتال یا همکاری روی یک ایده‌ی ارزشمند به دنبال همراه هستید، خوشحال می‌شوم درباره‌ی پروژه‌تان بشنوم. جزئیات را برایم ارسال کنید؛ حداکثر تا دو روز کاری پاسخ خواهم داد.",
        },
      },
      {
        id: "location",
        section: "Contact details",
        label: "Location display",
        value: { en: "Esfahan, Iran", fa: "" },
      },
      {
        id: "formHeading",
        section: "Form",
        label: "Form heading",
        value: { en: "Consultation Booking", fa: "رزرو مشاوره" },
      },
      {
        id: "topic.Photography",
        section: "Form options",
        label: "Photography option",
        value: { en: "Photography", fa: "عکاسی" },
      },
      {
        id: "topic.Graphic Design",
        section: "Form options",
        label: "Graphic Design option",
        value: { en: "Graphic Design", fa: "طراحی گرافیک" },
      },
      {
        id: "topic.Video Creation",
        section: "Form options",
        label: "Video Creation option",
        value: { en: "Video Creation", fa: "تولید ویدیو" },
      },
      {
        id: "topic.Social Media Management",
        section: "Form options",
        label: "Social Media option",
        value: { en: "Social Media", fa: "شبکه‌های اجتماعی" },
      },
      {
        id: "topic.Art Direction",
        section: "Form options",
        label: "Art Direction option",
        value: { en: "Art Direction", fa: "مدیریت هنری" },
      },
      {
        id: "topic.General Consulting",
        section: "Form options",
        label: "General Consulting option",
        value: { en: "General Consulting", fa: "مشاوره عمومی" },
      },
      {
        id: "seoTitle",
        section: "SEO",
        label: "Page title",
        value: { en: "Contact — Siavash Akbari", fa: "" },
      },
      {
        id: "seoDescription",
        section: "SEO",
        label: "Page description",
        value: {
          en: "Commission photography, graphic design, or product design with Siavash Akbari in Esfahan, Iran. Email, phone, Instagram, and Behance.",
          fa: "",
        },
      },
    ],
    links: [
      {
        id: "email",
        label: { en: "Siavakbari@gmail.com", fa: "Siavakbari@gmail.com" },
        href: "mailto:Siavakbari@gmail.com",
      },
      {
        id: "phone",
        label: { en: "+989386087846", fa: "+989386087846" },
        href: "tel:+989386087846",
      },
      {
        id: "map",
        label: { en: "Esfahan, Iran", fa: "" },
        href: "https://www.google.com/maps/search/?api=1&query=Esfahan%2C%20Iran",
      },
      {
        id: "behance",
        label: { en: "Behance", fa: "" },
        href: "https://www.behance.net/siavashakbari",
      },
      {
        id: "instagram",
        label: { en: "Instagram", fa: "" },
        href: "https://www.instagram.com/siavashakbari",
      },
    ],
  },
};

function isLocalized(value: unknown): value is Localized {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as Localized).en === "string" &&
    typeof (value as Localized).fa === "string",
  );
}

export function validateSiteContent(value: unknown): asserts value is SiteContent {
  if (!value || typeof value !== "object" || (value as SiteContent).version !== 1)
    throw new Error("Invalid site content version.");
  for (const pageId of ["landing", "about", "contact"] as const) {
    const page = (value as SiteContent)[pageId];
    if (!page || !Array.isArray(page.fields) || !Array.isArray(page.links))
      throw new Error(`Invalid ${pageId} content.`);
    const ids = new Set<string>();
    for (const field of page.fields) {
      if (
        typeof field.id !== "string" ||
        !field.id ||
        ids.has(field.id) ||
        typeof field.section !== "string" ||
        typeof field.label !== "string" ||
        !isLocalized(field.value)
      )
        throw new Error(`Invalid ${pageId} field.`);
      ids.add(field.id);
    }
    for (const link of page.links) {
      if (
        typeof link.id !== "string" ||
        !isLocalized(link.label) ||
        typeof link.href !== "string" ||
        !/^(?:https:\/\/|mailto:|tel:|\/)/.test(link.href)
      )
        throw new Error(`Invalid ${pageId} link.`);
    }
    if (page.imageUrl !== undefined && typeof page.imageUrl !== "string")
      throw new Error(`Invalid ${pageId} image.`);
  }
}

export function readSiteContent(): SiteContent | null {
  if (!isContentReady()) return null;
  const raw = contentStorage.getItem(SITE_CONTENT_KEY);
  if (!raw) return null; // Older snapshots retain their original hardcoded renderer until explicit migration.
  const value: unknown = JSON.parse(raw);
  validateSiteContent(value);
  return value;
}

export function publishSiteContent(value: SiteContent): void {
  validateSiteContent(value);
  if (!isContentReady()) throw new Error("Load published content before editing.");
  contentStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(value));
  queueContentSave();
}

export function siteField(
  page: SitePageId,
  id: string,
  locale: Locale,
): { text: string; lang: Locale; missing: boolean } {
  const value =
    readSiteContent()?.[page].fields.find((field) => field.id === id)?.value ||
    SITE_SEED[page].fields.find((field) => field.id === id)?.value;
  return localizedText(value?.en, value?.fa, locale);
}

export function siteLocalized(
  page: SitePageId,
  id: string,
  original: Localized,
  locale: Locale,
): { text: string; lang: Locale; missing: boolean } {
  const value =
    readSiteContent()?.[page].fields.find((field) => field.id === id)?.value || original;
  return localizedText(value.en, value.fa, locale);
}
