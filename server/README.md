# Media API

Serves the photos and project metadata for ericsminiatures.com.

Before this existed, every image lived in `src/Images/` and webpack pulled all
1.7 GB of it into the bundle: the production build was 1.6 GB, and opening a
gallery page downloaded ten full-resolution originals (20–30 MB) to display
them at roughly 700 px wide. The server now owns the images, resizes them on
demand, and hands the client only metadata.

## Layout

```
media/                originals, never served directly
  <section>/<project>/<file>
  banners/site/<file> banner artwork
content/
  media-index.json    generated: dimensions, byte sizes, blur placeholders
  projects.json       hand-authored: titles, descriptions, per-photo captions
.media-cache/         generated derivatives, safe to delete
server/src/           the API
```

## Running locally

```bash
cd server && npm install     # once
npm start                    # API on :4000

# in another shell, from the repo root
npm start                    # CRA dev server on :3000, proxies /api and /media
```

## Endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/sections` | Section cards for the home page |
| `GET /api/gallery/:section?page=&perPage=` | Paginated project list with cover photos |
| `GET /api/projects/:section/:project` | One project with every photo and caption |
| `GET /api/health` | Status, project/photo counts, index timestamp |
| `GET /media/:section/:project/:file` | An image derivative |

### Image parameters

- `?w=640` — target width. Snapped to the nearest allowed size
  (`config.allowedWidths`) so a caller cannot fill the disk with arbitrary
  dimensions. Images are never upscaled past their original width.
- `?fmt=avif|webp|jpeg` — override format selection. By default the server reads
  the `Accept` header and returns AVIF, then WebP, then JPEG.
- `?animated=1` — for GIF sources, return animated WebP rather than a still
  first frame. The grid requests stills; only the lightbox asks for animation.

Only files present in `media-index.json` are reachable, so the file path is
rebuilt from the index rather than from the request — path traversal is not
possible.

Derivatives are cached on disk under `.media-cache/`, keyed by the source's size
and mtime, so replacing an original invalidates its derivatives automatically.
Responses carry `Cache-Control: immutable` plus a strong `ETag`, and `Vary:
Accept` so shared caches do not hand an AVIF to a browser that cannot read it.

## Scripts

```bash
npm run scan        # rebuild media-index.json, scaffold new projects.json entries
npm run prewarm     # generate the derivatives visitors hit first
npm run prewarm -- --all   # every photo at every width (slow, thorough)

node scripts/generate-banner-assets.js   # refresh src/Components/Shared/bannerAssets.js
node scripts/set-descriptions.js batch.json   # merge authored copy into projects.json
node scripts/make-contact-sheets.js <dir>     # labelled sheets of every cover photo
```

`scan` is incremental: photos whose byte size is unchanged keep their existing
dimensions and blur placeholder instead of being re-read.

## Adding a project

1. Drop the photos in `media/<section>/<project-slug>/`. Name them
   `<project-slug>-1.jpg`, `-2.jpg`, and so on; the lowest number becomes the
   cover.
2. `npm run scan` — the new project appears in `content/projects.json` with a
   title derived from the folder name and an empty description.
3. Write the description and any per-photo captions in `content/projects.json`.
4. `npm run prewarm`, then restart the service.

## Configuration

All settings live in `src/config.js` and can be overridden by environment
variable: `PORT`, `HOST`, `MEDIA_ROOT`, `CONTENT_ROOT`, `CACHE_ROOT`,
`CLIENT_ROOT`, `SERVE_CLIENT`, `CORS_ORIGINS`.

Two matter on a small host:

- `MAX_CONCURRENT_ENCODES` (default 2) caps how many images are resized at
  once. A single encode of a 24 MP photo holds about 160 MB, so without a cap a
  burst of cold requests could exhaust a 1 GB VPS. Requests above the cap queue
  rather than fail. Use 1 on a 512 MB host.
- `AVIF_EFFORT` (default 4) trades encode time against file size. Dropping to
  2 makes a cold AVIF encode roughly 4x faster for about 15% more bytes.

When `SERVE_CLIENT` is not `false` and `CLIENT_ROOT` exists, the API also serves
the built React app, including the single-page-app fallback. In production nginx
serves those files directly and only proxies `/api` and `/media` here.
