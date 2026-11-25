import { uploadToCloudStorage } from "./cloud-storage";
import { processMediaUpload } from "./media-sizing";
import type { StudioBlogItem } from "@/types/admin";

export async function uploadBlogMedia(file: File, onProgress: (message: string) => void) {
  if (!/^(image|video)\//.test(file.type)) throw new Error("Choose an image, GIF, or video.");
  const animated = file.type === "image/gif";
  // The image optimizer uses canvas, which would flatten an animated GIF.
  const sized = animated
    ? undefined
    : await processMediaUpload(file, {
        compressOversizedVideo: true,
        onProgress: (_, message) => onProgress(message),
      });
  try {
    const blob = sized ? (sized.blob ?? (await (await fetch(sized.fullUrl)).blob())) : file;
    const upload = await uploadToCloudStorage(
      blob,
      sized?.rawExt ? `blog${sized.rawExt}` : file.name,
      {
        blog: true,
        onProgress: (percent) => onProgress(`Uploading … ${percent}%`),
      },
    );
    return {
      url: upload.url,
      kind: animated ? ("gif" as const) : sized?.isVideo ? ("video" as const) : ("image" as const),
    };
  } finally {
    if (sized?.fullUrl.startsWith("blob:")) URL.revokeObjectURL(sized.fullUrl);
  }
}

export function blogMediaUrls(post: StudioBlogItem) {
  return [
    post.coverImage,
    ...(post.blocks ?? []).flatMap((block) => (block.kind === "text" ? [] : [block.url])),
  ];
}
