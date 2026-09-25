import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  getMiniSiteEvents, getMiniSiteEventDetail, getMiniSiteEventTickets,
  joinMiniSiteEvent, leaveMiniSiteEvent, getMiniSiteEventAttendees,
  createMiniSiteEventDiscussion, getMiniSiteEventDiscussions,
  deleteMiniSiteEventDiscussion
} from '../../services/api';
import ImageCropper from './ImageCropper';
import './MiniSiteEventsPage.css';

function BackIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function ImageIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}

function MapPinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function TicketIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
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
  const [commentText, setCommentText] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [discComposerOpen, setDiscComposerOpen] = useState(false);
  const [discPostCaption, setDiscPostCaption] = useState('');
  const [cropQueue, setCropQueue] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCropQueue(files);
  };

  const handleCropSave = (croppedFile) => {
    setUploadedFiles(prev => [...prev, croppedFile]);
    // Move to next file in queue
    setCropQueue(prev => prev.slice(1));
  };

  const handleCropSkip = () => {
    if (cropQueue.length > 0) {
      setUploadedFiles(prev => [...prev, cropQueue[0]]);
    }
    // Move to next file in queue
    setCropQueue(prev => prev.slice(1));
  };

  const handleCropCancel = () => {
    setCropQueue([]);
    setUploadedFiles([]);
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
        text: disc.caption || '',
        time: disc.time ? new Date(disc.time).toLocaleString() : 'Just now',
        media: disc.media || [],
        likeCount: disc.likeCount || 0,
        commentCount: disc.commentCount || 0,
        raw: disc
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    }
  };

  const handlePostDiscussion = async () => {
    if (!selectedEvent || !token) return;
    if (!discPostCaption.trim() && uploadedFiles.length === 0) {
      alert('Please add a caption or upload photos/videos');
      return;
    }

    setPostingDiscussion(true);
    try {
      const eventId = selectedEvent._id || selectedEvent.id;
      const result = await createMiniSiteEventDiscussion(
        siteId,
        eventId,
        {
          caption: discPostCaption,
          mediaFiles: uploadedFiles.length > 0 ? uploadedFiles : null
        },
        token
      );

      // Reset form
      setDiscPostCaption('');
      setUploadedFiles([]);
      setDiscComposerOpen(false);

      // Fetch updated discussions
      await loadDiscussions();
    } catch (err) {
      console.error('Failed to post discussion:', err);
      alert('❌ Failed to post: ' + (err.message || 'Unknown error'));
    } finally {
      setPostingDiscussion(false);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!selectedEvent || !token) return;

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeletingId(discussionId);
    try {
      const eventId = selectedEvent._id || selectedEvent.id;
      await deleteMiniSiteEventDiscussion(siteId, eventId, discussionId, token);

      // Remove from comments
      setComments(prev => prev.filter(c => c.id !== discussionId));
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete discussion:', err);
      alert('❌ Failed to delete: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
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

        <div className="msev-detail-content" style={{ padding: '32px', background: '#0b0d17', borderBottom: '1px solid #1a1f35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>
                {selectedEvent.title || selectedEvent.name}
              </h1>

              <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <CalendarIcon />
                  <span>{formatEventDate(selectedEvent)}</span>
                </div>
                {selectedEvent.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                    <MapPinIcon />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.eventType && (
                  <div style={{ display: 'inline-block', padding: '6px 14px', background: 'transparent', borderRadius: '20px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', border: '1px solid #1a1f35' }}>
                    {selectedEvent.eventType}
                  </div>
                )}
              </div>
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
              {joiningId === eventId ? (isJoined ? 'Leaving...' : 'Joining...') : (isJoined ? 'Leave Event' : '+ Join')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '32px', padding: '0 32px', borderBottom: '1px solid #1a1f35', background: '#070b14' }}>
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

        {/* About Tab */}
        {detailTab === 'about' && (
          <div style={{ padding: '32px', display: 'grid', gap: '20px' }}>
            {/* DETAILS Card */}
            {selectedEvent.memberCount > 0 && (
              <div style={{ background: '#111422', border: '1px solid #1a1f35', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '0 0 12px' }}>DETAILS</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0' }}>{selectedEvent.memberCount || 0} people responded</p>
              </div>
            )}

            {/* About the Event Card */}
            {selectedEvent.description && (
              <div style={{ background: '#111422', border: '1px solid #1a1f35', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '0 0 12px' }}>ABOUT THE EVENT</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0', fontSize: '14px' }}>{selectedEvent.description}</p>
              </div>
            )}

            {/* Event Info Card */}
            {selectedEvent.startDate && (
              <div style={{ background: '#111422', border: '1px solid #1a1f35', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '0 0 12px' }}>EVENT INFO</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                    <CalendarIcon />
                    <span>{formatEventDate(selectedEvent)}</span>
                  </div>
                  {selectedEvent.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                      <MapPinIcon />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {(selectedEvent.virtual?.link || selectedEvent.virtualLink) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', background: 'transparent', borderRadius: '20px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', width: 'fit-content', border: '1px solid #1a1f35' }}>
                      {selectedEvent.eventType}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Virtual Instructions Card */}
            {(selectedEvent.virtual?.instructions || selectedEvent.virtualInstructions) && (
              <div style={{ background: '#111422', border: '1px solid #1a1f35', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '0 0 12px' }}>HOW TO JOIN</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0', fontSize: '14px', whiteSpace: 'pre-line' }}>
                  {selectedEvent.virtual?.instructions || selectedEvent.virtualInstructions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {detailTab === 'discussion' && (
          <div style={{ padding: '32px' }}>
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
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f35'}
              />
            )}

            {/* Composer Modal */}
            {discComposerOpen && isJoined && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
              }} onClick={() => setDiscComposerOpen(false)}>
                <div style={{
                  background: '#0b0d17',
                  borderRadius: '12px',
                  padding: '24px',
                  maxWidth: '600px',
                  width: '90%',
                  border: '1px solid #1a1f35'
                }} onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#e2e8f0' }}>New Discussion Post</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Share an update, photo, or video with attendees.</p>
                    </div>
                    <button onClick={() => {
                      setDiscComposerOpen(false);
                      setDiscPostCaption('');
                    }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '24px' }}>✕</button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    placeholder="Share something with attendees…"
                    value={discPostCaption}
                    onChange={(e) => setDiscPostCaption(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#111422',
                      border: '1px solid #1a1f35',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      marginBottom: '16px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '100px',
                      boxSizing: 'border-box'
                    }}
                  />

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '1',
                          background: '#111422',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid #1a1f35'
                        }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt="uploaded"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '20px',
                              height: '20px',
                              background: 'rgba(0, 0, 0, 0.6)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Zone */}
                  <div
                    onClick={() => document.getElementById('disc-file-input')?.click()}
                    style={{
                      border: '2px dashed #1a1f35',
                      borderRadius: '8px',
                      padding: '40px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1f35'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#2563eb' }}>
                      <ImageIcon />
                    </div>
                    <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>Add photos or a video</p>
                    <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>JPG, PNG, GIF or MP4 — pick multiple at once</p>
                    <input
                      id="disc-file-input"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={handleFileSelection}
                    />
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setDiscComposerOpen(false);
                        setDiscPostCaption('');
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        color: '#94a3b8',
                        border: '1px solid #1a1f35',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostDiscussion}
                      disabled={(!discPostCaption.trim() && uploadedFiles.length === 0) || postingDiscussion}
                      style={{
                        padding: '10px 20px',
                        background: '#1d4ed8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: (discPostCaption.trim() || uploadedFiles.length > 0) && !postingDiscussion ? 1 : 0.5
                      }}
                    >
                      {postingDiscussion ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Cropper Modal */}
            {cropQueue.length > 0 && (
              <ImageCropper
                file={cropQueue[0]}
                index={uploadedFiles.length}
                total={uploadedFiles.length + cropQueue.length}
                defaultAspect="original"
                cropShape="rect"
                onSave={handleCropSave}
                onSkip={handleCropSkip}
                onCancel={handleCropCancel}
              />
            )}

            {/* Discussion Posts Feed */}
            <div style={{ display: 'grid', gap: '16px' }}>
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

              {comments.map((comment, idx) => {
                const isAuthor = user && comment.raw?.author?._id === user._id;
                return (
                <div key={idx} style={{ paddingBottom: '16px', borderBottom: '1px solid #1a1f35' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', position: 'relative' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600',
                      flexShrink: 0,
                      fontSize: '14px'
                    }}>
                      {comment.author ? comment.author[0]?.toUpperCase() : '?'}
                    </div>

                    {/* Post Header */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>
                        {comment.author || 'Anonymous'}
                      </p>
                      <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>
                        {comment.time || 'Just now'}
                      </p>
                    </div>

                    {/* Three Dot Menu - Only for Author */}
                    {isAuthor && (
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                          ⋮
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === comment.id && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            background: '#0b0d17',
                            border: '1px solid #1a1f35',
                            borderRadius: '6px',
                            minWidth: '150px',
                            zIndex: 100,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                          }}>
                            <button
                              onClick={() => handleDeleteDiscussion(comment.id)}
                              disabled={deletingId === comment.id}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: deletingId === comment.id ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                opacity: deletingId === comment.id ? 0.6 : 1
                              }}
                              onMouseEnter={(e) => !deletingId && (e.currentTarget.style.background = '#111422')}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Caption */}
                  {comment.text && (
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 12px', paddingLeft: '52px' }}>
                      {comment.text}
                    </p>
                  )}

                  {/* Media Grid */}
                  {comment.media && comment.media.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gap: '4px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        marginBottom: '12px',
                        marginLeft: '52px',
                        gridTemplateColumns: comment.media.length === 1 ? '1fr' :
                                            comment.media.length === 2 ? '1fr 1fr' :
                                            'repeat(2, 1fr)'
                      }}
                    >
                      {comment.media.map((media, i) => (
                        media.type === 'video' || media.mediaType?.includes('video') ? (
                          <video
                            key={i}
                            src={media.url}
                            controls
                            style={{
                              width: '100%',
                              height: '100%',
                              maxHeight: '360px',
                              objectFit: 'cover',
                              display: 'block',
                              background: '#0d1022'
                            }}
                          />
                        ) : (
                          <img
                            key={i}
                            src={media.url}
                            alt="discussion media"
                            style={{
                              width: '100%',
                              height: '100%',
                              maxHeight: '360px',
                              objectFit: 'cover',
                              display: 'block',
                              background: '#0d1022'
                            }}
                          />
                        )
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {comment.raw?.reactions && Object.keys(comment.raw.reactions).length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', paddingLeft: '52px', fontSize: '12px' }}>
                      {Object.entries(comment.raw.reactions).filter(([_, count]) => count > 0).map(([reactionId, count]) => {
                        const reactionEmoji = { like: '👍', celebrate: '👏', support: '🫶', love: '❤️', insightful: '💡', funny: '😄' }[reactionId];
                        return reactionEmoji ? (
                          <button
                            key={reactionId}
                            style={{
                              background: 'rgba(29, 78, 216, 0.1)',
                              border: '1px solid rgba(29, 78, 216, 0.2)',
                              borderRadius: '20px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                              color: '#60a5fa',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(29, 78, 216, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(29, 78, 216, 0.1)'}
                          >
                            <span style={{ fontSize: '15px' }}>{reactionEmoji}</span>
                            {count > 1 && <span>{count}</span>}
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
              }
              )}
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
                  onClick={() => isJoined && handleSelectEvent(event)}
                  style={{ cursor: isJoined ? 'pointer' : 'not-allowed', opacity: isJoined ? 1 : 0.7 }}
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
