import { resolveImmediateMediaSrc } from "@/lib/local-media-db";
import type { VaultMediaItem } from "@/lib/vault-store";

const SAMPLE_SIZE = 64;

async function sampleImage(blob: Blob): Promise<Uint8ClampedArray> {
  const image = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Image comparison is unavailable.");
    context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    return context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
  } finally {
    image.close();
  }
}

function sameImage(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 4) {
    difference += Math.abs(a[i] - b[i]);
    difference += Math.abs(a[i + 1] - b[i + 1]);
    difference += Math.abs(a[i + 2] - b[i + 2]);
  }
  return difference / ((a.length / 4) * 3) <= 2;
}

/** Check only the selected project, so reusing an image on another page remains possible. */
export async function findDuplicateImageInProject(
  upload: Blob,
  assignedRoute: string,
  media: VaultMediaItem[],
): Promise<VaultMediaItem | undefined> {
  const uploadedPixels = await sampleImage(upload);
  for (const item of media) {
    if (item.assignedRoute !== assignedRoute || item.isVideo || !item.imgSrc) continue;
    try {
      const url = resolveImmediateMediaSrc(item.imgSrc);
      const response = await fetch(url);
      if (!response.ok) continue;
      const existingPixels = await sampleImage(await response.blob());
      if (sameImage(uploadedPixels, existingPixels)) return item;
    } catch {
      // A remote source may disallow browser reads. Other project images can still be checked.
    }
  }
  return undefined;
}
