'use strict';
/**
 * Walks media/ and writes two files into content/:
 *
 *   media-index.json   generated, do not hand-edit. Dimensions, byte sizes and
 *                      a tiny inline blur placeholder for every photo.
 *   projects.json      hand-authored titles, descriptions and captions. The
 *                      scan only *adds* entries for new projects and new
 *                      photos; existing prose is never overwritten.
 *
 * Run after adding or removing images:  npm run scan
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../src/config');
const pipeline = require('../src/lib/imagePipeline');
const { titleize, orderOf } = require('../src/lib/naming');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.webm']);
const BLUR_WIDTH = 16;

const indexPath = path.join(config.contentRoot, 'media-index.json');
const projectsPath = path.join(config.contentRoot, 'projects.json');

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

/** A 16px-wide webp data URI used as a blurred placeholder while the real photo loads. */
async function blurPlaceholder(file) {
  const buffer = await sharp(file, { animated: false, limitInputPixels: false })
    .resize(BLUR_WIDTH, null, { fit: 'inside' })
    .webp({ quality: 28 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function describePhoto(section, project, filename) {
  const abs = path.join(config.mediaRoot, section, project, filename);
  const ext = path.extname(filename).toLowerCase();
  const stat = fs.statSync(abs);
  const entry = {
    file: filename,
    bytes: stat.size,
    order: orderOf(filename),
    kind: VIDEO_EXT.has(ext) ? 'video' : ext === '.gif' ? 'animated' : 'image',
  };

  if (VIDEO_EXT.has(ext)) return entry;

  try {
    const meta = await sharp(abs, { limitInputPixels: false }).metadata();
    entry.width = meta.width;
    // An animated source reports the whole filmstrip as `height`; pageHeight is
    // the height of a single frame, which is what actually gets displayed.
    entry.height = meta.pageHeight || meta.height;
    entry.frames = meta.pages || 1;
    if (entry.frames > 1) {
      entry.kind = 'animated';
      entry.animatable = await pipeline.canAnimate(abs, stat);
    }
    entry.blur = await blurPlaceholder(abs);
  } catch (err) {
    console.warn(`  ! could not read ${section}/${project}/${filename}: ${err.message}`);
  }
  return entry;
}

async function main() {
  const previous = readJson(indexPath, { projects: {} });
  const projectsDoc = readJson(projectsPath, { sections: {}, projects: {} });
  projectsDoc.sections = projectsDoc.sections || {};
  projectsDoc.projects = projectsDoc.projects || {};

  const index = { generatedAt: new Date().toISOString(), sections: {}, projects: {} };
  let scanned = 0;
  let reused = 0;

  const sections = fs
    .readdirSync(config.mediaRoot)
    .filter((d) => fs.statSync(path.join(config.mediaRoot, d)).isDirectory())
    .sort((a, b) => config.sectionOrder.indexOf(a) - config.sectionOrder.indexOf(b));

  for (const section of sections) {
    const sectionDir = path.join(config.mediaRoot, section);
    const projectSlugs = fs
      .readdirSync(sectionDir)
      .filter((d) => fs.statSync(path.join(sectionDir, d)).isDirectory())
      .sort();

    index.sections[section] = { slug: section, projects: [] };

    for (const slug of projectSlugs) {
      const key = `${section}/${slug}`;
      const files = fs
        .readdirSync(path.join(sectionDir, slug))
        .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) || VIDEO_EXT.has(path.extname(f).toLowerCase()))
        .sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b));

      if (!files.length) continue;

      const prior = previous.projects?.[key];
      const photos = [];
      for (const filename of files) {
        const abs = path.join(sectionDir, slug, filename);
        const cached = prior?.photos?.find((p) => p.file === filename);
        // Re-derive only when the file actually changed.
        const complete = cached && cached.blur && (cached.kind === 'video' || cached.frames !== undefined);
        if (complete && cached.bytes === fs.statSync(abs).size) {
          photos.push(cached);
          reused++;
        } else {
          photos.push(await describePhoto(section, slug, filename));
          scanned++;
        }
      }

      // The cover is the first still image; fall back to the first photo.
      const cover = photos.find((p) => p.kind === 'image') || photos[0];

      index.projects[key] = { section, slug, cover: cover.file, photos };
      index.sections[section].projects.push(slug);

      // Scaffold the editable entry without touching prose that already exists.
      const existing = projectsDoc.projects[key] || {};
      projectsDoc.projects[key] = {
        title: existing.title || titleize(slug),
        description: existing.description ?? '',
        captions: photos.reduce((acc, photo) => {
          acc[photo.file] = existing.captions?.[photo.file] ?? '';
          return acc;
        }, {}),
      };
    }
  }

  // Drop editable entries whose media is gone.
  for (const key of Object.keys(projectsDoc.projects)) {
    if (!index.projects[key]) delete projectsDoc.projects[key];
  }

  fs.mkdirSync(config.contentRoot, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
  fs.writeFileSync(projectsPath, JSON.stringify(projectsDoc, null, 2) + '\n');

  const projectCount = Object.keys(index.projects).length;
  const photoCount = Object.values(index.projects).reduce((n, p) => n + p.photos.length, 0);
  console.log(`Scanned ${projectCount} projects / ${photoCount} photos (${scanned} derived, ${reused} reused)`);
  console.log(`  ${path.relative(process.cwd(), indexPath)}`);
  console.log(`  ${path.relative(process.cwd(), projectsPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
