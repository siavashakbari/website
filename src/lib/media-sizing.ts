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
  compressedFromKb?: number;
  durationSec?: number;
  isVideo: boolean;
  blob?: Blob;
  rawExt?: string;
  storedInIndexedDb?: boolean;
}

export interface ProcessMediaOptions {
  /** Progress callback `(percent 0..100, statusMessage)` during optimization/compression */
  onProgress?: (percent: number, message: string) => void;
  /** Compress oversized short videos (<= 60s) to studio 1080p / 3.2 Mbps spec in browser */
  compressOversizedVideo?: boolean;
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
export async function processMediaUpload(
  file: File,
  options: ProcessMediaOptions = {}
): Promise<SizedMediaResult> {
  const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov)$/i) !== null;

  if (isVideo) {
    return processVideoFile(file, options);
  } else {
    options.onProgress?.(35, "Optimizing image to studio web size (2000px + 450px WebP thumb)...");
    const res = await processImageFile(file);
    options.onProgress?.(100, "Image ready");
    return res;
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

const STUDIO_VIDEO_TARGET_BITRATE = 3_200_000; // matches scripts/transcode-video.mjs 3200k
const STUDIO_AUDIO_BITRATE = 128_000; // matches scripts/transcode-video.mjs 128k
const STUDIO_MB_PER_30S = 12; // matches scripts/transcode-video.mjs (durationSec / 30) * 12 MB
const MAX_BROWSER_COMPRESS_DURATION_SEC = 60;

/**
 * Computes studio-capped output dimensions (max 1920x1080 landscape or 1080x1920 portrait, no upscale).
 */
function computeStudioVideoDimensions(origW: number, origH: number): { width: number; height: number } {
  const safeW = Math.max(2, origW || 1920);
  const safeH = Math.max(2, origH || 1080);
  const isPortrait = safeH > safeW;
  const maxW = isPortrait ? 1080 : 1920;
  const maxH = isPortrait ? 1920 : 1080;
  const scale = Math.min(1, maxW / safeW, maxH / safeH);
  // Keep even pixel dimensions for hardware/codec compatibility
  const width = Math.max(2, Math.round((safeW * scale) / 2) * 2);
  const height = Math.max(2, Math.round((safeH * scale) / 2) * 2);
  return { width, height };
}

function pickRecorderMimeType(withAudio: boolean): { mimeType: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return null;
  }
  // Prefer VP8 / H.264 first so CPU/software encoders stay real-time without stalling on VP9 1080p
  const candidates: Array<{ mimeType: string; ext: string }> = withAudio
    ? [
        { mimeType: "video/webm;codecs=vp8,opus", ext: ".webm" },
        { mimeType: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", ext: ".mp4" },
        { mimeType: "video/webm;codecs=vp9,opus", ext: ".webm" },
        { mimeType: "video/webm", ext: ".webm" },
        { mimeType: "video/mp4", ext: ".mp4" },
      ]
    : [
        { mimeType: "video/webm;codecs=vp8", ext: ".webm" },
        { mimeType: "video/mp4;codecs=avc1.42E01E", ext: ".mp4" },
        { mimeType: "video/webm;codecs=vp9", ext: ".webm" },
        { mimeType: "video/webm", ext: ".webm" },
        { mimeType: "video/mp4", ext: ".mp4" },
      ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
  }
  return null;
}

/**
 * Compresses oversized short videos in the browser using the studio target spec
 * (max 1080p, 3.2 Mbps video + 128 kbps audio), replacing the huge file when smaller.
 */
async function compressVideoToStudioSpec(
  fileUrl: string,
  origW: number,
  origH: number,
  durationSec: number,
  onProgress?: (percent: number, message: string) => void
): Promise<{ blob: Blob; ext: string; width: number; height: number } | null> {
  const probeCanvas = document.createElement("canvas");
  if (typeof probeCanvas.captureStream !== "function") return null;
  if (!pickRecorderMimeType(false)) return null;

  const { width, height } = computeStudioVideoDimensions(origW, origH);

  return new Promise((resolve) => {
    const recVideo = document.createElement("video");
    recVideo.preload = "auto";
    recVideo.playsInline = true;
    recVideo.crossOrigin = "anonymous";

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }

    let audioCtx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let rafId = 0;
    let settled = false;
    let hardTimeout: ReturnType<typeof setTimeout> | null = null;
    let stallTimer: ReturnType<typeof setInterval> | null = null;
    let lastTime = -1;
    let stalledChecks = 0;
    const chunks: Blob[] = [];

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (hardTimeout) clearTimeout(hardTimeout);
      if (stallTimer) clearInterval(stallTimer);
      try {
        recVideo.onloadeddata = null;
        recVideo.oncanplay = null;
        recVideo.onended = null;
        recVideo.onerror = null;
        recVideo.pause();
        recVideo.removeAttribute("src");
        recVideo.load();
      } catch {
        // ignore
      }
      if (stream) {
        for (const t of stream.getTracks()) {
          try {
            t.stop();
          } catch {
            // ignore
          }
        }
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };

    const finishNull = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(null);
    };

    hardTimeout = setTimeout(() => {
      if (recorder && recorder.state === "recording") {
        try {
          recorder.stop();
          return;
        } catch {
          // ignore
        }
      }
      finishNull();
    }, Math.min(65000, Math.ceil(durationSec * 1000) + 12000));

    let started = false;
    const startCapture = async () => {
      if (settled || started) return;
      started = true;
      try {
        ctx.drawImage(recVideo, 0, 0, width, height);
        const videoStream = canvas.captureStream(30);
        const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
        let hasLiveAudio = false;

        // Only attach audio track if AudioContext genuinely resumes (prevents headless/muted stall)
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            audioCtx = new AudioCtx();
            if (audioCtx.state === "suspended") {
              await Promise.race([
                audioCtx.resume().catch(() => {}),
                new Promise((r) => setTimeout(r, 250)),
              ]);
            }
            if (audioCtx.state === "running") {
              const source = audioCtx.createMediaElementSource(recVideo);
              const dest = audioCtx.createMediaStreamDestination();
              source.connect(dest);
              const audioTracks = dest.stream.getAudioTracks();
              if (audioTracks.length > 0) {
                tracks.push(...audioTracks);
                hasLiveAudio = true;
              }
            }
          }
        } catch {
          hasLiveAudio = false;
        }

        if (!hasLiveAudio) {
          recVideo.muted = true;
        }

        const recorderFormat = pickRecorderMimeType(hasLiveAudio) || pickRecorderMimeType(false);
        if (!recorderFormat) {
          finishNull();
          return;
        }

        stream = new MediaStream(tracks);
        recorder = new MediaRecorder(stream, {
          mimeType: recorderFormat.mimeType,
          videoBitsPerSecond: STUDIO_VIDEO_TARGET_BITRATE,
          ...(hasLiveAudio ? { audioBitsPerSecond: STUDIO_AUDIO_BITRATE } : {}),
        });

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };

        recorder.onstop = () => {
          if (settled) return;
          settled = true;
          cleanup();
          if (chunks.length === 0) {
            resolve(null);
            return;
          }
          const blob = new Blob(chunks, { type: recorderFormat.mimeType });
          resolve(blob.size > 0 ? { blob, ext: recorderFormat.ext, width, height } : null);
        };

        recorder.onerror = finishNull;

        const drawLoop = () => {
          if (settled) return;
          if (recVideo.ended || (durationSec > 0 && recVideo.currentTime >= durationSec - 0.05)) {
            ctx.drawImage(recVideo, 0, 0, width, height);
            if (recorder && recorder.state === "recording") {
              recorder.stop();
            }
            return;
          }
          ctx.drawImage(recVideo, 0, 0, width, height);
          if (durationSec > 0) {
            const pct = Math.min(96, Math.max(8, Math.round((recVideo.currentTime / durationSec) * 90) + 5));
            onProgress?.(
              pct,
              `Compressing video to studio spec (${width}x${height}, 3.2 Mbps)... ${Math.min(100, Math.round((recVideo.currentTime / durationSec) * 100))}%`,
            );
          }
          rafId = requestAnimationFrame(drawLoop);
        };

        recVideo.onended = () => {
          ctx.drawImage(recVideo, 0, 0, width, height);
          if (recorder && recorder.state === "recording") {
            recorder.stop();
          }
        };

        // Abort gracefully to IndexedDB if browser decoder freezes for >3s
        stallTimer = setInterval(() => {
          if (settled || recVideo.ended) return;
          if (recVideo.currentTime > lastTime + 0.01) {
            lastTime = recVideo.currentTime;
            stalledChecks = 0;
          } else {
            stalledChecks += 1;
            if (stalledChecks >= 3) {
              finishNull();
            }
          }
        }, 1200);

        recorder.start(250);
        rafId = requestAnimationFrame(drawLoop);
        recVideo.play().catch(() => {
          recVideo.muted = true;
          recVideo.play().catch(finishNull);
        });
      } catch {
        finishNull();
      }
    };

    recVideo.onerror = finishNull;
    recVideo.onloadeddata = () => {
      void startCapture();
    };
    recVideo.oncanplay = () => {
      void startCapture();
    };
    // Attach handlers BEFORE setting src so cached blob URLs cannot miss events
    recVideo.src = fileUrl;
  });
}

/**
 * Extracts a video poster/thumbnail and compresses oversized short clips to studio spec
 * (1080p max, 3.2 Mbps target bitrate) before returning Blob/DataURL + thumbnail.
 */
async function processVideoFile(
  file: File,
  options: ProcessMediaOptions = {}
): Promise<SizedMediaResult> {
  const { onProgress, compressOversizedVideo = true } = options;
  const rawExt = getVideoExt(file);
  const originalKb = Math.round(file.size / 1024);

  onProgress?.(3, "Inspecting video dimensions & studio size budget...");

  const probe = await new Promise<{
    fileUrl: string;
    origW: number;
    origH: number;
    durationSec: number;
    thumbUrl: string;
    thumbSizeKb: number;
  }>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);

    let finished = false;
    let seekTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanupProbeVideo = () => {
      try {
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        // ignore
      }
    };

    const finishWithFrame = () => {
      if (finished) return;
      finished = true;
      if (seekTimer) clearTimeout(seekTimer);

      const origW = video.videoWidth || 1920;
      const origH = video.videoHeight || 1080;
      const durationSec = video.duration && isFinite(video.duration) ? video.duration : 0;

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

      cleanupProbeVideo();
      resolve({ fileUrl, origW, origH, durationSec, thumbUrl, thumbSizeKb });
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
      cleanupProbeVideo();
      URL.revokeObjectURL(fileUrl);
      reject(
        new Error(
          "Could not decode this video format in the browser. Use MP4 (H.264) / WebM, or paste a hosted video URL.",
        ),
      );
    };

    // Attach handlers BEFORE setting src so cached blob URLs cannot miss events
    video.src = fileUrl;
  });

  const studioBudgetBytes =
    probe.durationSec > 0
      ? Math.max(2 * 1024 * 1024, (probe.durationSec / 30) * STUDIO_MB_PER_30S * 1024 * 1024)
      : 15 * 1024 * 1024;

  let activeBlob: Blob = file;
  let activeExt = rawExt;
  let activeUrl = probe.fileUrl;
  let outW = probe.origW;
  let outH = probe.origH;
  let compressedFromKb: number | undefined;

  if (
    compressOversizedVideo &&
    probe.durationSec > 0 &&
    probe.durationSec <= MAX_BROWSER_COMPRESS_DURATION_SEC &&
    (file.size > studioBudgetBytes || file.size > 15 * 1024 * 1024)
  ) {
    onProgress?.(
      5,
      `File ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds studio budget (${(studioBudgetBytes / 1024 / 1024).toFixed(1)} MB). Compressing in browser...`,
    );
    const compressed = await compressVideoToStudioSpec(
      probe.fileUrl,
      probe.origW,
      probe.origH,
      probe.durationSec,
      onProgress,
    );
    if (compressed && compressed.blob.size > 0 && compressed.blob.size < file.size * 0.92) {
      // Discard the huge raw object URL and keep only the studio-sized compressed blob
      URL.revokeObjectURL(probe.fileUrl);
      activeBlob = compressed.blob;
      activeExt = compressed.ext;
      activeUrl = URL.createObjectURL(compressed.blob);
      outW = compressed.width;
      outH = compressed.height;
      compressedFromKb = originalKb;
    }
  }

  onProgress?.(98, "Saving studio-sized video...");

  const finalSizeKb = Math.round(activeBlob.size / 1024);

  // Only inline tiny videos (<= 1.5MB) into localStorage; larger videos go into IndexedDB
  if (activeBlob.size <= 1.5 * 1024 * 1024) {
    const dataUrl = await new Promise<string | null>((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res((e.target?.result as string) || null);
      reader.onerror = () => res(null);
      reader.readAsDataURL(activeBlob);
    });
    if (dataUrl) {
      URL.revokeObjectURL(activeUrl);
      onProgress?.(100, "Video ready");
      return {
        fullUrl: dataUrl,
        thumbUrl: probe.thumbUrl,
        width: outW,
        height: outH,
        fullSizeKb: finalSizeKb,
        thumbSizeKb: probe.thumbSizeKb,
        compressedFromKb,
        durationSec: probe.durationSec || undefined,
        isVideo: true,
        rawExt: activeExt,
      };
    }
  }

  onProgress?.(100, "Video ready");
  return {
    fullUrl: activeUrl,
    thumbUrl: probe.thumbUrl,
    width: outW,
    height: outH,
    fullSizeKb: finalSizeKb,
    thumbSizeKb: probe.thumbSizeKb,
    compressedFromKb,
    durationSec: probe.durationSec || undefined,
    isVideo: true,
    blob: activeBlob,
    rawExt: activeExt,
    storedInIndexedDb: true,
  };
}
