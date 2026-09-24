'use strict';
/**
 * Contact sheets for the description review, covering only projects still
 * marked unreviewed, in gallery order.
 *
 * Deliberately 2x2 at 780px per tile rather than the 3x3 at 460px used by
 * make-contact-sheets.js. The original descriptions were drafted from those
 * smaller tiles and got details wrong - a serving tray read as a top hat, a
 * loxodon's trunk as horns, poured water as ice. Roughly three times the
 * detail per tile is the whole point of this script.
 *
 *   node scripts/make-review-sheets.js <outputDir>
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../src/config');

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: node scripts/make-review-sheets.js <outputDir>');
  process.exit(1);
}

const COLS = 2;
const ROWS = 2;
const TILE_W = 780;
const TILE_H = 580;
const LABEL_H = 34;
const CELL_H = TILE_H + LABEL_H;

const contentDir = config.contentRoot;
const doc = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(contentDir, 'media-index.json'), 'utf8'));

const pending = [];
for (const section of config.sectionOrder) {
  const slugs = index.sections?.[section]?.projects || [];
  const rows = slugs
    .map((slug) => ({ key: `${section}/${slug}`, section, slug }))
    .filter((r) => doc.projects[r.key] && index.projects[r.key] && !doc.projects[r.key].reviewed)
    .sort((a, b) => {
      const ao = doc.projects[a.key].order;
      const bo = doc.projects[b.key].order;
      const ax = Number.isFinite(ao) ? ao : Number.MAX_SAFE_INTEGER;
      const bx = Number.isFinite(bo) ? bo : Number.MAX_SAFE_INTEGER;
      return ax - bx || a.slug.localeCompare(b.slug);
    });
  pending.push(...rows);
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function tile(project, n) {
  const media = index.projects[project.key];
  const cover = media.photos.find((p) => p.kind === 'image') || media.photos[0];
  const abs = path.join(config.mediaRoot, project.section, project.slug, cover.file);

  // `contain` rather than `cover`: a crop could hide the very detail being
  // checked, which is how some of these went wrong the first time.
  const img = await sharp(abs, { animated: false, limitInputPixels: false })
    .rotate()
    .resize(TILE_W, TILE_H, { fit: 'contain', background: '#111' })
    .toBuffer();

  const label = `${n}. ${project.key}`;
  const svg = Buffer.from(
    `<svg width="${TILE_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" fill="#111"/>
       <text x="8" y="23" font-family="monospace" font-size="18" fill="#fff">${escapeXml(label)}</text>
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
  const sheetCount = Math.ceil(pending.length / perSheet);

  for (let s = 0; s < sheetCount; s++) {
    const group = pending.slice(s * perSheet, (s + 1) * perSheet);
    const composites = [];
    for (let i = 0; i < group.length; i++) {
      composites.push({
        input: await tile(group[i], s * perSheet + i + 1),
        top: Math.floor(i / COLS) * CELL_H,
        left: (i % COLS) * TILE_W,
      });
    }
    const rows = Math.ceil(group.length / COLS);
    const file = path.join(outDir, `rev-${String(s + 1).padStart(2, '0')}.png`);
    await sharp({ create: { width: COLS * TILE_W, height: rows * CELL_H, channels: 3, background: '#111' } })
      .composite(composites)
      .png({ compressionLevel: 9 })
      .toFile(file);
  }

  // The descriptions alongside, so each sheet can be checked against its text.
  const manifest = pending.map((p, i) => ({
    n: i + 1,
    key: p.key,
    sheet: `rev-${String(Math.floor(i / perSheet) + 1).padStart(2, '0')}.png`,
    title: doc.projects[p.key].title,
    description: doc.projects[p.key].description,
  }));
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1));

  console.log(`${pending.length} pending projects across ${sheetCount} sheets (2x2 @ ${TILE_W}px)`);
})();
