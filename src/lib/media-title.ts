/** Keep generated filenames in sync with taxonomy while preserving every manual title. */
export function resolveMediaTitle(
  item: { title?: string; uniqueCode: string; titleModifiedByUser?: boolean },
  dynamicCode: string,
  extension: string,
): string {
  if (item.titleModifiedByUser) return item.title ?? "";
  const title = item.title || "";
  const generatedPattern = new RegExp(
    `^${item.uniqueCode}-[A-Z0-9-]+(\\.(JPG|JPEG|PNG|WEBP|GIF|MP4|WEBM|MOV))?$`,
    "i",
  );
  return !title || generatedPattern.test(title) ? `${dynamicCode}${extension}` : title;
}
