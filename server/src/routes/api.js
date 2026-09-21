'use strict';
/**
 * JSON API. Everything the client needs to render a gallery without pulling a
 * single byte of image data into the JS bundle.
 */
const express = require('express');
const config = require('../config');
const content = require('../lib/content');

const router = express.Router();

const revalidate = `public, max-age=${config.metadataMaxAge}, stale-while-revalidate=86400`;
const withCache = (res) => res.setHeader('Cache-Control', revalidate);

/** GET /api/sections - home page cards. */
router.get('/sections', (req, res) => {
  withCache(res);
  res.json({ sections: content.getSections() });
});

/** GET /api/gallery/:section?page=1&perPage=10 - paginated grid. */
router.get('/gallery/:section', (req, res) => {
  const section = content.getSection(req.params.section);
  if (!section) return res.status(404).json({ error: 'Unknown section', section: req.params.section });

  const page = Number(req.query.page) || 1;
  const perPage = Math.min(Math.max(Number(req.query.perPage) || 10, 1), 60);
  const result = content.getProjects(section.slug, { page, perPage });

  withCache(res);
  res.json({ section, ...result });
});

/** GET /api/projects/:section/:project - every photo for the lightbox. */
router.get('/projects/:section/:project', (req, res) => {
  const project = content.getProject(req.params.section, req.params.project);
  if (!project) return res.status(404).json({ error: 'Unknown project' });

  withCache(res);
  res.json({ project });
});

/** GET /api/health - for uptime checks and deploy smoke tests. */
router.get('/health', (req, res) => {
  const { projects, generatedAt } = content.load();
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    projects: projects.size,
    photos: [...projects.values()].reduce((n, p) => n + p.photoCount, 0),
    indexGeneratedAt: generatedAt,
    uptime: Math.round(process.uptime()),
  });
});

module.exports = router;
