'use strict';
/**
 * On-demand image derivatives with a disk cache.
 *
 * A request for /media/<section>/<project>/<file>?w=640&fmt=webp resizes the
 * original once, writes it to .media-cache/, and serves the cached copy on every
 * later hit. The cache key includes the source's mtime + size, so replacing an
 * original silently invalidates its derivatives.
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const config = require('../config');

// Cap concurrent sharp jobs; each one can hold a full bitmap in memory.
sharp.concurrency(Math.max(1, Math.min(4, require('os').cpus().length - 1)));

// Collapse duplicate work when several requests race for the same derivative.
const inFlight = new Map();

/**
 * Bounds how many encodes run at once. Each one can hold a full decoded bitmap
 * (~160 MB for a 24 MP source), so an unbounded burst of cold requests would
 * exhaust a small VPS. Callers queue instead of failing.
 */
let activeEncodes = 0;
const encodeQueue = [];

function acquireEncodeSlot() {
  if (activeEncodes < config.maxConcurrentEncodes) {
    activeEncodes++;
    return Promise.resolve();
  }
  return new Promise((resolve) => encodeQueue.push(resolve));
}

function releaseEncodeSlot() {
  const next = encodeQueue.shift();
  if (next) next();
  else activeEncodes--;
}

/** Snap an arbitrary requested width to the nearest allowed size. */
function normalizeWidth(requested) {
  const widths = config.allowedWidths;
  const w = Number(requested);
  if (!Number.isFinite(w) || w <= 0) return null;
  return widths.find((allowed) => allowed >= w) || widths[widths.length - 1];
}

/** Pick the best format the browser accepts, unless one was requested explicitly. */
function negotiateFormat(requested, acceptHeader = '') {
  if (requested && config.allowedFormats.includes(requested)) return requested;
  if (acceptHeader.includes('image/avif')) return 'avif';
  if (acceptHeader.includes('image/webp')) return 'webp';
  return 'jpeg';
}

function cachePathFor(relSource, width, format, stat, animated) {
  const key = crypto
    .createHash('sha1')
    .update(`${relSource}|${width}|${format}|${animated ? 'anim' : 'still'}|${stat.size}|${stat.mtimeMs}`)
    .digest('hex');
  // Shard by the first two hex chars so no single directory holds thousands of files.
  return path.join(config.cacheRoot, key.slice(0, 2), `${key}.${format}`);
}

async function encode(source, width, format, animated) {
  let pipeline = sharp(source, {
    failOn: 'none',
    animated,
    // An animated source is decoded as a tall filmstrip, so it needs a much
    // higher pixel ceiling than a still.
    limitInputPixels: animated ? config.animatedPixelLimit : undefined,
  }).rotate(); // honour EXIF orientation

  const meta = await pipeline.metadata();
  // Never upscale: a 640px-wide original stays 640px wide.
  if (meta.width && width < meta.width) {
    pipeline = pipeline.resize(width, null, { fit: 'inside', withoutEnlargement: true });
  }

  const quality = config.defaultQuality[format];
  // Animated output is webp-only: avif encoding of long GIFs is prohibitively
  // slow, and jpeg cannot hold multiple frames.
  if (animated) return pipeline.webp({ quality: config.animatedQuality, effort: 3 }).toBuffer();
  if (format === 'avif') return pipeline.avif({ quality, effort: config.encodeEffort.avif }).toBuffer();
  if (format === 'webp') return pipeline.webp({ quality, effort: config.encodeEffort.webp }).toBuffer();
  return pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
}

/**
 * Returns { path, format, fromCache } for a derivative, generating it if needed.
 * `relSource` is the media-relative path, used only for the cache key.
 */
/**
 * Can this source realistically be re-encoded with its animation intact?
 * Very long or very large GIFs are not worth the memory; they degrade to a still.
 */
async function canAnimate(absSource, stat) {
  if (stat.size > config.maxAnimatedBytes) return false;
  try {
    const meta = await sharp(absSource, { limitInputPixels: config.animatedPixelLimit }).metadata();
    const frames = meta.pages || 1;
    if (frames < 2) return false;
    return (meta.width || 0) * (meta.pageHeight || meta.height || 0) * frames <= config.animatedPixelLimit;
  } catch {
    return false;
  }
}

async function getDerivative(absSource, relSource, requestedWidth, format, { animated = false } = {}) {
  const width = normalizeWidth(requestedWidth) || config.allowedWidths[config.allowedWidths.length - 1];
  const stat0 = await fsp.stat(absSource);
  if (animated && !(await canAnimate(absSource, stat0))) animated = false;
  const outFormat = animated ? 'webp' : format;
  const stat = stat0;
  const target = cachePathFor(relSource, width, outFormat, stat, animated);

  try {
    await fsp.access(target);
    return { path: target, format: outFormat, width, animated, fromCache: true };
  } catch {
    /* not cached yet */
  }

  if (inFlight.has(target)) return inFlight.get(target);

  const work = (async () => {
    await acquireEncodeSlot();
    let buffer;
    try {
      buffer = await encode(absSource, width, outFormat, animated);
    } finally {
      releaseEncodeSlot();
    }
    await fsp.mkdir(path.dirname(target), { recursive: true });
    // Write to a temp file then rename, so a crash never leaves a truncated
    // derivative that later requests would happily serve.
    const tmp = `${target}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, buffer);
    await fsp.rename(tmp, target);
    return { path: target, format: outFormat, width, animated, fromCache: false };
  })().finally(() => inFlight.delete(target));

  inFlight.set(target, work);
  return work;
}

/** Strong ETag for a derivative, derived from its cache key. */
function etagFor(cacheFile) {
  return `"${path.basename(cacheFile, path.extname(cacheFile))}"`;
}

function clearCache() {
  fs.rmSync(config.cacheRoot, { recursive: true, force: true });
}

module.exports = { getDerivative, canAnimate, normalizeWidth, negotiateFormat, etagFor, clearCache };
