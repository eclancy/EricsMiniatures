'use strict';
/**
 * Builds labelled contact sheets of every project's cover photo.
 *
 * Used when authoring descriptions: reviewing 183 projects one image at a time
 * is impractical, and a 3x3 sheet still shows each piece large enough to tell
 * what it is and roughly how it was made.
 *
 *   node scripts/make-contact-sheets.js <outputDir>
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../src/config');

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: node scripts/make-contact-sheets.js <outputDir>');
  process.exit(1);
}

const COLS = 3;
const ROWS = 3;
const TILE_W = 460;
const TILE_H = 330;
const LABEL_H = 34;
const CELL_H = TILE_H + LABEL_H;

const index = JSON.parse(fs.readFileSync(path.join(config.contentRoot, 'media-index.json'), 'utf8'));

// Every gallery project, in the order the site lists them. Banners excluded.
const projects = [];
for (const section of config.sectionOrder) {
  for (const slug of index.sections[section]?.projects || []) {
    const entry = index.projects[`${section}/${slug}`];
    const cover = entry.photos.find((p) => p.kind === 'image') || entry.photos.find((p) => p.kind === 'animated');
    if (cover) projects.push({ section, slug, file: cover.file, photoCount: entry.photos.length });
  }
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function tile(project, n) {
  const abs = path.join(config.mediaRoot, project.section, project.slug, project.file);
  const img = await sharp(abs, { animated: false, limitInputPixels: false })
    .rotate()
    .resize(TILE_W, TILE_H, { fit: 'cover' })
    .toBuffer();

  const label = `${n}. ${project.section}/${project.slug}  (${project.photoCount})`;
  const svg = Buffer.from(
    `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" fill="#111"/>
       <text x="8" y="23" font-family="monospace" font-size="17" fill="#fff">${escapeXml(label)}</text>
     </svg>`
  );

  return sharp({ create: { width: TILE_W, height: CELL_H, channels: 3, background: '#111' } })
    .composite([
      { input: img, top: 0, left: 0 },
      { input: svg, top: TILE_H, left: 0 },
    ])
    .png()
    .toBuffer();
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const perSheet = COLS * ROWS;
  const sheetCount = Math.ceil(projects.length / perSheet);

  for (let s = 0; s < sheetCount; s++) {
    const group = projects.slice(s * perSheet, (s + 1) * perSheet);
    const composites = [];

    for (let i = 0; i < group.length; i++) {
      composites.push({
        input: await tile(group[i], s * perSheet + i + 1),
        top: Math.floor(i / COLS) * CELL_H,
        left: (i % COLS) * TILE_W,
      });
    }

    const rows = Math.ceil(group.length / COLS);
    const file = path.join(outDir, `sheet-${String(s + 1).padStart(2, '0')}.png`);
    await sharp({ create: { width: COLS * TILE_W, height: rows * CELL_H, channels: 3, background: '#111' } })
      .composite(composites)
      .png({ compressionLevel: 9 })
      .toFile(file);
    console.log(`${path.basename(file)}: ${group.length} projects`);
  }

  fs.writeFileSync(path.join(outDir, 'projects.json'), JSON.stringify(projects, null, 1));
  console.log(`\n${projects.length} projects across ${sheetCount} sheets`);
})();
