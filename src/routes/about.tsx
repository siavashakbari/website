import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Briefcase,
  GraduationCap,
  Images,
  Layers,
  PenTool,
  type LucideIcon,
} from "lucide-react";
import { pageHead } from "@/lib/seo";
import {
  ExpandableGallery,
  type GalleryPhoto,
} from "@/components/ui/expandable-gallery";
import { projects, type Project } from "@/data/projects";
import nozadLogo from "@/assets/graphic-design/nozad-publication/graphic-design-nozad-publication-01.jpg";
import nozadBookCover1 from "@/assets/graphic-design/book-covers/graphic-design-book-covers-01.jpg";
import nozadBookCover2 from "@/assets/graphic-design/book-covers/graphic-design-book-covers-03.jpg";
import zeeeProduct1 from "@/assets/product/objects/product-objects-41.jpg";
import zeeeProduct2 from "@/assets/product/objects/product-objects-44.jpg";
import zeeeProduct3 from "@/assets/product/objects/product-objects-57.jpg";
import carpet1 from "@/assets/product/objects/product-objects-31.jpg";
import carpet2 from "@/assets/product/objects/product-objects-30.jpg";
import carpet3 from "@/assets/product/objects/product-objects-27.jpg";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About — Siavash Akbari",
      description:
        "Meet Siavash Akbari — designer, photographer, and art director from Esfahan. A decade of multidisciplinary work across photography, branding, and creative direction.",
      path: "/about",
      type: "profile",
    }),
  component: AboutPage,
});

type Lang = "en" | "fa";
type Localized = { en: string; fa: string };
type CategoryKey = "Education" | "Job" | "Freelance" | "Project";

type Milestone = {
  year: string;
  category: CategoryKey;
  title: Localized;
  /** Job / role — shown separately from the description */
  role?: Localized;
  /** Date span label */
  period?: Localized;
  /** Duration in years — drives capsule length (ignored if Present) */
  lengthYears: number;
  description: Localized;
  /** Image stack for Job / Project entries (portfolio assets when available) */
  photos?: GalleryPhoto[];
};

type Skill = { name: Localized; levelOutOf10: number };

const CATEGORY: Record<CategoryKey, Localized> = {
  Education: { en: "Education", fa: "تحصیلات" },
  Job: { en: "Job", fa: "شغل" },
  Freelance: { en: "Freelance", fa: "فریلنس" },
  Project: { en: "Project", fa: "پروژه" },
};

type FilterKey = CategoryKey | "All";

const CATEGORY_FILTERS: CategoryKey[] = [
  "Job",
  "Freelance",
  "Education",
  "Project",
];

/** Default on first visit / refresh: every category + All checked */
function createDefaultFilters() {
  return new Set<CategoryKey>(CATEGORY_FILTERS);
}

const FILTER_OPTIONS: { key: FilterKey; label: Localized }[] = [
  { key: "All", label: { en: "All", fa: "همه" } },
  { key: "Job", label: { en: "Jobs", fa: "شغل‌ها" } },
  { key: "Freelance", label: { en: "Freelance", fa: "فریلنس" } },
  { key: "Education", label: { en: "Education", fa: "تحصیلات" } },
  { key: "Project", label: { en: "Projects", fa: "پروژه‌ها" } },
];

/** Universally recognized metaphors for career-timeline categories */
const CATEGORY_ICON: Record<FilterKey, LucideIcon> = {
  All: Layers,
  Job: Briefcase,
  Freelance: PenTool,
  Education: GraduationCap,
  Project: Images,
};

const COPY = {
  journey: { en: "The Journey", fa: "مسیر" },
  heroTitle: { en: "More than A decade of", fa: "بیش از یک دهه" },
  heroAccent: { en: "creating images.", fa: "خلق تصویر." },
  heroBody: {
    en: "From the first photo edit in 2013 to art direction and brand building.",
    fa: "از اولین ادیت عکس در ۲۰۱۳ تا کارگردانی هنری و ساخت.",
  },
  period: { en: "2013 — Present", fa: "۲۰۱۳ — اکنون" },
  capabilities: { en: "Capabilities", fa: "توانمندی‌ها" },
  skills: { en: "Skills", fa: "مهارت‌ها" },
  creative: { en: "Creative", fa: "خلاقانه" },
  software: { en: "Software", fa: "نرم‌افزار" },
  timelineAria: { en: "Career timeline", fa: "خط زمانی مسیر حرفه‌ای" },
  filterAria: { en: "Filter timeline", fa: "فیلتر خط زمانی" },
  skillsAria: { en: "Skills", fa: "مهارت‌ها" },
  langAria: { en: "Switch language", fa: "تغییر زبان" },
};

/** Map duration years → capsule height (px). Only for finite (non-Present) jobs. */
function durationCapsuleHeight(years: number) {
  if (years <= 0) return 0;
  const min = 40;
  const max = 128;
  const t = Math.min(1, Math.max(0, years / 5));
  return Math.round(min + t * (max - min));
}

function isOngoing(milestone: Milestone) {
  const period = milestone.period?.en ?? "";
  return /present/i.test(period);
}

/** Finite-duration jobs get the elongated capsule; Present / point events get a circle. */
function hasDurationCapsule(milestone: Milestone) {
  return !isOngoing(milestone) && milestone.lengthYears > 0;
}

/** Visual-identity brands that should show only the hero/logo mark on the timeline */
const TIMELINE_LOGO_ONLY = new Set([
  "echo-supplements",
  "goats-coffee",
  "zen-studio",
  "femiq",
  "on-swipe",
]);

function projectGalleryPhotos(project: Project): GalleryPhoto[] {
  const srcs = TIMELINE_LOGO_ONLY.has(project.id)
    ? [project.image]
    : (project.gallery?.length ? project.gallery : [project.image]).slice(0, 3);
  return srcs.map((src, i) => ({
    id: `${project.id}-${i + 1}`,
    src,
    alt:
      TIMELINE_LOGO_ONLY.has(project.id)
        ? `${project.title} — logo`
        : `${project.title} — ${i + 1}`,
  }));
}

const NOZAD_JOB_PHOTOS: GalleryPhoto[] = [
  { id: "nozad-job-1", src: nozadLogo, alt: "Nozad Publications — logo" },
  { id: "nozad-job-2", src: nozadBookCover1, alt: "Nozad Publications — book cover" },
  { id: "nozad-job-3", src: nozadBookCover2, alt: "Nozad Publications — book cover" },
];

const CARPET_LOVERS_PHOTOS: GalleryPhoto[] = [
  { id: "carpet-lovers-1", src: carpet1, alt: "Carpet Lovers Club — handwoven carpet campaign" },
  { id: "carpet-lovers-2", src: carpet2, alt: "Carpet Lovers Club — styled carpet still life" },
  { id: "carpet-lovers-3", src: carpet3, alt: "Carpet Lovers Club — kilim rugs on wall" },
];

const ZEEE_PRODUCTS_PHOTOS: GalleryPhoto[] = [
  { id: "zeeeproducts-1", src: zeeeProduct1, alt: "ZEEEProducts — product photography" },
  { id: "zeeeproducts-2", src: zeeeProduct2, alt: "ZEEEProducts — product photography" },
  { id: "zeeeproducts-3", src: zeeeProduct3, alt: "ZEEEProducts — product photography" },
];

/** Named client / brand projects + every visual identity in the portfolio. */
function isTimelinePortfolioProject(project: Project) {
  // Nozad already appears on the timeline as a Job entry.
  if (project.id === "nozad-publication") return false;
  if (project.category.toLowerCase().includes("visual identity")) return true;
  return (
    project.id === "atlasi" ||
    project.id === "zeeen" ||
    project.id === "sepidar"
  );
}

const PROJECT_TITLE_FA: Record<string, string> = {
  dodareh: "دوباره",
  "ahura-cctv": "اهورا سی‌سی‌تی‌وی",
  femiq: "فمیک",
  polarity: "پلاریتی آتلیه",
  "echo-supplements": "اکو ساپلمنتس",
  "goats-coffee": "قهوه‌ی بز",
  "nozad-publication": "انتشارات نوزاد",
  "on-swipe": "آن سوایپ",
  "zen-studio": "محصولات استودیو زن",
  atlasi: "اطلسی",
  zeeen: "زین",
  sepidar: "سپیدار",
};

const PROJECT_ROLE_FA: Record<string, string> = {
  "Visual Identity": "هویت بصری",
  "Visual Identity & Catalogue": "هویت بصری و کاتالوگ",
  "Fashion Photography": "عکاسی مد",
  "Product Design": "طراحی محصول",
};

const PROJECT_DESC_FA: Record<string, string> = {
  dodareh:
    "پروژه هویت بصری برای دوباره اکسسوریز — برند اکسسوری با فرم‌های حروفی مجسمه‌گونه و لحنی بازیگوش.",
  "ahura-cctv":
    "پروژه هویت بصری برای اهورا سی‌سی‌تی‌وی — برند سیستم‌های نظارتی با تایپوگرافی زاویه‌دار فارسی و تصویرسازی سینمایی.",
  femiq:
    "پروژه هویت بصری و کاتالوگ محصول برای فمیک — برند صنعتی دوزبانه با تعادل میان فرم مهندسی و سیستم بصری دقیق.",
  polarity:
    "پروژه هویت بصری برای پلاریتی آتلیه — وردمارک هندسی تیز که هم نشان است و هم نگرش.",
  "echo-supplements":
    "پروژه هویت بصری برای اکو ساپلمنتس — برند مکمل حول سیلوئت شیشه، موتیف موج و بسته‌بندی که برند را به فرم محصول می‌برد.",
  "goats-coffee":
    "پروژه هویت بصری برای قهوه‌ی بز — برند قهوه که سیلوئت بز داخل نشان دانه زندگی می‌کند، با بسته‌بندی آرام و برشی به‌یادماندنی.",
  "nozad-publication":
    "پروژه هویت بصری برای انتشارات نوزاد — برند نشر با نشان جوانه و تایپ مدرن فارسی.",
  "on-swipe":
    "پروژه هویت بصری برای آن سوایپ — نرم‌افزار شغل‌یابی با هوش مصنوعی؛ حروف باز و آیکون سوراخ کلید.",
  "zen-studio":
    "پروژه هویت بصری برای محصولات استودیو زن — وردمارک معماری با هندسه شابلونی و صدای صنعتی آرام.",
  atlasi:
    "داستان مد استودیویی حول پارچه‌های دست‌بافت، سیلوئت‌های مجسمه‌گونه و ژست‌های آرام.",
  zeeen:
    "داستان مد ریشه در مکان — پارچه‌های دست‌بافت میراثی و معماری نور پارسی.",
  sepidar:
    "سری مد از حضور و پارچه در فضای باز — نور، منظره و ایستایی آرام.",
};

function portfolioProjectToMilestone(project: Project): Milestone {
  const roleEn = project.category;
  return {
    year: project.year,
    category: "Project",
    title: {
      en: project.title,
      fa: PROJECT_TITLE_FA[project.id] ?? project.title,
    },
    role: {
      en: roleEn,
      fa: PROJECT_ROLE_FA[roleEn] ?? roleEn,
    },
    lengthYears: 0,
    description: {
      en: project.description,
      fa: PROJECT_DESC_FA[project.id] ?? project.description,
    },
    photos: projectGalleryPhotos(project),
  };
}

function sortYear(milestone: Milestone) {
  const match = milestone.year.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

/** Insert portfolio projects after career items of the same (or earlier) year. */
function mergeMilestones(career: Milestone[], portfolio: Milestone[]) {
  const result = [...career];
  const sorted = [...portfolio].sort((a, b) => sortYear(a) - sortYear(b));
  for (const item of sorted) {
    const y = sortYear(item);
    let i = 0;
    while (i < result.length && sortYear(result[i]!) <= y) i += 1;
    result.splice(i, 0, item);
  }
  return result;
}

const CAREER_MILESTONES: Milestone[] = [
  {
    year: "2013",
    category: "Freelance",
    title: { en: "Photo Editor", fa: "ادیتور تصویر" },
    period: { en: "2013 — Present", fa: "۲۰۱۳ — اکنون" },
    lengthYears: 13,
    description: {
      en: "Designing posters for my favorite football club at the age of 13 marked the beginning of my journey into the world of design.",
      fa: "طراحی پوستر برای تیم فوتبال موردعلاقه‌ام در ۱۳ سالگی، آغاز مسیر من در دنیای طراحی بود.",
    },
  },
  {
    year: "2017",
    category: "Freelance",
    title: { en: "Photographer", fa: "عکاس" },
    period: { en: "2017 — Present", fa: "۲۰۱۷ — اکنون" },
    lengthYears: 9,
    description: {
      en: "Specialized in fashion, product, industrial, and portrait photography.",
      fa: "تخصص در عکاسی مد، محصول، صنعتی و پرتره.",
    },
  },
  {
    year: "2019",
    category: "Education",
    title: { en: "High School Diploma", fa: "دیپلم دبیرستان" },
    role: { en: "Mathematics — Ejei High School", fa: "ریاضی — دبیرستان اژه‌ای" },
    lengthYears: 0,
    description: {
      en: "Completed high school at Ejei High School with a mathematics diploma.",
      fa: "اتمام دبیرستان اژه‌ای با دیپلم ریاضی.",
    },
  },
  {
    year: "2019",
    category: "Freelance",
    title: { en: "Graphic Designer", fa: "طراح گرافیک" },
    period: { en: "2019 — Present", fa: "۲۰۱۹ — اکنون" },
    lengthYears: 7,
    description: {
      en: "Working in visual identity, branding, poster design, book covers, and motion graphics.",
      fa: "کار در هویت بصری، برندینگ، پوستر، جلد کتاب و موشن‌گرافیک.",
    },
  },
  {
    year: "2019",
    category: "Education",
    title: { en: "Photography Certificate", fa: "گواهینامه عکاسی" },
    role: {
      en: "Technical and Vocational Training Organization (TVTO), Iran",
      fa: "سازمان آموزش فنی و حرفه‌ای",
    },
    lengthYears: 1,
    description: {
      en: "Completed professional digital photography courses.",
      fa: "گذراندن دوره‌های حرفه‌ای عکاسی دیجیتال.",
    },
  },
  {
    year: "2019–2023",
    category: "Education",
    title: { en: "Bachelor of Architecture", fa: "کارشناسی معماری" },
    period: { en: "2019 — 2023", fa: "۲۰۱۹ — ۲۰۲۳" },
    lengthYears: 4,
    description: {
      en: "Studied architecture while expanding into branding, photography, and three-dimensional design.",
      fa: "تحصیل در زمینه‌ی معماری همراه با گسترش فعالیت در برندینگ، عکاسی و طراحی سه‌بعدی.",
    },
  },
  {
    year: "2020",
    category: "Job",
    title: { en: "Howwin Media", fa: "هاووین مدیا" },
    role: { en: "Intern & Assistant", fa: "کارآموز و دستیار" },
    period: {
      en: "Summer 2020 — Winter 2021",
      fa: "تابستان ۱۴۰۰ — زمستان ۱۴۰۰",
    },
    lengthYears: 1.5,
    description: {
      en: "Worked on commercial productions and gained practical experience in photography and content creation.",
      fa: "همکاری در تولیدات تجاری و کسب تجربه عملی در عکاسی و تولید محتوا.",
    },
  },
  {
    year: "2021",
    category: "Job",
    title: { en: "Carpet Lovers Club", fa: "دوستداران فرش" },
    role: { en: "Visual Content Manager", fa: "مدیر محتوای بصری" },
    period: {
      en: "Winter 2021 — Autumn 2022",
      fa: "زمستان ۱۴۰۰ — پاییز ۱۴۰۱",
    },
    lengthYears: 2,
    description: {
      en: "Led photography and visual content production for marketing campaigns.",
      fa: "هدایت عکاسی و تولید محتوای بصری برای کمپین‌های بازاریابی.",
    },
    photos: CARPET_LOVERS_PHOTOS,
  },
  {
    year: "2022",
    category: "Freelance",
    title: { en: "Video Director & Editor", fa: "کارگردان و تدوین‌گر ویدیو" },
    period: { en: "2022 — Present", fa: "۲۰۲۲ — اکنون" },
    lengthYears: 4,
    description: {
      en: "Expanded into directing, filming, and editing commercial video productions.",
      fa: "گسترش کار به کارگردانی، تصویربرداری و تدوین تولیدات ویدیویی تجاری.",
    },
  },
  {
    year: "2023",
    category: "Job",
    title: { en: "Nozad Publications", fa: "انتشارات نوزاد" },
    role: { en: "Art Director", fa: "کارگردان هنری" },
    period: {
      en: "Spring 2023 — Winter 2025",
      fa: "بهار ۱۴۰۲ — زمستان ۱۴۰۳",
    },
    lengthYears: 2,
    description: {
      en: "Responsible for creative direction, publication design, and visual identity.",
      fa: "مسئول کارگردانی خلاق، طراحی نشر و هویت بصری.",
    },
    photos: NOZAD_JOB_PHOTOS,
  },
  {
    year: "2023",
    category: "Job",
    title: { en: "ZEEEProducts", fa: "محصولات زی" },
    role: {
      en: "Co-Founder & Art Director",
      fa: "هم‌بنیان‌گذار و کارگردان هنری",
    },
    period: {
      en: "Autumn 2023 — Winter 2025",
      fa: "پاییز ۱۴۰۲ — زمستان ۱۴۰۳",
    },
    lengthYears: 1.5,
    description: {
      en: "Co-founded the brand while leading branding, product visuals, and creative direction.",
      fa: "هم‌بنیان‌گذاری برند همراه با هدایت برندینگ، ویژوال محصول و کارگردانی خلاق.",
    },
    photos: ZEEE_PRODUCTS_PHOTOS,
  },
  {
    year: "2025",
    category: "Job",
    title: { en: "AZURA", fa: "آژورا" },
    role: { en: "Visual Content Manager", fa: "مدیر محتوای بصری" },
    period: {
      en: "Spring 2025 — Summer 2026",
      fa: "بهار ۱۴۰۴ — تابستان ۱۴۰۵",
    },
    lengthYears: 1.25,
    description: {
      en: "Responsible for product photography, campaign visuals, social media content, and creative strategy.",
      fa: "مسئول عکاسی محصول، ویژوال کمپین، محتوای شبکه‌های اجتماعی و استراتژی خلاق.",
    },
  },
  {
    year: "2025",
    category: "Job",
    title: { en: "Reverse Studio", fa: "استودیو معماری ریورس" },
    role: { en: "Architecture Studio", fa: "استودیو معماری" },
    period: {
      en: "Summer 2025 — Summer 2026",
      fa: "تابستان ۱۴۰۴ — تابستان ۱۴۰۵",
    },
    lengthYears: 1,
    description: {
      en: "Architecture studio practice spanning design, spatial thinking, and visual presentation.",
      fa: "فعالیت در استودیو معماری با تمرکز بر طراحی، تفکر فضایی و ارائه بصری.",
    },
  },
];

const PORTFOLIO_MILESTONES: Milestone[] = projects
  .filter(isTimelinePortfolioProject)
  .map(portfolioProjectToMilestone);

const MILESTONES: Milestone[] = mergeMilestones(
  CAREER_MILESTONES,
  PORTFOLIO_MILESTONES,
);

const CREATIVE_SKILLS: Skill[] = [
  { name: { en: "Photography", fa: "عکاسی" }, levelOutOf10: 10 },
  { name: { en: "Videography", fa: "فیلم‌برداری" }, levelOutOf10: 8 },
  { name: { en: "Graphic Design", fa: "طراحی گرافیک" }, levelOutOf10: 8 },
  { name: { en: "Art Direction", fa: "کارگردانی هنری" }, levelOutOf10: 7 },
  { name: { en: "Product Design", fa: "طراحی محصول" }, levelOutOf10: 7 },
];

const SOFTWARE_SKILLS: Skill[] = [
  { name: { en: "Photoshop", fa: "فتوشاپ" }, levelOutOf10: 10 },
  { name: { en: "Rhino 3D", fa: "راینو ۳ بعدی" }, levelOutOf10: 9 },
  { name: { en: "After Effects", fa: "افتر افکت" }, levelOutOf10: 8 },
  { name: { en: "DaVinci Resolve", fa: "داوینچی ریزالو" }, levelOutOf10: 8 },
  { name: { en: "Illustrator", fa: "ایلاستریتور" }, levelOutOf10: 8 },
  { name: { en: "Cinema 4D + Octane", fa: "سینما ۴دی + اکتن" }, levelOutOf10: 7 },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

function t(copy: Localized, lang: Lang) {
  return copy[lang];
}

/** Convert 0–10 score to 0–5 for the circle meter. */
function toFiveScale(levelOutOf10: number) {
  return Math.min(5, Math.max(0, levelOutOf10 / 2));
}

function AboutPage() {
  const reduceMotion = useReducedMotion();
  const [lang, setLang] = useState<Lang>("en");
  const [filters, setFilters] = useState<Set<CategoryKey>>(createDefaultFilters);
  const isFa = lang === "fa";

  return (
    <div
      className="w-full overflow-x-hidden bg-background text-foreground"
      lang={lang}
      dir={isFa ? "rtl" : "ltr"}
    >
      <Hero
        reduceMotion={!!reduceMotion}
        lang={lang}
        onToggleLang={() => setLang(isFa ? "en" : "fa")}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <Timeline reduceMotion={!!reduceMotion} lang={lang} filters={filters} />
      <SkillsSection reduceMotion={!!reduceMotion} lang={lang} />
    </div>
  );
}

function Hero({
  reduceMotion,
  lang,
  onToggleLang,
  filters,
  onFiltersChange,
}: {
  reduceMotion: boolean;
  lang: Lang;
  onToggleLang: () => void;
  filters: Set<CategoryKey>;
  onFiltersChange: (filters: Set<CategoryKey>) => void;
}) {
  const isFa = lang === "fa";

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
      <motion.p
        key={`eyebrow-${lang}`}
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className={`text-xs font-medium text-foreground/50 ${
          isFa
            ? "font-farsi tracking-normal"
            : "uppercase tracking-[0.32em]"
        }`}
      >
        {t(COPY.journey, lang)}
      </motion.p>

      <div className="mt-8 flex items-center justify-between gap-6 md:gap-10">
        <motion.h1
          key={`title-${lang}`}
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: easeOut }}
          className={`min-w-0 flex-1 font-bold leading-[0.95] tracking-tight ${
            isFa
              ? "font-farsi text-[clamp(2.4rem,8vw,5.5rem)]"
              : "font-display text-[clamp(2.75rem,9vw,7.5rem)]"
          }`}
        >
          {t(COPY.heroTitle, lang)}
          <br />
          <span className="text-secondary">{t(COPY.heroAccent, lang)}</span>
        </motion.h1>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
          className="shrink-0"
        >
          <LanguageSwitch
            lang={lang}
            onToggle={onToggleLang}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </div>

      <motion.p
        key={`body-${lang}`}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.22, ease: easeOut }}
        className={`mt-10 max-w-lg text-base leading-relaxed text-foreground/60 md:text-lg ${
          isFa ? "font-farsi" : ""
        }`}
      >
        {t(COPY.heroBody, lang)}
      </motion.p>

      <motion.div
        key={`period-${lang}`}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className={`mt-20 flex items-center gap-4 text-[0.65rem] text-foreground/35 ${
          isFa
            ? "font-farsi tracking-normal"
            : "uppercase tracking-[0.28em]"
        }`}
      >
        <span className="h-px w-12 bg-foreground/30" />
        {t(COPY.period, lang)}
      </motion.div>

      <TimelineFilters
        lang={lang}
        filters={filters}
        onFiltersChange={onFiltersChange}
        reduceMotion={reduceMotion}
      />
    </section>
  );
}

function TimelineFilters({
  lang,
  filters,
  onFiltersChange,
  reduceMotion,
}: {
  lang: Lang;
  filters: Set<CategoryKey>;
  onFiltersChange: (filters: Set<CategoryKey>) => void;
  reduceMotion: boolean;
}) {
  const isFa = lang === "fa";
  const allSelected = CATEGORY_FILTERS.every((key) => filters.has(key));

  const toggle = (key: FilterKey) => {
    if (key === "All") {
      onFiltersChange(createDefaultFilters());
      return;
    }
    const next = new Set(filters);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onFiltersChange(next);
  };

  return (
    <motion.div
      key={`filters-${lang}`}
      role="group"
      aria-label={t(COPY.filterAria, lang)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.65, ease: easeOut }}
      className="mt-10 flex flex-wrap items-center gap-2.5"
      dir={isFa ? "rtl" : "ltr"}
    >
      {FILTER_OPTIONS.map((option) => {
        const active =
          option.key === "All" ? allSelected : filters.has(option.key);
        const Icon = CATEGORY_ICON[option.key];
        return (
          <button
            key={option.key}
            type="button"
            role="checkbox"
            aria-checked={active}
            onClick={() => toggle(option.key)}
            className={`group relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-secondary px-4 shadow-none transition-[border-color,box-shadow,background-color,color] duration-300 ease-out hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_55%,transparent),0_0_18px_color-mix(in_oklab,var(--secondary)_30%,transparent),0_0_28px_color-mix(in_oklab,var(--secondary)_16%,transparent)] ${
              active
                ? "bg-secondary text-secondary-foreground"
                : "bg-transparent text-secondary/80"
            }`}
          >
            <span
              aria-hidden
              className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors duration-300 ${
                active
                  ? "border-secondary-foreground/80 bg-secondary-foreground text-secondary"
                  : "border-secondary/70 text-transparent"
              }`}
            >
              <svg
                viewBox="0 0 12 12"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 6.2 4.8 8.5 9.5 3.5" />
              </svg>
            </span>
            <Icon
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 opacity-90"
              strokeWidth={1.75}
            />
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                isFa
                  ? "font-farsi tracking-normal"
                  : "uppercase tracking-[0.14em]"
              }`}
            >
              {t(option.label, lang)}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}

function LanguageSwitch({
  lang,
  onToggle,
  reduceMotion,
}: {
  lang: Lang;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const isFa = lang === "fa";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFa}
      aria-label={t(COPY.langAria, lang)}
      onClick={onToggle}
      dir="ltr"
      className="group relative inline-flex h-11 w-[7.25rem] shrink-0 items-center rounded-full border border-secondary bg-transparent p-1 shadow-none transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-[0_0_8px_color-mix(in_oklab,var(--secondary)_55%,transparent),0_0_18px_color-mix(in_oklab,var(--secondary)_30%,transparent),0_0_28px_color-mix(in_oklab,var(--secondary)_16%,transparent)]"
    >
      <motion.span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#EFEFEF] transition-[box-shadow] duration-300 ease-out group-hover:shadow-[0_0_8px_color-mix(in_oklab,#EFEFEF_70%,transparent),0_0_18px_color-mix(in_oklab,#EFEFEF_35%,transparent)]"
        initial={false}
        animate={{ x: isFa ? "100%" : "0%" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 28 }
        }
      />
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
          !isFa ? "text-[#0F0F0F]" : "text-secondary/80"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-[1] flex w-1/2 items-center justify-center font-farsi text-sm font-medium transition-colors duration-300 ${
          isFa ? "text-[#0F0F0F]" : "text-secondary/80"
        }`}
      >
        فا
      </span>
    </button>
  );
}

/** Tip Y in the same space as CSS `top: progress%` on the spine. */
function tipYFromProgress(
  container: HTMLElement,
  progress: number,
): number {
  const box = container.getBoundingClientRect();
  return box.top + progress * box.height;
}

function fillFromTip(
  tipY: number,
  marker: HTMLElement,
  elongated: boolean,
): number {
  const rect = marker.getBoundingClientRect();
  if (!elongated) {
    return tipY >= (rect.top + rect.bottom) / 2 ? 1 : 0;
  }
  if (tipY <= rect.top) return 0;
  if (tipY >= rect.bottom) return 1;
  return (tipY - rect.top) / (rect.bottom - rect.top);
}

function Timeline({
  reduceMotion,
  lang,
  filters,
}: {
  reduceMotion: boolean;
  lang: Lang;
  filters: Set<CategoryKey>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const filterKey = CATEGORY_FILTERS.filter((k) => filters.has(k)).join(",");
  const milestones =
    filters.size === 0
      ? []
      : MILESTONES.filter((m) => filters.has(m.category));
  const isFa = lang === "fa";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.6"],
  });
  // One shared progress for the spine tip AND capsule fills (no second spring on markers)
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    mass: 0.25,
  });
  const tipTop = useTransform(lineProgress, (p) => `${p * 100}%`);
  const tipOpacity = useTransform(
    lineProgress,
    [0, 0.06, 0.94, 1],
    [0, 1, 1, 0],
  );
  const spineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const spine = spineRef.current;
    if (!el || !spine) return;
    let maskRaf = 0;

    const updateSpineMask = () => {
      const box = el.getBoundingClientRect();
      const height = box.height || 1;
      const viewTop = -box.top;
      const viewBottom = window.innerHeight - box.top;
      const visible = Math.max(0, viewBottom - viewTop);
      const fadePx = Math.min(140, window.innerHeight * 0.14, visible * 0.35);
      const pct = (y: number) =>
        `${Math.min(100, Math.max(0, (y / height) * 100)).toFixed(2)}%`;
      const mask = `linear-gradient(to bottom, transparent ${pct(viewTop)}, black ${pct(viewTop + fadePx)}, black ${pct(viewBottom - fadePx)}, transparent ${pct(viewBottom)})`;
      spine.style.maskImage = mask;
      spine.style.webkitMaskImage = mask;
    };

    const onScroll = () => {
      if (maskRaf) return;
      maskRaf = requestAnimationFrame(() => {
        maskRaf = 0;
        updateSpineMask();
      });
    };

    updateSpineMask();
    const raf = requestAnimationFrame(updateSpineMask);
    const ro = new ResizeObserver(updateSpineMask);
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateSpineMask);
    return () => {
      cancelAnimationFrame(raf);
      if (maskRaf) cancelAnimationFrame(maskRaf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSpineMask);
    };
  }, [lang, filterKey, filters]);

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 pb-32 md:px-10"
      aria-label={t(COPY.timelineAria, lang)}
      dir="ltr"
    >
      <div ref={ref} className="relative">
        <div
          ref={spineRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[7px] z-[1] w-10 -translate-x-1/2 md:left-1/2"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-secondary/20" />
          <motion.div
            className="absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2 bg-secondary"
            style={{ scaleY: reduceMotion ? 1 : lineProgress }}
          />
          <motion.div
            className="absolute left-1/2 z-[3] -translate-x-1/2 -translate-y-full"
            style={{
              top: reduceMotion ? "100%" : tipTop,
              opacity: reduceMotion ? 1 : tipOpacity,
            }}
          >
            <span className="absolute bottom-0 left-1/2 h-24 w-[5px] -translate-x-1/2 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--secondary)_55%,transparent),transparent)] blur-[5px]" />
            <span className="absolute bottom-0 left-1/2 h-16 w-[2px] -translate-x-1/2 bg-[linear-gradient(to_top,var(--secondary),transparent)] blur-[1.5px]" />
            <span className="absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 bg-[linear-gradient(to_top,var(--secondary),transparent)]" />
          </motion.div>
        </div>

        <ol className="relative z-[2] flex flex-col gap-24 py-4 md:gap-36">
          {milestones.map((m, i) => (
            <TimelineEntry
              key={`${m.year}-${m.title.en}`}
              milestone={m}
              flip={i % 2 === 1}
              reduceMotion={reduceMotion}
              lineProgress={lineProgress}
              containerRef={ref}
              lang={lang}
              isFa={isFa}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineEntry({
  milestone,
  flip,
  reduceMotion,
  lineProgress,
  containerRef,
  lang,
  isFa,
}: {
  milestone: Milestone;
  flip: boolean;
  reduceMotion: boolean;
  lineProgress: MotionValue<number>;
  containerRef: RefObject<HTMLDivElement | null>;
  lang: Lang;
  isFa: boolean;
}) {
  const slideX = reduceMotion ? 0 : flip ? 28 : -28;
  const useCapsule = hasDurationCapsule(milestone);
  const capsuleH = useCapsule ? durationCapsuleHeight(milestone.lengthYears) : 0;
  const markerRef = useRef<HTMLElement | null>(null);

  // Live tip→marker geometry every spring frame (avoids stale precomputed ranges)
  const fill = useMotionValue(reduceMotion ? 1 : 0);

  useLayoutEffect(() => {
    if (reduceMotion) {
      fill.set(1);
      return;
    }

    const sync = (p: number) => {
      const container = containerRef.current;
      const marker = markerRef.current;
      if (!container || !marker) return;
      fill.set(
        fillFromTip(tipYFromProgress(container, p), marker, useCapsule),
      );
    };

    sync(lineProgress.get());
    return lineProgress.on("change", sync);
  }, [lineProgress, containerRef, fill, reduceMotion, useCapsule]);

  const fillClip = useTransform(
    fill,
    (v) => `inset(0 0 ${(1 - v) * 100}% 0)`,
  );
  const glowOpacity = useTransform(fill, (v) => Math.min(1, v * 4));
  const circleFill = useTransform(
    fill,
    [0, 1],
    ["color-mix(in oklab, var(--background) 100%, transparent)", "var(--secondary)"],
  );
  const circleBorder = useTransform(
    fill,
    [0, 1],
    [
      "color-mix(in oklab, var(--secondary) 45%, transparent)",
      "var(--secondary)",
    ],
  );

  const yearAlign = flip
    ? "md:order-2 md:pl-16 md:justify-start"
    : "md:order-1 md:pr-16 md:justify-end";
  const cardAlign = flip
    ? "md:order-1 md:pr-16 md:text-right"
    : "md:order-2 md:pl-16 md:text-left";

  const showGallery =
    (milestone.category === "Job" || milestone.category === "Project") &&
    !!milestone.photos?.length;
  const CategoryIcon = CATEGORY_ICON[milestone.category];

  return (
    <li
      className="relative"
      style={{ paddingBottom: capsuleH > 48 ? capsuleH - 28 : undefined }}
    >
      {useCapsule ? (
        <span
          ref={markerRef}
          aria-hidden
          className="absolute left-[7px] top-3 z-[4] w-[11px] -translate-x-1/2 md:left-1/2"
          style={{ height: capsuleH }}
        >
          {/* Hollow stadium outline */}
          <span className="absolute inset-0 overflow-hidden rounded-full border border-secondary/45 bg-background/40">
            {/* Fill tracks the spine tip exactly (clip grows top → bottom) */}
            <motion.span
              className="absolute inset-0 rounded-full bg-secondary"
              style={{ clipPath: fillClip }}
            />
          </span>
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              opacity: glowOpacity,
              boxShadow:
                "0 0 10px color-mix(in oklab, var(--secondary) 40%, transparent)",
            }}
          />
        </span>
      ) : (
        <span
          ref={markerRef}
          aria-hidden
          className="absolute left-[7px] top-3 z-[4] h-[9px] w-[9px] -translate-x-1/2 md:left-1/2"
        >
          <motion.span
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/25 blur-[3px]"
            style={{ opacity: glowOpacity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{
              backgroundColor: circleFill,
              borderColor: circleBorder,
            }}
          />
        </span>
      )}

      <div className="grid gap-0 md:grid-cols-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className={`hidden items-center gap-3 md:flex ${yearAlign}`}
        >
          {/* Gallery sits between year and spine */}
          {!flip && showGallery && (
            <ExpandableGallery
              photos={milestone.photos!}
              compact
              expandable={false}
            />
          )}
          <p className="font-display text-[clamp(3.6rem,8.4vw,7.2rem)] font-bold leading-none tracking-tight text-foreground/[0.14]">
            {milestone.year}
          </p>
          {flip && showGallery && (
            <ExpandableGallery
              photos={milestone.photos!}
              compact
              expandable={false}
            />
          )}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: slideX, y: 16 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.65, ease: easeOut }}
          className={`pl-8 md:pl-0 ${cardAlign}`}
          dir={isFa ? "rtl" : "ltr"}
        >
          <div className="mb-3 flex items-center gap-3 md:hidden">
            <p className="font-display text-[2.7rem] font-bold leading-none tracking-tight text-foreground/[0.16]">
              {milestone.year}
            </p>
            {showGallery && (
              <ExpandableGallery
                photos={milestone.photos!}
                compact
                expandable={false}
              />
            )}
          </div>

          <p
            className={`inline-flex items-center gap-2 text-[0.99rem] font-medium text-secondary ${
              isFa
                ? "font-farsi tracking-normal"
                : "uppercase tracking-[0.3em]"
            }`}
          >
            <CategoryIcon
              aria-hidden
              className="h-[1.12rem] w-[1.12rem] shrink-0"
              strokeWidth={1.75}
            />
            {t(CATEGORY[milestone.category], lang)}
          </p>
          <h2
            className={`mt-3 font-extrabold tracking-tight text-foreground ${
              isFa
                ? "font-farsi text-[1.65rem] md:text-[1.98rem]"
                : "font-display text-[1.98rem] md:text-[2.475rem]"
            }`}
          >
            {t(milestone.title, lang)}
          </h2>

          {(milestone.role || milestone.period) && (
            <div
              className={`mt-2 space-y-1 text-[1.05rem] ${
                isFa ? "font-farsi" : ""
              }`}
            >
              {milestone.role && (
                <p className="font-medium text-foreground/75">
                  {t(milestone.role, lang)}
                </p>
              )}
              {milestone.period && (
                <p className="text-foreground/45">{t(milestone.period, lang)}</p>
              )}
            </div>
          )}

          <p
            className={`mt-5 max-w-md border-t border-foreground/10 pt-4 text-[1.14rem] leading-relaxed text-foreground/65 ${
              isFa ? "font-farsi" : ""
            } ${flip ? "md:ml-auto" : ""}`}
          >
            {t(milestone.description, lang)}
          </p>
        </motion.div>
      </div>
    </li>
  );
}

function SkillsSection({
  reduceMotion,
  lang,
}: {
  reduceMotion: boolean;
  lang: Lang;
}) {
  const isFa = lang === "fa";

  return (
    <section
      className="border-t border-foreground/10 px-6 py-28 md:px-10 md:py-40"
      aria-label={t(COPY.skillsAria, lang)}
    >
      <div className="mx-auto w-full max-w-6xl">
        <motion.p
          key={`cap-${lang}`}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className={`text-xs font-medium text-foreground/50 ${
            isFa
              ? "font-farsi tracking-normal"
              : "uppercase tracking-[0.32em]"
          }`}
        >
          {t(COPY.capabilities, lang)}
        </motion.p>
        <motion.h2
          key={`skills-${lang}`}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.65, delay: 0.08, ease: easeOut }}
          className={`mt-6 font-bold tracking-tight ${
            isFa
              ? "font-farsi text-4xl md:text-5xl"
              : "font-display text-4xl md:text-6xl"
          }`}
        >
          {t(COPY.skills, lang)}
        </motion.h2>

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-24">
          <SkillColumn
            heading={t(COPY.creative, lang)}
            skills={CREATIVE_SKILLS}
            reduceMotion={reduceMotion}
            lang={lang}
          />
          <SkillColumn
            heading={t(COPY.software, lang)}
            skills={SOFTWARE_SKILLS}
            reduceMotion={reduceMotion}
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}

function SkillColumn({
  heading,
  skills,
  reduceMotion,
  lang,
}: {
  heading: string;
  skills: Skill[];
  reduceMotion: boolean;
  lang: Lang;
}) {
  const isFa = lang === "fa";

  return (
    <div>
      <p
        className={`text-[0.65rem] font-medium text-foreground/40 ${
          isFa
            ? "font-farsi tracking-normal"
            : "uppercase tracking-[0.3em]"
        }`}
      >
        {heading}
      </p>
      <ul className="mt-8 flex flex-col gap-8">
        {skills.map((skill, i) => {
          const score = toFiveScale(skill.levelOutOf10);
          const fillPct = (score / 5) * 100;
          return (
            <li key={skill.name.en}>
              <p
                className={`font-medium tracking-tight text-foreground md:text-xl ${
                  isFa
                    ? "font-farsi text-base md:text-lg"
                    : "font-display text-lg"
                }`}
              >
                {t(skill.name, lang)}
              </p>
              <div
                className="relative mt-3 h-3 w-full overflow-hidden rounded-full border border-secondary/45 bg-background/40"
                aria-label={`${score} out of 5`}
              >
                <motion.span
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.7,
                    delay: Math.min(i * 0.08, 0.4),
                    ease: easeOut,
                  }}
                  className="absolute inset-y-0 start-0 origin-left rounded-full bg-secondary shadow-[0_0_10px_color-mix(in_oklab,var(--secondary)_40%,transparent)] rtl:origin-right"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
