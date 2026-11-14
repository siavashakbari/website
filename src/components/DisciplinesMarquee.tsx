import { useEffect, useLayoutEffect, useState } from "react";
import { CoverTile } from "@/components/CoverTile";
import { DISCIPLINES } from "@/data/disciplines";
import { getVaultPages, isRouteOrAncestorHidden, subscribeToVaultStore } from "@/lib/vault-store";
import { resolveInventoryImage, resolveKnownAssetStem } from "@/lib/inventory-assets";
import { localizedText } from "@/lib/locale";
import { useLocale } from "@/lib/use-locale";

function coverTileImage(image: string) {
  return resolveKnownAssetStem(image) === "graphic-design-posters-06"
    ? "/graphic-design-posters-06-cover.webp"
    : image;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Category strip: equal tiles across the section, live-synced with Vault Pages.
 */
export function DisciplinesMarquee() {
  const locale = useLocale();
  const computeTiles = () => {
    const pages = getVaultPages();
    const byRoute = new Map(pages.map((p) => [p.route.toLowerCase(), p]));

    const tiles = DISCIPLINES.filter((d) => !isRouteOrAncestorHidden(d.path, pages)).map((d) => {
      const vp = byRoute.get(d.path.toLowerCase());
      return {
        key: d.path || d.slug,
        href: d.path,
        label: localizedText(vp?.name || d.label, vp?.nameFa || d.labelFa, locale).text,
        image: coverTileImage((vp?.coverPhoto ? resolveInventoryImage(vp.coverPhoto) || vp.coverPhoto : "") || d.image || ""),
      };
    });

    // Also include custom root disciplines created directly in Vault Pages
    const existingHrefs = new Set(tiles.map((t) => t.href.toLowerCase()));
    const builtInFolders = new Set(["/graphic-design", "/photography"]);
    pages
      .filter((p) => !p.parentRoute && !p.isHidden && !existingHrefs.has(p.route.toLowerCase()) && !builtInFolders.has(p.route.toLowerCase()))
      .forEach((p) => {
        tiles.push({
          key: p.route,
          href: p.route,
          label: localizedText(p.name, p.nameFa, locale).text,
          image: coverTileImage(p.coverPhoto ? resolveInventoryImage(p.coverPhoto) || p.coverPhoto : ""),
        });
      });

    return tiles;
  };

  const [tiles, setTiles] = useState(computeTiles);

  useIsomorphicLayoutEffect(() => {
    setTiles(computeTiles());
    return subscribeToVaultStore(() => setTiles(computeTiles()));
  }, [locale]);

  return (
    <div className="w-full bg-[#0F0F0F] px-[20px] pt-3 pb-12 md:pb-16">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile, idx) => (
          <CoverTile
            key={tile.key}
            index={idx}
            href={tile.href}
            label={tile.label}
            image={tile.image}
          />
        ))}
      </div>
    </div>
  );
}
