import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BinaryBannerCanvas } from "@/components/BinaryBannerCanvas";
import { DisciplineCircleMap } from "@/components/DisciplineCircleMap";
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
  const [progress, setProgress] = useState(1);
  const match = value.match(/[0-9۰-۹٠-٩][0-9۰-۹٠-٩,٬]*/);
  const raw = match?.[0] || "";
  const normalize = (char: string) => {
    const code = char.charCodeAt(0);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return char;
  };
  const target = Number([...raw].map(normalize).join("").replace(/[,٬]/g, ""));

  useEffect(() => {
    if (
      !raw ||
      !Number.isFinite(target) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min((now - start) / 1200, 1);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [raw, target]);

  const format = (fraction: number) => {
    if (!match || !Number.isFinite(target) || fraction >= 1) return value;
    const digits = String(Math.floor(target * fraction));
    const base = /[۰-۹]/.test(raw) ? 0x06f0 : /[٠-٩]/.test(raw) ? 0x0660 : 0x30;
    return value.replace(
      raw,
      [...digits].map((digit) => String.fromCharCode(base + Number(digit))).join(""),
    );
  };
  return (
    <strong className="home-hero-stat-number" dir="ltr" aria-label={value}>
      <span aria-hidden="true">{format(progress)}</span>
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
                    <AnimatedStat value={number} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            <div className="home-hero-map">
              <p lang={disciplineLabel.lang} dir={disciplineLabel.lang === "fa" ? "rtl" : "ltr"}>
                {disciplineLabel.text}
              </p>
              <DisciplineCircleMap />
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
