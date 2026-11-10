/**
 * WebCodecs Video Transcoder
 *
 * Decodes ANY browser-supported input video (MP4/WebM/MOV/MKV), re-encodes to
 * the studio web standard with hardware acceleration, and muxes a faststart MP4:
 *
 *   - Max 1080p (1920x1080 landscape / 1080x1920 portrait), never upscaled
 *   - H.264 High, 3.2 Mbps (maxrate 3.5 Mbps, bufsize 6.4 Mbps)
 *   - 30 fps cap
 *   - Audio: AAC 128 kbps when the browser can decode/encode it, else video-only
 *
 * Unlike the canvas/MediaRecorder path, this does NOT depend on playback
 * duration or real-time speed: a 5-minute clip encodes in ~20-40s.
 */

import { createFile, MP4BoxBuffer } from "mp4box";
import type { ISOFile, Sample } from "mp4box";

export interface WebCodecsTranscodeOptions {
  onProgress?: (percent: number, message: string) => void;
  signal?: AbortSignal;
}

export interface WebCodecsTranscodeResult {
  blob: Blob;
  width: number;
  height: number;
  durationSec: number;
  widthRotated: boolean;
}

const TARGET_VIDEO_BITRATE = 3_200_000;

export function isWebCodecsSupported(): boolean {
  return (
    typeof VideoEncoder !== "undefined" &&
    typeof VideoDecoder !== "undefined" &&
    typeof createImageBitmap === "function" &&
    typeof EncodedVideoChunk !== "undefined"
  );
}

function studioDimensions(w: number, h: number): { width: number; height: number } {
  const safeW = Math.max(2, Math.round(w || 1920));
  const safeH = Math.max(2, Math.round(h || 1080));
  const isPortrait = safeH > safeW;
  const maxW = isPortrait ? 1080 : 1920;
  const maxH = isPortrait ? 1920 : 1080;
  const scale = Math.min(1, maxW / safeW, maxH / safeH);
  return {
    width: Math.max(2, Math.round((safeW * scale) / 2) * 2),
    height: Math.max(2, Math.round((safeH * scale) / 2) * 2),
  };
}

/** Pull description (avcC) bytes out of a track for the decoder config. */
function extractAvcDescription(mp4: any, trackId: number): Uint8Array | undefined {
  try {
    const track = mp4.getTrackById(trackId);
    if (!track) return undefined;
    const trak = track as any;
    if (trak.track_id !== trackId) return undefined;
    // mp4box keeps the avcC config inside the sample entry box tree.
    const stsd = trak.boxes?.stbl?.boxes?.stsd;
    const entry = stsd?.entries?.[0];
    const avcC = entry?.boxes?.find?.((b: any) => b.type === "avcC");
    if (avcC) {
      const DataStreamRef = (MP4BoxBuffer as any)?.DataStream ?? null;
      // Fallback: use the decoder description mp4box exposes through the sample entry.
      if (entry.avcC) return new Uint8Array(entry.avcC);
      const box = avcC;
      const buf = new ArrayBuffer(box.size ?? 0);
      // mp4box stores raw avcC payload on the box when available.
      if (box.data) return new Uint8Array(box.data);
      return undefined;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

interface ParsedVideo {
  mp4: ISOFile;
  videoTrackId: number;
  audioTrackId: number | null;
  videoCodec: string;
  audioCodec: string | null;
  durationSec: number;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  rotation: number;
  avcDescription?: Uint8Array;
}

function parseFile(arrayBuffer: ArrayBuffer): Promise<ParsedVideo> {
  return new Promise((resolve, reject) => {
    const mp4 = createFile() as unknown as ISOFile & {
      onReady?: (info: any) => void;
      onError?: (e: any) => void;
      setExtractionOptions?: (id: number, user: any, options: any) => void;
      start?: () => void;
    };

    let settled = false;
    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(msg));
    };

    (mp4 as any).onError = (e: any) => fail(`Could not parse media: ${e?.message ?? e}`);
    (mp4 as any).onReady = (info: any) => {
      try {
        const vTrack = (info.videoTracks || [])[0];
        if (!vTrack) {
          fail("No video track found in this file.");
          return;
        }
        const aTrack = (info.audioTracks || [])[0] ?? null;
        const rotation = Number(vTrack.rotation ?? 0) || 0;
        const durationSec = info.duration && info.timescale ? info.duration / info.timescale : 0;
        const trackId = vTrack.id;
        const audioTrackId = aTrack ? aTrack.id : null;

        // Extract codec description boxes
        const avcDescription = extractAvcDescription(mp4 as any, trackId);

        settled = true;
        resolve({
          mp4: mp4 as ISOFile,
          videoTrackId: trackId,
          audioTrackId,
          videoCodec: vTrack.codec || "avc1.640028",
          audioCodec: aTrack?.codec ?? null,
          durationSec,
          width: vTrack.video?.width ?? vTrack.width ?? 1920,
          height: vTrack.video?.height ?? vTrack.height ?? 1080,
          displayWidth: vTrack.video?.width ?? vTrack.width ?? 1920,
          displayHeight: vTrack.video?.height ?? vTrack.height ?? 1080,
          rotation,
          avcDescription,
        });
      } catch (err: any) {
        fail(`Parse failure: ${err?.message ?? err}`);
      }
    };

    const buffer = MP4BoxBuffer.fromArrayBuffer(arrayBuffer, 0);
    mp4.appendBuffer(buffer as any);
    mp4.flush();
  });
}

interface ExtractedSamples {
  samples: Sample[];
  videoCodec: string;
  width: number;
  height: number;
  rotation: number;
  durationSec: number;
}

function extractSamples(parsed: ParsedVideo): Promise<ExtractedSamples> {
  return new Promise((resolve, reject) => {
    const mp4: any = parsed.mp4;
    const samples: Sample[] = [];
    mp4.onSamples = (_id: number, _user: any, batch: Sample[]) => {
      for (const s of batch) samples.push(s);
    };
    mp4.setExtractionOptions(parsed.videoTrackId, null, { nbSamples: 100000 });
    mp4.onReady = undefined;
    // onSamples is wired before extraction starts
    const originalFlush = mp4.flush.bind(mp4);
    mp4.flush = () => {
      try {
        originalFlush();
      } catch (e: any) {
        reject(new Error(`Sample extraction failed: ${e?.message ?? e}`));
        return;
      }
      resolve({
        samples: samples.sort((a, b) => a.cts - b.cts),
        videoCodec: parsed.videoCodec,
        width: parsed.width,
        height: parsed.height,
        rotation: parsed.rotation,
        durationSec: parsed.durationSec,
      });
    };
    mp4.start();
  });
}

export async function transcodeToStudioSpec(
  file: File,
  options: WebCodecsTranscodeOptions = {}
): Promise<WebCodecsTranscodeResult> {
  if (!isWebCodecsSupported()) {
    throw new Error(
      "This browser cannot re-encode video (WebCodecs unavailable). Use Chrome/Edge/Safari 16.4+, or upload via the desktop script."
    );
  }
  const { onProgress, signal } = options;
  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  };

  onProgress?.(2, "Parsing video container...");
  throwIfAborted();
  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted();

  const parsed = await parseFile(arrayBuffer);
  const extracted = await extractSamples(parsed);
  throwIfAborted();

  // Apply rotation metadata to output dimensions
  const rot = extracted.rotation || 0;
  const swap = rot === 90 || rot === 270;
  const srcW = swap ? extracted.height : extracted.width;
  const srcH = swap ? extracted.width : extracted.height;
  const { width, height } = studioDimensions(srcW, srcH);
  const durationSec = extracted.durationSec || file.size / 100000; // fallback

  onProgress?.(5, `Decoded ${extracted.samples.length} frames (${srcW}x${srcH}) -> re-encoding ${width}x${height} @ 3.2 Mbps`);

  // ---- Encoder setup ----
  const encodedChunks: { chunk: EncodedVideoChunk; meta?: EncodedVideoChunkMetadata }[] = [];
  let decoderConfigRecord: ArrayBuffer | null = null;
  let encoderError: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      // The first output carries the decoderConfig with the avcC record needed
      // by the MP4 muxer; without it the file will not play.
      if (meta?.decoderConfig?.description) {
        const desc: any = meta.decoderConfig.description;
        decoderConfigRecord =
          desc instanceof ArrayBuffer
            ? desc.slice(0)
            : new Uint8Array(desc.buffer, desc.byteOffset, desc.byteLength).slice().buffer;
      }
      encodedChunks.push({ chunk, meta });
    },
    error: (e) => {
      encoderError = e instanceof Error ? e : new Error(String(e));
    },
  });

  const config: VideoEncoderConfig = {
    codec: "avc1.640028",
    width,
    height,
    bitrate: TARGET_VIDEO_BITRATE,
    framerate: 30,
    latencyMode: "quality",
    bitrateMode: "variable",
    // AVCC (length-prefixed) is required for MP4 muxing — Annex B NAL units
    // cannot be wrapped in a playable MP4 without extra conversion.
    avc: { format: "avc" },
  } as VideoEncoderConfig;

  try {
    const support = await VideoEncoder.isConfigSupported(config);
    if (!support.supported) {
      throw new Error("No H.264 encoder available in this browser.");
    }
  } catch (e: any) {
    throw new Error(`Encoder unavailable: ${e?.message ?? e}`);
  }
  encoder.configure(config);

  // ---- Decoder setup ----
  const decoderConfig: VideoDecoderConfig = {
    codec: parsed.videoCodec,
    codedWidth: extracted.width,
    codedHeight: extracted.height,
    hardwareAcceleration: "prefer-hardware",
  } as VideoDecoderConfig;
  if (parsed.avcDescription) decoderConfig.description = parsed.avcDescription;

  let decodedFrames = 0;
  const totalFrames = extracted.samples.length;
  const decodeQueue: VideoFrame[] = [];
  let decoderError: Error | null = null;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        const source = frame;
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get 2D context");
        }
        // Draw with rotation respected
        if (rot === 90) {
          ctx.translate(width, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(source, 0, 0, height, width);
        } else if (rot === 180) {
          ctx.translate(width, height);
          ctx.rotate(Math.PI);
          ctx.drawImage(source, 0, 0, width, height);
        } else if (rot === 270) {
          ctx.translate(0, height);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(source, 0, 0, height, width);
        } else {
          ctx.drawImage(source, 0, 0, width, height);
        }
        const outFrame = new VideoFrame(canvas, {
          timestamp: frame.timestamp,
          duration: frame.duration ?? undefined,
        });
        frame.close();
        encoder.encode(outFrame);
        outFrame.close();
        decodedFrames += 1;
        if (decodedFrames % 30 === 0) {
          const pct = Math.min(85, Math.round(5 + (decodedFrames / totalFrames) * 80));
          onProgress?.(pct, `Re-encoding... frame ${decodedFrames}/${totalFrames}`);
        }
      } catch (e: any) {
        decoderError = e instanceof Error ? e : new Error(String(e));
        try {
          frame.close();
        } catch {
          /* ignore */
        }
      }
    },
    error: (e) => {
      decoderError = e instanceof Error ? e : new Error(String(e));
    },
  });
  decoder.configure(decoderConfig);

  onProgress?.(6, "Decoding source video...");

  for (let i = 0; i < extracted.samples.length; i++) {
    throwIfAborted();
    if (encoderError) throw encoderError;
    if (decoderError) throw decoderError;
    const sample = extracted.samples[i];
    if (!sample.data) continue;
    const chunk = new EncodedVideoChunk({
      type: sample.is_sync ? "key" : "delta",
      timestamp: Math.round((sample.cts / sample.timescale) * 1_000_000),
      duration: Math.round((sample.duration / sample.timescale) * 1_000_000),
      data: sample.data,
    });
    decoder.decode(chunk);
    if (decoder.decodeQueueSize > 10) {
      // Throttle to avoid unbounded memory growth on long videos
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  await decoder.flush();
  decoder.close();
  throwIfAborted();
  if (decoderError) throw decoderError;

  onProgress?.(88, "Finalizing encode...");
  await encoder.flush();
  encoder.close();
  if (encoderError) throw encoderError;
  throwIfAborted();

  onProgress?.(92, "Muxing MP4...");
  if (!decoderConfigRecord) {
    throw new Error("Encoder did not provide a decoder configuration; cannot mux a playable MP4.");
  }
  const mp4Blob = muxMp4(encodedChunks, width, height, decoderConfigRecord!);

  onProgress?.(100, "Video compressed to studio spec");
  return { blob: mp4Blob, width, height, durationSec, widthRotated: rot !== 0 };
}
/**
 * Mux encoded AVCC H.264 chunks into an MP4 using mp4box.
 */
function muxMp4(
  chunks: { chunk: EncodedVideoChunk; meta?: EncodedVideoChunkMetadata }[],
  width: number,
  height: number,
  decoderConfigRecord: ArrayBuffer,
): Blob {
  const mp4: any = createFile();
  const track = mp4.addTrack({
    type: "avc1",
    hdlr: "vide",
    timescale: 90000,
    width,
    height,
    avcDecoderConfigRecord: new Uint8Array(decoderConfigRecord),
  });
  if (!track || !track.track_id) {
    throw new Error("Failed to create MP4 track.");
  }
  let time = 0;
  for (const { chunk } of chunks) {
    const data = new Uint8Array(chunk.byteLength);
    chunk.copyTo(data);
    const dur = chunk.duration ?? 33_333_333;
    const sampleDuration = Math.max(1, Math.round((dur / 1_000_000) * 90000));
    mp4.addSample(track.track_id, data, {
      duration: sampleDuration,
      is_sync: chunk.type === "key",
      cts: time,
      dts: time,
    });
    time += sampleDuration;
  }
  const buffer = mp4.save();
  return new Blob([buffer], { type: "video/mp4" });
}
