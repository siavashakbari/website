/**
 * Video Transcoding & Compression Script
 *
 * Implements Siavash Akbari's Portfolio Video Protocol:
 * - Resolution: 1080p (1920x1080 landscape or 1080x1920 portrait)
 * - File Size Formula: (durationSec / 30) * 12 MB (e.g. 30s = 12MB, 3min = 72MB)
 * - Video Bitrate: 3200 kbps (3.2 Mbps) H.264
 * - Audio Bitrate: 128 kbps AAC
 *
 * Usage:
 *   node scripts/transcode-video.mjs input.mov [output.mp4]
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const inputFile = process.argv[2];
const outputFile =
  process.argv[3] ||
  (inputFile ? inputFile.replace(/\.[^/.]+$/, "") + "_1080p.mp4" : null);

if (!inputFile || !fs.existsSync(inputFile)) {
  console.log(`
Usage:
  node scripts/transcode-video.mjs <input-video> [output-video.mp4]

Formula:
  - 1080p resolution
  - 12 MB per 30 seconds (3.2 Mbps target bitrate)
  - 3 min video -> ~72 MB
`);
  process.exit(1);
}

console.log(`🎬 Reading metadata for: ${inputFile}`);

// Check if ffprobe / ffmpeg is available
try {
  const probeOutput = execSync(
    `ffprobe -v error -show_entries format=duration:stream=width,height,codec_name -of default=noprint_wrappers=1 "${inputFile}"`,
    { encoding: "utf8" }
  );

  const durationMatch = probeOutput.match(/duration=([\d.]+)/);
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 30;
  const targetMb = ((duration / 30) * 12).toFixed(1);

  console.log(`⏱️ Duration: ${Math.round(duration)}s (${(duration / 60).toFixed(1)} mins)`);
  console.log(`🎯 Formula Target Size: ${targetMb} MB (at 12 MB / 30s)`);
  console.log(`🚀 Transcoding to 1080p @ 3.2 Mbps...`);

  // Detect orientation
  const widthMatch = probeOutput.match(/width=(\d+)/);
  const heightMatch = probeOutput.match(/height=(\d+)/);
  const width = widthMatch ? parseInt(widthMatch[1]) : 1920;
  const height = heightMatch ? parseInt(heightMatch[1]) : 1080;
  const isPortrait = height > width;

  const scaleFilter = isPortrait
    ? `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2`
    : `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`;

  const ffmpegCmd = `ffmpeg -y -i "${inputFile}" -vf "${scaleFilter}" -c:v libx264 -preset slow -b:v 3200k -maxrate 3500k -bufsize 6400k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outputFile}"`;

  console.log(`Executing: ${ffmpegCmd}`);
  execSync(ffmpegCmd, { stdio: "inherit" });

  const stats = fs.statSync(outputFile);
  const actualMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Finished! Output: ${outputFile} (${actualMb} MB)`);
} catch (err) {
  console.error("FFmpeg/ffprobe error or not found in PATH:", err.message);
  console.log(`
Alternative manual command to run:
ffmpeg -i "${inputFile}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v 3200k -maxrate 3500k -bufsize 6400k -c:a aac -b:a 128k "${outputFile}"
`);
}
