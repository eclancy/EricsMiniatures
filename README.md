# Eric's Miniatures

Personal website for my arts and crafts, as well as some other projects.

React + Material-UI + SASS on the front end, with a small Node/Express service
that stores the photos and serves resized, format-negotiated derivatives of
them.

## Running locally

```bash
npm install
cd server && npm install && cd ..

npm run server    # media API on http://localhost:4000
npm start         # site on http://localhost:3000, proxying /api and /media
```

Both need to be running. The dev server proxies image and API requests to the
Node service, so the same relative URLs work in development and production.

## Layout

```
src/        React app. Contains no gallery photos - only the logo.
media/      Original photos, organised as <section>/<project>/<file>
content/    Project titles, descriptions and captions, plus the generated index
server/     The media API (see server/README.md)
deploy/     systemd unit, nginx config and server setup notes
```

## Adding photos

```bash
# 1. add files to media/<section>/<project-slug>/
npm run scan          # index them and scaffold a projects.json entry
# 2. write the description in content/projects.json
```

See [server/README.md](server/README.md) for the API, the image parameters and
the full set of scripts, and [deploy/README.md](deploy/README.md) for server
setup.

[docs/IDEAS.md](docs/IDEAS.md) collects things we have discussed but not built,
including automatic cropping of the gallery covers.

## Why the images are not in the bundle

`src/Images/` used to hold every photo, and `require.context` pulled all of them
into the webpack build. That made the production build 1.6 GB, and a gallery
page served ten untouched originals — often 20–30 MB — to render them at about
700 px wide.

Photos now live in `media/`, outside the bundle. The client fetches metadata
from the API and requests each image at the width it will actually display;
the server resizes once, caches the result on disk, and picks AVIF, WebP or
JPEG from the browser's `Accept` header.

| | before | after |
| --- | --- | --- |
| production build | 1.6 GB | 2.5 MB |
| gallery page, 10 covers | 21–31 MB | ~0.25 MB |
