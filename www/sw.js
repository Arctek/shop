importScripts('workbox-sw.prod.v2.1.2.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "assets/icon/favicon.ico",
    "revision": "275096c38325fe5f696fff9b9bd3d60d"
  },
  {
    "url": "assets/icon/icon.png",
    "revision": "c044d6355f97557f0c9367678d03e499"
  },
  {
    "url": "build/app.js",
    "revision": "438643b7a6b46e8981d7cb7b36739ac1"
  },
  {
    "url": "build/app/5e3mm8py.js",
    "revision": "d8783a51d88a5fe606e0bd94a40261be"
  },
  {
    "url": "build/app/91hb3by2.js",
    "revision": "b3bbc4e3035df0ea2af26d906032113f"
  },
  {
    "url": "build/app/app.global.js",
    "revision": "905896db4c96c2ffe4285cd63c098ca5"
  },
  {
    "url": "build/app/app.ku5ihkhw.js",
    "revision": "e3a5b040457c8ac9236a43453aba8e3e"
  },
  {
    "url": "build/app/app.pibc9phr.js",
    "revision": "7bae95ac6efb5b10aa7e56b0bbc40ab5"
  },
  {
    "url": "build/app/app.registry.json",
    "revision": "dbe3b029d6e77377d96254aa027e9e4b"
  },
  {
    "url": "build/app/cv7cbtbi.js",
    "revision": "b425d7fba0b1c25730cf13a34af6b556"
  },
  {
    "url": "index.html",
    "revision": "5ccb0ac7ba66077eb5874511075541f4"
  },
  {
    "url": "manifest.json",
    "revision": "fd2e0ff26f2849af39887c3084cb0194"
  }
];

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache(fileManifest);
