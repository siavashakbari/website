import { useEffect, useState } from "react";
import { DISCIPLINES } from "@/data/disciplines";
import { localizedText, withLocale } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
import { getVaultPages, subscribeToVaultStore } from "@/lib/vault-store";

const ROOTS = [
  { route: "/photography", en: "Photography", fa: "عکاسی" },
  { route: "/graphic-design", en: "Graphic Design", fa: "طراحی گرافیک" },
  { route: "/video", en: "Video", fa: "ویدیو" },
  { route: "/product-design", en: "Product Design", fa: "طراحی محصول" },
] as const;

export function DisciplineCircleMap() {
  const locale = useLocale();
  const [pages, setPages] = useState(getVaultPages);

  useEffect(() => subscribeToVaultStore(() => setPages(getVaultPages())), []);

  return (
    <div
      className="discipline-circle-map"
      aria-label={locale === "fa" ? "حوزه‌های کاری" : "Disciplines"}
    >
      {ROOTS.map((root) => {
        const vaultRoot = pages.find((page) => page.route === root.route);
        if (vaultRoot?.isHidden) return null;
        const label = localizedText(
          vaultRoot?.name || root.en,
          vaultRoot?.nameFa || root.fa,
          locale,
        );
        const vaultChildren = pages.filter(
          (page) => page.parentRoute === root.route && !page.isHidden,
        );
        const children = pages.length
          ? vaultChildren.map((page) => localizedText(page.name, page.nameFa, locale).text)
          : DISCIPLINES.filter(
              (item) => item.disciplineSlug === root.route.slice(1) && item.path !== root.route,
            ).map((item) => localizedText(item.label, item.labelFa, locale).text);

        return (
          <a
            key={root.route}
            href={withLocale(root.route, locale)}
            className="discipline-circle"
            lang={label.lang}
            dir={label.lang === "fa" ? "rtl" : "ltr"}
          >
            <strong>{label.text}</strong>
            {children.length > 0 && (
              <span className="discipline-circle-children">
                {children.map((child) => (
                  <span key={child}>{child}</span>
                ))}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
