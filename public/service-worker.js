/**
 * Tombstone for the service worker shipped by the previous build.
 *
 * That build registered a Workbox service worker which precached the whole app.
 * Anyone who visited the old site still has it registered, and it would keep
 * serving the old precached bundle indefinitely - deleting this file is not
 * enough, because a 404 on the update check leaves the existing worker active.
 *
 * This replacement takes over, drops every cache it created, unregisters
 * itself, and reloads any open tabs onto the current site. Once a visitor has
 * run it, they are back to plain network requests.
 *
 * Safe to delete once enough time has passed that returning visitors have all
 * picked it up.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();

      // Reload open tabs so they leave the old bundle behind immediately.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
