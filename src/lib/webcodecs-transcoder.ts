/**
 * WebCodecs Video Transcoder
 *
 * Decodes ANY browser-supported input video, re-encodes to the studio web
 * standard, and muxes a faststart MP4 with correct duration metadata:
 *
 *   - Video: H.264 High, max 1080p (1920x1080 / 1080x1920), 3.2 Mbps, 30fps cap
 *   - Audio: AAC 128 kbps (re-encoded via Web Audio decode + AudioEncoder)
 *   - Any duration — encoding runs faster than real-time (no MediaRecorder cap)
 */

import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { createFile, MP4BoxBuffer } from "mp4box";
import type { Sample } from "mp4box";

export interface WebCodecsTranscodeOptions {
  onProgress?: (percent: number, message: string) => void;
  signal?: AbortSignal;
}

export interface WebCodecsTranscodeResult {
  blob: Blob;
  width: number;
  height: number;
  durationSec: number;
}

const TARGET_VIDEO_BITRATE = 3_200_000;
const TARGET_AUDIO_BITRATE = 128_000;
const TARGET_FPS = 30;

export function isWebCodecsSupported(): boolean {
  return (
    typeof VideoEncoder !== "undefined" &&
    typeof VideoDecoder !== "undefined" &&
    typeof EncodedVideoChunk !== "undefined" &&
    typeof OffscreenCanvas !== "undefined"
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

interface ParsedVideo {
  videoTrackId: number;
  videoCodec: string;
  codedWidth: number;
  codedHeight: number;
  durationSec: number;
  rotation: number;
  avcDescription?: Uint8Array;
}

/** Reads track info and the avcC description needed to configure the decoder. */
function parseFile(arrayBuffer: ArrayBuffer): Promise<{ parsed: ParsedVideo; mp4: any }> {
  return new Promise((resolve, reject) => {
    const mp4: any = createFile();
    let settled = false;
    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(msg));
    };

    mp4.onError = (e: any) => fail(`Could not parse media: ${e?.message ?? e}`);
    mp4.onReady = (info: any) => {
      try {
        const vTrack = (info.videoTracks || [])[0];
        if (!vTrack) return fail("No video track found in this file.");

        // Pull the avcC/H.264 description straight from the sample entry so the
        // decoder can be configured for AVCC data.
        let avcDescription: Uint8Array | undefined;
        try {
          const entry = mp4.getTrackById(vTrack.id)?.mdia?.minf?.stbl?.stsd?.entries?.[0];
          const avcC = entry?.avcC ?? entry?.boxes?.find?.((b: any) => b.type === "avcC");
          if (avcC) {
            // avcC boxes parsed by mp4box keep a `data` Uint8Array of the payload
            if (avcC.data) avcDescription = new Uint8Array(avcC.data);
            else if (typeof avcC.write === "function") {
              const DS = (MP4BoxBuffer as any).DataStream;
              if (DS) {
                const ds = new DS(undefined, 0, DS.BIG_ENDIAN);
                avcC.write(ds);
                const out = new Uint8Array(ds.buffer, ds.position ?? 0);
                // strip box header (8 bytes) to get the raw avcC payload
                avcDescription = out.slice(8);
              }
            }
          }
        } catch {
          /* description optional — decoder may still accept the codec string */
        }

        settled = true;
        resolve({
          mp4,
          parsed: {
            videoTrackId: vTrack.id,
            videoCodec: vTrack.codec || "avc1.640028",
            codedWidth: vTrack.video?.width ?? vTrack.width ?? 1920,
            codedHeight: vTrack.video?.height ?? vTrack.height ?? 1080,
            durationSec:
              info.duration && info.timescale ? info.duration / info.timescale : 0,
            rotation: Number(vTrack.rotation ?? 0) || 0,
            avcDescription,
          },
        });
      } catch (err: any) {
        fail(`Parse failure: ${err?.message ?? err}`);
      }
    };

    try {
      mp4.appendBuffer(MP4BoxBuffer.fromArrayBuffer(arrayBuffer, 0) as any);
      mp4.flush();
    } catch (err: any) {
      fail(`Could not read media file: ${err?.message ?? err}`);
    }
  });
}

/** Extracts the encoded video samples so they can be fed to VideoDecoder. */
function extractVideoSamples(mp4: any, trackId: number): Promise<Sample[]> {
  return new Promise((resolve, reject) => {
    const samples: Sample[] = [];
    mp4.onSamples = (_id: number, _user: any, batch: Sample[]) => {
      for (const s of batch) samples.push(s);
    };
    const originalFlush = mp4.flush.bind(mp4);
    mp4.flush = () => {
      try {
        originalFlush();
        resolve(samples);
      } catch (e: any) {
        reject(new Error(`Sample extraction failed: ${e?.message ?? e}`));
      }
    };
    mp4.setExtractionOptions(trackId, null, { nbSamples: Number.MAX_SAFE_INTEGER });
    mp4.start();
  });
}

/** Decodes audio with Web Audio, re-encodes to AAC. Returns null when no audio. */
async function transcodeAudio(
  arrayBuffer: ArrayBuffer,
  targetDurationSec: number,
): Promise<{ chunks: EncodedAudioChunk[]; sampleRate: number; channels: number } | null> {
  if (typeof AudioEncoder === "undefined") return null;
  try {
    const AudioCtx: typeof AudioContext | undefined =
      typeof AudioContext !== "undefined"
        ? AudioContext
        : (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    // decodeAudioData detaches the buffer — always pass a copy
    const ctx = new AudioCtx();
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      ctx.close().catch(() => {});
    }
    if (!audioBuffer || audioBuffer.length === 0) return null;

    // Cap ASR to something universally supported by AAC encoders
    const supportedRates = [48000, 44100, 32000, 24000, 22050];
    let sampleRate = audioBuffer.sampleRate;
    if (!supportedRates.includes(sampleRate)) {
      sampleRate = sampleRate > 44100 ? 48000 : 44100;
    }
    const channels = Math.min(2, Math.max(1, audioBuffer.numberOfChannels));

    const cfg: AudioEncoderConfig = {
      codec: "mp4a.40.2",
      sampleRate,
      numberOfChannels: channels,
      bitrate: TARGET_AUDIO_BITRATE,
    };
    const support = await AudioEncoder.isConfigSupported(cfg).catch(() => null);
    if (!support?.supported) return null;

    const out: EncodedAudioChunk[] = [];
    let audioError: Error | null = null;
    const encoder = new AudioEncoder({
      output: (chunk) => out.push(chunk),
      error: (e) => {
        audioError = e instanceof Error ? e : new Error(String(e));
      },
    });
    encoder.configure(cfg);

    // Resample-on-the-fly: build planar f32 AudioData in encoder-sized slices.
    const channelData: Float32Array[] = [];
    for (let c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));

    const framesPerChunk = 1024;
    const total = audioBuffer.length;
    for (let offset = 0; offset < total; offset += framesPerChunk) {
      const n = Math.min(framesPerChunk, total - offset);
      // planar layout: channel0 samples, then channel1 samples
      const planar = new Float32Array(n * channels);
      for (let c = 0; c < channels; c++) {
        planar.set(channelData[c].subarray(offset, offset + n), c * n);
      }
      const timestamp = Math.round((offset / sampleRate) * 1_000_000);
      const data = new AudioData({
        format: "f32-planar",
        sampleRate,
        numberOfFrames: n,
        numberOfChannels: channels,
        timestamp,
        data: planar,
      });
      encoder.encode(data);
      data.close();
      if (encoder.encodeQueueSize > 20) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    await encoder.flush();
    encoder.close();
    if (audioError) throw audioError;
    if (out.length === 0) return null;
    void targetDurationSec;
    return { chunks: out, sampleRate, channels };
  } catch {
    return null; // audio is best-effort; video-only output is still valid
  }
}

export async function transcodeToStudioSpec(
  file: File,
  options: WebCodecsTranscodeOptions = {},
): Promise<WebCodecsTranscodeResult> {
  if (!isWebCodecsSupported()) {
    throw new Error(
      "This browser cannot re-encode video (WebCodecs unavailable). Use Chrome/Edge/Safari 16.4+, or upload via the desktop script.",
    );
  }
  const { onProgress, signal } = options;
  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  };

  onProgress?.(2, "Reading video file...");
  throwIfAborted();
  const arrayBuffer = await file.arrayBuffer();
  throwIfAborted();

  onProgress?.(4, "Parsing video tracks...");
  const { parsed, mp4 } = await parseFile(arrayBuffer);
  const samples = await extractVideoSamples(mp4, parsed.videoTrackId);
  throwIfAborted();
  if (samples.length === 0) {
    throw new Error("No decodable video frames found in this file.");
  }

  // Rotation from the container metadata
  const rot = parsed.rotation || 0;
  const swap = rot === 90 || rot === 270;
  const srcW = swap ? parsed.codedHeight : parsed.codedWidth;
  const srcH = swap ? parsed.codedWidth : parsed.codedHeight;
  const { width, height } = studioDimensions(srcW, srcH);

  // Derive duration from the frame timestamps — more reliable than the header.
  const sorted = [...samples].sort((a, b) => a.cts - b.cts);
  const last = sorted[sorted.length - 1];
  const lastEnd = (last.cts + (last.duration || 0)) / last.timescale;
  const firstStart = sorted[0].cts / sorted[0].timescale;
  const durationSec = parsed.durationSec || Math.max(0, lastEnd - firstStart) || 1;

  onProgress?.(
    6,
    `Re-encoding ${sorted.length} frames (${srcW}x${srcH} → ${width}x${height} @ 3.2 Mbps)`,
  );

  // ---- Muxer (correct duration + faststart via mp4-muxer) ----
  const target = new ArrayBufferTarget();
  const audio = await (async () => {
    onProgress?.(8, "Re-encoding audio (AAC 128 kbps)...");
    return transcodeAudio(arrayBuffer, durationSec);
  })();
  throwIfAborted();

  const muxer = new Muxer({
    target,
    video: { codec: "avc", width, height, frameRate: TARGET_FPS },
    ...(audio
      ? {
          audio: {
            codec: "aac" as const,
            numberOfChannels: audio.channels,
            sampleRate: audio.sampleRate,
          },
          firstTimestampBehavior: "offset" as const,
        }
      : {}),
    fastStart: "in-memory",
  });

  // ---- Video encoder ----
  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      encoderError = e instanceof Error ? e : new Error(String(e));
    },
  });

  const cfg: VideoEncoderConfig = {
    codec: "avc1.640028",
    width,
    height,
    bitrate: TARGET_VIDEO_BITRATE,
    framerate: TARGET_FPS,
    latencyMode: "quality",
    bitrateMode: "variable",
    avc: { format: "avc" },
  } as VideoEncoderConfig;
  const support = await VideoEncoder.isConfigSupported(cfg).catch(() => null);
  if (!support?.supported) {
    throw new Error("No H.264 encoder available in this browser.");
  }
  encoder.configure(cfg);

  // ---- Video decoder ----
  const decoderConfig: VideoDecoderConfig = {
    codec: parsed.videoCodec,
    codedWidth: parsed.codedWidth,
    codedHeight: parsed.codedHeight,
    hardwareAcceleration: "prefer-hardware",
  } as VideoDecoderConfig;
  if (parsed.avcDescription) decoderConfig.description = parsed.avcDescription;

  // Reuse one canvas — allocating per frame exhausts memory on long videos.
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not obtain 2D canvas context.");

  let decodedFrames = 0;
  let decoderError: Error | null = null;
  const totalFrames = sorted.length;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        ctx.save();
        if (rot === 90) {
          ctx.translate(width, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(frame, 0, 0, height, width);
        } else if (rot === 180) {
          ctx.translate(width, height);
          ctx.rotate(Math.PI);
          ctx.drawImage(frame, 0, 0, width, height);
        } else if (rot === 270) {
          ctx.translate(0, height);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(frame, 0, 0, height, width);
        } else {
          ctx.drawImage(frame, 0, 0, width, height);
        }
        ctx.restore();

        const outFrame = new VideoFrame(canvas, {
          timestamp: frame.timestamp,
          duration: frame.duration ?? Math.round(1_000_000 / TARGET_FPS),
        });
        encoder.encode(outFrame, { keyFrame: decodedFrames % (TARGET_FPS * 2) === 0 });
        outFrame.close();
        frame.close();
        decodedFrames += 1;
        if (decodedFrames % 15 === 0) {
          const pct = Math.min(88, Math.round(10 + (decodedFrames / totalFrames) * 78));
          onProgress?.(pct, `Encoding video... frame ${decodedFrames}/${totalFrames}`);
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

  onProgress?.(10, "Decoding video...");
  for (let i = 0; i < sorted.length; i++) {
    throwIfAborted();
    if (encoderError) throw encoderError;
    if (decoderError) throw decoderError;
    const s = sorted[i];
    if (!s.data) continue;
    decoder.decode(
      new EncodedVideoChunk({
        type: s.is_sync ? "key" : "delta",
        timestamp: Math.round((s.cts / s.timescale) * 1_000_000),
        duration: Math.round(((s.duration || 0) / s.timescale) * 1_000_000) || undefined,
        data: s.data,
      }),
    );
    if (decoder.decodeQueueSize > 8) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  await decoder.flush();
  decoder.close();
  if (decoderError) throw decoderError;
  if (encoderError) throw encoderError;

  onProgress?.(90, "Finalizing video encode...");
  await encoder.flush();
  encoder.close();
  if (encoderError) throw encoderError;
  throwIfAborted();

  if (audio) {
    onProgress?.(94, "Muxing audio track...");
    for (const chunk of audio.chunks) muxer.addAudioChunk(chunk);
  }

  onProgress?.(97, "Writing MP4 (faststart)...");
  muxer.finalize();

  const blob = new Blob([target.buffer], { type: "video/mp4" });
  onProgress?.(100, "Video compressed to studio spec");
  return { blob, width, height, durationSec };
}
