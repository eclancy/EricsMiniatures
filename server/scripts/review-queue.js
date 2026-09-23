'use strict';
/**
 * Lists projects still awaiting a description review, in the order the site
 * shows them.
 *
 * The descriptions were drafted from 460px contact sheets, so some got details
 * wrong (a serving tray read as a top hat, poured water as ice). This walks the
 * gallery in order so each can be checked against the real photo.
 *
 *   node scripts/review-queue.js          next few pending
 *   node scripts/review-queue.js --count  progress summary only
 *   node scripts/review-queue.js --all    every pending project
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

const contentDir = config.contentRoot;
const doc = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(contentDir, 'media-index.json'), 'utf8'));

// Gallery order: an explicit `order` first, then alphabetical, section by section.
const ordered = [];
for (const section of config.sectionOrder) {
  const slugs = index.sections?.[section]?.projects || [];
  const rows = slugs
    .map((slug) => {
      const key = `${section}/${slug}`;
      return { key, section, slug, entry: doc.projects[key], media: index.projects[key] };
    })
    .filter((r) => r.entry && r.media)
    .sort((a, b) => {
      const ax = Number.isFinite(a.entry.order) ? a.entry.order : Number.MAX_SAFE_INTEGER;
      const bx = Number.isFinite(b.entry.order) ? b.entry.order : Number.MAX_SAFE_INTEGER;
      return ax - bx || a.slug.localeCompare(b.slug);
    });
  ordered.push(...rows);
}

const pending = ordered.filter((r) => !r.entry.reviewed);
const done = ordered.length - pending.length;

if (process.argv.includes('--count')) {
  console.log(`${done}/${ordered.length} reviewed, ${pending.length} pending`);
  process.exit(0);
}

const limit = process.argv.includes('--all') ? pending.length : 3;
console.log(`${done}/${ordered.length} reviewed, ${pending.length} pending\n`);

for (const row of pending.slice(0, limit)) {
  const photos = row.media.photos.filter((p) => p.kind !== 'video');
  console.log(row.key);
  console.log(`  title:  ${row.entry.title}`);
  console.log(`  photos: ${row.media.photos.length}  cover: ${row.media.cover}`);
  console.log(`  url:    https://ericsminiatures.com/media/${row.section}/${row.slug}/${row.media.cover}?w=1400`);
  photos.slice(0, 6).forEach((p) => {
    console.log(`          https://ericsminiatures.com/media/${row.section}/${row.slug}/${p.file}?w=1400`);
  });
  console.log(`  text:   ${row.entry.description || '(none)'}`);
  console.log();
}
