/**
 * Keeps HomePage's in-memory `section` (and whatever a page reports as its
 * current view — a specific item id, a sub-tab, a selected date, or an open
 * "create" flow) mirrored into the URL as ?section=&id=&tab=&date=&create=,
 * the same lightweight pattern permalink.js already uses for ?post=. There's
 * no router in this app — section is plain useState — so without this, a
 * refresh always remounts back to the 'feed' default. Read on mount, written
 * via replaceState (no reload, no history-stack spam) whenever a page's
 * reported view changes.
 */
const VALID_SECTIONS = new Set([
  'feed', 'minisites', 'profile', 'userProfile', 'library', 'courses',
  'events', 'messages', 'groups', 'calendar', 'plans',
]);

const SAFE_VALUE = /^[a-zA-Z0-9_-]+$/;

export function readInitialSection() {
  if (typeof window === 'undefined') return 'feed';
  const section = new URLSearchParams(window.location.search).get('section');
  return VALID_SECTIONS.has(section) ? section : 'feed';
}

export function readInitialViewId() {
  if (typeof window === 'undefined') return null;
  const id = new URLSearchParams(window.location.search).get('id');
  return id && SAFE_VALUE.test(id) ? id : null;
}

export function readInitialTab() {
  if (typeof window === 'undefined') return null;
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab && SAFE_VALUE.test(tab) ? tab : null;
}

export function readInitialDate() {
  if (typeof window === 'undefined') return null;
  const date = new URLSearchParams(window.location.search).get('date');
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

export function readInitialCreate() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('create') === '1';
}

/** section is required; id/tab/date/create are omitted from the URL when falsy. */
export function syncPageUrl(section, { id, tab, date, create } = {}) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (section === 'feed') url.searchParams.delete('section');
  else url.searchParams.set('section', section);

  if (id) url.searchParams.set('id', id); else url.searchParams.delete('id');
  if (tab) url.searchParams.set('tab', tab); else url.searchParams.delete('tab');
  if (date) url.searchParams.set('date', date); else url.searchParams.delete('date');
  if (create) url.searchParams.set('create', '1'); else url.searchParams.delete('create');

  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}
