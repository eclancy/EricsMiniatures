'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Load server/.env if it exists.
 *
 * systemd passes MEDIA_ROOT, CACHE_ROOT and friends to the service process,
 * but a CLI run of `npm run scan` or `npm run prewarm` inherits none of that
 * and silently falls back to the in-repo defaults. That is how the first
 * production prewarm ended up filling a cache directory the running service
 * never reads. Sharing a .env keeps the service and the scripts pointed at the
 * same paths.
 *
 * Real environment variables always win, so systemd stays authoritative.
 */
function loadEnvFile() {
  let text;
  try {
    text = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  } catch {
    return; // no .env is the normal case in development
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq < 1) continue;

    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

/** Parse a comma-separated env list into a trimmed array. */
const list = (value, fallback) =>
  (value ? value.split(',') : fallback).map((s) => s.trim()).filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || '0.0.0.0',

  // Original, full-resolution source images. Never served directly.
  mediaRoot: process.env.MEDIA_ROOT || path.join(ROOT, 'media'),
  // Hand-authored copy + generated technical metadata.
  contentRoot: process.env.CONTENT_ROOT || path.join(ROOT, 'content'),
  // Derivative cache. Safe to delete; it is rebuilt on demand.
  cacheRoot: process.env.CACHE_ROOT || path.join(ROOT, '.media-cache'),
  // Optional: serve the built React app from the same process.
  clientRoot: process.env.CLIENT_ROOT || path.join(ROOT, 'build'),
  serveClient: process.env.SERVE_CLIENT !== 'false',

  // Widths the API is willing to generate. Anything else is snapped to the
  // nearest allowed width so a hostile caller cannot fill the disk.
  allowedWidths: [160, 320, 480, 640, 960, 1280, 1600, 1920, 2560],
  allowedFormats: ['avif', 'webp', 'jpeg'],
  defaultQuality: { avif: 50, webp: 72, jpeg: 78 },
  // Encoder effort. AVIF is roughly 10x slower than WebP per step; effort 4 is
  // a good trade on a multi-core host, but a 1-vCPU VPS may want 2.
  encodeEffort: { avif: Number(process.env.AVIF_EFFORT) || 4, webp: 4 },

  // A single large encode holds ~160 MB of bitmap. Cap how many can run at
  // once so a burst of cold requests cannot exhaust a small VPS's memory;
  // anything over the limit waits rather than being refused.
  maxConcurrentEncodes: Number(process.env.MAX_CONCURRENT_ENCODES) || 2,
  // Animated WebP needs a lower quality to stay a sane size across many frames.
  animatedQuality: 55,
  // Animated GIFs are re-encoded to animated WebP (often a 10-20x saving).
  // Only widths up to this are offered for animation, to bound encode cost.
  maxAnimatedWidth: 960,
  // Sources above this are never animated - decoding every frame of a very long
  // GIF costs more memory than it is worth. They fall back to a still frame.
  maxAnimatedBytes: 48 * 1024 * 1024,
  // width x height x frames for an animated source. Above this sharp refuses
  // anyway, so we check first and degrade gracefully instead of 500-ing.
  animatedPixelLimit: 900 * 1000 * 1000,

  // sharp cannot transcode video, so mp4/webm stream from disk untouched.
  passthroughExtensions: ['.mp4', '.webm'],

  corsOrigins: list(process.env.CORS_ORIGINS, [
    'http://localhost:3000',
    'https://ericsminiatures.com',
    'https://www.ericsminiatures.com',
  ]),

  // Derivatives are immutable: the URL contains the width + format, and the
  // content hash is in the ETag.
  immutableMaxAge: 60 * 60 * 24 * 365,
  // Metadata can change between deploys, so it revalidates more often.
  metadataMaxAge: 60 * 5,

  sectionOrder: ['miniatures', 'terrain', 'modelkits', 'other'],
};
