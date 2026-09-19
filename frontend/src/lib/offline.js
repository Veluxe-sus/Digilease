// The receiver's offline copy of one link, in Cache Storage under /offline/{token}/card|photo|area|route,
// plus the page's own files so /s/{token} opens with no network (public/sw.js serves them).
const CACHE = "pata-card";
const PARTS = ["card", "photo", "area", "route"];
const key = (token, part) => `/offline/${encodeURIComponent(token)}/${part}`;

export const canSaveOffline = () => typeof caches !== "undefined";

export async function saveJson(token, part, data) {
  const cache = await caches.open(CACHE);
  await cache.put(key(token, part), new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } }));
}

export async function savePhoto(token, blob) {
  const cache = await caches.open(CACHE);
  await cache.put(key(token, "photo"), new Response(blob, { headers: { "content-type": blob.type } }));
}

export async function deleteCopy(token) {
  const cache = await caches.open(CACHE);
  await Promise.all(PARTS.map((part) => cache.delete(key(token, part))));
}

// The saved copy, or null. A copy whose link has expired (by this phone's clock) is deleted, never shown.
export async function loadCopy(token, nowSeconds = Date.now() / 1000) {
  const cache = await caches.open(CACHE);
  const read = async (part) => {
    const res = await cache.match(key(token, part));
    return res ? res.json() : null;
  };
  const card = await read("card");
  if (!card) return null;
  if (card.expiresAt != null && card.expiresAt <= nowSeconds) {
    await deleteCopy(token);
    return null;
  }
  const photo = await cache.match(key(token, "photo"));
  return {
    card,
    area: await read("area"),
    route: await read("route"),
    photoUrl: photo ? URL.createObjectURL(await photo.blob()) : null,
  };
}

// Every same-origin file this page has loaded, plus the entry page and the map worker
// (a module worker's fetches don't always show up as resource entries).
export async function saveAppShell() {
  const urls = new Set(["/", "/index.html", "/maplibre/maplibre-gl-worker.mjs", "/maplibre/maplibre-gl-shared.mjs"]);
  for (const entry of performance.getEntriesByType("resource")) {
    const url = new URL(entry.name);
    if (url.origin === location.origin) urls.add(url.pathname);
  }
  const cache = await caches.open(CACHE);
  const results = await Promise.allSettled([...urls].map((url) => cache.add(url)));
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed) throw new Error(`${failed} page files could not be saved`);
}
