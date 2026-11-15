import type { Locale } from "@/lib/locale";

type SkillGroup = {
  id: string;
  en: string;
  fa: string;
  children: { en: string; fa: string }[];
};

const GROUPS: SkillGroup[] = [
  {
    id: "photography",
    en: "Photography",
    fa: "عکاسی",
    children: [
      { en: "Fashion", fa: "مد" },
      { en: "Product", fa: "محصول" },
      { en: "Industrial", fa: "صنعتی" },
      { en: "Portrait", fa: "پرتره" },
    ],
  },
  {
    id: "graphic-design",
    en: "Graphic Design",
    fa: "طراحی گرافیک",
    children: [
      { en: "Visual Identity", fa: "هویت بصری" },
      { en: "Poster Design", fa: "طراحی پوستر" },
      { en: "Book Covers", fa: "جلد کتاب" },
      { en: "Motion Graphics", fa: "موشن گرافیک" },
    ],
  },
  {
    id: "video-motion",
    en: "Video & Motion",
    fa: "ویدیو و حرکت",
    children: [
      { en: "Directing", fa: "کارگردانی" },
      { en: "Filming", fa: "فیلم‌برداری" },
      { en: "Editing", fa: "تدوین" },
      { en: "Commercial Video", fa: "ویدیوی تبلیغاتی" },
      { en: "2D Animation", fa: "انیمیشن دوبعدی" },
    ],
  },
  {
    id: "art-direction",
    en: "Art Direction",
    fa: "مدیریت هنری",
    children: [
      { en: "Brand Building", fa: "برندسازی" },
      { en: "Campaigns", fa: "کمپین‌ها" },
      { en: "Visual Content", fa: "محتوای بصری" },
    ],
  },
];

export function HorizontalSkillTree({ locale }: { locale: Locale }) {
  return (
    <div
      className="skill-tree"
      lang={locale}
      aria-label={locale === "fa" ? "نقشه مهارت‌ها" : "Skills map"}
    >
      <div className="skill-tree-root">
        {locale === "fa"
          ? "برای برند شما چه کارهایی می‌توانم انجام دهم"
          : "What I can do for your brand"}
      </div>
      <div className="skill-tree-branches">
        {GROUPS.map((group) => (
          <div className="skill-tree-branch" key={group.id}>
            <strong className="skill-tree-discipline">{group[locale]}</strong>
            <div className="skill-tree-children">
              {group.children.map((child) => (
                <span key={child.en}>{child[locale]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
