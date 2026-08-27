import { useEffect, useRef, useState } from 'react';
import { geocode, haversineDistance, addressForGeocode } from '../utils/geo';

// Resolves a free-text search location plus a set of events' addresses to
// coordinates, then returns each event's distance from the search point.
// Geocoding is client-side (see utils/geo.js) since neither the search
// location nor events carry coordinates today — this hook is what makes the
// "Location" + "Radius" filters actually work against real addresses.
//
// `events` only needs `id` and `locationObj` (city/state/country/etc.).
// Returns:
//   distanceById  — { [eventId]: milesOrKmOrNull } for events resolved so far
//   resolving     — true while any lookup (search point or events) is in flight
//   searchCoords  — { lat, lng } for the resolved search location, or null
export default function useRadiusFilter(events, searchLocation, unit = 'mi', enabled = true) {
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchFailed, setSearchFailed] = useState(false);
  const [coordsById, setCoordsById] = useState({});
  const [resolving, setResolving] = useState(false);
  const resolvedRef = useRef(new Set());

  useEffect(() => {
    if (!enabled || !searchLocation.trim()) { setSearchCoords(null); setSearchFailed(false); return; }
    let cancelled = false;
    setSearchCoords(null);
    setSearchFailed(false);
    geocode(searchLocation).then(coords => {
      if (cancelled) return;
      setSearchCoords(coords);
      setSearchFailed(!coords);
    });
    return () => { cancelled = true; };
  }, [enabled, searchLocation]);

  useEffect(() => {
    if (!enabled || !searchLocation.trim()) return;
    const pending = events.filter(ev => ev.locationObj && !resolvedRef.current.has(ev.id));
    if (pending.length === 0) return;
    let cancelled = false;
    setResolving(true);
    (async () => {
      for (const ev of pending) {
        if (cancelled) break;
        resolvedRef.current.add(ev.id);
        // Prefer coordinates the backend already stored on the venue (real
        // pin, not a geocoded guess) — only fall back to geocoding the
        // address for events saved before the backend captured lat/lng.
        const loc = ev.locationObj;
        const lat = loc.latitude ?? loc.lat;
        const lng = loc.longitude ?? loc.lng;
        let coords = (typeof lat === 'number' && typeof lng === 'number') ? { lat, lng } : null;
        if (!coords) {
          const address = addressForGeocode(loc);
          coords = address ? await geocode(address) : null;
        }
        if (cancelled) break;
        setCoordsById(prev => ({ ...prev, [ev.id]: coords }));
      }
      if (!cancelled) setResolving(false);
    })();
    return () => { cancelled = true; };
  }, [enabled, searchLocation, events]);

  const distanceById = {};
  if (searchCoords) {
    for (const ev of events) {
      const c = coordsById[ev.id];
      if (c) distanceById[ev.id] = haversineDistance(searchCoords.lat, searchCoords.lng, c.lat, c.lng, unit);
    }
  }

  return { distanceById, resolving, searchCoords, searchFailed };
}
