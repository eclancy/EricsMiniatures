'use strict';
/**
 * Pre-generates the derivatives visitors hit first, so nobody pays the resize
 * cost on a cold cache after a deploy.
 *
 *   node scripts/prewarm-cache.js            # covers + banners (fast)
 *   node scripts/prewarm-cache.js --all      # every photo at every grid width
 *
 * Safe to re-run: anything already cached is skipped.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const config = require('../src/config');
const pipeline = require('../src/lib/imagePipeline');

const ALL = process.argv.includes('--all');

// What the gallery grid and lightbox actually request.
const COVER_WIDTHS = [320, 480, 640, 960, 1280];
const BANNER_WIDTHS = [640, 960, 1280, 1600, 1920, 2560];
const FULL_WIDTHS = [640, 960, 1280, 1600];
const THUMB_WIDTHS = [160];
// AVIF and WebP cover every modern browser; JPEG is generated on demand for the rest.
const FORMATS = ['avif', 'webp'];

const index = JSON.parse(fs.readFileSync(path.join(config.contentRoot, 'media-index.json'), 'utf8'));

const jobs = [];
for (const [key, project] of Object.entries(index.projects)) {
  const isBanner = project.section === 'banners';

  for (const photo of project.photos) {
    if (photo.kind === 'video') continue;

    let widths;
    if (isBanner) widths = BANNER_WIDTHS;
    else if (photo.file === project.cover) widths = [...COVER_WIDTHS, ...(ALL ? FULL_WIDTHS : [])];
    else if (ALL) widths = [...THUMB_WIDTHS, ...FULL_WIDTHS];
    else continue;

    for (const width of new Set(widths)) {
      for (const format of FORMATS) {
        jobs.push({
          abs: path.join(config.mediaRoot, project.section, project.slug, photo.file),
          rel: `${project.section}/${project.slug}/${photo.file}`,
          width,
          format,
          key,
        });
      }
    }
  }
}

const concurrency = Math.max(2, Math.min(os.cpus().length, 8));
let done = 0;
let generated = 0;
let failed = 0;
const started = Date.now();

async function worker(queue) {
  while (queue.length) {
    const job = queue.pop();
    try {
      const result = await pipeline.getDerivative(job.abs, job.rel, job.width, job.format);
      if (!result.fromCache) generated++;
    } catch (err) {
      failed++;
      console.warn(`  ! ${job.rel} @${job.width} ${job.format}: ${err.message}`);
    }
    done++;
    if (done % 100 === 0) {
      process.stdout.write(`\r  ${done}/${jobs.length} (${generated} new)`);
    }
  }
}

(async () => {
  console.log(`Prewarming ${jobs.length} derivatives with ${concurrency} workers${ALL ? ' (--all)' : ''}...`);
  await Promise.all(Array.from({ length: concurrency }, () => worker(jobs)));
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\rDone: ${done} derivatives, ${generated} newly generated, ${failed} failed, in ${secs}s`);
})();
