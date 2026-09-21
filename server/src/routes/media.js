'use strict';
/**
 * GET /media/:section/:project/:file
 *
 *   ?w=640                target width, snapped to config.allowedWidths
 *   ?fmt=avif|webp|jpeg   override content negotiation
 *   ?animated=1           for GIF sources, return animated WebP instead of a
 *                         still first frame. The grid asks for stills; only the
 *                         lightbox pays for the animation.
 *
 * Video is streamed from disk; sharp cannot transcode it.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const config = require('../config');
const content = require('../lib/content');
const pipeline = require('../lib/imagePipeline');

const router = express.Router();

const MIME = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  avif: 'image/avif',
  webp: 'image/webp',
  jpeg: 'image/jpeg',
};

const immutable = `public, max-age=${config.immutableMaxAge}, immutable`;

router.get('/:section/:project/:file', async (req, res, next) => {
  const { section, project, file } = req.params;

  // Only files the scan actually indexed are reachable. Because the path is
  // rebuilt from the index rather than from user input, traversal is a non-issue.
  const photo = content.getPhoto(section, project, file);
  if (!photo) return next();

  const absSource = path.join(config.mediaRoot, section, project, file);
  const ext = path.extname(file).toLowerCase();

  // Video: stream the original so Express can answer range requests.
  if (config.passthroughExtensions.includes(ext)) {
    res.setHeader('Cache-Control', immutable);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    return res.sendFile(absSource);
  }

  const wantsAnimation = ext === '.gif' && req.query.animated === '1';

  try {
    const format = pipeline.negotiateFormat(req.query.fmt, req.headers.accept || '');
    const width = wantsAnimation
      ? Math.min(Number(req.query.w) || config.maxAnimatedWidth, config.maxAnimatedWidth)
      : req.query.w;

    const derivative = await pipeline.getDerivative(absSource, `${section}/${project}/${file}`, width, format, {
      animated: wantsAnimation,
    });
    const etag = pipeline.etagFor(derivative.path);

    res.setHeader('Cache-Control', immutable);
    res.setHeader('Content-Type', MIME[derivative.format]);
    res.setHeader('ETag', etag);
    // Caches must key on Accept, since the same URL yields avif or jpeg.
    res.setHeader('Vary', 'Accept');
    res.setHeader('X-Image-Cache', derivative.fromCache ? 'HIT' : 'MISS');

    if (req.headers['if-none-match'] === etag) return res.status(304).end();

    fs.createReadStream(derivative.path).on('error', next).pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
