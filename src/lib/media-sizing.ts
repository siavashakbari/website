/**
 * Portfolio Media Sizing Guidelines & Processing Engine
 *
 * Guidelines derived from production optimization scripts (scripts/optimize-for-web.mjs & scripts/generate-thumbnails.py):
 *
 * 1. HIGH-RESOLUTION DISPLAY VARIANT:
 *    - Max long edge: 2000px (maintains original aspect ratio, no upscale)
 *    - Format: JPEG / WebP (quality ~80-82%)
 *    - Soft file size cap: ~400 KB
 *
 * 2. FAST PROGRESSIVE THUMBNAIL VARIANT:
 *    - Max bounding box: 450px x 450px (LANCZOS-style smooth downscaling)
 *    - Format: WebP (quality 60-65%)
 *    - File size cap: < 20 KB for instant masonry/grid layout loading
 *
 * 3. VIDEO VARIANT:
 *    - Extracts video thumbnail frame at 0.5s
 *    - Standard web formats: MP4 / WebM
 */

export interface SizedMediaResult {
  fullUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  fullSizeKb: number;
  thumbSizeKb: number;
  isVideo: boolean;
  blob?: Blob;
  rawExt?: string;
  storedInIndexedDb?: boolean;
}

/**
 * Resizes an image on an HTMLCanvasElement with high quality downsampling
 */
function resizeCanvas(
  source: CanvasImageSource,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("Could not acquire 2D canvas context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas;
}

/**
 * Automatically applies portfolio sizing rules to an uploaded File (image or video)
 */
export async function processMediaUpload(file: File): Promise<SizedMediaResult> {
  const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov)$/i) !== null;

  if (isVideo) {
    return processVideoFile(file);
  } else {
    return processImageFile(file);
  }
}

/**
 * Processes an image file into both high-res and 20KB thumbnail versions
 */
async function processImageFile(file: File): Promise<SizedMediaResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // 1. Calculate Full dimensions (Max 2000px long edge)
        const MAX_FULL_EDGE = 2000;
        let fullW = origW;
        let fullH = origH;
        if (origW > MAX_FULL_EDGE || origH > MAX_FULL_EDGE) {
          if (origW >= origH) {
            fullW = MAX_FULL_EDGE;
            fullH = Math.round((origH * MAX_FULL_EDGE) / origW);
          } else {
            fullH = MAX_FULL_EDGE;
            fullW = Math.round((origW * MAX_FULL_EDGE) / origH);
          }
        }

        const fullCanvas = resizeCanvas(img, fullW, fullH);
        const fullUrl = fullCanvas.toDataURL("image/jpeg", 0.82);
        const fullSizeKb = Math.round((fullUrl.length * 3) / 4 / 1024);

        // 2. Calculate Thumbnail dimensions (Max 450px)
        const MAX_THUMB_EDGE = 450;
        let thumbW = origW;
        let thumbH = origH;
        if (origW > MAX_THUMB_EDGE || origH > MAX_THUMB_EDGE) {
          if (origW >= origH) {
            thumbW = MAX_THUMB_EDGE;
            thumbH = Math.round((origH * MAX_THUMB_EDGE) / origW);
          } else {
            thumbH = MAX_THUMB_EDGE;
            thumbW = Math.round((origW * MAX_THUMB_EDGE) / origH);
          }
        }

        const thumbCanvas = resizeCanvas(img, thumbW, thumbH);
        // Try webp first, fallback to jpeg
        let thumbUrl = thumbCanvas.toDataURL("image/webp", 0.65);
        if (!thumbUrl.startsWith("data:image/webp")) {
          thumbUrl = thumbCanvas.toDataURL("image/jpeg", 0.65);
        }
        const thumbSizeKb = Math.round((thumbUrl.length * 3) / 4 / 1024);

        resolve({
          fullUrl,
          thumbUrl,
          width: fullW,
          height: fullH,
          fullSizeKb,
          thumbSizeKb,
          isVideo: false,
          rawExt: ".jpg",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function getVideoExt(file: File): string {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".webm") || file.type === "video/webm") return ".webm";
  if (lower.endsWith(".mov") || file.type === "video/quicktime") return ".mov";
  return ".mp4";
}

/**
 * Extracts a video poster/thumbnail and returns video Blob/DataURL + thumbnail.
 * Videos > 1.5MB avoid localStorage base64 limits by passing the binary Blob for IndexedDB storage.
 */
async function processVideoFile(file: File): Promise<SizedMediaResult> {
  const rawExt = getVideoExt(file);
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    let finished = false;
    let seekTimer: ReturnType<typeof setTimeout> | null = null;

    const finishWithFrame = () => {
      if (finished) return;
      finished = true;
      if (seekTimer) clearTimeout(seekTimer);

      const origW = video.videoWidth || 1920;
      const origH = video.videoHeight || 1080;

      // Create thumbnail from frame when a decodable video frame exists
      let thumbUrl = "";
      let thumbSizeKb = 0;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const MAX_THUMB_EDGE = 450;
          let thumbW = origW;
          let thumbH = origH;
          if (origW >= origH) {
            thumbW = MAX_THUMB_EDGE;
            thumbH = Math.round((origH * MAX_THUMB_EDGE) / origW);
          } else {
            thumbH = MAX_THUMB_EDGE;
            thumbW = Math.round((origW * MAX_THUMB_EDGE) / origH);
          }
          const canvas = resizeCanvas(video, thumbW, thumbH);
          thumbUrl = canvas.toDataURL("image/webp", 0.65);
          if (!thumbUrl.startsWith("data:image/webp")) {
            thumbUrl = canvas.toDataURL("image/jpeg", 0.65);
          }
          thumbSizeKb = Math.round((thumbUrl.length * 3) / 4 / 1024);
        } catch {
          thumbUrl = "";
          thumbSizeKb = 0;
        }
      }

      // Only inline tiny videos (<= 1.5MB) into localStorage; larger videos go into IndexedDB
      if (file.size <= 1.5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          URL.revokeObjectURL(fileUrl);
          resolve({
            fullUrl: e.target?.result as string,
            thumbUrl,
            width: origW,
            height: origH,
            fullSizeKb: Math.round(file.size / 1024),
            thumbSizeKb,
            isVideo: true,
            rawExt,
          });
        };
        reader.onerror = () => {
          resolve({
            fullUrl: fileUrl,
            thumbUrl,
            width: origW,
            height: origH,
            fullSizeKb: Math.round(file.size / 1024),
            thumbSizeKb,
            isVideo: true,
            blob: file,
            rawExt,
            storedInIndexedDb: true,
          });
        };
        reader.readAsDataURL(file);
      } else {
        resolve({
          fullUrl: fileUrl,
          thumbUrl,
          width: origW,
          height: origH,
          fullSizeKb: Math.round(file.size / 1024),
          thumbSizeKb,
          isVideo: true,
          blob: file,
          rawExt,
          storedInIndexedDb: true,
        });
      }
    };

    video.onloadeddata = () => {
      const targetTime =
        video.duration && isFinite(video.duration)
          ? Math.min(0.5, Math.max(0, video.duration * 0.25))
          : 0.1;
      if (targetTime <= 0.02) {
        finishWithFrame();
        return;
      }
      seekTimer = setTimeout(finishWithFrame, 1200);
      try {
        video.currentTime = targetTime;
      } catch {
        finishWithFrame();
      }
    };

    video.onseeked = finishWithFrame;

    video.onerror = () => {
      if (finished) return;
      finished = true;
      if (seekTimer) clearTimeout(seekTimer);
      URL.revokeObjectURL(fileUrl);
      reject(
        new Error(
          "Could not decode this video format in the browser. Use MP4 (H.264) / WebM, or paste a hosted video URL.",
        ),
      );
    };
  });
}
