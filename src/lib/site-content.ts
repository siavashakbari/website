import { contentStorage, isContentReady, queueContentSave } from "./published-store";
import { localizedText, type Locale } from "./locale";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "./seo";

export const SITE_CONTENT_KEY = "siavash_site_content_v1";
export type SitePageId = "landing" | "about" | "contact" | "notFound";
export type Localized = { en: string; fa: string };
export type SiteField = { id: string; section: string; label: string; value: Localized };
export type SiteLink = { id: string; label: Localized; href: string };
export interface SitePageContent {
  fields: SiteField[];
  links: SiteLink[];
  imageUrl?: string;
}
export const appearanceSettings = [
  { id: "header-scale", label: "Header height multiplier", value: 0.85, min: 0.65, max: 1.3, step: 0.01 },
  { id: "nav-gap", label: "Menu spacing multiplier", value: 1, min: 0.5, max: 2, step: 0.05 },
  { id: "logo-scale", label: "Desktop logo size multiplier", value: 1, min: 0.7, max: 1.3, step: 0.05 },
  { id: "switch-scale", label: "Desktop language switch size multiplier", value: 1, min: 0.8, max: 1.4, step: 0.05 },
  { id: "pill-height", label: "Menu pill height (px)", value: 33.6, min: 22, max: 44, step: 0.1 },
  { id: "nav-weight", label: "Inactive menu weight", value: 300, min: 300, max: 600, step: 100 },
  { id: "glow", label: "Button glow opacity", value: 0.2, min: 0, max: 0.6, step: 0.01 },
  { id: "intro-scale", label: "Introduction size multiplier", value: 1, min: 0.75, max: 1.3, step: 0.05 },
  { id: "intro-weight", label: "Introduction weight", value: 300, min: 300, max: 700, step: 100 },
  { id: "roles-scale", label: "Services size multiplier", value: 1, min: 0.75, max: 1.3, step: 0.05 },
  { id: "outline", label: "Service outline width (px)", value: 0.5, min: 0.1, max: 2, step: 0.1 },
  { id: "fill", label: "Word interval used for filling (%)", value: 62, min: 10, max: 100, step: 1 },
  { id: "counter-weight", label: "Counter weight", value: 400, min: 300, max: 700, step: 100 },
  { id: "portrait-width", label: "Desktop portrait width (%)", value: 50, min: 30, max: 65, step: 1 },
  { id: "copy-inset", label: "Desktop text inset (%)", value: 8.8, min: 2, max: 15, step: 0.1 },
] as const;

export interface SiteContent {
  landingCopyRevision?: 2;
  appearance?: Partial<Record<(typeof appearanceSettings)[number]["id"], number>>;
  version: 1;
  landing: SitePageContent;
  about: SitePageContent;
  contact: SitePageContent;
  /** Optional for snapshots published before the 404 editor was added. */
  notFound?: SitePageContent;
}

export const SITE_SEED: SiteContent = {
  version: 1,
  landingCopyRevision: 2,
  landing: {
    fields: [
      { id: "nav-home", section: "Shared navigation", label: "Home menu label", value: { en: "Home", fa: "خانه" } },
      { id: "nav-works", section: "Shared navigation", label: "Works menu label", value: { en: "Works", fa: "آثار" } },
      { id: "nav-brief", section: "Shared navigation", label: "Visual Identity Form menu label", value: { en: "Visual Identity Form", fa: "فرم هویت بصری" } },
      { id: "nav-blog", section: "Shared navigation", label: "Blog menu label", value: { en: "Blog", fa: "وبلاگ" } },
      { id: "nav-about", section: "Shared navigation", label: "About menu label", value: { en: "About", fa: "درباره" } },
      { id: "nav-contact", section: "Shared navigation", label: "Contact menu label", value: { en: "Contact", fa: "تماس" } },
      {
        id: "heading",
        section: "Hero",
        label: "Introduction",
        value: {
          en: "Hi, I’m Siavash and I help people with these:",
          fa: "سلام، من سیاوشم و در این زمینه‌ها به شما کمک می‌کنم:",
        },
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
        value: { en: "Photography, Visual Identity Design", fa: "عکاسی، طراحی هویت بصری" },
      },
      {
        id: "role2",
        section: "Hero",
        label: "Role 2",
        value: { en: "Social Media Content Creation", fa: "تولید محتوای شبکه‌های اجتماعی" },
      },
      {
        id: "role3",
        section: "Hero",
        label: "Role 3",
        value: { en: "Art Direction, Poster Design", fa: "کارگردانی هنری، طراحی پوستر" },
      },
      {
        id: "statYears",
        section: "Hero statistics",
        label: "Years of work",
        value: { en: "12+ years of work", fa: "12+ سال تجربه کاری" },
      },
      {
        id: "statProjects",
        section: "Hero statistics",
        label: "Projects done",
        value: { en: "43+ projects done", fa: "43+ پروژه انجام‌شده" },
      },
      {
        id: "statAssets",
        section: "Hero statistics",
        label: "Assets delivered",
        value: { en: "2130+ assets delivered", fa: "2130+ خروجی تحویل‌شده" },
      },
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
    links: [
      { id: "contact", label: { en: "Tell me how I can help you", fa: "بگویید چطور می‌توانم کمک کنم" }, href: "/contact" },
      { id: "brief", label: { en: "Create a brief for your brand", fa: "برای برندتان بریف بسازید" }, href: "/brand-discovery" },
    ],
    imageUrl: "/hero-portrait-transparent-v2.webp",
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
  notFound: {
    fields: [
      {
        id: "message",
        section: "404 page",
        label: "Message below the image",
        value: {
          en: "Nothing is here, wanna check something else?",
          fa: "اینجا چیزی نیست، دوست دارید چیز دیگری را ببینید؟",
        },
      },
    ],
    links: [],
    imageUrl: "/404.gif",
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
  const appearance = (value as SiteContent).appearance;
  if (appearance !== undefined) {
    if (!appearance || typeof appearance !== "object" || Array.isArray(appearance))
      throw new Error("Invalid site appearance.");
    for (const setting of appearanceSettings) {
      const number = appearance[setting.id];
      if (number !== undefined && (!Number.isFinite(number) || number < setting.min || number > setting.max))
        throw new Error("Invalid " + setting.label);
    }
  }
  for (const pageId of ["landing", "about", "contact", "notFound"] as const) {
    const page = (value as SiteContent)[pageId];
    if (pageId === "notFound" && !page) continue;
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
    const linkIds = new Set<string>();
    for (const link of page.links) {
      if (
        typeof link.id !== "string" || !link.id || linkIds.has(link.id) ||
        !isLocalized(link.label) ||
        typeof link.href !== "string" ||
        !/^(?:https:\/\/[^/]|mailto:.|tel:.|\/(?!\/))/.test(link.href) ||
        /[\\\r\n\t]/.test(link.href)
      )
        throw new Error(`Invalid ${pageId} link.`);
      linkIds.add(link.id);
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
  const savedLinks = value.landing.links;
  value.landing.links = [...savedLinks, ...SITE_SEED.landing.links.filter(link => !savedLinks.some(saved => saved.id === link.id))];
  if (value.landingCopyRevision === 2) return value;
  value.landingCopyRevision = 2;
  for (const field of value.landing.fields) {
    const previous = previousLandingCopy.get(field.id);
    if (!previous) continue;
    const current = SITE_SEED.landing.fields.find(({ id }) => id === field.id);
    if (!current) continue;
    if (previous.en.includes(field.value.en)) field.value.en = current.value.en;
    if (previous.fa.includes(field.value.fa)) field.value.fa = current.value.fa;
    if (field.label === "Accessible heading") field.label = current.label;
  }
  return value;
}

// Carry the landing redesign into older published snapshots while preserving edited copy.
const previousLandingCopy = new Map([
  ["heading", {
    en: [
      "Siavash Akbari — Photographer, Designer & Art Director",
      "Siavash Akbari — Photographer, Designer & Creative Director",
    ],
    fa: ["سیاوش اکبری — عکاس، طراح و کارگردان هنری", ""],
  }],
  ["role1", { en: ["Multi-disciplinary Designer"], fa: ["طراح چندحوزه‌ای", ""] }],
  ["role2", { en: ["Photographer"], fa: ["عکاس", ""] }],
  ["role3", { en: ["Art Director", "Creative Director"], fa: ["کارگردان هنری", ""] }],
  ["statProjects", { en: ["50+ projects done"], fa: ["50+ پروژه انجام‌شده"] }],
  ["statAssets", { en: ["2000+ assets delivered"], fa: ["2000+ خروجی تحویل‌شده"] }],
]);

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
    readSiteContent()?.[page]?.fields.find((field) => field.id === id)?.value ||
    SITE_SEED[page]?.fields.find((field) => field.id === id)?.value;
  return localizedText(value?.en, value?.fa, locale);
}

export function siteLocalized(
  page: SitePageId,
  id: string,
  original: Localized,
  locale: Locale,
): { text: string; lang: Locale; missing: boolean } {
  const value =
    readSiteContent()?.[page]?.fields.find((field) => field.id === id)?.value || original;
  return localizedText(value.en, value.fa, locale);
}
