import { createFileRoute, notFound, redirect, rootRouteId } from "@tanstack/react-router";
import { getPhotoItemBySlugOrCode, getMergedPhotoInventory } from "@/lib/studio-store";
import {
  getPhotoByCode,
  getPhotoBySeoSlug,
  getPhotoByStem,
  type PhotoInventoryItem,
} from "@/data/photo-inventory";
import {
  normalizeDisciplineSlug,
  normalizeSpecialtySlug,
  normalizeProjectSlug,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/$discipline/$photoId")({
  loader: ({ params }) => {
    const rawParam = params.photoId.trim();

    let photo: PhotoInventoryItem | undefined =
      getPhotoItemBySlugOrCode(rawParam, params.discipline) ||
      getPhotoBySeoSlug(rawParam, params.discipline) ||
      getPhotoByCode(rawParam) ||
      getPhotoByStem(rawParam);

    if (!photo) {
      const q = rawParam.toLowerCase();
      photo = getMergedPhotoInventory().find(
        (i) =>
          i.code.toLowerCase() === q ||
          (i.standardCode && i.standardCode.toLowerCase() === q) ||
          i.imgSrc.toLowerCase().includes(q),
      );
    }

    if (photo) {
      const discSlug = normalizeDisciplineSlug(photo.disciplineSlug || photo.discipline || params.discipline);
      const specSlug = normalizeSpecialtySlug(photo.specialtySlug || photo.subdiscipline || "fashion");
      const projSlug = normalizeProjectSlug(photo.projectSlug || photo.project);
      const photoId = photo.code || photo.standardCode || rawParam;

      throw redirect({
        to: "/$discipline/$specialty/$project/$photoId",
        params: {
          discipline: discSlug,
          specialty: specSlug,
          project: projSlug,
          photoId,
        },
      });
    }

    throw notFound({ routeId: rootRouteId });
  },
  component: () => null,
});
