import { useEffect, useState } from "react";
import { DISCIPLINES } from "@/data/disciplines";
import { localizedText, withLocale } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";
import { getVaultPages, subscribeToVaultStore } from "@/lib/vault-store";

const ROOTS = [
  { route: "/photography", en: "Photography", fa: "عکاسی", x: 85, y: 83, r: 70 },
  { route: "/graphic-design", en: "Graphic Design", fa: "طراحی گرافیک", x: 215, y: 83, r: 52 },
  { route: "/video", en: "Video", fa: "ویدیو", x: 205, y: 207, r: 42 },
  { route: "/product-design", en: "Product Design", fa: "طراحی محصول", x: 91, y: 218, r: 42 },
] as const;

const CHILD_POSITIONS = [
  [-0.43, 0.34],
  [0, 0.48],
  [0.43, 0.34],
  [-0.22, 0.04],
  [0.22, 0.04],
  [-0.56, -0.04],
  [0.56, -0.04],
] as const;

export function DisciplineCircleMap() {
  const locale = useLocale();
  const [pages, setPages] = useState(getVaultPages);

  useEffect(() => subscribeToVaultStore(() => setPages(getVaultPages())), []);

  return (
    <svg
      viewBox="0 0 300 285"
      role="img"
      aria-label={locale === "fa" ? "نقشه دایره‌ای حوزه‌های کاری" : "Circle map of disciplines"}
      className="h-full w-full overflow-visible"
    >
      {ROOTS.map((root, index) => {
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
          ? vaultChildren.map((page) => ({
              label: localizedText(page.name, page.nameFa, locale).text,
              route: page.route,
            }))
          : DISCIPLINES.filter(
              (item) => item.disciplineSlug === root.route.slice(1) && item.path !== root.route,
            ).map((item) => ({
              label: localizedText(item.label, item.labelFa, locale).text,
              route: item.path,
            }));

        return (
          <a key={root.route} href={withLocale(root.route, locale)}>
            <title>{label.text}</title>
            <circle
              cx={root.x}
              cy={root.y}
              r={root.r}
              fill={index === 0 ? "#f1f1f1" : "#f8f8f8"}
              stroke="#111"
              strokeWidth="1.25"
            />
            <text
              x={root.x}
              y={root.y - root.r * 0.3}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={root.r > 60 ? 13 : root.r > 45 ? 11 : 9}
              fontWeight="700"
              fill="#111"
              lang={label.lang}
            >
              {label.text}
            </text>
            {children.slice(0, CHILD_POSITIONS.length).map((child, childIndex) => {
              const [dx, dy] = CHILD_POSITIONS[childIndex];
              const radius = root.r > 60 ? 11 : root.r > 45 ? 8 : 6;
              return (
                <circle
                  key={child.route}
                  cx={root.x + dx * root.r}
                  cy={root.y + dy * root.r}
                  r={radius}
                  fill={childIndex === 0 ? "#2CE3C0" : "#d1d1d1"}
                  stroke="#111"
                  strokeWidth="0.75"
                >
                  <title>{child.label}</title>
                </circle>
              );
            })}
          </a>
        );
      })}
    </svg>
  );
}
