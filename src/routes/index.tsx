import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { BinaryBannerCanvas } from "@/components/BinaryBannerCanvas";
import { DisciplinesMarquee } from "@/components/DisciplinesMarquee";
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

function Index() {
  const locale = useLocale();
  const portraitUrl = portraitSrc(readSiteContent()?.landing.imageUrl);
  const heroHeading = siteField("landing", "heading", locale);
  const heroAlt = siteField("landing", "heroAlt", locale);
  let wordCount = 0;
  const roles = ["role1", "role2", "role3"].map((id) => {
    const role = siteField("landing", id, locale);
    const words = (role.text.match(/\S+/g) ?? []).map((text) => ({ text, index: wordCount++ }));
    return { ...role, id, words };
  });
  const statistics = (["statYears", "statProjects", "statAssets"] as const).map((id) =>
    siteField("landing", id, locale),
  );
  const disciplineLabel = siteField("landing", "disciplineLabel", locale);

  return (
    <div className="flex flex-col overscroll-y-contain">
      <section className="home-hero-scene" aria-labelledby="home-heading">
        <div className="home-hero-outer">
          <div className="home-hero" dir={locale === "fa" ? "rtl" : "ltr"}>
            <BinaryBannerCanvas />
            <div className="home-hero-copy">
              <div className="home-hero-intro">
                <h1 id="home-heading" lang={heroHeading.lang}>
                  {heroHeading.text}
                </h1>
                <div className="home-hero-roles">
                  {roles.map((role) => (
                    <p key={role.id} lang={role.lang} dir={role.lang === "fa" ? "rtl" : "ltr"}>
                      <span className="sr-only">{role.text}</span>
                      <span aria-hidden="true">
                        {role.words.map(({ text, index }, lineIndex) => (
                          <span key={index}>
                            {lineIndex > 0 && " "}
                            <span
                              className="home-hero-word"
                              style={
                                {
                                  "--fill-start": `${(index / wordCount) * 100}%`,
                                  "--fill-end": `${((index + 0.62) / wordCount) * 100}%`,
                                } as CSSProperties
                              }
                            >
                              {text}
                            </span>
                          </span>
                        ))}
                      </span>
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
                        <strong className="home-hero-stat-number" dir="ltr">
                          {number}
                        </strong>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="home-hero-links">
                  <Link to="/contact" className="home-hero-cta">
                    {locale === "fa"
                      ? "بگویید چطور می‌توانم کمک کنم"
                      : "Tell me how I can help you"}
                  </Link>
                  <Link to="/brand-discovery" className="home-hero-cta">
                    {locale === "fa" ? "برای برندتان بریف بسازید" : "Create a brief for your brand"}
                  </Link>
                </div>
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
        </div>
      </section>

      <section className="w-full" aria-label={disciplineLabel.text}>
        <DisciplinesMarquee />
      </section>
    </div>
  );
}
