'use strict';
/**
 * Merge authored copy into content/projects.json.
 *
 *   node scripts/set-descriptions.js path/to/batch.json
 *
 * The batch file maps a project key to the fields to set:
 *
 *   {
 *     "miniatures/big-kraken": {
 *       "title": "Big Kraken",
 *       "description": "...",
 *       "captions": { "big-kraken-2.jpg": "..." }
 *     }
 *   }
 *
 * Only the fields present are touched, so captions survive a description
 * rewrite and vice versa. Unknown project keys are reported and skipped rather
 * than silently creating orphan entries.
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

const batchPath = process.argv[2];
if (!batchPath) {
  console.error('usage: node scripts/set-descriptions.js <batch.json>');
  process.exit(1);
}

const projectsPath = path.join(config.contentRoot, 'projects.json');
const indexPath = path.join(config.contentRoot, 'media-index.json');

const doc = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

let updated = 0;
const unknownProjects = [];
const unknownPhotos = [];

for (const [key, fields] of Object.entries(batch)) {
  if (!index.projects[key]) {
    unknownProjects.push(key);
    continue;
  }
  const entry = doc.projects[key] || { title: '', description: '', captions: {} };

  if (fields.title !== undefined) entry.title = fields.title;
  if (fields.description !== undefined) entry.description = fields.description;

  if (fields.captions) {
    const known = new Set(index.projects[key].photos.map((p) => p.file));
    for (const [file, caption] of Object.entries(fields.captions)) {
      if (!known.has(file)) {
        unknownPhotos.push(`${key}/${file}`);
        continue;
      }
      entry.captions[file] = caption;
    }
  }

  doc.projects[key] = entry;
  updated++;
}

fs.writeFileSync(projectsPath, JSON.stringify(doc, null, 2) + '\n');

const total = Object.keys(doc.projects).length;
const described = Object.values(doc.projects).filter((p) => (p.description || '').trim()).length;
console.log(`Updated ${updated} projects. ${described}/${total} now have a description.`);
if (unknownProjects.length) console.warn(`  unknown projects skipped: ${unknownProjects.join(', ')}`);
if (unknownPhotos.length) console.warn(`  unknown photos skipped: ${unknownPhotos.join(', ')}`);
