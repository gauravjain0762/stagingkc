// Client-side geocoding + distance helpers for the location/radius event
// filter. There's no backend geocoding or coordinates on events yet (see
// eventsSlice normalizeEvent), so addresses are geocoded here, in the
// browser, against OpenStreetMap's free Nominatim API (no key needed).
// Nominatim's usage policy caps unauthenticated traffic at ~1 request/sec,
// so lookups are serialized through a queue and cached indefinitely in
// localStorage (a city's coordinates don't change) to keep repeat filtering
// instant and avoid re-hitting the API for the same address.

const CACHE_KEY = 'kc_geocode_cache_v1';
const MIN_REQUEST_GAP_MS = 1100;

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full/unavailable — cache just won't persist across sessions.
  }
}

let cache = loadCache();
let queueTail = Promise.resolve();

function normalizeQuery(q) {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function fetchGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  const { lat, lon } = results[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

// Resolves an address/city/ZIP string to { lat, lng }, or null if it can't
// be found. Results are cached by normalized query text.
export function geocode(query) {
  const key = normalizeQuery(query || '');
  if (!key) return Promise.resolve(null);
  if (key in cache) return Promise.resolve(cache[key]);

  const run = queueTail.then(async () => {
    // Re-check the cache — an identical in-flight lookup may have just
    // resolved while this one was queued behind the rate limiter.
    if (key in cache) return cache[key];
    let coords;
    try {
      coords = await fetchGeocode(query);
    } catch {
      coords = null;
    }
    cache[key] = coords;
    saveCache(cache);
    return coords;
  });
  // Chain the next queued lookup after this one's rate-limit delay,
  // regardless of whether this lookup succeeded or failed.
  queueTail = run.then(
    () => new Promise(r => setTimeout(r, MIN_REQUEST_GAP_MS)),
    () => new Promise(r => setTimeout(r, MIN_REQUEST_GAP_MS)),
  );
  return run;
}

// Seeds the geocode cache for a query string with already-known coordinates
// (e.g. after "Use my location" resolves via the browser's Geolocation API),
// so the subsequent forward geocode() of its reverse-geocoded label is a
// cache hit instead of a redundant network round trip.
export function primeGeocode(query, coords) {
  const key = normalizeQuery(query || '');
  if (!key) return;
  cache[key] = coords;
  saveCache(cache);
}

const EARTH_RADIUS_MI = 3958.8;
const EARTH_RADIUS_KM = 6371;

// Great-circle distance between two coordinates.
export function haversineDistance(lat1, lng1, lat2, lng2, unit = 'mi') {
  const R = unit === 'km' ? EARTH_RADIUS_KM : EARTH_RADIUS_MI;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function milesToKm(mi) { return mi * 1.60934; }
export function kmToMiles(km) { return km / 1.60934; }

// Reverse-geocodes coordinates to a short human-readable label (e.g. "Olympia,
// Washington, United States") so "Use my location" can show something
// meaningful in the location text field instead of raw numbers.
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address;
    if (!a) return data?.display_name ?? null;
    const parts = [a.city || a.town || a.village || a.county, a.state, a.country].filter(Boolean);
    return parts.join(', ') || data?.display_name || null;
  } catch {
    return null;
  }
}

// Wraps the browser Geolocation API in a promise, resolving { lat, lng }.
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation is not supported by this browser.')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

// Builds the best-effort address string to geocode an event by, preferring
// the fullest structured data available and falling back to city/state/
// country only (still enough for an approximate radius match).
export function addressForGeocode(locationObj) {
  if (!locationObj) return '';
  const { street, city, state, country, pinCode } = locationObj;
  const parts = [street, city, state, pinCode, country].filter(Boolean);
  return parts.join(', ');
}
