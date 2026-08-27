// Mini Sites API returns Mongo-style `_id` — normalized to `id` here so every
// component (dashboard, create form, builder, public preview) can consume a
// single consistent shape, same defensive pattern as normalizeAttendee etc.
export function normalizeSite(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw._id ?? '',
    // /api/mini-sites (owner-scoped) returns a flat `userId`; /browse (the
    // cross-user gallery) nests it under `creator` instead — accept both.
    userId: raw.userId ?? raw.creator?.id ?? raw.creator?._id ?? '',
    creatorName: raw.creator?.name ?? '',
    creatorAvatar: raw.creator?.avatar ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    slug: raw.slug ?? '',
    // Backend returns status/visibility in UPPERCASE ("LIVE", "PUBLIC", ...)
    // but every comparison in this app checks lowercase — normalize here so
    // "site.status === 'live'" keeps working everywhere else unmodified.
    visibility: (raw.visibility ?? 'private').toLowerCase(),
    status: (raw.status ?? 'draft').toLowerCase(),
    coverImage: raw.coverImage ?? '',
    logo: raw.logo ?? '',
    coverImages: Array.isArray(raw.coverImages) ? raw.coverImages : [],
    contactInfo: raw.contactInfo ?? {},
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    sectionsCount: raw.sectionsCount ?? (Array.isArray(raw.sections) ? raw.sections.length : 0),
    views: raw.views ?? 0,
    reported: raw.reported ?? false,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    publishedAt: raw.publishedAt ?? null,
    publishedUrl: raw.publishedUrl ?? '',
  };
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week} week${week === 1 ? '' : 's'} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} month${month === 1 ? '' : 's'} ago`;
  const yr = Math.floor(day / 365);
  return `${yr} year${yr === 1 ? '' : 's'} ago`;
}

// The public site URL is served from this same SPA (no real kicksite.io
// domain exists) via a `?site=<slug>` param that App.jsx reads before the
// auth gate, so it works for logged-out visitors too.
export function publicSiteUrl(slug) {
  return `${window.location.origin}${window.location.pathname}?site=${encodeURIComponent(slug)}`;
}

// The real, clickable URL for a site — prefers the backend's own
// `publishedUrl` (now that it correctly returns this deployment's real
// domain) and only falls back to computing it locally for a site that
// hasn't been published yet and so has no publishedUrl from the API.
export function siteUrl(site) {
  return site?.publishedUrl || publicSiteUrl(site?.slug ?? '');
}

// Strips the protocol for compact display on cards, e.g.
// "https://kick-analyst-frontend-yupf.vercel.app/?site=x" -> "kick-analyst-frontend-yupf.vercel.app/?site=x".
export function displayUrl(url) {
  return (url || '').replace(/^https?:\/\//, '');
}
