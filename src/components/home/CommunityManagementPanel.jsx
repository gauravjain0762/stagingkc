import { useState } from 'react';
import AnimatedNav from './AnimatedNav';
import './CommunityManagementPanel.css';
import { ALEX_AVATAR } from './mockData';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function UsersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function MailIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>;
}

function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}

// Mock community data
const MOCK_COMMUNITY = {
  id: 'comm-1',
  name: 'Tech Innovators',
  siteId: 'site-1',
  siteUrl: 'https://kickanalyst.com/tech-innovators',
  adminUrl: 'https://kickanalyst.com/tech-innovators/admin',
  totalMembers: 234,
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
    { id: 'user-7', name: 'Bob White', email: 'bob@example.com', avatar: '👨', rejectedDate: '2026-08-20', reason: 'User rejected invitation' },
  ],
};

export default function CommunityManagementPanel({ onBack, avatarUrl }) {
  const [activeTab, setActiveTab] = useState('active');
  const [copied, setCopied] = useState(null);

  const handleCopyLink = (link, type) => {
    navigator.clipboard.writeText(link);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleMakeModerator = (userId) => {
    alert(`✅ Made user moderator`);
  };

  const handleRemoveModerator = (userId) => {
    alert(`✅ Removed moderator role`);
  };

  const handleRemoveMember = (userId) => {
    alert(`❌ Member removed`);
  };

  const handleAcceptRequest = (userId) => {
    alert(`✅ Request accepted`);
  };

  const handleRejectRequest = (userId) => {
    alert(`❌ Request rejected`);
  };

  return (
    <div className="community-mgmt-page">
      <AnimatedNav avatarUrl={avatarUrl || ALEX_AVATAR} activeId="minisites" />

      <div className="community-mgmt-container">
        {/* Header */}
        <div className="community-mgmt-header">
          <button className="community-mgmt-back" onClick={onBack}>
            <BackIcon /> Back
          </button>
          <div className="community-mgmt-title-section">
            <h1 className="community-mgmt-title">Community Management</h1>
            <p className="community-mgmt-subtitle">{MOCK_COMMUNITY.name}</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="community-mgmt-links">
          <div className="community-link-item">
            <div className="community-link-icon">🌐</div>
            <div className="community-link-content">
              <p className="community-link-label">Public Website URL</p>
              <div className="community-link-display">
                <input type="text" value={MOCK_COMMUNITY.siteUrl} readOnly />
                <button
                  className="community-link-copy-btn"
                  onClick={() => handleCopyLink(MOCK_COMMUNITY.siteUrl, 'site')}
                >
                  {copied === 'site' ? '✓' : <CopyIcon />}
                </button>
              </div>
              <p className="community-link-hint">Share this link with everyone</p>
            </div>
          </div>

          <div className="community-link-item">
            <div className="community-link-icon">🔐</div>
            <div className="community-link-content">
              <p className="community-link-label">Admin Panel URL</p>
              <div className="community-link-display">
                <input type="text" value={MOCK_COMMUNITY.adminUrl} readOnly />
                <button
                  className="community-link-copy-btn"
                  onClick={() => handleCopyLink(MOCK_COMMUNITY.adminUrl, 'admin')}
                >
                  {copied === 'admin' ? '✓' : <CopyIcon />}
                </button>
              </div>
              <p className="community-link-hint">Only you can access this</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="community-mgmt-tabs">
          <button
            className={`community-mgmt-tab${activeTab === 'active' ? ' active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <UsersIcon /> Active Members ({MOCK_COMMUNITY.activeMembers.length})
          </button>
          <button
            className={`community-mgmt-tab${activeTab === 'pending' ? ' active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <ClockIcon /> Pending ({MOCK_COMMUNITY.pendingRequests.length})
          </button>
          <button
            className={`community-mgmt-tab${activeTab === 'invitations' ? ' active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            <MailIcon /> Invitations ({MOCK_COMMUNITY.invitations.length})
          </button>
          <button
            className={`community-mgmt-tab${activeTab === 'rejected' ? ' active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            <XIcon /> Rejected ({MOCK_COMMUNITY.rejected.length})
          </button>
        </div>

        {/* Members List */}
        <div className="community-mgmt-members">
          {/* Active Members */}
          {activeTab === 'active' && (
            <div className="members-list">
              {MOCK_COMMUNITY.activeMembers.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <p className="member-name">{member.name}</p>
                    <p className="member-email">{member.email}</p>
                    <p className="member-date">Joined {new Date(member.joinedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="member-role-badge">
                    {member.role === 'moderator' ? '👑 Moderator' : '👤 Member'}
                  </div>
                  <div className="member-actions">
                    {member.role === 'moderator' ? (
                      <button className="btn btn-secondary" onClick={() => handleRemoveModerator(member.id)}>
                        Remove Moderator
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleMakeModerator(member.id)}>
                        Make Moderator
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Requests */}
          {activeTab === 'pending' && (
            <div className="members-list">
              {MOCK_COMMUNITY.pendingRequests.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <p className="member-name">{member.name}</p>
                    <p className="member-email">{member.email}</p>
                    <p className="member-date">Requested {new Date(member.requestedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="member-actions">
                    <button className="btn btn-success" onClick={() => handleAcceptRequest(member.id)}>
                      Accept
                    </button>
                    <button className="btn btn-danger" onClick={() => handleRejectRequest(member.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invitations */}
          {activeTab === 'invitations' && (
            <div className="members-list">
              {MOCK_COMMUNITY.invitations.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <p className="member-name">{member.name}</p>
                    <p className="member-email">{member.email}</p>
                    <p className="member-date">Invited {new Date(member.invitedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="member-actions">
                    <button className="btn btn-secondary" onClick={() => handleRemoveMember(member.id)}>
                      Cancel Invitation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejected */}
          {activeTab === 'rejected' && (
            <div className="members-list">
              {MOCK_COMMUNITY.rejected.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
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
    </div>
  );
}
