import { useEffect, useState } from "react";
import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { getPhotoItemBySlugOrCode } from "@/lib/studio-store";
import { buildMediaLiveDetailUrl, getMediaByCode } from "@/lib/vault-store";
import { getPhotoByCode, getPhotoBySeoSlug, getPhotoByStem } from "@/data/photo-inventory";
import {
  looksLikeMediaCode,
  redirectToCanonicalPath,
} from "@/components/DedicatedPhotoView";
import { NotFoundPage } from "@/components/NotFoundPage";
import { useLocale } from "@/lib/use-locale";
import { withLocale } from "@/lib/locale";

export const Route = createFileRoute("/$discipline/$photoId")({
  loader: ({ params }) => {
    const rawParam = params.photoId.trim();

    const vaultMedia = getMediaByCode(rawParam);
    if (vaultMedia) {
      redirectToCanonicalPath(buildMediaLiveDetailUrl(vaultMedia), true);
    }

    const photo =
      getPhotoItemBySlugOrCode(rawParam, params.discipline) ||
      getPhotoBySeoSlug(rawParam, params.discipline) ||
      getPhotoByCode(rawParam) ||
      getPhotoByStem(rawParam);

    if (photo) {
      const vm =
        getMediaByCode(photo.uniqueCode || photo.code) ||
        (photo.standardCode ? getMediaByCode(photo.standardCode) : undefined);
      if (vm) {
        redirectToCanonicalPath(buildMediaLiveDetailUrl(vm), true);
      }
      if (photo.canonicalPath) {
        redirectToCanonicalPath(photo.canonicalPath, true);
      }
    }

    if (typeof window === "undefined" && looksLikeMediaCode(rawParam)) {
      return { rawPhotoCode: rawParam };
    }

    throw notFound({ routeId: rootRouteId });
  },
  component: PendingShortCodeRedirect,
});

function PendingShortCodeRedirect() {
  const locale = useLocale();
  const { rawPhotoCode } = Route.useLoaderData();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const vm = getMediaByCode(rawPhotoCode);
    if (vm && typeof window !== "undefined") {
      window.location.replace(withLocale(buildMediaLiveDetailUrl(vm), locale));
    } else {
      setMissing(true);
    }
  }, [rawPhotoCode, locale]);

  if (!missing) {
    return <div className="min-h-screen bg-background" />;
  }
  return <NotFoundPage />;
}
