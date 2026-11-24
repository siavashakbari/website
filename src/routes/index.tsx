import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useState } from "react";
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
  const [frames, setFrames] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (
      !/\p{Decimal_Number}/u.test(value) ||
      !window.matchMedia("(prefers-reduced-motion: no-preference)").matches
    ) {
      setFrames([]);
      return;
    }

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?#%";
    setFrames(
      Array.from({ length: 7 }, () =>
        value.replace(
          /\p{Decimal_Number}/gu,
          () => characters[Math.floor(Math.random() * characters.length)],
        ),
      ),
    );
  }, [value]);

  return (
    <strong
      className="home-hero-stat-number"
      dir="ltr"
      aria-label={value}
      data-animating={frames.length > 0 || undefined}
    >
      <span
        className="home-hero-stat-final"
        aria-hidden="true"
        onAnimationEnd={() => setFrames([])}
      >
        {value}
      </span>
      {frames.map((frame, index) => (
        <span
          key={index}
          className="home-hero-stat-frame"
          style={{ animationDelay: `${(index - 1) * 145}ms` }}
          aria-hidden="true"
        >
          {frame}
        </span>
      ))}
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
        </div>
      </section>

      <section className="w-full" aria-label={disciplineLabel.text}>
        <DisciplinesMarquee />
      </section>
    </div>
  );
}
