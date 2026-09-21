'use strict';
const config = require('./config');
const content = require('./lib/content');
const { createApp } = require('./app');

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  const { projects } = content.load();
  console.log(`Eric's Miniatures API listening on http://${config.host}:${config.port}`);
  console.log(`  media:   ${config.mediaRoot}`);
  console.log(`  cache:   ${config.cacheRoot}`);
  console.log(`  indexed: ${projects.size} projects`);
});

// Keep connections alive slightly longer than a typical upstream proxy, so the
// proxy - not the app - is the one that closes idle sockets.
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
