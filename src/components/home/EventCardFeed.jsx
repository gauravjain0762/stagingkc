import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import ShareSheet from './ShareSheet';
import './EventCardFeed.css';

function MapPinIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function CalendarIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ShareIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>; }
function PeopleIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function InfoIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTimeWithAMPM(time) {
  if (!time) return '';
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time;
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

export default function EventCardFeed({ event, onEventClick, onUserClick }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [joined, setJoined] = useState(event.isAttending ?? false);
  const [shareOpen, setShareOpen] = useState(false);

  const isAuthor = user?._id === event.createdBy || user?.id === event.createdBy;

  const [attendeeCount, setAttendeeCount] = useState(event.attendingCount ?? event.attendees ?? event.totalAttending ?? 0);

  const eventImage = event.coverImages?.[0] ?? event.images?.[0] ?? event.coverImage ?? event.image ?? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&fit=crop';
  const eventTitle = event.title ?? 'Untitled Event';
  const eventDate = event.startDate ?? event.eventDate ?? 'TBA';
  const eventTime = event.isAllDay ? 'All Day' : formatTimeWithAMPM(event.startTime || '00:00');
  const isOnlineEvent = event.eventType === 'online';

  // Extract location as string (handle both string and object formats)
  let eventLocation = 'Location TBA';
  if (typeof event.location === 'string') {
    eventLocation = event.location;
  } else if (event.location?.city || event.city) {
    const city = event.location?.city ?? event.city;
    const state = event.location?.state ?? event.state ?? '';
    const country = event.location?.country ?? event.country ?? '';
    eventLocation = [city, state, country].filter(Boolean).join(', ');
  }

  const eventId = event._id ?? event.id;

  // Socket integration for real-time join/leave updates
  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    const handleUserJoined = (data) => {
      if (data.eventId === eventId) {
        setAttendeeCount(prev => prev + 1);
      }
    };

    const handleUserLeft = (data) => {
      if (data.eventId === eventId) {
        setAttendeeCount(prev => Math.max(0, prev - 1));
      }
    };

    socket.on('event:user-joined', handleUserJoined);
    socket.on('event:user-left', handleUserLeft);

    return () => {
      socket.off('event:user-joined', handleUserJoined);
      socket.off('event:user-left', handleUserLeft);
    };
  }, [eventId]);

  function handleJoin() {
    // Navigate to event detail page where user can join with ticket selection
    // (same UX as clicking Join in events module discovery view)
    onEventClick?.(eventId);
  }

  function handleDetails() {
    onEventClick?.(eventId);
  }

  const createdTime = timeAgo(event.createdAt);

  return (
    <>
      <article className="event-card-feed">
        {/* Cover Image */}
        <div className="ecf-cover">
          <img src={eventImage} alt={eventTitle} className="ecf-cover-img" />
        </div>

        {/* Content */}
        <div className="ecf-content">
          {/* Header */}
          <div className="ecf-header">
            <div>
              <h3 className="ecf-title">{eventTitle}</h3>
              <p className="ecf-time">{createdTime}</p>
            </div>
          </div>

          {/* Info */}
          <div className="ecf-info">
            <div className="ecf-info-row">
              <CalendarIcon />
              <span>{eventDate} at {eventTime}</span>
            </div>
            <div className="ecf-info-row">
              <MapPinIcon />
              <span>{isOnlineEvent ? 'Online' : eventLocation}</span>
              {!isOnlineEvent && <span className="ecf-status-badge">Offline</span>}
            </div>
            <div className="ecf-info-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>{attendeeCount} attending</span>
            </div>
          </div>

          {/* Actions - Match feed post design */}
          <div className="post-actions">
            <button
              className={`post-action-btn${joined || isAuthor ? ' post-action-btn--active' : ''}`}
              onClick={handleJoin}
              disabled={joined && !isAuthor}
            >
              {isAuthor ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19H4v-3L16.5 3.5z"/></svg> Manage
                </>
              ) : joined ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Joined
                </>
              ) : (
                <>
                  <PeopleIcon /> Join ({attendeeCount})
                </>
              )}
            </button>
            <div className="post-action-sep" />
            <button
              className="post-action-btn"
              onClick={handleDetails}
            >
              <InfoIcon /> Details
            </button>
            <div className="post-action-sep" />
            <button
              className="post-action-btn"
              onClick={() => setShareOpen(true)}
            >
              <ShareIcon /> Share
            </button>
          </div>
        </div>
      </article>

      {shareOpen && (
        <ShareSheet
          url={`${window.location.origin}/events/${eventId}`}
          title={eventTitle}
          text={`Check out ${eventTitle} on Kink Catalyst`}
          heading="Share event"
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
