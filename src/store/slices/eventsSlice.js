import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';

const MONTHS      = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS        = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtFullDate(startDate, startTime) {
  if (!startDate) return '';
  const d = new Date(startDate + (startTime ? 'T' + startTime : 'T00:00'));
  if (isNaN(d)) return startDate;
  const timeStr = startTime ? ` at ${startTime}` : '';
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}${timeStr}`;
}

// The backend nests the venue's full address (street/city/state/country/
// pinCode, plus the venue's own name under the `venue` key) inside the
// event's `location` object — there's no separate top-level `venue` object.
// Its own `label` field is only "city, state" and drops street/country
// entirely, so build our own strings from the structured fields whenever
// they're present rather than trusting `label` for anything beyond a
// same-shape fallback (plain-string `location`, or no structured fields).
function composeAddress(loc) {
  if (!loc || typeof loc !== 'object') return '';
  const parts = [loc.venue, loc.street, loc.city, loc.state, loc.country].filter(Boolean);
  let addr = parts.join(', ');
  if (loc.pinCode) addr = addr ? `${addr} ${loc.pinCode}` : loc.pinCode;
  return addr;
}

function normalizeEvent(e) {
  const d     = e.startDate ? new Date(e.startDate + 'T00:00') : null;
  const valid = d && !isNaN(d);
  const loc   = e.location;
  const locLabel = typeof loc === 'string' ? loc
    : ([loc?.city, loc?.state, loc?.country].filter(Boolean).join(', ') || loc?.label || '');
  const fullAddress = composeAddress(loc);
  const coverImages = readCoverImages(e);
  return {
    id:          e.id ?? e._id ?? '',
    day:         valid ? String(d.getDate()).padStart(2, '0') : '',
    month:       valid ? MONTHS[d.getMonth()] : '',
    monthFull:   valid ? MONTH_FULL[d.getMonth()] : '',
    fullDate:    fmtFullDate(e.startDate, e.startTime),
    // coverImage (singular) is the legacy single-file field; the backend now
    // returns coverImages (array, multi-upload) — prefer that, fall back to
    // the old field for events created before the change.
    img:         e.coverImages?.[0] ?? e.coverImage ?? '',
    coverImages: e.coverImages ?? (e.coverImage ? [e.coverImage] : []),
    category:    e.category ?? '',
    // Only meaningful when category === 'Other' — the freeform text the
    // organizer typed in place of picking a fixed category.
    customCategory: e.customCategory ?? '',
    catColor:    e.categoryColor ?? '#3b82f6',
    location:    locLabel,
    locationObj: typeof loc === 'object' && loc !== null ? loc : null,
    title:       e.title ?? '',
    tagline:     e.tagline ?? '',
    desc:        e.description ?? '',
    about:       e.about ?? e.description ?? '',
    attending:   e.attendingCount != null ? Number(e.attendingCount).toLocaleString() : '0',
    attendingCount: e.attendingCount ?? 0,
    seats:       e.seatsLeft != null ? `${e.seatsLeft} seats left` : null,
    seatsLeft:   e.seatsLeft ?? null,
    totalSeats:  e.totalSeats ?? null,
    soldOut:     e.soldOut ?? false,
    responded:   e.attendingCount != null ? Number(e.attendingCount).toLocaleString() : '0',
    venue:       fullAddress || locLabel,
    // Raw structured venue object (name/street/city/state/country/pinCode),
    // read out of the nested `location` object above (see composeAddress) —
    // falls back to a legacy top-level `venue` field if a backend response
    // ever sends one. Needed to prefill the edit-event form.
    venueObj:    e.venue ?? (typeof loc === 'object' && loc !== null ? {
      name:    loc.venue ?? '',
      street:  loc.street ?? '',
      city:    loc.city ?? '',
      state:   loc.state ?? '',
      country: loc.country ?? '',
      pinCode: loc.pinCode ?? '',
    } : null),
    visibility:  e.visibility ?? 'anyone',
    isSaved:     e.isSaved ?? false,
    isBooked:    e.isBooked ?? false,
    // "already joined" flag — was previously missing entirely, so the "+
    // Join" button had no way to know an event was already joined until the
    // user joined it again in the current session.
    isAttending: e.isAttending ?? false,
    isInCalendar: e.isInCalendar ?? false,
    tickets:     e.tickets ?? [],
    registration: e.registration ?? null,
    organizer:   e.organizer ?? null,
    parking:     e.parking ?? null,
    virtualLink: e.virtualLink ?? null,
    virtualInstructions: e.virtualInstructions ?? null,
    eventType:   e.eventType ?? 'offline',
    startDate:   e.startDate ?? '',
    endDate:     e.endDate ?? '',
    startTime:   e.startTime ?? '',
    endTime:     e.endTime ?? '',
    isAllDay:    e.isAllDay ?? false,
    createdBy:   e.createdBy ?? null,
    createdAt:   e.createdAt ?? '',
    status:      readStatus(e),
  };
}

// An event can be created with several coverImage files, so the API may send
// back a single URL, an array of URLs, or an array of { url } objects (and
// under a few different key names). Return them all: the card shows the first,
// the detail carousel shows the whole set. Assigning a raw array to <img src>
// is what renders a broken-image icon.
function readCoverImages(e) {
  const candidates = [e.coverImages, e.coverImage, e.images, e.image, e.banner];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('http')) return [c];
    if (Array.isArray(c)) {
      const urls = c
        .map(item => (typeof item === 'string' ? item : item?.url))
        .filter(u => typeof u === 'string' && u.startsWith('http'));
      if (urls.length) return urls;
    }
  }
  return [];
}

// Drafts must never be mistaken for published (they'd leak into the Published
// tab and the public feed), so accept the common shapes a backend might use
// and only fall back to 'published' when there's genuinely no signal.
function readStatus(e) {
  const raw = typeof e.status === 'string' ? e.status.trim().toLowerCase() : '';
  if (raw) return raw;
  if (e.isDraft === true || e.draft === true) return 'draft';
  if (e.isPublished === false || e.published === false) return 'draft';
  return 'published';
}

function normalizeComment(c) {
  return {
    id:        c.id ?? c._id ?? '',
    userId:    c.userId ?? '',
    name:      c.name ?? '',
    avatar:    c.avatar ?? null,
    text:      c.text ?? '',
    likes:     c.likes ?? 0,
    time:      c.time ?? '',
    createdAt: c.createdAt ?? '',
  };
}

function patchEventInList(arr, eventId, patch) {
  return arr.map(e => e.id === eventId ? { ...e, ...patch } : e);
}

// 1. GET /api/events
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ tab = 'upcoming', category = '', eventType = '', location = '', search = '', page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams({ tab, page, limit });
      if (category && category !== 'All') params.set('category', category);
      if (eventType && eventType !== 'all') params.set('eventType', eventType);
      if (location) params.set('location', location);
      if (search) params.set('search', search);
      const data = await apiRequest(`/api/events?${params}`, { token });
      return { tab, events: (data.data ?? []).map(normalizeEvent), total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// Dedicated Redux cache for the calendar's upcoming view.
export const fetchCalendarUpcomingEvents = createAsyncThunk(
  'events/fetchCalendarUpcomingEvents',
  async ({ limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events?tab=upcoming&page=1&limit=${limit}`, { token });
      return { events: (data.data ?? []).map(normalizeEvent), total: data.total ?? 0 };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. GET /api/events/:id
export const fetchEventDetail = createAsyncThunk(
  'events/fetchEventDetail',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}`, { token });
      return normalizeEvent(data.data ?? data);
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 3. POST /api/events
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const isFormData = payload instanceof FormData;
      const body = isFormData ? payload : (() => {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v == null) return;
          if (v instanceof File) form.append(k, v);
          else if (typeof v === 'object') form.append(k, JSON.stringify(v));
          else form.append(k, String(v));
        });
        return form;
      })();
      const data = await apiRequest('/api/events', { method: 'POST', token, body, isFormData: true });
      return data;
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 4. PUT /api/events/:id — expects a pre-built FormData (same shape createEvent
// sends), so the edit form can reuse identical field-building logic, including
// multiple `coverImage` files under the same key.
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, formData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}`, { method: 'PUT', token, body: formData, isFormData: true });
      return { eventId, ...data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// PATCH /api/events/:id/publish — turns a draft into a published event.
// Editing a draft's fields still goes through updateEvent (PUT) above with
// status left as 'draft'; this is the dedicated action for the final publish
// step once the creator is happy with it.
export const publishEvent = createAsyncThunk(
  'events/publishEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/publish`, { method: 'PATCH', token });
      return { eventId, ...data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 5. DELETE /api/events/:id
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/events/${eventId}`, { method: 'DELETE', token });
      return { eventId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 6. POST /api/events/:id/book
export const bookEvent = createAsyncThunk(
  'events/bookEvent',
  async ({ eventId, ticketId, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const body = { quantity };
      if (ticketId) body.ticketId = ticketId;
      const data = await apiRequest(`/api/events/${eventId}/book`, { method: 'POST', token, body });
      return { eventId, ...data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 7. DELETE /api/events/:id/book
export const cancelBooking = createAsyncThunk(
  'events/cancelBooking',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/events/${eventId}/book`, { method: 'DELETE', token });
      return { eventId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 8. POST /api/events/:id/save
export const saveEvent = createAsyncThunk(
  'events/saveEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/save`, { method: 'POST', token });
      return { eventId, saved: data.saved ?? true };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 9. DELETE /api/events/:id/save
export const unsaveEvent = createAsyncThunk(
  'events/unsaveEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/save`, { method: 'DELETE', token });
      return { eventId, saved: data.saved ?? false };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 10. GET /api/events/my/booked
export const fetchMyBooked = createAsyncThunk(
  'events/fetchMyBooked',
  async ({ page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/my/booked?page=${page}&limit=${limit}`, { token });
      return { events: (data.data ?? []).map(normalizeEvent), total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 11. GET /api/events/my/saved
export const fetchMySaved = createAsyncThunk(
  'events/fetchMySaved',
  async ({ page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/my/saved?page=${page}&limit=${limit}`, { token });
      return { events: (data.data ?? []).map(normalizeEvent), total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 12. GET /api/events/my/created
export const fetchMyCreated = createAsyncThunk(
  'events/fetchMyCreated',
  async ({ page = 1, limit = 20, status } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      // `status` ('draft' | 'published') is optional — passed through once the
      // backend supports server-side filtering; until then the Published/Drafts
      // tabs filter client-side on the `status` field every event now carries.
      const statusParam = status ? `&status=${status}` : '';
      const data = await apiRequest(`/api/events/my/created?page=${page}&limit=${limit}${statusParam}`, { token });
      return { events: (data.data ?? []).map(normalizeEvent), total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 13. GET /api/events/:id/comments
export const fetchComments = createAsyncThunk(
  'events/fetchComments',
  async ({ eventId, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/comments?page=${page}&limit=${limit}`, { token });
      return { eventId, comments: (data.data ?? []).map(normalizeComment), total: data.total ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 14. POST /api/events/:id/comments
export const postComment = createAsyncThunk(
  'events/postComment',
  async ({ eventId, text }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/comments`, { method: 'POST', token, body: { text } });
      return { eventId, comment: normalizeComment(data.data ?? {}) };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 15. POST /api/events/:id/comments/:commentId/like
export const likeComment = createAsyncThunk(
  'events/likeComment',
  async ({ eventId, commentId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/comments/${commentId}/like`, { method: 'POST', token });
      return { eventId, commentId, likes: data.likes ?? 0 };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 16. POST /api/events/:id/report — same shape as groups'/conversations' report endpoints.
export const reportEvent = createAsyncThunk(
  'events/reportEvent',
  async ({ eventId, reason }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiRequest(`/api/events/${eventId}/report`, { method: 'POST', token, body: { reason } });
      return { eventId };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 17. POST /api/events/:id/calendar
export const calendarEvent = createAsyncThunk(
  'events/calendarEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/calendar`, { method: 'POST', token });
      return { eventId, inCalendar: data.inCalendar ?? true };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 18. DELETE /api/events/:id/calendar
export const uncalendarEvent = createAsyncThunk(
  'events/uncalendarEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/calendar`, { method: 'DELETE', token });
      return { eventId, inCalendar: data.inCalendar ?? false };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 19. GET /api/events/my/calendar — also pulls in events from every
// organization the user has joined or created (GET /api/organizations/:id/
// events/main-calendar), so org-hosted events show up on "My Events"
// alongside personally-saved ones, not just the latter.
export const fetchMyCalendar = createAsyncThunk(
  'events/fetchMyCalendar',
  async ({ page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/my/calendar?page=${page}&limit=${limit}`, { token });
      const personalEvents = (data.data ?? []).map(normalizeEvent);

      let orgEvents = [];
      try {
        const [joinedRes, createdRes] = await Promise.all([
          apiRequest('/api/organizations/joined?limit=100&offset=0', { token }),
          apiRequest('/api/organizations?limit=100&page=1', { token }),
        ]);
        const orgIds = [...new Set(
          [...(joinedRes?.data ?? []), ...(createdRes?.data ?? [])]
            .map(o => o.id ?? o._id)
            .filter(Boolean)
        )];

        const perOrgResults = await Promise.all(
          orgIds.map(orgId =>
            apiRequest(`/api/organizations/${orgId}/events/main-calendar`, { token })
              .then(res => ({ orgId, res }))
              .catch(() => null)
          )
        );
        // Tagged so the calendar can route a click on one of these to its
        // organization's mini-site Events page instead of the main-site
        // event detail — these events only exist inside a mini-site, the
        // main /api/events/:id detail endpoint doesn't know about them.
        orgEvents = perOrgResults
          .filter(Boolean)
          .flatMap(({ orgId, res }) => (res?.data ?? []).map(e => ({
            ...normalizeEvent(e),
            isMiniSiteEvent: true,
            organizationId: orgId,
          })));
      } catch {
        // Org-calendar fetch is best-effort — personal calendar events
        // should still show even if this fails.
      }

      const seen = new Set();
      const events = [...personalEvents, ...orgEvents].filter(ev => {
        if (!ev.id || seen.has(ev.id)) return false;
        seen.add(ev.id);
        return true;
      });

      return {
        events,
        total: data.total ?? events.length,
        userId: getState().auth.user?._id ?? getState().auth.user?.id ?? null,
      };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

// 20. PATCH /api/events/:id/sold-out — creator-only manual sold-out toggle,
// independent of seatsLeft (an organizer may sell tickets outside the app
// and just wants Join blocked once real-world seats run out).
export const setEventSoldOut = createAsyncThunk(
  'events/setEventSoldOut',
  async ({ eventId, soldOut }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const data = await apiRequest(`/api/events/${eventId}/sold-out`, { method: 'PATCH', token, body: { soldOut } });
      return { eventId, soldOut: data.soldOut ?? soldOut };
    } catch (err) { return rejectWithValue(err.message); }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    eventsTab: '',
    eventsTotal: 0,
    eventsLoading: false,

    calendarUpcomingEvents: [],
    calendarUpcomingTotal: 0,
    calendarUpcomingLoading: false,
    calendarUpcomingFetched: false,

    bookedEvents: [],
    bookedTotal: 0,
    bookedLoading: false,

    savedEvents: [],
    savedTotal: 0,
    savedLoading: false,

    createdEvents: [],
    createdTotal: 0,
    createdLoading: false,

    calendarEvents: [],
    calendarTotal: 0,
    calendarLoading: false,
    calendarFetched: false,
    calendarFetchedUserId: null,

    eventDetail: null,
    detailLoading: false,

    comments: {},       // { [eventId]: comment[] }
    commentsTotal: {},
    commentsLoading: false,

    bookingLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    publishingId: null,
    soldOutTogglingId: null,

    // Socket: event:deleted — { eventId, eventName, deletedBy, reason, deletedAt }.
    // Set so EventsPage can pop a "deleted by admin" modal if this event is
    // the one currently open; cleared right after it's read.
    eventDeletedNotice: null,

    error: null,
  },
  reducers: {
    // Socket: event:seats_updated
    seatsUpdated(state, action) {
      const { eventId, seatsLeft, soldOut } = action.payload;
      const patch = { seatsLeft, soldOut, seats: seatsLeft != null ? `${seatsLeft} seats left` : null };
      state.events        = patchEventInList(state.events,        eventId, patch);
      state.bookedEvents  = patchEventInList(state.bookedEvents,  eventId, patch);
      state.savedEvents   = patchEventInList(state.savedEvents,   eventId, patch);
      state.createdEvents = patchEventInList(state.createdEvents, eventId, patch);
      if (state.eventDetail?.id === eventId) Object.assign(state.eventDetail, patch);
    },
    // Socket: event:attending_updated
    attendingUpdated(state, action) {
      const { eventId, attendingCount } = action.payload;
      const cnt   = Number(attendingCount).toLocaleString();
      const patch = { attendingCount, attending: cnt, responded: cnt };
      state.events        = patchEventInList(state.events,        eventId, patch);
      state.bookedEvents  = patchEventInList(state.bookedEvents,  eventId, patch);
      state.savedEvents   = patchEventInList(state.savedEvents,   eventId, patch);
      state.createdEvents = patchEventInList(state.createdEvents, eventId, patch);
      if (state.eventDetail?.id === eventId) Object.assign(state.eventDetail, patch);
    },
    // Socket: event:new_comment
    commentReceived(state, action) {
      const { eventId, comment } = action.payload;
      const normalized = normalizeComment(comment);
      if (!state.comments[eventId]) state.comments[eventId] = [];
      if (!state.comments[eventId].find(c => c.id === normalized.id)) {
        state.comments[eventId].unshift(normalized);
      }
    },
    // Socket: event:comment_liked
    commentLikeUpdated(state, action) {
      const { commentId, likes } = action.payload;
      Object.keys(state.comments).forEach(evId => {
        const idx = state.comments[evId].findIndex(c => c.id === commentId);
        if (idx !== -1) state.comments[evId][idx].likes = likes;
      });
    },
    // Socket: event:deleted — admin removed this event; drop it from every
    // cached list immediately so it vanishes for anyone browsing, and leave
    // a notice behind for EventsPage to react to if it's the open detail view.
    eventDeletedRemote(state, action) {
      const { eventId } = action.payload;
      state.events        = state.events.filter(e => e.id !== eventId);
      state.bookedEvents  = state.bookedEvents.filter(e => e.id !== eventId);
      state.savedEvents   = state.savedEvents.filter(e => e.id !== eventId);
      state.createdEvents = state.createdEvents.filter(e => e.id !== eventId);
      state.eventDeletedNotice = action.payload;
    },
    clearEventDeletedNotice(state) {
      state.eventDeletedNotice = null;
    },
  },
  extraReducers: builder => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, s => { s.eventsLoading = true; s.events = []; s.eventsTab = ''; })
      .addCase(fetchEvents.fulfilled, (s, a) => {
        s.eventsLoading = false;
        s.events = a.payload.events;
        s.eventsTab = a.payload.tab;
        s.eventsTotal = a.payload.total;
      })
      .addCase(fetchEvents.rejected, (s, a) => { s.eventsLoading = false; s.error = a.payload; })

      // fetchEventDetail
      .addCase(fetchEventDetail.pending, s => { s.detailLoading = true; })
      .addCase(fetchEventDetail.fulfilled, (s, a) => { s.detailLoading = false; s.eventDetail = a.payload; })
      .addCase(fetchEventDetail.rejected, s => { s.detailLoading = false; })

      // createEvent
      .addCase(createEvent.pending, s => { s.createLoading = true; })
      .addCase(createEvent.fulfilled, s => { s.createLoading = false; })
      .addCase(createEvent.rejected, (s, a) => { s.createLoading = false; s.error = a.payload; })

      // updateEvent
      .addCase(updateEvent.pending, s => { s.updateLoading = true; })
      .addCase(updateEvent.fulfilled, s => { s.updateLoading = false; })
      .addCase(updateEvent.rejected, s => { s.updateLoading = false; })

      // publishEvent — flip status locally so the event moves from the Drafts
      // sub-tab to Published immediately, without waiting on a refetch.
      .addCase(publishEvent.pending, (s, a) => { s.publishingId = a.meta.arg; })
      .addCase(publishEvent.fulfilled, (s, a) => {
        const { eventId, event } = a.payload;
        s.publishingId = null;
        // Trust the server's status (it may not always be plain 'published',
        // e.g. a future-dated event could come back 'scheduled').
        const status = (typeof event?.status === 'string' && event.status) || 'published';
        s.createdEvents = patchEventInList(s.createdEvents, eventId, { status });
        s.events        = patchEventInList(s.events,        eventId, { status });
      })
      .addCase(publishEvent.rejected, s => { s.publishingId = null; })

      // setEventSoldOut
      .addCase(setEventSoldOut.pending, (s, a) => { s.soldOutTogglingId = a.meta.arg.eventId; })
      .addCase(setEventSoldOut.fulfilled, (s, a) => {
        const { eventId, soldOut } = a.payload;
        s.soldOutTogglingId = null;
        s.events        = patchEventInList(s.events,        eventId, { soldOut });
        s.bookedEvents  = patchEventInList(s.bookedEvents,  eventId, { soldOut });
        s.savedEvents   = patchEventInList(s.savedEvents,   eventId, { soldOut });
        s.createdEvents = patchEventInList(s.createdEvents, eventId, { soldOut });
        s.calendarEvents = patchEventInList(s.calendarEvents, eventId, { soldOut });
        if (s.eventDetail?.id === eventId) s.eventDetail.soldOut = soldOut;
      })
      .addCase(setEventSoldOut.rejected, s => { s.soldOutTogglingId = null; })

      // deleteEvent
      .addCase(deleteEvent.pending, s => { s.deleteLoading = true; })
      .addCase(deleteEvent.fulfilled, (s, a) => {
        const { eventId } = a.payload;
        s.deleteLoading = false;
        s.createdEvents = s.createdEvents.filter(e => e.id !== eventId);
        s.events        = s.events.filter(e => e.id !== eventId);
      })
      .addCase(deleteEvent.rejected, s => { s.deleteLoading = false; })

      // bookEvent — optimistic
      .addCase(bookEvent.pending, (s, a) => {
        s.bookingLoading = true;
        const { eventId } = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isBooked: true });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isBooked: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isBooked = true;
      })
      .addCase(bookEvent.fulfilled, (s, a) => {
        s.bookingLoading = false;
        s.events = patchEventInList(s.events, a.payload.eventId, { isBooked: true });
        if (s.eventDetail?.id === a.payload.eventId) s.eventDetail.isBooked = true;
      })
      .addCase(bookEvent.rejected, (s, a) => {
        s.bookingLoading = false;
        const { eventId } = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isBooked: false });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isBooked: false });
        if (s.eventDetail?.id === eventId) s.eventDetail.isBooked = false;
      })

      // cancelBooking — optimistic
      .addCase(cancelBooking.pending, (s, a) => {
        const eventId = a.meta.arg;
        s.events       = patchEventInList(s.events, eventId, { isBooked: false });
        s.bookedEvents = s.bookedEvents.filter(e => e.id !== eventId);
        if (s.eventDetail?.id === eventId) s.eventDetail.isBooked = false;
      })
      .addCase(cancelBooking.rejected, (s, a) => {
        const eventId = a.meta.arg;
        s.events = patchEventInList(s.events, eventId, { isBooked: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isBooked = true;
      })

      // saveEvent — optimistic
      .addCase(saveEvent.pending, (s, a) => {
        const eventId = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isSaved: true });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isSaved: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isSaved = true;
      })
      .addCase(saveEvent.rejected, (s, a) => {
        const eventId = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isSaved: false });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isSaved: false });
        if (s.eventDetail?.id === eventId) s.eventDetail.isSaved = false;
      })

      // unsaveEvent — optimistic
      .addCase(unsaveEvent.pending, (s, a) => {
        const eventId = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isSaved: false });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isSaved: false });
        s.savedEvents  = s.savedEvents.filter(e => e.id !== eventId);
        if (s.eventDetail?.id === eventId) s.eventDetail.isSaved = false;
      })
      .addCase(unsaveEvent.rejected, (s, a) => {
        const eventId = a.meta.arg;
        s.events       = patchEventInList(s.events,       eventId, { isSaved: true });
        s.bookedEvents = patchEventInList(s.bookedEvents, eventId, { isSaved: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isSaved = true;
      })

      // calendarEvent — optimistic
      .addCase(calendarEvent.pending, (s, a) => {
        const eventId = a.meta.arg;
        s.events        = patchEventInList(s.events,        eventId, { isInCalendar: true });
        s.calendarUpcomingEvents = patchEventInList(s.calendarUpcomingEvents, eventId, { isInCalendar: true });
        const event = s.calendarUpcomingEvents.find(e => e.id === eventId) || s.events.find(e => e.id === eventId);
        if (event && !s.calendarEvents.some(e => e.id === eventId)) {
          s.calendarEvents.push({ ...event, isInCalendar: true });
          s.calendarTotal = s.calendarEvents.length;
        }
        s.bookedEvents  = patchEventInList(s.bookedEvents,  eventId, { isInCalendar: true });
        s.savedEvents   = patchEventInList(s.savedEvents,   eventId, { isInCalendar: true });
        s.createdEvents = patchEventInList(s.createdEvents, eventId, { isInCalendar: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isInCalendar = true;
      })
      .addCase(calendarEvent.rejected, (s, a) => {
        const eventId = a.meta.arg;
        s.events        = patchEventInList(s.events,        eventId, { isInCalendar: false });
        s.calendarUpcomingEvents = patchEventInList(s.calendarUpcomingEvents, eventId, { isInCalendar: false });
        s.bookedEvents  = patchEventInList(s.bookedEvents,  eventId, { isInCalendar: false });
        s.savedEvents   = patchEventInList(s.savedEvents,   eventId, { isInCalendar: false });
        s.createdEvents = patchEventInList(s.createdEvents, eventId, { isInCalendar: false });
        if (s.eventDetail?.id === eventId) s.eventDetail.isInCalendar = false;
      })

      // uncalendarEvent — optimistic
      .addCase(uncalendarEvent.pending, (s, a) => {
        const eventId = a.meta.arg;
        s.events         = patchEventInList(s.events,        eventId, { isInCalendar: false });
        s.calendarUpcomingEvents = patchEventInList(s.calendarUpcomingEvents, eventId, { isInCalendar: false });
        s.bookedEvents   = patchEventInList(s.bookedEvents,  eventId, { isInCalendar: false });
        s.savedEvents    = patchEventInList(s.savedEvents,   eventId, { isInCalendar: false });
        s.createdEvents  = patchEventInList(s.createdEvents, eventId, { isInCalendar: false });
        s.calendarEvents = s.calendarEvents.filter(e => e.id !== eventId);
        if (s.eventDetail?.id === eventId) s.eventDetail.isInCalendar = false;
      })
      .addCase(uncalendarEvent.rejected, (s, a) => {
        const eventId = a.meta.arg;
        s.events        = patchEventInList(s.events,        eventId, { isInCalendar: true });
        s.calendarUpcomingEvents = patchEventInList(s.calendarUpcomingEvents, eventId, { isInCalendar: true });
        const event = s.calendarUpcomingEvents.find(e => e.id === eventId) || s.events.find(e => e.id === eventId);
        if (event && !s.calendarEvents.some(e => e.id === eventId)) {
          s.calendarEvents.push({ ...event, isInCalendar: true });
          s.calendarTotal = s.calendarEvents.length;
        }
        s.bookedEvents  = patchEventInList(s.bookedEvents,  eventId, { isInCalendar: true });
        s.savedEvents   = patchEventInList(s.savedEvents,   eventId, { isInCalendar: true });
        s.createdEvents = patchEventInList(s.createdEvents, eventId, { isInCalendar: true });
        if (s.eventDetail?.id === eventId) s.eventDetail.isInCalendar = true;
      })

      // fetchMyCalendar
      .addCase(fetchMyCalendar.pending, s => { s.calendarLoading = true; })
      .addCase(fetchMyCalendar.fulfilled, (s, a) => {
        s.calendarLoading = false;
        s.calendarEvents = a.payload.events;
        s.calendarTotal  = a.payload.total;
        s.calendarFetched = true;
        s.calendarFetchedUserId = a.payload.userId;
      })
      .addCase(fetchMyCalendar.rejected, s => { s.calendarLoading = false; })

      // fetchCalendarUpcomingEvents
      .addCase(fetchCalendarUpcomingEvents.pending, s => { s.calendarUpcomingLoading = true; })
      .addCase(fetchCalendarUpcomingEvents.fulfilled, (s, a) => {
        s.calendarUpcomingLoading = false;
        s.calendarUpcomingEvents = a.payload.events;
        s.calendarUpcomingTotal = a.payload.total;
        s.calendarUpcomingFetched = true;
      })
      .addCase(fetchCalendarUpcomingEvents.rejected, s => { s.calendarUpcomingLoading = false; })

      // fetchMyBooked
      .addCase(fetchMyBooked.pending, s => { s.bookedLoading = true; s.bookedEvents = []; })
      .addCase(fetchMyBooked.fulfilled, (s, a) => {
        s.bookedLoading = false;
        s.bookedEvents = a.payload.events;
        s.bookedTotal  = a.payload.total;
      })
      .addCase(fetchMyBooked.rejected, s => { s.bookedLoading = false; })

      // fetchMySaved
      .addCase(fetchMySaved.pending, s => { s.savedLoading = true; s.savedEvents = []; })
      .addCase(fetchMySaved.fulfilled, (s, a) => {
        s.savedLoading = false;
        s.savedEvents = a.payload.events;
        s.savedTotal  = a.payload.total;
      })
      .addCase(fetchMySaved.rejected, s => { s.savedLoading = false; })

      // fetchMyCreated
      .addCase(fetchMyCreated.pending, s => { s.createdLoading = true; s.createdEvents = []; })
      .addCase(fetchMyCreated.fulfilled, (s, a) => {
        s.createdLoading = false;
        s.createdEvents = a.payload.events;
        s.createdTotal  = a.payload.total;
      })
      .addCase(fetchMyCreated.rejected, s => { s.createdLoading = false; })

      // fetchComments
      .addCase(fetchComments.pending, s => { s.commentsLoading = true; })
      .addCase(fetchComments.fulfilled, (s, a) => {
        const { eventId, comments, total } = a.payload;
        s.commentsLoading = false;
        s.comments[eventId] = comments;
        s.commentsTotal[eventId] = total;
      })
      .addCase(fetchComments.rejected, s => { s.commentsLoading = false; })

      // postComment — fulfilled replaces temp
      .addCase(postComment.fulfilled, (s, a) => {
        const { eventId, comment } = a.payload;
        if (!s.comments[eventId]) s.comments[eventId] = [];
        s.comments[eventId] = [comment, ...s.comments[eventId].filter(c => !String(c.id).startsWith('temp_'))];
      })

      // likeComment
      .addCase(likeComment.fulfilled, (s, a) => {
        const { eventId, commentId, likes } = a.payload;
        const idx = (s.comments[eventId] ?? []).findIndex(c => c.id === commentId);
        if (idx !== -1) s.comments[eventId][idx].likes = likes;
      });
  },
});

export const { seatsUpdated, attendingUpdated, commentReceived, commentLikeUpdated, eventDeletedRemote, clearEventDeletedNotice } = eventsSlice.actions;
export default eventsSlice.reducer;
