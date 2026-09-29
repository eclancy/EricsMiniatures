'use strict';
/**
 * Lists descriptions that assert something a photograph cannot settle.
 *
 * Colour, pose and composition are visible. How a piece was made is not: a
 * smooth pink model could be printed, cast or sculpted, and a glow could be an
 * LED or paint. Those claims came from the drafts and need the maker to
 * confirm or correct them.
 *
 *   node scripts/list-guesses.js          grouped summary
 *   node scripts/list-guesses.js --full   every match with its description
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

const doc = JSON.parse(fs.readFileSync(path.join(config.contentRoot, 'projects.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(config.contentRoot, 'media-index.json'), 'utf8'));

// Each pattern is something a photo cannot confirm on its own.
const CLAIMS = [
  ['how it was made', /\b(printed|print-in-place|3d[- ]print\w*|resin|cast|kitbash\w*|sculpt\w*|snapped together|built from a kit|out of the box|straight from the kit)\b/i],
  ['what it is made of', /\b(wire|steel wool|wool|clay|foam|balsa|jeweller's chain|real chain|glass|brass|pewter|acrylic)\b/i],
  ['painting technique', /\b(drybrush\w*|glaz\w*|stippl\w*|freehand\w*|wash(es)?|airbrush\w*|underpaint\w*|sealed|gloss[- ]coated)\b/i],
  ['lights or electronics', /\b(LED|lit from inside|light\w* from|glows? from|infinity mirror|rigged with)\b/i],
  ['how it is built or used', /\b(modular|lifts? apart|connect in different|swings? clear|pivot\w*|print bed|support removal|hollow)\b/i],
];

const rows = [];
for (const [key, entry] of Object.entries(doc.projects)) {
  const text = (entry.description || '').trim();
  if (!text) continue;
  const hits = [];
  for (const [label, re] of CLAIMS) {
    const m = text.match(re);
    if (m) hits.push({ label, phrase: m[0] });
  }
  if (hits.length) {
    const media = index.projects[key];
    rows.push({ key, title: entry.title, text, hits, cover: media && media.cover });
  }
}

// Gallery order, so the walkthrough follows the site.
rows.sort((a, b) => a.key.localeCompare(b.key));

if (process.argv.includes('--full')) {
  rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.key}`);
    console.log(`   claims: ${r.hits.map((h) => `${h.phrase} (${h.label})`).join('; ')}`);
    console.log(`   photo:  https://ericsminiatures.com/media/${r.key}/${r.cover}?w=1400`);
    console.log(`   text:   ${r.text}`);
    console.log();
  });
} else {
  const byLabel = {};
  rows.forEach((r) => r.hits.forEach((h) => (byLabel[h.label] = (byLabel[h.label] || 0) + 1)));
  console.log(`${rows.length} descriptions assert something a photo cannot settle\n`);
  Object.entries(byLabel)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, n]) => console.log(`  ${String(n).padStart(3)}  ${label}`));
  console.log('\nRun with --full to list them.');
}
