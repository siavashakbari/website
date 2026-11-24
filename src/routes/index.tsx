import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { BinaryBannerCanvas } from "@/components/BinaryBannerCanvas";
import { DisciplinesMarquee } from "@/components/DisciplinesMarquee";
import { Logo } from "@/components/Logo";
import { currentLocale } from "@/lib/locale";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT, pageHead } from "@/lib/seo";
import { readSiteContent, siteField } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";

const PORTRAIT_FALLBACK = "/hero-portrait-transparent-v2.webp";

function portraitSrc(url?: string) {
  const src = url || PORTRAIT_FALLBACK;
  return src === PORTRAIT_FALLBACK ? `${src}?v=2` : src;
}

export const Route = createFileRoute("/")({
  head: () => {
    const locale = currentLocale();
    const seo = pageHead({
      title: siteField("landing", "seoTitle", locale).text || SITE_TITLE_DEFAULT,
      description: siteField("landing", "seoDescription", locale).text || SITE_DESCRIPTION,
      path: "/",
      hasPersian: !siteField("landing", "heading", "fa").missing,
    });
    return {
      ...seo,
      links: [
        ...seo.links,
        {
          rel: "preload",
          as: "image",
          href: portraitSrc(readSiteContent()?.landing.imageUrl),
          fetchPriority: "high",
        },
      ],
    };
  },
  component: Index,
});

function splitStat(value: string) {
  const match = value.match(/^(\S+)\s+(.+)$/);
  return match ? { number: match[1], label: match[2] } : { number: value, label: "" };
}

function AnimatedStat({ value }: { value: string }) {
  return (
    <strong className="home-hero-stat-number" dir="ltr">
      <span className="sr-only">{value}</span>
      <span className="home-hero-stat-reels" aria-hidden="true">
        {Array.from(value, (character, index) => {
          const digits = ["0123456789", "۰۱۲۳۴۵۶۷۸۹", "٠١٢٣٤٥٦٧٨٩"].find((set) =>
            set.includes(character),
          );
          const frames = digits
            ? Array.from({ length: digits.indexOf(character) + 11 }, (_, step) => digits[step % 10])
            : character === "+" ? ["\u00a0", "+", "\u00a0", "+"] : [character];
          return (
            <span key={index} className="reel-window home-hero-stat-glyph">
              <span
                className="home-hero-stat-strip"
                style={{ "--reel-delay": (index * 55) + "ms" } as CSSProperties}
              >
                {frames.map((frame, step) => <span key={step}>{frame}</span>)}
              </span>
            </span>
          );
        })}
      </span>
    </strong>
  );
}

function Index() {
  const locale = useLocale();
  const portraitUrl = portraitSrc(readSiteContent()?.landing.imageUrl);
  const heroHeading = siteField("landing", "heading", locale);
  const heroAlt = siteField("landing", "heroAlt", locale);
  const roles = (["role1", "role2", "role3"] as const).map((id) =>
    siteField("landing", id, locale),
  );
  const statistics = (["statYears", "statProjects", "statAssets"] as const).map((id) =>
    siteField("landing", id, locale),
  );
  const disciplineLabel = siteField("landing", "disciplineLabel", locale);

  return (
    <div className="flex flex-col overscroll-y-contain">
      <section className="home-hero-outer" aria-labelledby="home-heading">
        <div className="home-hero" dir={locale === "fa" ? "rtl" : "ltr"}>
          <BinaryBannerCanvas />
          <div className="home-hero-copy">
            <div className="home-hero-intro">
              <Logo className="home-hero-logo" />
              <h1 id="home-heading" className="sr-only">
                {heroHeading.text}
              </h1>
              <div
                className="home-hero-roles"
                aria-label={locale === "fa" ? "حوزه‌های فعالیت" : "Creative roles"}
              >
                {roles.map((role, index) => (
                  <p key={index} lang={role.lang} dir={role.lang === "fa" ? "rtl" : "ltr"}>
                    {role.text}
                  </p>
                ))}
              </div>
            </div>

            <div className="home-hero-actions">
              <div className="home-hero-stats">
                {statistics.map((stat, index) => {
                  const { number, label } = splitStat(stat.text);
                  return (
                    <div
                      key={index}
                      className="home-hero-stat"
                      lang={stat.lang}
                      dir={stat.lang === "fa" ? "rtl" : "ltr"}
                    >
                      <AnimatedStat key={number} value={number} />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
              <Link to="/brand-discovery" className="home-hero-cta">
                {locale === "fa"
                  ? "بگذارید به شما در ساخت برندتان کمک کنم"
                  : "Let me help you build your brand"}
              </Link>
            </div>
          </div>
          <img
            src={portraitUrl}
            alt={heroAlt.text}
            width={1000}
            height={1000}
            className="home-hero-portrait"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section className="w-full" aria-label={disciplineLabel.text}>
        <DisciplinesMarquee />
      </section>
    </div>
  );
}
