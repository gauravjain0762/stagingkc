import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getMiniSiteEvents, getMiniSiteEventDetail, getMiniSiteEventTickets,
  joinMiniSiteEvent, leaveMiniSiteEvent, getMiniSiteEventAttendees,
  createMiniSiteEventDiscussion, getMiniSiteEventDiscussions,
  likeMiniSiteEventDiscussion, unlikeMiniSiteEventDiscussion,
  getMiniSiteEventDiscussionComments, createMiniSiteEventDiscussionComment
} from '../../services/api';
import CreatePostModal from './CreatePostModal';
import './MiniSiteEventsPage.css';

function BackIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function MapPinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function TicketIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
}

function ExternalLinkIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}

// Same helpers/pattern as the main Events page (EventsPage.jsx) so the map
// card behaves identically.
function googleMapsEmbedSrc(address) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
function googleMapsSearchUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
// Backend returns a full breakdown at ev.locationDetails (venue, street,
// city, state, country, pinCode) — join whatever's present into one line
// instead of just showing the short ev.location summary.
function eventLocationLabel(ev) {
  if (!ev) return 'N/A';
  const d = ev.locationDetails;
  if (d) {
    const full = [d.venue, d.street, d.city, d.state, d.country, d.pinCode].filter(Boolean).join(', ');
    if (full) return full;
  }
  const loc = ev.venue || ev.location || ev.address;
  if (loc) return loc;
  return (ev.eventType || '').toLowerCase() === 'online' ? 'Online' : 'N/A';
}
function ClickableLocation({ location }) {
  if (!location || location === 'Online' || location === 'N/A') {
    return <span>{location || 'N/A'}</span>;
  }
  return (
    <a href={googleMapsSearchUrl(location)} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', cursor: 'pointer' }}>
      {location}
    </a>
  );
}

function LinkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

// Real API shape uses startDate/endDate (YYYY-MM-DD) + optional startTime/
// endTime, not the fullDate/date fields this view used to guess at.
function formatEventDate(event) {
  if (!event?.startDate) return 'TBA';
  const start = new Date(`${event.startDate}T00:00:00`);
  const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (event.endDate && event.endDate !== event.startDate) {
    const end = new Date(`${event.endDate}T00:00:00`);
    const endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }
  if (!event.isAllDay && event.startTime) {
    return `${startStr} · ${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}`;
  }
  return startStr;
}

export default function MiniSiteEventsPage({ siteId, siteName }) {
  const { token, user } = useSelector(s => s.auth);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'joined'
  const [detailTab, setDetailTab] = useState('about'); // 'about' or 'discussion' in detail view
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [joiningId, setJoiningId] = useState(null);
  const [joinFlow, setJoinFlow] = useState(null); // { step: 'ticket'|'members'|'confirm', ... }
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [members, setMembers] = useState([{ name: '', age: '' }]);
  const [comments, setComments] = useState([]);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [discComposerOpen, setDiscComposerOpen] = useState(false);
  const [likingDiscId, setLikingDiscId] = useState(null);
  const [expandedDiscComments, setExpandedDiscComments] = useState(new Set());
  const [discPostComments, setDiscPostComments] = useState({});
  const [discCommentsLoading, setDiscCommentsLoading] = useState({});
  const [discCommentText, setDiscCommentText] = useState({});
  const [previewEvent, setPreviewEvent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [siteId, token]);

  useEffect(() => {
    if (detailTab === 'discussion' && view === 'detail' && selectedEvent && token) {
      loadDiscussions();
    }
  }, [detailTab, selectedEvent, token]);

  const loadEvents = async () => {
    if (!siteId || !token) return;
    setLoading(true);
    try {
      const data = await getMiniSiteEvents(siteId, { limit: 50 }, token);
      const eventsList = Array.isArray(data?.data) ? data.data : data?.events || [];
      setEvents(eventsList);

      // Check which events user has joined
      const joinedIds = new Set();
      eventsList.forEach(ev => {
        if (ev.joined || ev.isJoined || ev.hasJoined) {
          joinedIds.add(ev._id || ev.id);
        }
      });
      setJoinedEventIds(joinedIds);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (event) => {
    // Show the list-card data immediately so the detail view isn't blank,
    // then replace it with the full record from the get-by-id endpoint
    // (has fields the list endpoint doesn't return, e.g. full description,
    // virtual link/instructions, capacity, tickets).
    setSelectedEvent(event);
    setView('detail');

    const eventId = event._id || event.id;
    if (!eventId) return;
    try {
      const data = await getMiniSiteEventDetail(siteId, eventId, token);
      if (data?.data) {
        setSelectedEvent(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Failed to load event detail:', err);
    }
  };

  // Preview popup for a not-yet-joined event — same get-by-id endpoint as
  // handleSelectEvent, but shown as a modal instead of navigating to the
  // full detail page (which requires joining to see the Discussion tab).
  const handleOpenPreview = async (event) => {
    setPreviewEvent(event);
    const eventId = event._id || event.id;
    if (!eventId) return;
    setPreviewLoading(true);
    try {
      const data = await getMiniSiteEventDetail(siteId, eventId, token);
      if (data?.data) {
        setPreviewEvent(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Failed to load event preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleJoinEvent = async (event) => {
    if (!event._id && !event.id) return;
    const eventId = event._id || event.id;
    setJoiningId(eventId);

    try {
      // Use tickets from event object if available, otherwise fetch
      let ticketsList = event.tickets || [];

      if (ticketsList.length === 0) {
        try {
          const ticketData = await getMiniSiteEventTickets(siteId, eventId, token);
          ticketsList = Array.isArray(ticketData) ? ticketData : ticketData?.data || ticketData?.tickets || [];
        } catch (err) {
          console.warn('Failed to fetch tickets:', err);
        }
      }

      setTickets(ticketsList);
      // Pre-select first ticket if available
      if (ticketsList.length > 0) {
        setSelectedTicket(ticketsList[0]);
      }
      // Just show the join modal, don't navigate to detail view
      setSelectedEvent(event);
      setJoinFlow({
        eventId,
        step: ticketsList.length > 0 ? 'ticket' : 'members',
        ticketId: ticketsList.length > 0 ? (ticketsList[0]._id || ticketsList[0].id) : null,
        quantity: 1,
        members: [{ name: '', age: '' }],
        submitting: false
      });
    } catch (err) {
      console.error('Failed to load event:', err);
      alert('Failed to load event. Please try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveEvent = async (eventId) => {
    if (!eventId) return;
    setJoiningId(eventId);

    try {
      await leaveMiniSiteEvent(siteId, eventId, token);
      setJoinedEventIds(prev => {
        const n = new Set(prev);
        n.delete(eventId);
        return n;
      });

      // Update events list
      setEvents(prev => prev.map(ev =>
        (ev._id === eventId || ev.id === eventId)
          ? { ...ev, joined: false, isJoined: false }
          : ev
      ));
    } catch (err) {
      console.error('Failed to leave event:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const handleSubmitJoin = async () => {
    if (!joinFlow) return;
    setJoinFlow(prev => prev ? { ...prev, submitting: true } : prev);

    try {
      const result = await joinMiniSiteEvent(siteId, joinFlow.eventId, {
        ticketId: joinFlow.ticketId,
        quantity: joinFlow.quantity,
        attendeeDetails: joinFlow.members
      }, token);

      // Update the joined status
      setJoinedEventIds(prev => new Set([...prev, joinFlow.eventId]));

      // Update events list to reflect joined status
      setEvents(prev => prev.map(ev =>
        (ev._id === joinFlow.eventId || ev.id === joinFlow.eventId)
          ? { ...ev, joined: true, isJoined: true, hasJoined: true }
          : ev
      ));

      // Update selected event if viewing details
      if (selectedEvent && (selectedEvent._id === joinFlow.eventId || selectedEvent.id === joinFlow.eventId)) {
        setSelectedEvent(prev => ({ ...prev, joined: true, isJoined: true, hasJoined: true }));
      }

      // Show success message
      setJoinSuccess(true);
      setTimeout(() => {
        setJoinFlow(null);
        setJoinSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to join event:', err);
      alert('❌ Failed to join event: ' + (err.message || 'Unknown error'));
    } finally {
      setJoinFlow(prev => prev ? { ...prev, submitting: false } : prev);
    }
  };

  const loadDiscussions = async () => {
    if (!selectedEvent || !token) return;
    try {
      const eventId = selectedEvent._id || selectedEvent.id;
      const data = await getMiniSiteEventDiscussions(siteId, eventId, { limit: 50 }, token);

      // Map API response to comments format
      let discussionsList = [];
      if (data?.data?.discussions) {
        discussionsList = data.data.discussions;
      } else if (data?.discussions) {
        discussionsList = data.discussions;
      } else if (Array.isArray(data?.data)) {
        discussionsList = data.data;
      } else if (Array.isArray(data)) {
        discussionsList = data;
      }

      // Transform to comment format
      const formattedComments = discussionsList.map(disc => ({
        id: disc._id || disc.id,
        author: disc.author?.fullName || 'User',
        authorAvatar: disc.author?.avatar || '',
        authorLocation: disc.author?.location || '',
        authorId: disc.author?._id || disc.author?.id || '',
        text: disc.caption || '',
        time: disc.time ? new Date(disc.time).toLocaleString() : 'Just now',
        media: disc.media || [],
        likeCount: disc.likeCount || 0,
        commentCount: disc.commentCount || 0,
        liked: !!(disc.liked ?? disc.likedByMe ?? disc.isLiked),
        raw: disc
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    }
  };

  // Matches CreatePostModal's onPostCreate payload shape — same as the
  // mini-site group posts composer.
  const handlePostDiscussion = async (postData) => {
    if (!selectedEvent || !token) return;
    const eventId = selectedEvent._id || selectedEvent.id;
    const mediaFiles = [
      ...(postData.images && postData.images.length > 0
        ? postData.images.map(img => img.file).filter(Boolean)
        : []),
      ...(postData.video ? [postData.video] : [])
    ];

    try {
      await createMiniSiteEventDiscussion(
        siteId,
        eventId,
        {
          caption: postData.caption,
          mediaFiles: mediaFiles.length > 0 ? mediaFiles : null
        },
        token
      );
      setDiscComposerOpen(false);
      await loadDiscussions();
    } catch (err) {
      console.error('Failed to post discussion:', err);
      throw err;
    }
  };


  const handleLikeDiscussion = async (discussionId) => {
    if (!selectedEvent || !token || likingDiscId) return;
    const eventId = selectedEvent._id || selectedEvent.id;
    const target = comments.find(c => c.id === discussionId);
    if (!target) return;
    const wasLiked = target.liked;

    // Optimistic toggle
    setComments(prev => prev.map(c => c.id === discussionId
      ? { ...c, liked: !wasLiked, likeCount: c.likeCount + (wasLiked ? -1 : 1) }
      : c
    ));
    setLikingDiscId(discussionId);
    try {
      const response = wasLiked
        ? await unlikeMiniSiteEventDiscussion(siteId, eventId, discussionId, token)
        : await likeMiniSiteEventDiscussion(siteId, eventId, discussionId, token);

      // Sync with the server's authoritative { data: { liked, likeCount } }
      // instead of trusting the optimistic guess.
      const liked = response?.data?.liked;
      const likeCount = response?.data?.likeCount;
      if (liked !== undefined || likeCount !== undefined) {
        setComments(prev => prev.map(c => c.id === discussionId
          ? { ...c, liked: liked ?? c.liked, likeCount: likeCount ?? c.likeCount }
          : c
        ));
      }
    } catch (err) {
      console.error('Failed to like/unlike discussion:', err);
      // Revert on failure
      setComments(prev => prev.map(c => c.id === discussionId
        ? { ...c, liked: wasLiked, likeCount: c.likeCount + (wasLiked ? 1 : -1) }
        : c
      ));
    } finally {
      setLikingDiscId(null);
    }
  };

  const loadDiscComments = async (discussionId) => {
    if (!selectedEvent || !token) return;
    setDiscCommentsLoading(prev => ({ ...prev, [discussionId]: true }));
    try {
      const eventId = selectedEvent._id || selectedEvent.id;
      const data = await getMiniSiteEventDiscussionComments(siteId, eventId, discussionId, { limit: 50 }, token);
      const list = data?.data?.comments ?? data?.comments ?? (Array.isArray(data?.data) ? data.data : []) ?? [];
      setDiscPostComments(prev => ({ ...prev, [discussionId]: list }));
    } catch (err) {
      console.error('Failed to load discussion comments:', err);
    } finally {
      setDiscCommentsLoading(prev => ({ ...prev, [discussionId]: false }));
    }
  };

  const toggleDiscExpanded = (discussionId) => {
    setExpandedDiscComments(prev => {
      const next = new Set(prev);
      if (next.has(discussionId)) {
        next.delete(discussionId);
      } else {
        next.add(discussionId);
        if (!discPostComments[discussionId]) loadDiscComments(discussionId);
      }
      return next;
    });
  };

  const handleAddDiscComment = async (discussionId) => {
    const text = (discCommentText[discussionId] || '').trim();
    if (!text || !selectedEvent || !token) return;
    const eventId = selectedEvent._id || selectedEvent.id;
    try {
      await createMiniSiteEventDiscussionComment(siteId, eventId, discussionId, { text }, token);
      setDiscCommentText(prev => ({ ...prev, [discussionId]: '' }));
      setComments(prev => prev.map(c => c.id === discussionId ? { ...c, commentCount: c.commentCount + 1 } : c));
      await loadDiscComments(discussionId);
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('❌ Failed to post comment: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && events.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#6b7280' }}>
        Loading events...
      </div>
    );
  }

  if (view === 'detail' && selectedEvent) {
    const isJoined = joinedEventIds.has(selectedEvent._id || selectedEvent.id);
    const eventId = selectedEvent._id || selectedEvent.id;
    const mapAddress = eventLocationLabel(selectedEvent);
    const hasMapAddress = mapAddress && mapAddress !== 'N/A' && mapAddress !== 'Online';

    return (
      <div className="mini-site-events-detail">
        <div className="msev-detail-header" style={{
          background: (selectedEvent.coverImages?.[0] || selectedEvent.image) ? `url(${selectedEvent.coverImages?.[0] || selectedEvent.image})` : 'linear-gradient(135deg, #1a1f2e 0%, #0d1720 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '400px',
          position: 'relative'
        }}>
          <button
            className="msev-back-btn"
            onClick={() => setView('list')}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <BackIcon />
          </button>
        </div>

        {/* Hero row: calendar badge + title/location — matches EventsPage.jsx's ev-detail-hero */}
        <div className="msev-detail-hero">
          <div className="msev-detail-cal-badge">
            <div className="msev-detail-cal-top">
              {selectedEvent.startDate ? new Date(`${selectedEvent.startDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '—'}
            </div>
            <div className="msev-detail-cal-day">
              {selectedEvent.startDate ? new Date(`${selectedEvent.startDate}T00:00:00`).getDate() : '?'}
            </div>
            <div className="msev-detail-cal-year">
              {selectedEvent.startDate ? new Date(`${selectedEvent.startDate}T00:00:00`).getFullYear() : ''}
            </div>
          </div>
          <div className="msev-detail-hero-info">
            <h1 className="msev-detail-title">{selectedEvent.title || selectedEvent.name}</h1>
            <p className="msev-detail-location"><MapPinIcon /> <ClickableLocation location={eventLocationLabel(selectedEvent)} /></p>
          </div>
        </div>

        {/* Tabs + join/leave action, same row */}
        <div className="msev-detail-tab-row">
          <div style={{ display: 'flex', gap: '32px' }}>
            <button
              onClick={() => setDetailTab('about')}
              style={{
                padding: '16px 0',
                background: 'none',
                border: 'none',
                color: detailTab === 'about' ? '#1d4ed8' : '#64748b',
                fontSize: '14px',
                fontWeight: detailTab === 'about' ? '700' : '500',
                cursor: 'pointer',
                borderBottom: detailTab === 'about' ? '2px solid #1d4ed8' : 'none',
                transition: 'all 0.2s'
              }}
            >
              About
            </button>
            <button
              onClick={() => setDetailTab('discussion')}
              style={{
                padding: '16px 0',
                background: 'none',
                border: 'none',
                color: detailTab === 'discussion' ? '#1d4ed8' : '#64748b',
                fontSize: '14px',
                fontWeight: detailTab === 'discussion' ? '700' : '500',
                cursor: 'pointer',
                borderBottom: detailTab === 'discussion' ? '2px solid #1d4ed8' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Discussion
            </button>
          </div>

          <button
            onClick={() => isJoined ? handleLeaveEvent(eventId) : handleJoinEvent(selectedEvent)}
            disabled={joiningId === eventId}
            style={{
              padding: isJoined ? '10px 20px' : '10px 24px',
              background: isJoined ? 'rgba(239,68,68,0.1)' : '#1d4ed8',
              color: isJoined ? '#f87171' : '#fff',
              border: isJoined ? '1px solid rgba(239,68,68,0.3)' : '1px solid #2563eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {joiningId === eventId ? (isJoined ? 'Leaving...' : 'Joining...') : (isJoined ? '✓ Joined' : '+ Join')}
          </button>
        </div>

        {/* About Tab: main column + sticky map sidebar, matches ev-detail-body */}
        {detailTab === 'about' && (
          <div className="msev-detail-body" style={!hasMapAddress ? { gridTemplateColumns: '1fr' } : undefined}>
            <div className="msev-detail-main">
              {/* DETAILS Card */}
              {selectedEvent.memberCount > 0 && (
                <div className="msev-detail-card">
                  <h3 className="msev-detail-card-title">Details</h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0' }}>{selectedEvent.memberCount || 0} people responded</p>
                </div>
              )}

              {/* About the Event Card */}
              {selectedEvent.description && (
                <div className="msev-detail-card">
                  <h3 className="msev-detail-card-title">About the Event</h3>
                  <p style={{ color: '#7a8aaa', lineHeight: '1.75', margin: '0', fontSize: '13.5px' }}>{selectedEvent.description}</p>
                </div>
              )}

              {/* Event Info Card */}
              {selectedEvent.startDate && (
                <div className="msev-detail-card">
                  <h3 className="msev-detail-card-title">Event Info</h3>
                  <div className="msev-detail-info-rows">
                    <div className="msev-detail-info-row"><CalendarIcon /><span>{formatEventDate(selectedEvent)}</span></div>
                    <div className="msev-detail-info-row"><MapPinIcon /><ClickableLocation location={eventLocationLabel(selectedEvent)} /></div>
                    {(selectedEvent.virtual?.link || selectedEvent.virtualLink) && (
                      <div className="msev-detail-info-row">
                        <LinkIcon />
                        <a
                          href={(selectedEvent.virtual?.link || selectedEvent.virtualLink).startsWith('http') ? (selectedEvent.virtual?.link || selectedEvent.virtualLink) : `https://${selectedEvent.virtual?.link || selectedEvent.virtualLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#60a5fa' }}
                        >
                          {selectedEvent.virtual?.link || selectedEvent.virtualLink}
                        </a>
                      </div>
                    )}
                    {selectedEvent.eventType && (
                      <div className="msev-detail-info-row">
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', background: 'rgba(96,165,250,0.13)', color: '#60a5fa' }}>
                          {selectedEvent.eventType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Virtual Instructions Card */}
              {(selectedEvent.virtual?.instructions || selectedEvent.virtualInstructions) && (
                <div className="msev-detail-card">
                  <h3 className="msev-detail-card-title">How to Join</h3>
                  <p style={{ color: '#7a8aaa', lineHeight: '1.75', margin: '0', fontSize: '13.5px', whiteSpace: 'pre-line' }}>
                    {selectedEvent.virtual?.instructions || selectedEvent.virtualInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Map sidebar — hidden entirely for Online events, since there's no
                real address to map and it was showing "Online" twice (once as
                the map placeholder, once in the footer) */}
            {hasMapAddress && (
              <div className="msev-detail-sidebar">
                <div className="msev-detail-map-card">
                  <div className="msev-detail-map-bg">
                    <iframe
                      className="msev-map-iframe"
                      title="Event location"
                      src={googleMapsEmbedSrc(mapAddress)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="msev-detail-map-footer">
                    <p className="msev-detail-map-venue"><ClickableLocation location={mapAddress} /></p>
                    <button
                      className="msev-detail-map-btn"
                      onClick={() => window.open(googleMapsSearchUrl(mapAddress), '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLinkIcon /> Open in Maps
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {detailTab === 'discussion' && (
          <div className="msev-detail-body">
          <div className="msev-detail-main">
            {/* Comment Composer Trigger */}
            {isJoined && (
              <input
                type="text"
                placeholder="Share something with attendees…"
                onClick={() => setDiscComposerOpen(true)}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#111422',
                  border: '1px solid #1a1f35',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginBottom: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f35'}
              />
            )}

            {/* Composer — same CreatePostModal used for mini-site group posts */}
            {discComposerOpen && isJoined && (
              <CreatePostModal
                onClose={() => setDiscComposerOpen(false)}
                siteId={siteId}
                isMinSiteFeed={true}
                onPostCreate={handlePostDiscussion}
              />
            )}

            {/* Discussion Posts Feed */}
            <div className="msev-disc-posts">
              {!isJoined && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>
                  Join this event to see discussions
                </p>
              )}

              {isJoined && comments.length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>
                  No posts yet — be the first to share something.
                </p>
              )}

              {comments.map((comment) => {
                const isExpanded = expandedDiscComments.has(comment.id);
                return (
                <div key={comment.id} className="msev-disc-post">
                  <div className="msev-disc-post-header" style={{ position: 'relative' }}>
                    {comment.authorAvatar
                      ? <img src={comment.authorAvatar} alt={comment.author} className="msev-disc-comment-av" />
                      : <span className="msev-disc-comment-av msev-disc-av-fallback">{comment.author ? comment.author[0]?.toUpperCase() : '?'}</span>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="msev-disc-author-row">{comment.author || 'Anonymous'}</p>
                      {comment.authorLocation && (
                        <p className="msev-disc-author-loc"><MapPinIcon /> {comment.authorLocation}</p>
                      )}
                      <p className="msev-disc-post-time">{comment.time || 'Just now'}</p>
                    </div>
                  </div>

                  {/* Post Caption */}
                  {comment.text && <p className="msev-disc-post-caption">{comment.text}</p>}

                  {/* Media Grid */}
                  {comment.media && comment.media.length > 0 && (
                    <div className={`msev-disc-post-media msev-disc-post-media--${Math.min(comment.media.length, 4)}`}>
                      {comment.media.map((media, i) => (
                        media.type === 'video' || media.mediaType?.includes('video') ? (
                          <video key={i} src={media.url} controls />
                        ) : (
                          <img key={i} src={media.url} alt="discussion media" />
                        )
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {comment.raw?.reactions && Object.keys(comment.raw.reactions).length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px', fontSize: '12px' }}>
                      {Object.entries(comment.raw.reactions).filter(([_, count]) => count > 0).map(([reactionId, count]) => {
                        const reactionEmoji = { like: '👍', celebrate: '👏', support: '🫶', love: '❤️', insightful: '💡', funny: '😄' }[reactionId];
                        return reactionEmoji ? (
                          <span key={reactionId} style={{ background: 'rgba(29, 78, 216, 0.1)', border: '1px solid rgba(29, 78, 216, 0.2)', borderRadius: '20px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#60a5fa' }}>
                            <span style={{ fontSize: '15px' }}>{reactionEmoji}</span>
                            {count > 1 && <span>{count}</span>}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Like / Comment action row — matches EventsPage.jsx's discussion posts */}
                  <div className="msev-disc-post-actions">
                    <button
                      className={`msev-disc-action-btn${comment.liked ? ' msev-disc-action-btn--active' : ''}`}
                      onClick={() => handleLikeDiscussion(comment.id)}
                      disabled={likingDiscId === comment.id}
                    >
                      <span style={{ fontSize: '16px' }}>👍</span> {comment.liked ? 'Liked' : 'Like'} ({comment.likeCount})
                    </button>
                    <div className="msev-disc-action-divider" />
                    <button className="msev-disc-action-btn" onClick={() => toggleDiscExpanded(comment.id)}>
                      <span style={{ fontSize: '16px' }}>💬</span> Comment ({comment.commentCount})
                    </button>
                  </div>

                  {/* Inline comments */}
                  {isExpanded && (
                    <div className="msev-disc-comments">
                      {isJoined && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <input
                            type="text"
                            placeholder="Write a comment…"
                            value={discCommentText[comment.id] || ''}
                            onChange={(e) => setDiscCommentText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddDiscComment(comment.id)}
                            style={{ flex: 1, padding: '8px 12px', background: '#0f172a', color: '#e2e8f0', border: '1px solid #1a1f35', borderRadius: '20px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                          />
                          <button
                            onClick={() => handleAddDiscComment(comment.id)}
                            disabled={!(discCommentText[comment.id] || '').trim()}
                            style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: (discCommentText[comment.id] || '').trim() ? 1 : 0.5 }}
                          >
                            Post
                          </button>
                        </div>
                      )}

                      {discCommentsLoading[comment.id] ? (
                        <p style={{ textAlign: 'center', color: '#6b7a9e', fontSize: '13px', margin: 0 }}>Loading comments…</p>
                      ) : (discPostComments[comment.id] || []).length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7a9e', fontSize: '13px', margin: 0 }}>No comments yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {discPostComments[comment.id].map((c, i) => (
                            <div key={c._id || c.id || i} style={{ display: 'flex', gap: '10px' }}>
                              {c.author?.avatar
                                ? <img src={c.author.avatar} alt="" className="msev-disc-comment-av" />
                                : <span className="msev-disc-comment-av msev-disc-av-fallback">{(c.author?.fullName || 'U')[0]?.toUpperCase()}</span>
                              }
                              <div style={{ background: '#0f172a', border: '1px solid #1a1f35', borderRadius: '12px', padding: '8px 12px', flex: 1 }}>
                                <p style={{ margin: '0 0 2px', fontSize: '12.5px', fontWeight: 700, color: '#c8d3e8' }}>{c.author?.fullName || 'User'}</p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#c8d3e8', lineHeight: 1.5 }}>{c.text}</p>
                                {c.createdAt && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#4a5270' }}>{new Date(c.createdAt).toLocaleString()}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>

          {/* Right: description sidebar — matches EventsPage.jsx's discussion tab */}
          <div className="msev-detail-sidebar">
            <div className="msev-detail-card">
              <h3 className="msev-detail-card-title">Description</h3>

              <div className="msev-detail-info-rows" style={{ marginBottom: 16 }}>
                <div className="msev-detail-info-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>{selectedEvent.memberCount || 0} people responded</span>
                </div>
                <div className="msev-detail-info-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{(selectedEvent.organizer?.fullName || selectedEvent.createdBy?.fullName) ? `${selectedEvent.organizer?.fullName || selectedEvent.createdBy?.fullName}'s Event` : selectedEvent.title}</span>
                </div>
                <div className="msev-detail-info-row">
                  <MapPinIcon />
                  <ClickableLocation location={mapAddress} />
                </div>
                <div className="msev-detail-info-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>
                    {selectedEvent.visibility === 'friends' ? 'Friends only · Only friends can join'
                      : selectedEvent.visibility === 'only_me' ? 'Only me · Private event'
                      : 'Public · Anyone can join'}
                  </span>
                </div>
              </div>

              <p style={{ color: '#7a8aaa', lineHeight: '1.75', margin: 0, fontSize: '13.5px' }}>{selectedEvent.description || selectedEvent.about}</p>

              {selectedEvent.category && (
                <div style={{ marginTop: 14 }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', background: (selectedEvent.categoryColor || '#7c3aed') + '22', color: selectedEvent.categoryColor || '#7c3aed', border: `1px solid ${selectedEvent.categoryColor || '#7c3aed'}44` }}>
                    {selectedEvent.category}
                  </span>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  const filteredEvents = activeTab === 'joined'
    ? events.filter(ev => joinedEventIds.has(ev._id || ev.id))
    : events.filter(ev => !joinedEventIds.has(ev._id || ev.id));

  return (
    <div className="mini-site-events-list">
      {/* Join Modal */}
      {joinFlow && selectedEvent && (
        <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={() => setJoinFlow(null)}>
      <div style={{
        background: '#0b0d17',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '550px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        border: '1px solid #1a1f35'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '20px' }}>
          {joinFlow.step === 'ticket' ? 'Select Ticket' : joinFlow.step === 'members' ? 'Your Details' : 'Confirm & Join'}
        </h2>

        {joinFlow.step === 'ticket' && tickets.length > 0 && (
          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {tickets.map(ticket => (
                  <label key={ticket._id || ticket.id} style={{
                    padding: '16px',
                    border: `2px solid ${(selectedTicket?._id === (ticket._id || ticket.id) || selectedTicket?.id === (ticket._id || ticket.id)) ? '#1d4ed8' : '#1a1f35'}`,
                    borderRadius: '8px',
                    background: (selectedTicket?._id === (ticket._id || ticket.id) || selectedTicket?.id === (ticket._id || ticket.id)) ? 'rgba(29, 78, 216, 0.1)' : '#111422',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <input
                      type="radio"
                      name="ticket"
                      checked={selectedTicket?._id === (ticket._id || ticket.id) || selectedTicket?.id === (ticket._id || ticket.id)}
                      onChange={() => {
                        setSelectedTicket(ticket);
                        setJoinFlow(prev => prev ? { ...prev, ticketId: ticket._id || ticket.id } : prev);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontWeight: '600' }}>
                        {ticket.name || ticket.type || 'Standard Ticket'} {ticket.price ? `- $${ticket.price}` : '(Free)'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {joinFlow.step === 'confirm' && (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: '#111422', borderRadius: '8px', borderLeft: '3px solid #1d4ed8' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Order Summary</h3>

                  <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1a1f35' }}>
                      <span>Ticket:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{selectedTicket?.name || 'Standard'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1a1f35' }}>
                      <span>Attendee:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{joinFlow.members[0]?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1a1f35' }}>
                      <span>Quantity:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{joinFlow.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>Price per Ticket:</span>
                      <span style={{ color: '#86efac', fontWeight: '600', fontSize: '14px' }}>${selectedTicket?.price || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid #1a1f35', marginTop: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>Total Amount:</span>
                      <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '16px' }}>${(selectedTicket?.price || 0) * (joinFlow.quantity || 1)}</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: '#64748b', fontSize: '12px', margin: '0', textAlign: 'center' }}>
                  You'll be charged after confirming this purchase
                </p>
              </div>
            )}

            {joinFlow.step === 'members' && (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={joinFlow.quantity}
                    onChange={(e) => setJoinFlow(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : prev)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#111422',
                      border: '1px solid #1a1f35',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Your Details</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={joinFlow.members[0]?.name || ''}
                      onChange={(e) => setJoinFlow(prev => prev ? { ...prev, members: [{ ...prev.members[0], name: e.target.value }] } : prev)}
                      style={{
                        padding: '10px',
                        background: '#111422',
                        border: '1px solid #1a1f35',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Your Age"
                      min="1"
                      max="120"
                      value={joinFlow.members[0]?.age || ''}
                      onChange={(e) => setJoinFlow(prev => prev ? { ...prev, members: [{ ...prev.members[0], age: parseInt(e.target.value) || '' }] } : prev)}
                      style={{
                        padding: '10px',
                        background: '#111422',
                        border: '1px solid #1a1f35',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  if (joinFlow.step !== 'ticket') {
                    setJoinFlow(prev => prev ? { ...prev, step: 'ticket' } : prev);
                  } else {
                    setJoinFlow(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid #1a1f35',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {joinFlow.step !== 'ticket' ? 'Back' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (joinFlow.step === 'ticket') {
                    setJoinFlow(prev => prev ? { ...prev, step: 'members' } : prev);
                  } else if (joinFlow.step === 'members') {
                    setJoinFlow(prev => prev ? { ...prev, step: 'confirm' } : prev);
                  } else {
                    handleSubmitJoin();
                  }
                }}
                disabled={joinFlow.submitting || (joinFlow.step === 'ticket' && !selectedTicket) || (joinFlow.step === 'members' && !joinFlow.members[0]?.name)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1d4ed8',
                  color: '#fff',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: (joinFlow.submitting || (joinFlow.step === 'ticket' && !selectedTicket) || (joinFlow.step === 'members' && !joinFlow.members[0]?.name)) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {joinFlow.submitting ? 'Processing...' : joinFlow.step === 'ticket' ? 'Next' : joinFlow.step === 'members' ? 'Review' : 'Pay & Join'}
              </button>
            </div>
          </div>
        </div>
        )}

      {/* Event Preview Popup — for a not-yet-joined event clicked from the
          All Events grid. Same get-by-id data as the full detail page, shown
          as a modal instead of navigating (since Discussion needs joining). */}
      {previewEvent && (() => {
        const previewIsJoined = joinedEventIds.has(previewEvent._id || previewEvent.id);
        const previewLocation = eventLocationLabel(previewEvent);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setPreviewEvent(null)}>
            <div style={{ background: '#0b0d17', borderRadius: '12px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid #1a1f35' }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                height: '220px',
                background: (previewEvent.coverImages?.[0] || previewEvent.image) ? `url(${previewEvent.coverImages?.[0] || previewEvent.image})` : 'linear-gradient(135deg, #1a1f2e 0%, #0d1720 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: '12px 12px 0 0'
              }}>
                <button
                  onClick={() => setPreviewEvent(null)}
                  style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#e2e8f0' }}>{previewEvent.title || previewEvent.name}</h2>
                  {previewEvent.eventType && (
                    <span style={{ flexShrink: 0, padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '700', background: 'rgba(96,165,250,0.13)', color: '#60a5fa', textTransform: 'uppercase' }}>
                      {previewEvent.eventType}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13.5px' }}>
                    <CalendarIcon /> {formatEventDate(previewEvent)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13.5px' }}>
                    <MapPinIcon /> <ClickableLocation location={previewLocation} />
                  </div>
                  {(previewEvent.virtual?.link || previewEvent.virtualLink) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13.5px' }}>
                      <LinkIcon /> {previewEvent.virtual?.link || previewEvent.virtualLink}
                    </div>
                  )}
                </div>

                {previewLoading && !previewEvent.description && (
                  <p style={{ color: '#6b7a9e', fontSize: '13px' }}>Loading details…</p>
                )}

                {previewEvent.description && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>About the Event</h3>
                    <p style={{ color: '#c8d3e8', fontSize: '13.5px', lineHeight: '1.7', margin: 0 }}>{previewEvent.description}</p>
                  </div>
                )}

                {(previewEvent.virtual?.instructions || previewEvent.virtualInstructions) && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>How to Join</h3>
                    <p style={{ color: '#c8d3e8', fontSize: '13.5px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>{previewEvent.virtual?.instructions || previewEvent.virtualInstructions}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (previewIsJoined) {
                      const ev = previewEvent;
                      setPreviewEvent(null);
                      handleSelectEvent(ev);
                    } else {
                      const ev = previewEvent;
                      setPreviewEvent(null);
                      handleJoinEvent(ev);
                    }
                  }}
                  disabled={joiningId === (previewEvent._id || previewEvent.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: previewIsJoined ? 'rgba(96,165,250,0.12)' : '#1d4ed8',
                    color: previewIsJoined ? '#60a5fa' : '#fff',
                    border: previewIsJoined ? '1px solid rgba(96,165,250,0.3)' : '1px solid #2563eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}
                >
                  {previewIsJoined ? 'View Event' : '+ Join Event'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="msev-header">
        <div className="msev-tabs">
          <button
            className={`msev-tab ${activeTab === 'all' ? 'msev-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Events
          </button>
          <button
            className={`msev-tab ${activeTab === 'joined' ? 'msev-tab--active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            Joined Events
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
            {activeTab === 'joined' ? 'You haven\'t joined any events yet.' : 'No events yet. Check back soon!'}
          </div>
        ) : (
          <div className="msev-grid">
            {filteredEvents.map(event => {
              const isJoined = joinedEventIds.has(event._id || event.id);
              const eventId = event._id || event.id;

              return (
                <div
                  key={eventId}
                  className="msev-card msev-card--clickable"
                  onClick={() => isJoined ? handleSelectEvent(event) : handleOpenPreview(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="msev-card-img-wrap">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="msev-card-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1720 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon />
                      </div>
                    )}

                    <div className="msev-date-badge">
                      <span className="msev-date-day">{event.day || '?'}</span>
                      <span className="msev-date-month">{event.month || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="msev-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h3 className="msev-card-title" style={{ margin: 0, flex: 1 }}>{event.title || event.name}</h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        background: (event.pricingType === 'paid' || event.isPaid) ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: (event.pricingType === 'paid' || event.isPaid) ? '#fb923c' : '#86efac',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {(event.pricingType === 'paid' || event.isPaid) ? 'PAID' : 'FREE'}
                      </span>
                    </div>

                    {event.description && (
                      <p className="msev-card-desc">{event.description}</p>
                    )}

                    <div className="msev-card-footer">
                      <div className="msev-card-meta">
                        {event.location && (
                          <div className="msev-card-loc">
                            <MapPinIcon />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.memberCount && (
                          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👥 {event.memberCount} attending
                          </div>
                        )}
                      </div>

                      <button
                        className={`msev-join-btn${isJoined ? ' msev-join-btn--joined' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          isJoined ? handleLeaveEvent(eventId) : handleJoinEvent(event);
                        }}
                        disabled={joiningId === eventId}
                      >
                        {joiningId === eventId ? '⟳' : (isJoined ? '✓ Joined' : '+ Join')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
