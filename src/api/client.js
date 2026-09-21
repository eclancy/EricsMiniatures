/**
 * Thin client for the media API.
 *
 * In development CRA proxies /api and /media to the Node server (see the
 * "proxy" field in package.json). In production both are served from the same
 * origin, so relative URLs work everywhere. REACT_APP_API_BASE overrides that
 * if the API ever moves to its own host or a CDN.
 */
const BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

// Responses are small and highly cacheable; remembering them makes paging back
// and forth through a gallery instant.
const cache = new Map();

async function getJson(path, { signal } = {}) {
  if (cache.has(path)) return cache.get(path);

  const promise = fetch(`${BASE}${path}`, { signal, headers: { Accept: 'application/json' } }).then((res) => {
    if (!res.ok) {
      const error = new Error(`Request failed: ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  });

  // Cache the promise, not the result, so concurrent callers share one request.
  cache.set(path, promise);
  promise.catch(() => cache.delete(path));
  return promise;
}

export function fetchSections(options) {
  return getJson('/api/sections', options);
}

export function fetchGallery(section, { page = 1, perPage = 10, ...options } = {}) {
  return getJson(`/api/gallery/${section}?page=${page}&perPage=${perPage}`, options);
}

export function fetchProject(section, project, options) {
  return getJson(`/api/projects/${section}/${project}`, options);
}

/** Absolute URL for a derivative of a photo. */
export function mediaUrl(src, { width, format, animated } = {}) {
  const params = new URLSearchParams();
  if (width) params.set('w', String(width));
  if (format) params.set('fmt', format);
  if (animated) params.set('animated', '1');
  const query = params.toString();
  return `${BASE}${src}${query ? `?${query}` : ''}`;
}

/** A srcset string across the given widths. */
export function srcSetFor(src, widths) {
  return widths.map((w) => `${mediaUrl(src, { width: w })} ${w}w`).join(', ');
}
