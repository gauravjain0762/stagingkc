import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getMiniSiteEvents, getMiniSiteEventDetail, getMiniSiteEventTickets,
  joinMiniSiteEvent, leaveMiniSiteEvent, getMiniSiteEventAttendees
} from '../../services/api';
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

export default function MiniSiteEventsPage({ siteId, siteName }) {
  const { token } = useSelector(s => s.auth);
  const [view, setView] = useState('list'); // 'list' or 'detail'
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

  useEffect(() => {
    loadEvents();
  }, [siteId, token]);

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
    setSelectedEvent(event);
    setView('detail');
  };

  const handleJoinEvent = async (event) => {
    if (!event._id && !event.id) return;
    const eventId = event._id || event.id;
    setJoiningId(eventId);

    try {
      // Fetch tickets for this event
      const ticketData = await getMiniSiteEventTickets(siteId, eventId, token);
      const ticketsList = Array.isArray(ticketData) ? ticketData : ticketData?.tickets || [];

      setTickets(ticketsList);
      setJoinFlow({
        eventId,
        step: ticketsList.length > 0 ? 'ticket' : 'members',
        ticketId: null,
        quantity: 1,
        members: [{ name: '', age: '' }],
        submitting: false
      });
    } catch (err) {
      console.error('Failed to load tickets:', err);
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
      await joinMiniSiteEvent(siteId, joinFlow.eventId, {
        ticketId: joinFlow.ticketId,
        quantity: joinFlow.quantity,
        attendeeDetails: joinFlow.members
      }, token);

      setJoinedEventIds(prev => new Set([...prev, joinFlow.eventId]));
      setEvents(prev => prev.map(ev =>
        (ev._id === joinFlow.eventId || ev.id === joinFlow.eventId)
          ? { ...ev, joined: true, isJoined: true }
          : ev
      ));

      setJoinFlow(null);
    } catch (err) {
      console.error('Failed to join event:', err);
    } finally {
      setJoinFlow(prev => prev ? { ...prev, submitting: false } : prev);
    }
  };

  if (loading && events.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading events...</div>;
  }

  if (view === 'detail' && selectedEvent) {
    const isJoined = joinedEventIds.has(selectedEvent._id || selectedEvent.id);
    const eventId = selectedEvent._id || selectedEvent.id;

    return (
      <div className="mini-site-events-detail">
        <div className="msev-detail-header" style={{
          background: `linear-gradient(135deg, #1a1f2e 0%, #0d1720 100%), url(${selectedEvent.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '240px',
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
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>
            {selectedEvent.title || selectedEvent.name}
          </h1>

          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
              <CalendarIcon />
              <span>{selectedEvent.fullDate || selectedEvent.date || 'TBA'}</span>
            </div>
            {selectedEvent.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <MapPinIcon />
                <span>{selectedEvent.location}</span>
              </div>
            )}
            {selectedEvent.eventType && (
              <div style={{ display: 'inline-block', padding: '4px 12px', background: '#111422', borderRadius: '4px', color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>
                {selectedEvent.eventType}
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            {isJoined ? (
              <button
                onClick={() => handleLeaveEvent(eventId)}
                disabled={joiningId === eventId}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {joiningId === eventId ? 'Leaving...' : 'Leave Event'}
              </button>
            ) : (
              <button
                onClick={() => handleJoinEvent(selectedEvent)}
                disabled={joiningId === eventId}
                style={{
                  padding: '10px 24px',
                  background: '#1d4ed8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {joiningId === eventId ? 'Joining...' : '+ Join Event'}
              </button>
            )}
          </div>
        </div>

        {selectedEvent.description && (
          <div style={{ padding: '32px', borderBottom: '1px solid #1a1f35' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>About</h2>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0' }}>{selectedEvent.description}</p>
          </div>
        )}

        {joinFlow && (
          <div className="msev-join-flow" style={{ padding: '32px', borderTop: '1px solid #1a1f35' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '20px' }}>
              {joinFlow.step === 'ticket' ? 'Select Ticket' : 'Attendee Details'}
            </h2>

            {joinFlow.step === 'ticket' && tickets.length > 0 && (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {tickets.map(ticket => (
                  <label key={ticket._id || ticket.id} style={{
                    padding: '16px',
                    border: `2px solid ${selectedTicket?.id === (ticket._id || ticket.id) ? '#1d4ed8' : '#1a1f35'}`,
                    borderRadius: '8px',
                    background: selectedTicket?.id === (ticket._id || ticket.id) ? 'rgba(29, 78, 216, 0.1)' : '#111422',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <input
                      type="radio"
                      name="ticket"
                      checked={selectedTicket?.id === (ticket._id || ticket.id)}
                      onChange={() => {
                        setSelectedTicket(ticket);
                        setJoinFlow(prev => prev ? { ...prev, ticketId: ticket._id || ticket.id } : prev);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontWeight: '600' }}>
                        {ticket.name || ticket.type || 'Standard Ticket'}
                      </p>
                      <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>
                        ${ticket.price || 0} • {ticket.available || 0} available
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(joinFlow.step === 'members' || joinFlow.step === 'ticket') && (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={joinFlow.quantity}
                  onChange={(e) => setJoinFlow(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : prev)}
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
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setJoinFlow(null)}
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
                Cancel
              </button>
              <button
                onClick={handleSubmitJoin}
                disabled={joinFlow.submitting || (joinFlow.step === 'ticket' && !selectedTicket)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1d4ed8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: joinFlow.submitting || (joinFlow.step === 'ticket' && !selectedTicket) ? 0.5 : 1
                }}
              >
                {joinFlow.submitting ? 'Confirming...' : 'Confirm & Join'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mini-site-events-list">
      <div style={{ padding: '32px', background: '#0b0d17', borderBottom: '1px solid #1a1f35' }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>Events</h1>
        <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>Join events and buy tickets</p>
      </div>

      <div style={{ padding: '32px' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
            No events yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {events.map(event => {
              const isJoined = joinedEventIds.has(event._id || event.id);
              const eventId = event._id || event.id;

              return (
                <div
                  key={eventId}
                  onClick={() => handleSelectEvent(event)}
                  style={{
                    padding: '20px',
                    background: '#111422',
                    border: '1px solid #1a1f35',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 120px',
                    gap: '20px',
                    alignItems: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#2a3f5f'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#1a1f35'}
                >
                  {/* Date box */}
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    background: '#0d1720',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#e2e8f0' }}>
                      {event.day || '?'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {event.month || 'N/A'}
                    </div>
                  </div>

                  {/* Event info */}
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>
                      {event.title || event.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '13px' }}>
                          <MapPinIcon />
                          {event.location}
                        </div>
                      )}
                      {event.eventType && (
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                          {event.eventType}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isJoined ? handleLeaveEvent(eventId) : handleJoinEvent(event);
                    }}
                    disabled={joiningId === eventId}
                    style={{
                      padding: '9px 16px',
                      background: isJoined ? 'rgba(239,68,68,0.1)' : '#1d4ed8',
                      color: isJoined ? '#f87171' : '#fff',
                      border: isJoined ? '1px solid rgba(239,68,68,0.3)' : 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      opacity: joiningId === eventId ? 0.6 : 1
                    }}
                  >
                    {joiningId === eventId ? '⟳' : (isJoined ? 'Leave' : '+ Join')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
