'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const apiRoutes = require('./routes/api');
const mediaRoutes = require('./routes/media');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('etag', false); // routes set their own strong ETags

  app.use(
    helmet({
      // The CRA bundle and Google Analytics need looser defaults than helmet's,
      // and images are served cross-origin to the CDN/browser.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(cors({ origin: config.corsOrigins, maxAge: 86400 }));

  // Compress JSON and HTML. Images are already compressed - re-gzipping them
  // burns CPU for nothing.
  app.use(
    compression({
      filter: (req, res) => {
        const type = res.getHeader('Content-Type') || '';
        if (typeof type === 'string' && (type.startsWith('image/') || type.startsWith('video/'))) return false;
        return compression.filter(req, res);
      },
    })
  );

  app.use('/api', apiRoutes);
  app.use('/media', mediaRoutes);

  // Optionally serve the built React app from the same process.
  if (config.serveClient && fs.existsSync(config.clientRoot)) {
    app.use(
      express.static(config.clientRoot, {
        index: false,
        setHeaders: (res, filePath) => {
          // CRA fingerprints everything under /static, so it can be cached hard.
          if (filePath.includes(`${path.sep}static${path.sep}`)) {
            res.setHeader('Cache-Control', `public, max-age=${config.immutableMaxAge}, immutable`);
          } else {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          }
        },
      })
    );

    // Client-side routing: anything not matched above renders index.html.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/media')) return next();
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(config.clientRoot, 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl} ->`, err.message);
    if (res.headersSent) return req.destroy();
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
