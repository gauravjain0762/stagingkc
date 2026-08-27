import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CalendarPage.css';
import './EventsPage.css';
import AnimatedNav from './AnimatedNav';
import CreatePostModal from './CreatePostModal';
import Loader from '../Loader';
import { fetchEvents, fetchMyCalendar } from '../../store/slices/eventsSlice';
import { CustomDatePicker } from './DateTimePicker';
import { DISC_CATEGORIES } from './EventsPage';
import { isEventFree } from '../../utils/eventHelpers';
import { CountrySelect } from './CountryPicker';
import LocationRadiusFilter from './LocationRadiusFilter';
import useRadiusFilter from '../../hooks/useRadiusFilter';
import { getCurrentLocation, reverseGeocode, primeGeocode } from '../../utils/geo';
import { showToast } from '../../store/slices/toastSlice';

/* ── Sidebar nav icons ── */
function FeedNavIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function EventNavIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function GroupsNavIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CalendarNavIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>; }
function MessagesNavIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }

/* ── Calendar icons ── */
function ChevronLeftIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function ClockIcon()        { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function PlusIcon()         { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CalMapPinIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }

/* ── Constants ── */
const HOUR_HEIGHT  = 80;
const GRID_START   = 9;
const HOURS        = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEK_DAY_NAMES = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const MONTH_COL_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// Real events only carry a start/end date+time, not a pre-picked color —
// cycle a small palette by category so the grid isn't monochrome.
const EVENT_COLORS = ['blue', 'slate', 'teal', 'red'];
function colorFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return EVENT_COLORS[Math.abs(h) % EVENT_COLORS.length];
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseHM(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return { h, m: Number.isNaN(m) ? 0 : m };
}

// Places each event on whichever weekDay column its startDate matches,
// clamped into the visible 9am–6pm grid. Events entirely outside that
// window (e.g. a midnight event) used to be dropped outright — now they're
// pinned as a thin sliver at whichever edge they're closest to instead, so
// nothing you've added to your calendar silently disappears. `sH/sM/eH/eM`
// are the clamped block position; `realStart*/realEnd*` (used for the
// on-screen time label) always carry the event's actual, unclamped time.
function buildWeekEvents(events, weekDays) {
  const gridEnd = GRID_START + HOURS.length;
  const out = [];
  for (const ev of events) {
    const dayIdx = weekDays.findIndex(d => d.iso === ev.startDate);
    if (dayIdx === -1) continue;
    const start = parseHM(ev.startTime) ?? { h: GRID_START, m: 0 };
    const endRaw = ev.isAllDay ? null : parseHM(ev.endTime);
    const end = endRaw ?? { h: Math.min(start.h + 1, gridEnd), m: start.m };
    const outsideWindow = start.h >= gridEnd || end.h < GRID_START;
    out.push({
      id: ev.id,
      dayIdx,
      title: ev.title || 'Untitled event',
      sH: outsideWindow ? (start.h >= gridEnd ? gridEnd - 1 : GRID_START) : Math.max(start.h, GRID_START),
      sM: outsideWindow ? 0 : (start.h < GRID_START ? 0 : start.m),
      eH: outsideWindow ? (start.h >= gridEnd ? gridEnd : GRID_START + 1) : Math.min(end.h, gridEnd),
      eM: outsideWindow ? 0 : (end.h > gridEnd ? 0 : end.m),
      realStartH: start.h, realStartM: start.m,
      realEndH: end.h, realEndM: end.m,
      color: colorFor(ev.category || ev.title),
    });
  }
  return layoutOverlappingEvents(out);
}

// Every event block in the hourly grid used to be a fixed `left:4px;
// right:4px` — full column width regardless of what else was scheduled at
// the same time. Two events overlapping on the same day therefore painted
// exactly on top of each other, with only the last one in DOM order
// visible — events didn't disappear, they were just hidden behind another
// one. This assigns each event a column/colCount within its overlap
// cluster (same greedy interval-graph-coloring approach calendar apps use)
// so overlapping events render side-by-side instead of stacked.
function layoutOverlappingEvents(events) {
  const byDay = new Map();
  for (const ev of events) {
    if (!byDay.has(ev.dayIdx)) byDay.set(ev.dayIdx, []);
    byDay.get(ev.dayIdx).push({ ...ev, startMin: ev.sH * 60 + ev.sM, endMin: ev.eH * 60 + ev.eM });
  }
  const out = [];
  for (const dayEvents of byDay.values()) {
    dayEvents.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    let cluster = [];
    let clusterEnd = -Infinity;
    const flush = () => {
      if (cluster.length === 0) return;
      const colEnds = []; // colEnds[i] = end time of the last event placed in column i
      const placed = [];
      for (const ev of cluster) {
        let col = colEnds.findIndex(end => end <= ev.startMin);
        if (col === -1) { col = colEnds.length; colEnds.push(ev.endMin); }
        else colEnds[col] = ev.endMin;
        placed.push({ ...ev, col });
      }
      const colCount = colEnds.length;
      placed.forEach(ev => out.push({ ...ev, colCount }));
      cluster = [];
    };
    for (const ev of dayEvents) {
      if (cluster.length > 0 && ev.startMin >= clusterEnd) flush();
      cluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.endMin);
    }
    flush();
  }
  return out;
}

// Only places events that start within the displayed month — matches the
// original grid's scope (it only tracks day-of-month, not cross-month spans).
function buildMonthEvents(events, year, month) {
  const out = [];
  for (const ev of events) {
    if (!ev.startDate) continue;
    const s = new Date(ev.startDate + 'T00:00');
    if (isNaN(s) || s.getFullYear() !== year || s.getMonth() !== month) continue;
    const e = ev.endDate ? new Date(ev.endDate + 'T00:00') : s;
    const endsInMonth = !isNaN(e) && e.getFullYear() === year && e.getMonth() === month;
    out.push({
      id: ev.id,
      title: ev.title || 'Untitled event',
      startDay: s.getDate(),
      endDay: endsInMonth ? Math.max(e.getDate(), s.getDate()) : s.getDate(),
      color: colorFor(ev.category || ev.title),
    });
  }
  return out;
}

// One day's events for the mobile day-agenda view — a plain sorted list,
// not clamped to the 9am-6pm hour grid the desktop week view uses, since
// there's no fixed-height grid to fit into here.
function buildDayEvents(events, iso) {
  return events
    .filter(ev => ev.startDate === iso)
    .map(ev => {
      const start = parseHM(ev.startTime);
      const end = parseHM(ev.endTime);
      return {
        id: ev.id,
        title: ev.title || 'Untitled event',
        color: colorFor(ev.category || ev.title),
        sortKey: start ? start.h * 60 + start.m : -1, // all-day events float to the top
        timeLabel: start
          ? `${fmtT(start.h, start.m)} ${fmtPeriod(start.h)}${end ? ` – ${fmtT(end.h, end.m)} ${fmtPeriod(end.h)}` : ''}`
          : 'All day',
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey);
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function formatDayHeader(d) {
  return `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

/* ── Helpers ── */
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(monday) {
  return WEEK_DAY_NAMES.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return { label, date: d.getDate(), isToday, iso: toISODate(d) };
  });
}

function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${MONTH_NAMES[monday.getMonth()]} ${monday.getDate()} — ${sunday.getDate()}, ${monday.getFullYear()}`;
}

function formatMonthHeader(date) {
  return `${MONTH_NAMES[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatHourLabel(h) {
  if (h === 12) return '12:00 PM';
  if (h > 12)   return `${String(h - 12).padStart(2, '0')}:00 PM`;
  return `${String(h).padStart(2, '0')}:00 AM`;
}

function fmtT(h, m) {
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(dh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtPeriod(h) { return h >= 12 ? 'PM' : 'AM'; }
function evTop(sH, sM)            { return ((sH - GRID_START) + sM / 60) * HOUR_HEIGHT; }
function evH(sH, sM, eH, eM)      { return ((eH * 60 + eM) - (sH * 60 + sM)) / 60 * HOUR_HEIGHT; }

/* Build a 42-cell grid for the given month */
function getMonthGrid(year, month) {
  const firstDow    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevTotal   = new Date(year, month, 0).getDate();
  const today       = new Date();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ day: prevTotal - i, current: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({
      day: d, current: true,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
    });
  let next = 1;
  while (cells.length < 42) cells.push({ day: next++, current: false, isToday: false });
  return cells;
}

/* Get events visible within one week row, with column positions */
function getEventsInWeek(week, events) {
  const curCells = week.map((c, i) => ({ ...c, col: i })).filter(c => c.current);
  if (!curCells.length) return [];
  const minDay = curCells[0].day;
  const maxDay = curCells[curCells.length - 1].day;

  const result = [];
  events.forEach((ev, evIdx) => {
    if (ev.endDay < minDay || ev.startDay > maxDay) return;
    const cs = Math.max(ev.startDay, minDay);
    const ce = Math.min(ev.endDay, maxDay);
    const colStart = week.findIndex(c => c.current && c.day === cs);
    let colEnd = -1;
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i].current && week[i].day === ce) { colEnd = i; break; }
    }
    if (colStart < 0 || colEnd < 0) return;
    result.push({ ...ev, colStart, colEnd, slot: result.length });
  });
  return result;
}

/* ══════════════════════════════
   Main Component
══════════════════════════════ */
export default function CalendarPage({ onFeedClick, onEventsClick, onEventsCreateClick, onEventClick, onGroupsClick, onMessagesClick, onLibraryClick, onCoursesClick, onMinisitesClick, initialView, initialDate, onViewStateChange }) {
  const dispatch = useDispatch();
  // "upcoming" is the only general-listing tab the events API exposes today
  // (see EventsPage), so a week/month you navigate into the past will show
  // no events — a real gap if past events need to show here too; would need
  // either a date-range query param or a tab that includes past events.
  const { events: allEvents, calendarEvents, eventsLoading, calendarLoading } = useSelector(s => s.events);
  const [monday,    setMonday]   = useState(getMondayOf(initialDate ? new Date(initialDate) : new Date()));
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [view,      setView]      = useState(initialView === 'month' ? 'month' : 'week');
  // 'all' = every upcoming event (previous/default behavior); 'mine' = only
  // events the user explicitly added via "Add to Calendar" on an event page.
  const [scope,     setScope]     = useState('all');
  // Independent of the desktop week grid's `monday` anchor — the mobile
  // day-agenda (see the "Mobile calendar" section below) navigates one day
  // at a time rather than one week at a time, so it tracks its own date.
  const [mobileDay, setMobileDay] = useState(new Date());

  const DEFAULT_CAL_FILTERS = {
    dateFrom: '', dateTo: '',
    location: '', radius: 50, radiusUnit: 'mi',
    country: '', state: '',
    categories: new Set(),
    priceType: 'all',
    eventType: 'all',
  };
  // `filters` is what's actually applied to the grid; `pendingF` is what the
  // slide-in panel edits — same staged Apply/Reset pattern as EventsPage's
  // filter drawer, so a location typo doesn't refilter (and re-geocode) on
  // every keystroke.
  const [filters,    setFilters]    = useState({ ...DEFAULT_CAL_FILTERS, categories: new Set() });
  const [pendingF,   setPendingF]   = useState({ ...DEFAULT_CAL_FILTERS, categories: new Set() });
  const [showFilter, setShowFilter] = useState(false);
  const [locatingMe, setLocatingMe] = useState(false);

  useEffect(() => {
    if (scope === 'mine') dispatch(fetchMyCalendar({ limit: 100 }));
    else dispatch(fetchEvents({ tab: 'upcoming', limit: 100 }));
  }, [dispatch, scope]);

  const scopedEvents = scope === 'mine' ? calendarEvents : allEvents;
  const isLoading = scope === 'mine' ? calendarLoading : eventsLoading;

  const radiusFilterActive = filters.location.trim().length > 0;
  const { distanceById, resolving: geoResolving, searchFailed: geoSearchFailed } =
    useRadiusFilter(scopedEvents, filters.location, filters.radiusUnit, radiusFilterActive);

  const filteredEvents = scopedEvents.filter(ev => {
    if (filters.dateFrom && ev.startDate < filters.dateFrom) return false;
    if (filters.dateTo   && ev.startDate > filters.dateTo)   return false;
    if (filters.eventType !== 'all' && ev.eventType !== filters.eventType && ev.eventType !== 'both') return false;
    if (filters.priceType === 'free' && !isEventFree(ev)) return false;
    if (filters.priceType === 'paid' && isEventFree(ev)) return false;
    if (filters.categories.size > 0) {
      const matched = [...filters.categories].some(c => (ev.category || '').toLowerCase().includes(c.toLowerCase()));
      if (!matched) return false;
    }
    if (filters.country.trim() && !(ev.locationObj?.country ?? '').toLowerCase().includes(filters.country.trim().toLowerCase())) return false;
    if (filters.state.trim()   && !(ev.locationObj?.state   ?? '').toLowerCase().includes(filters.state.trim().toLowerCase()))   return false;
    if (radiusFilterActive) {
      if (ev.eventType === 'online') return false;
      const dist = distanceById[ev.id];
      if (dist === undefined) return false; // still resolving, or unresolvable — hide until known
      if (dist > filters.radius) return false;
    }
    return true;
  });

  function openFilter() { setPendingF({ ...filters, categories: new Set(filters.categories) }); setShowFilter(true); }
  function commitFilters(next) { setFilters(next); setShowFilter(false); }
  function applyFilters() { commitFilters({ ...pendingF, categories: new Set(pendingF.categories) }); }
  // Reset applies immediately, same as EventsPage — closes the panel rather
  // than leaving the user to press Apply again just to see it take effect.
  function resetFilters() {
    const def = { ...DEFAULT_CAL_FILTERS, categories: new Set() };
    setPendingF(def);
    commitFilters(def);
  }
  function togglePendingCat(cat) {
    setPendingF(p => { const s = new Set(p.categories); s.has(cat) ? s.delete(cat) : s.add(cat); return { ...p, categories: s }; });
  }
  async function useMyLocationForFilter() {
    setLocatingMe(true);
    try {
      const coords = await getCurrentLocation();
      const label = await reverseGeocode(coords.lat, coords.lng);
      const text = label || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      primeGeocode(text, coords);
      setPendingF(p => ({ ...p, location: text }));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Could not get your location.', type: 'error' }));
    } finally {
      setLocatingMe(false);
    }
  }
  const activeFilterCount = filters.categories.size + (filters.eventType !== 'all' ? 1 : 0)
    + (filters.priceType !== 'all' ? 1 : 0) + (filters.country.trim() ? 1 : 0) + (filters.state.trim() ? 1 : 0)
    + (filters.location.trim() ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  // Report the desktop week/month view up to HomePage so it can keep the URL
  // in sync (?section=calendar&tab=&date=) for refresh restore. The mobile
  // day-agenda intentionally always opens on "today" rather than persisting
  // mobileDay, since there's no reliable non-JS way to tell which of the two
  // views is on screen from here.
  useEffect(() => {
    onViewStateChange?.({ view, date: toISODate(view === 'month' ? monthDate : monday) });
  }, [view, monday, monthDate]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Derived */
  const weekDays   = getWeekDays(monday);
  const monthGrid  = getMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
  const monthWeeks = Array.from({ length: 6 }, (_, i) => monthGrid.slice(i * 7, i * 7 + 7));
  const weekEvents  = buildWeekEvents(filteredEvents, weekDays);
  const monthEvents = buildMonthEvents(filteredEvents, monthDate.getFullYear(), monthDate.getMonth());
  const dayEvents    = buildDayEvents(filteredEvents, toISODate(mobileDay));
  const isMobileToday = toISODate(mobileDay) === toISODate(new Date());

  function prevMobileDay() { const d = new Date(mobileDay); d.setDate(d.getDate() - 1); setMobileDay(d); }
  function nextMobileDay() { const d = new Date(mobileDay); d.setDate(d.getDate() + 1); setMobileDay(d); }

  /* Current-time indicator */
  const now         = new Date();
  const nowTop      = ((now.getHours() - GRID_START) + now.getMinutes() / 60) * HOUR_HEIGHT;
  const showNowLine = now.getHours() >= GRID_START && now.getHours() < GRID_START + HOURS.length;

  /* Unified navigation */
  function prevPeriod() {
    if (view === 'week') {
      const d = new Date(monday); d.setDate(d.getDate() - 7); setMonday(d);
    } else {
      const d = new Date(monthDate); d.setMonth(d.getMonth() - 1); setMonthDate(d);
    }
  }
  function nextPeriod() {
    if (view === 'week') {
      const d = new Date(monday); d.setDate(d.getDate() + 7); setMonday(d);
    } else {
      const d = new Date(monthDate); d.setMonth(d.getMonth() + 1); setMonthDate(d);
    }
  }

  const headerLabel = view === 'week' ? formatWeekRange(monday) : formatMonthHeader(monthDate);

  return (
    <div className="cal-page">

      {/* ── Left sidebar ── */}
      <AnimatedNav
        activeId="calendar"
        onNavigate={id => {
          if (id === 'create')   { setCreatePostOpen(true); return; }
          if (id === 'home')     onFeedClick?.();
          if (id === 'courses')  onCoursesClick?.();
          if (id === 'library')  onLibraryClick?.();
          if (id === 'events')   onEventsClick?.();
          if (id === 'friends')  onGroupsClick?.();
          if (id === 'messages')  onMessagesClick?.();
          if (id === 'minisites') onMinisitesClick?.();
        }}
      />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}

      {/* ── Main area ── */}
      <main className="cal-main">

        {/* Header */}
        <div className="cal-header">
          <h1 className="cal-title">Weekly Agenda</h1>
          <div className="cal-header-row">
            <div className="cal-view-toggle">
              <button className={`cal-view-btn${view === 'week'  ? ' cal-view-btn--active' : ''}`} onClick={() => setView('week')}>Week</button>
              <button className={`cal-view-btn${view === 'month' ? ' cal-view-btn--active' : ''}`} onClick={() => setView('month')}>Month</button>
            </div>
            <div className="cal-view-toggle">
              <button className={`cal-view-btn${scope === 'all'  ? ' cal-view-btn--active' : ''}`} onClick={() => setScope('all')}>All Events</button>
              <button className={`cal-view-btn${scope === 'mine' ? ' cal-view-btn--active' : ''}`} onClick={() => setScope('mine')}>My Calendar</button>
            </div>
            <div className="cal-date-nav">
              <button className="cal-arrow-btn" onClick={prevPeriod}><ChevronLeftIcon /></button>
              <span className="cal-date-range">{headerLabel}</span>
              <button className="cal-arrow-btn" onClick={nextPeriod}><ChevronRightIcon /></button>
            </div>
            <button className={`ev-disc-filter-btn${activeFilterCount > 0 ? ' ev-disc-filter-btn--active' : ''}`} onClick={openFilter}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters{activeFilterCount > 0 && <span className="ev-filter-badge">{activeFilterCount}</span>}
            </button>
            <button className="cal-header-create-btn" onClick={() => (onEventsCreateClick ?? onEventsClick)?.()}>
              <PlusIcon /> Create Event
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader inline />
          </div>
        ) : (
        <>
        {/* ── WEEK VIEW ── */}
        {view === 'week' && (
          <>
          {/* Desktop/tablet: 7-column hour grid. Hidden on mobile (see
              CalendarPage.css) in favor of the day agenda below — cramming
              7 columns into a phone width doesn't work even with scrolling. */}
          <div className="cal-grid-wrap">
            <div className="cal-col-headers">
              <div className="cal-time-header">TIME</div>
              {weekDays.map((d, i) => (
                <div key={i} className={`cal-day-header${d.isToday ? ' cal-day-header--today' : ''}`}>
                  <span className="cal-day-label">{d.label}</span>
                  <span className={`cal-day-num${d.isToday ? ' cal-day-num--today' : ''}`}>{d.date}</span>
                </div>
              ))}
            </div>
            <div className="cal-body">
              <div className="cal-time-col">
                {HOURS.map(h => (
                  <div key={h} className="cal-time-cell"><span>{formatHourLabel(h)}</span></div>
                ))}
              </div>
              <div className="cal-days-area">
                {weekDays.map((d, dayIdx) => (
                  <div key={dayIdx} className={`cal-day-col${d.isToday ? ' cal-day-col--today' : ''}`}>
                    {weekEvents.filter(ev => ev.dayIdx === dayIdx).map(ev => (
                      <div key={ev.id} className={`cal-event cal-event--${ev.color}`}
                        style={{
                          top: evTop(ev.sH, ev.sM),
                          height: evH(ev.sH, ev.sM, ev.eH, ev.eM),
                          left: `calc(${(ev.col / ev.colCount) * 100}% + 4px)`,
                          width: `calc(${100 / ev.colCount}% - 8px)`,
                          cursor: onEventClick ? 'pointer' : undefined,
                        }}
                        onClick={() => onEventClick?.(ev.id)}>
                        <p className="cal-ev-title">{ev.title}</p>
                        <p className="cal-ev-time">{fmtT(ev.realStartH, ev.realStartM)} –<br />{fmtT(ev.realEndH, ev.realEndM)} {fmtPeriod(ev.realEndH)}</p>
                      </div>
                    ))}
                  </div>
                ))}
                {showNowLine && (
                  <div className="cal-now-line" style={{ top: nowTop }}>
                    <span className="cal-now-dot" /><span className="cal-now-track" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: single-day agenda instead of the grid — one day's
              events as a plain list, with its own day-by-day navigation
              independent of the desktop week ("monday") anchor. */}
          <div className="cal-day-agenda">
            <div className="cal-day-agenda-nav">
              <button className="cal-arrow-btn" onClick={prevMobileDay}><ChevronLeftIcon /></button>
              <span className="cal-day-agenda-date">
                {formatDayHeader(mobileDay)}
                {isMobileToday && <span className="cal-day-agenda-today-pill">Today</span>}
              </span>
              <button className="cal-arrow-btn" onClick={nextMobileDay}><ChevronRightIcon /></button>
            </div>
            <div className="cal-day-agenda-list">
              {dayEvents.length === 0 && (
                <p className="cal-day-agenda-empty">No events this day.</p>
              )}
              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  className="cal-day-agenda-item"
                  style={{ cursor: onEventClick ? 'pointer' : undefined }}
                  onClick={() => onEventClick?.(ev.id)}
                >
                  <span className={`cal-day-agenda-bar cal-day-agenda-bar--${ev.color}`} />
                  <div className="cal-day-agenda-body">
                    <p className="cal-day-agenda-title">{ev.title}</p>
                    <p className="cal-day-agenda-time"><ClockIcon /> {ev.timeLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
        )}

        {/* ── MONTH VIEW ── */}
        {view === 'month' && (
          <div className="cal-month-wrap">
            {/* Column headers */}
            <div className="cal-month-col-hdr">
              {MONTH_COL_NAMES.map(d => <div key={d} className="cal-month-col-hdr-cell">{d}</div>)}
            </div>

            {/* Week rows */}
            <div className="cal-month-body">
              {monthWeeks.map((week, wi) => {
                const weekEvs = getEventsInWeek(week, monthEvents);
                // Event bars are absolutely positioned so they can span
                // multiple day cells, which means the row's own height
                // doesn't naturally grow to fit them — a row with several
                // stacked events used to overflow its fixed 100px height
                // and visually bleed into the row below. Size the row to
                // whatever its tallest stack of bars actually needs instead.
                const maxSlot = weekEvs.reduce((max, ev) => Math.max(max, ev.slot), -1);
                const rowMinHeight = Math.max(100, 30 + (maxSlot + 1) * 22 + 8);
                return (
                  <div key={wi} className="cal-month-week" style={{ minHeight: rowMinHeight }}>
                    {/* Day cells */}
                    {week.map((cell, ci) => (
                      <div key={ci} className={`cal-month-cell${cell.isToday ? ' cal-month-cell--today' : ''}${!cell.current ? ' cal-month-cell--other' : ''}`}>
                        <span className={`cal-month-num${cell.isToday ? ' cal-month-num--today' : ''}`}>
                          {cell.day}
                        </span>
                      </div>
                    ))}
                    {/* Event bars — absolutely positioned over the row */}
                    {weekEvs.map(ev => (
                      <div
                        key={ev.id}
                        className={`cal-month-ev cal-month-ev--${ev.color}`}
                        style={{
                          left:   `calc(${ev.colStart} * (100% / 7) + 3px)`,
                          width:  `calc(${ev.colEnd - ev.colStart + 1} * (100% / 7) - 6px)`,
                          top:    `${30 + ev.slot * 22}px`,
                          cursor: onEventClick ? 'pointer' : undefined,
                        }}
                        onClick={() => onEventClick?.(ev.id)}
                      >
                        <span className="cal-month-ev-title">{ev.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}

      </main>

      {/* ── Filter panel overlay — same slide-in drawer as EventsPage's
          filter panel (identical classes/animation), triggered by the
          "Filters" button in the header instead of a permanent sidebar, so
          the calendar grid gets the full width by default. ── */}
      {showFilter && (
        <>
          <div className="ev-filter-backdrop" onClick={() => setShowFilter(false)} />
          <div className="ev-filter-panel">
            <div className="ev-filter-panel-header">
              <span className="ev-filter-panel-title">Filters</span>
              <div className="ev-filter-header-actions">
                <button className="ev-filter-reset-btn" onClick={resetFilters}>Reset All</button>
                <button className="ev-filter-apply-btn" onClick={applyFilters}>Apply Filters</button>
                <button className="ev-filter-close-btn" onClick={() => setShowFilter(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="ev-filter-panel-body">

              {/* Date range */}
              <div className="ev-filter-section">
                <h4 className="ev-filter-section-title">Date Range</h4>
                <div className="cal-date-range-row">
                  <CustomDatePicker
                    value={pendingF.dateFrom}
                    onChange={e => setPendingF(p => ({ ...p, dateFrom: e.target.value }))}
                    max={pendingF.dateTo || undefined}
                    placeholder="Start date"
                  />
                  <span className="cal-date-range-sep">to</span>
                  <CustomDatePicker
                    value={pendingF.dateTo}
                    onChange={e => setPendingF(p => ({ ...p, dateTo: e.target.value }))}
                    min={pendingF.dateFrom || undefined}
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Online / Offline */}
              <div className="ev-filter-section">
                <h4 className="ev-filter-section-title">Event Type</h4>
                <div className="ev-filter-type-row">
                  {['all', 'offline', 'online'].map(t => (
                    <button
                      key={t}
                      className={`ev-filter-type-btn${pendingF.eventType === t ? ' ev-filter-type-btn--active' : ''}`}
                      onClick={() => setPendingF(p => ({ ...p, eventType: t }))}
                    >{t === 'all' ? 'All' : t === 'offline' ? 'Offline' : 'Online'}</button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="ev-filter-section">
                <h4 className="ev-filter-section-title">Price</h4>
                <div className="ev-filter-type-row">
                  {['all', 'free', 'paid'].map(t => (
                    <button
                      key={t}
                      className={`ev-filter-type-btn${pendingF.priceType === t ? ' ev-filter-type-btn--active' : ''}`}
                      onClick={() => setPendingF(p => ({ ...p, priceType: t }))}
                    >{t === 'all' ? 'All' : t === 'free' ? 'Free' : 'Paid'}</button>
                  ))}
                </div>
              </div>

              <LocationRadiusFilter
                pendingF={pendingF}
                setPendingF={setPendingF}
                onUseMyLocation={useMyLocationForFilter}
                locatingMe={locatingMe}
                radiusFilterActive={radiusFilterActive}
                geoResolving={geoResolving}
                geoSearchFailed={geoSearchFailed}
              />

              {/* Country */}
              <div className="ev-filter-section">
                <h4 className="ev-filter-section-title">Country</h4>
                <CountrySelect
                  value={pendingF.country}
                  onChange={val => setPendingF(p => ({ ...p, country: val }))}
                  placeholder="Any country"
                />
              </div>

              {/* State */}
              <div className="ev-filter-section">
                <h4 className="ev-filter-section-title">State / Province</h4>
                <div className="ev-filter-location-row">
                  <CalMapPinIcon />
                  <input
                    className="ev-filter-location-input"
                    placeholder="Enter state or province"
                    value={pendingF.state}
                    onChange={e => setPendingF(p => ({ ...p, state: e.target.value }))}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="ev-filter-section">
                <div className="ev-filter-section-head">
                  <h4 className="ev-filter-section-title">Categories</h4>
                  {pendingF.categories.size > 0 && <button className="ev-filter-clear-link" onClick={() => setPendingF(p => ({ ...p, categories: new Set() }))}>Clear all</button>}
                </div>
                <div className="ev-filter-cats-grid">
                  {DISC_CATEGORIES.filter(c => c.label !== 'All').map(cat => (
                    <label key={cat.label} className="ev-filter-check-label">
                      <input
                        type="checkbox"
                        className="ev-filter-checkbox"
                        checked={pendingF.categories.has(cat.label)}
                        onChange={() => togglePendingCat(cat.label)}
                      />
                      <span className="ev-filter-check-box" />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
