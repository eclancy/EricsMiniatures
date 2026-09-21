/**
 * Static section metadata.
 *
 * These used to import a full-resolution preview image each, which webpack
 * pulled into the bundle. Preview photos now come from /api/sections; this file
 * only carries the copy, so the header and home page can render before any
 * network request completes.
 */
export const sections = [
  {
    slug: 'miniatures',
    title: 'Miniatures',
    description:
      'Hand painted miniature creatures, characters, and props. Monsters that can fit in the palm of your hand!',
    url: '/gallery/miniatures',
  },
  {
    slug: 'terrain',
    title: 'Terrain',
    description:
      'Sculpted from a wide variety of items including clay, foam, or even trash! Realistic landscapes crafted and painted from basic every day items.',
    url: '/gallery/terrain',
  },
  {
    slug: 'modelkits',
    title: 'Model Kits',
    description:
      'Model kits involve tiny plastic parts and following instructions. Not as creative as other projects, but oh so satisfying.',
    url: '/gallery/modelkits',
  },
  {
    slug: 'other',
    title: 'Other Projects',
    description:
      "Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
    url: '/gallery/other',
  },
];

export default sections;
