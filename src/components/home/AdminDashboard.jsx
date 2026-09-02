import { useState } from 'react';
import './AdminDashboard.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function LinkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

function CopyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}

function UsersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function CalendarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>;
}

function XIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

// Mock data
const MOCK_COMMUNITY = {
  name: 'Tech Innovators',
  siteUrl: 'https://kickanalyst.com/tech-innovators',
  adminUrl: 'https://kickanalyst.com/tech-innovators/admin',
  activeMembers: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '👨', role: 'moderator', joinedDate: '2026-01-15' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '👩', role: 'member', joinedDate: '2026-02-20' },
    { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', avatar: '👨', role: 'member', joinedDate: '2026-03-10' },
  ],
  pendingRequests: [
    { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com', avatar: '👩', requestedDate: '2026-08-28' },
    { id: 'user-5', name: 'Tom Brown', email: 'tom@example.com', avatar: '👨', requestedDate: '2026-08-29' },
  ],
  invitations: [
    { id: 'user-6', name: 'Alice Green', email: 'alice@example.com', avatar: '👩', invitedDate: '2026-08-26' },
  ],
  rejected: [
    { id: 'user-7', name: 'Bob White', email: 'bob@example.com', avatar: '👨', rejectedDate: '2026-08-20' },
  ],
  events: [
    { id: 'evt-1', name: 'Tech Summit 2026', date: '2026-09-15', attendees: 125, status: 'live' },
    { id: 'evt-2', name: 'Web Dev Workshop', date: '2026-09-20', attendees: 45, status: 'live' },
    { id: 'evt-3', name: 'AI Talk Series', date: '2026-10-01', attendees: 89, status: 'upcoming' },
  ],
};

export default function AdminDashboard({ site, onBack }) {
  const [mainTab, setMainTab] = useState('members');
  const [memberTab, setMemberTab] = useState('active');
  const [copiedWeb, setCopiedWeb] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const siteName = site?.name || MOCK_COMMUNITY.name;
  const webUrl = site ? `https://kickanalyst.com/${site.slug}` : MOCK_COMMUNITY.siteUrl;
  const adminUrl = site ? `https://kickanalyst.com/${site.slug}/admin` : MOCK_COMMUNITY.adminUrl;

  const handleCopyUrl = (url, type) => {
    navigator.clipboard.writeText(url);
    if (type === 'web') {
      setCopiedWeb(true);
      setTimeout(() => setCopiedWeb(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
  };

  const handleMakeModerator = (userId) => alert('✅ Made moderator');
  const handleRemoveModerator = (userId) => alert('✅ Removed moderator');
  const handleRemoveMember = (userId) => alert('❌ Member removed');
  const handleAcceptRequest = (userId) => alert('✅ Request accepted');
  const handleRejectRequest = (userId) => alert('❌ Request rejected');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-top">
          {onBack && (
            <button className="admin-back-btn" onClick={onBack}>
              <BackIcon /> Back
            </button>
          )}
          <div className="admin-header-content">
            <h1>{siteName}</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        {/* URLs Section */}
        <div className="admin-urls-section">
          <div className="admin-url-item">
            <div className="admin-url-label">Public Website</div>
            <div className="admin-url-display">
              <LinkIcon />
              <input type="text" className="admin-url-input" value={webUrl} readOnly />
              <button className="admin-url-copy" onClick={() => handleCopyUrl(webUrl, 'web')} title="Copy URL">
                <CopyIcon /> {copiedWeb ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="admin-url-item">
            <div className="admin-url-label">Admin Panel</div>
            <div className="admin-url-display">
              <LinkIcon />
              <input type="text" className="admin-url-input" value={adminUrl} readOnly />
              <button className="admin-url-copy" onClick={() => handleCopyUrl(adminUrl, 'admin')} title="Copy URL">
                <CopyIcon /> {copiedAdmin ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="admin-main-tabs">
        <button
          className={`admin-main-tab${mainTab === 'members' ? ' active' : ''}`}
          onClick={() => setMainTab('members')}
        >
          <UsersIcon /> Members
        </button>
        <button
          className={`admin-main-tab${mainTab === 'events' ? ' active' : ''}`}
          onClick={() => setMainTab('events')}
        >
          <CalendarIcon /> Events
        </button>
      </div>

      {/* Members Section */}
      {mainTab === 'members' && (
        <div className="admin-content">
          {/* Member Sub-Tabs */}
          <div className="admin-sub-tabs">
            <button
              className={`admin-sub-tab${memberTab === 'active' ? ' active' : ''}`}
              onClick={() => setMemberTab('active')}
            >
              <UsersIcon /> Active Members ({MOCK_COMMUNITY.activeMembers.length})
            </button>
            <button
              className={`admin-sub-tab${memberTab === 'pending' ? ' active' : ''}`}
              onClick={() => setMemberTab('pending')}
            >
              <ClockIcon /> Pending ({MOCK_COMMUNITY.pendingRequests.length})
            </button>
            <button
              className={`admin-sub-tab${memberTab === 'invitations' ? ' active' : ''}`}
              onClick={() => setMemberTab('invitations')}
            >
              <MailIcon /> Invitations ({MOCK_COMMUNITY.invitations.length})
            </button>
            <button
              className={`admin-sub-tab${memberTab === 'rejected' ? ' active' : ''}`}
              onClick={() => setMemberTab('rejected')}
            >
              <XIcon /> Rejected ({MOCK_COMMUNITY.rejected.length})
            </button>
          </div>

          {/* Members List */}
          <div className="admin-members-list">
            {/* Active Members */}
            {memberTab === 'active' && (
              <div className="members-grid">
                {MOCK_COMMUNITY.activeMembers.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-details">
                      <p className="member-name">{member.name}</p>
                      <p className="member-email">{member.email}</p>
                      <p className="member-date">Joined {new Date(member.joinedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="member-role">{member.role === 'moderator' ? '👑 Mod' : '👤 Member'}</div>
                    <div className="member-actions">
                      {member.role === 'moderator' ? (
                        <button className="btn btn-secondary" onClick={() => handleRemoveModerator(member.id)}>Remove Mod</button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => handleMakeModerator(member.id)}>Make Mod</button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleRemoveMember(member.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Requests */}
            {memberTab === 'pending' && (
              <div className="members-grid">
                {MOCK_COMMUNITY.pendingRequests.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-details">
                      <p className="member-name">{member.name}</p>
                      <p className="member-email">{member.email}</p>
                      <p className="member-date">Requested {new Date(member.requestedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="member-actions">
                      <button className="btn btn-success" onClick={() => handleAcceptRequest(member.id)}>Accept</button>
                      <button className="btn btn-danger" onClick={() => handleRejectRequest(member.id)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invitations */}
            {memberTab === 'invitations' && (
              <div className="members-grid">
                {MOCK_COMMUNITY.invitations.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-details">
                      <p className="member-name">{member.name}</p>
                      <p className="member-email">{member.email}</p>
                      <p className="member-date">Invited {new Date(member.invitedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="member-actions">
                      <button className="btn btn-secondary" onClick={() => handleRemoveMember(member.id)}>Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected */}
            {memberTab === 'rejected' && (
              <div className="members-grid">
                {MOCK_COMMUNITY.rejected.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="member-details">
                      <p className="member-name">{member.name}</p>
                      <p className="member-email">{member.email}</p>
                      <p className="member-date">Rejected {new Date(member.rejectedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Section */}
      {mainTab === 'events' && (
        <div className="admin-content">
          <div className="admin-events-grid">
            {MOCK_COMMUNITY.events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.name}</h3>
                  <span className={`event-status event-status--${event.status}`}>
                    {event.status === 'live' ? '🔴 Live' : '📅 Upcoming'}
                  </span>
                </div>
                <div className="event-details">
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Attendees:</strong> {event.attendees}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
