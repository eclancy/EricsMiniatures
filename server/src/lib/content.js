'use strict';
/**
 * Merges the generated media index with the hand-authored copy in
 * content/projects.json and exposes the shapes the API returns.
 *
 * Both files are read once at boot and cached. In development they are
 * re-read whenever they change on disk so edits show up without a restart.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { titleize } = require('./naming');

const SECTION_META = {
  miniatures: {
    title: 'Miniatures',
    blurb: 'Hand painted miniature creatures, characters, and props. Monsters that can fit in the palm of your hand!',
    bannerTitle: 'Hand Painted Miniatures',
    bannerDescription: 'Creatures of all shapes and sizes - some are nice, some are not...',
    preview: { project: 'blimpy', file: 'blimpy-2.jpg' },
  },
  terrain: {
    title: 'Terrain',
    blurb: 'Sculpted from a wide variety of items including clay, foam, or even trash! Realistic landscapes crafted and painted from basic every day items.',
    bannerTitle: 'Custom Built Terrain',
    bannerDescription: 'Every journey begins somewhere',
    preview: { project: 'temple-interior', file: 'temple-interior-6.jpg' },
  },
  modelkits: {
    title: 'Model Kits',
    blurb: 'Model kits involve tiny plastic parts and following instructions. Not as creative as other projects, but oh so satisfying.',
    bannerTitle: 'Model Kits',
    bannerDescription: 'Robots, laser swords, and tiny parts holding them all together',
    preview: { project: 'gundam-centaur', file: 'gundam-centaur-3.jpg' },
  },
  other: {
    title: 'Other Projects',
    blurb: "Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
    bannerTitle: 'Other Projects',
    bannerDescription: 'Check out some of the other things I spend time on',
    // An animated GIF. The home page used to set it as a CSS background, where
    // it played; the card requests the animated derivative to keep that.
    preview: { project: 'wizard-wars', file: 'wizard-wars-fire-gif.gif' },
  },
};

let cache = null;

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

function build() {
  const index = readJson(path.join(config.contentRoot, 'media-index.json'), { sections: {}, projects: {} });
  const authored = readJson(path.join(config.contentRoot, 'projects.json'), { projects: {} });

  const projects = new Map();
  for (const [key, entry] of Object.entries(index.projects || {})) {
    const copy = authored.projects?.[key] || {};
    const photos = entry.photos.map((photo) => ({
      file: photo.file,
      src: `/media/${entry.section}/${entry.slug}/${photo.file}`,
      width: photo.width || null,
      height: photo.height || null,
      kind: photo.kind,
      // Only animated sources we can actually re-encode get a play affordance.
      animated: photo.kind === 'animated' && photo.animatable !== false,
      blur: photo.blur || null,
      caption: (copy.captions?.[photo.file] || '').trim() || null,
    }));

    projects.set(key, {
      id: key,
      section: entry.section,
      slug: entry.slug,
      title: (copy.title || '').trim() || titleize(entry.slug),
      description: (copy.description || '').trim() || null,
      cover: photos.find((p) => p.file === entry.cover) || photos[0],
      photoCount: photos.length,
      photos,
    });
  }

  const sections = config.sectionOrder
    .filter((slug) => index.sections?.[slug])
    .map((slug) => {
      const slugs = index.sections[slug].projects || [];
      const { preview: previewRef, ...meta } = SECTION_META[slug] || { title: titleize(slug), blurb: '' };
      const members = slugs.map((s) => projects.get(`${slug}/${s}`)).filter(Boolean);

      // The home page card uses a deliberately chosen photo, not whichever
      // project happens to sort first. Falls back to the first cover if the
      // chosen one is ever renamed or removed.
      const chosen = previewRef
        ? projects.get(`${slug}/${previewRef.project}`)?.photos.find((p) => p.file === previewRef.file)
        : null;

      return {
        slug,
        ...meta,
        url: `/gallery/${slug}`,
        projectCount: members.length,
        preview: chosen || members[0]?.cover || null,
      };
    });

  return { index, projects, sections, generatedAt: index.generatedAt || null };
}

function load() {
  if (!cache) cache = build();
  return cache;
}

/** Drop the cached merge so the next request re-reads content/. */
function invalidate() {
  cache = null;
}

// In development, pick up content edits without a restart.
if (process.env.NODE_ENV !== 'production') {
  try {
    fs.watch(config.contentRoot, { persistent: false }, invalidate);
  } catch {
    /* content/ may not exist yet */
  }
}

/** Section list for the home page. */
function getSections() {
  return load().sections;
}

function getSection(slug) {
  return load().sections.find((s) => s.slug === slug) || null;
}

/** Paginated project list, cover photo only - the gallery grid payload. */
function getProjects(sectionSlug, { page = 1, perPage = 10 } = {}) {
  const { projects } = load();
  const all = [...projects.values()].filter((p) => p.section === sectionSlug);
  const total = all.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const slice = all.slice((current - 1) * perPage, current * perPage);

  return {
    page: current,
    perPage,
    pageCount,
    total,
    items: slice.map(({ photos, ...rest }) => rest),
  };
}

/** A single project including every photo - the lightbox payload. */
function getProject(sectionSlug, projectSlug) {
  return load().projects.get(`${sectionSlug}/${projectSlug}`) || null;
}

function getPhoto(sectionSlug, projectSlug, file) {
  const project = getProject(sectionSlug, projectSlug);
  return project ? project.photos.find((p) => p.file === file) || null : null;
}

module.exports = { getSections, getSection, getProjects, getProject, getPhoto, invalidate, load, SECTION_META };
