import { createFileRoute } from "@tanstack/react-router";
import { BinaryBannerCanvas } from "@/components/BinaryBannerCanvas";
import { DisciplineCircleMap } from "@/components/DisciplineCircleMap";
import { DisciplinesMarquee } from "@/components/DisciplinesMarquee";
import { Logo } from "@/components/Logo";
import { currentLocale } from "@/lib/locale";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT, pageHead } from "@/lib/seo";
import { readSiteContent, siteField } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";

const PORTRAIT_FALLBACK = "/hero-portrait-transparent.webp";

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
          href: readSiteContent()?.landing.imageUrl || PORTRAIT_FALLBACK,
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
  const portraitUrl = readSiteContent()?.landing.imageUrl || PORTRAIT_FALLBACK;
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
        <div className="home-hero" dir="ltr">
          <BinaryBannerCanvas />
          <img
            src={portraitUrl}
            alt={heroAlt.text}
            width={1600}
            height={1986}
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
                    <strong>{number}</strong>
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
