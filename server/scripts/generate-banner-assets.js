'use strict';
/**
 * Writes src/Components/Shared/bannerAssets.js from the media index.
 *
 * Banners are the largest above-the-fold images on the site, so they must start
 * downloading without waiting for an API round trip. Baking their dimensions
 * and blur placeholders into a small generated module gives the Banner
 * component everything it needs at first paint, while the image bytes still
 * come from the media API.
 *
 * Re-run after changing banner artwork:  npm run scan && node scripts/generate-banner-assets.js
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

const OUT = path.join(config.contentRoot, '..', 'src', 'Components', 'Shared', 'bannerAssets.js');

// Which artwork each banner slot uses. `slim` renders below 990px, `large`
// above - they are different crops, not just different sizes.
const BANNERS = {
  home: { slim: 'full-banner-purple-worm-slim.jpg', large: 'zoomed-banner-purple-worm4.jpg' },
  miniatures: { slim: 'clockwork-dragon-banner-high-contrast.jpg', large: 'sludge-monstrosity.jpg' },
  terrain: { slim: 'docks-small-banner.jpg', large: 'prisma-wall-banner.jpg' },
  modelkits: { slim: 'gundam-chibi-banner.jpg', large: 'gold-unicorn-banner.jpg' },
  other: { slim: 'mothers-day-diorama.jpg', large: 'coin-banner.jpg' },
};

const index = JSON.parse(fs.readFileSync(path.join(config.contentRoot, 'media-index.json'), 'utf8'));
const banners = index.projects['banners/site'];
if (!banners) throw new Error('media-index.json has no banners/site entry - run scan-media.js first');

const byFile = new Map(banners.photos.map((p) => [p.file, p]));

const resolve = (file) => {
  const photo = byFile.get(file);
  if (!photo) throw new Error(`banner artwork not found in media index: ${file}`);
  return {
    src: `/media/banners/site/${file}`,
    width: photo.width,
    height: photo.height,
    blur: photo.blur,
  };
};

const assets = Object.fromEntries(
  Object.entries(BANNERS).map(([slot, { slim, large }]) => [slot, { slim: resolve(slim), large: resolve(large) }])
);

const body = `/**
 * GENERATED FILE - do not edit by hand.
 * Produced by server/scripts/generate-banner-assets.js from content/media-index.json.
 *
 * Banner artwork is served by the media API, but its dimensions and blur
 * placeholders are baked in here so the banner can render at the correct
 * aspect ratio on the very first paint.
 */
const bannerAssets = ${JSON.stringify(assets, null, 2)};

export default bannerAssets;
`;

fs.writeFileSync(OUT, body);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${Object.keys(assets).length} banners)`);
