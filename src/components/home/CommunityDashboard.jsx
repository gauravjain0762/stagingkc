import { useState } from 'react';
import './CommunityDashboard.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function GlobeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>;
}

function CopyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}

function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function LiveDotIcon() {
  return <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>;
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
const MOCK_MEMBERS = {
  activeMembers: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '👨', role: 'moderator', joinedDate: '2026-01-15' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '👩', role: 'member', joinedDate: '2026-02-20' },
    { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', avatar: '👨', role: 'member', joinedDate: '2026-03-10' },
  ],
  pendingRequests: [
    { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com', avatar: '👩', requestedDate: '2026-08-28' },
    { id: 'user-5', name: 'Tom Brown', email: 'tom@example.com', avatar: '👨', requestedDate: '2026-08-29' },
  ],
};

export default function CommunityDashboard({ site, onBack }) {
  const [activeTab, setActiveTab] = useState('website');
  const [memberTab, setMemberTab] = useState('active');
  const [copied, setCopied] = useState({ web: false, admin: false });

  const webUrl = `http://localhost:5173/?section=minisites#/${site.slug}`;
  const adminUrl = `http://localhost:5173/?section=minisites#/${site.slug}/admin`;
  const displayWebUrl = `localhost:5173/${site.slug}`;
  const displayAdminUrl = `localhost:5173/${site.slug}/admin`;

  const handleCopy = (type) => {
    const url = type === 'web' ? displayWebUrl : displayAdminUrl;
    navigator.clipboard.writeText(url);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const handleOpenUrl = (type) => {
    const url = type === 'web' ? webUrl : adminUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="community-dashboard">
      {/* Header */}
      <div className="cd-header">
        <button className="cd-back-btn" onClick={onBack}>
          <BackIcon /> Back
        </button>
        <div className="cd-title-section">
          <h1>{site.name}</h1>
          <p>Community Dashboard</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="cd-tabs">
        <button
          className={`cd-tab${activeTab === 'website' ? ' cd-tab--active' : ''}`}
          onClick={() => setActiveTab('website')}
        >
          <GlobeIcon /> Public Website
        </button>
        <button
          className={`cd-tab${activeTab === 'admin' ? ' cd-tab--active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <SettingsIcon /> Admin Dashboard
        </button>
      </div>

      {/* Content */}
      <div className="cd-content">
        {/* Website Tab */}
        {activeTab === 'website' && (
          <div className="cd-website-section">
            {/* URL Bar */}
            <div className="cd-url-bar">
              <button className="cd-url-link" onClick={() => handleOpenUrl('web')} title="Open in new tab">
                <span className="cd-url-protocol">http://</span>
                <span className="cd-url-text">{displayWebUrl}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
              <button className="cd-copy-btn" onClick={() => handleCopy('web')}>
                <CopyIcon /> {copied.web ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Website Preview */}
            <div className="cd-preview">
              <div className="cd-website-frame">
                {/* Navbar */}
                <nav className="cd-navbar">
                  <div className="cd-navbar-brand">
                    <span className="cd-logo">🌐</span>
                    <span className="cd-brand-name">{site.name}</span>
                  </div>
                  <div className="cd-nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#services">Services</a>
                    <a href="#contact">Contact</a>
                  </div>
                  <button className="cd-nav-cta">Get Started</button>
                </nav>

                {/* Hero Section */}
                <section className="cd-hero">
                  <div className="cd-hero-content">
                    <h2>Welcome to {site.name}</h2>
                    <p>Your professional online presence starts here. Built with modern design and powerful features.</p>
                    <button className="cd-hero-btn">Explore Now</button>
                  </div>
                </section>

                {/* Features */}
                <section className="cd-features">
                  <h3>Key Features</h3>
                  <div className="cd-feature-grid">
                    <div className="cd-feature-card">
                      <div className="cd-feature-icon">⚡</div>
                      <h4>Fast & Reliable</h4>
                      <p>Lightning-fast loading speeds</p>
                    </div>
                    <div className="cd-feature-card">
                      <div className="cd-feature-icon">🎨</div>
                      <h4>Modern Design</h4>
                      <p>Beautiful responsive design</p>
                    </div>
                    <div className="cd-feature-card">
                      <div className="cd-feature-icon">📊</div>
                      <h4>Analytics</h4>
                      <p>Track your site performance</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div className="cd-admin-section">
            {/* URL Bar */}
            <div className="cd-url-bar">
              <button className="cd-url-link" onClick={() => handleOpenUrl('admin')} title="Open in new tab">
                <span className="cd-url-protocol">http://</span>
                <span className="cd-url-text">{displayAdminUrl}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
              <button className="cd-copy-btn" onClick={() => handleCopy('admin')}>
                <CopyIcon /> {copied.admin ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Admin Content */}
            <div className="cd-admin-tabs">
              <button
                className={`cd-admin-tab${memberTab === 'active' ? ' cd-admin-tab--active' : ''}`}
                onClick={() => setMemberTab('active')}
              >
                <UsersIcon /> Active Members ({MOCK_MEMBERS.activeMembers.length})
              </button>
              <button
                className={`cd-admin-tab${memberTab === 'pending' ? ' cd-admin-tab--active' : ''}`}
                onClick={() => setMemberTab('pending')}
              >
                <ClockIcon /> Pending ({MOCK_MEMBERS.pendingRequests.length})
              </button>
            </div>

            {/* Members List */}
            <div className="cd-members-list">
              {memberTab === 'active' && (
                <div className="cd-members-grid">
                  {MOCK_MEMBERS.activeMembers.map(member => (
                    <div key={member.id} className="cd-member-card">
                      <div className="cd-member-avatar">{member.avatar}</div>
                      <div className="cd-member-info">
                        <p className="cd-member-name">{member.name}</p>
                        <p className="cd-member-email">{member.email}</p>
                        <p className="cd-member-date">Joined {new Date(member.joinedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="cd-member-role">{member.role === 'moderator' ? '👑 Mod' : '👤 Member'}</div>
                      <div className="cd-member-actions">
                        <button className="cd-btn cd-btn--primary">Make Mod</button>
                        <button className="cd-btn cd-btn--danger">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {memberTab === 'pending' && (
                <div className="cd-members-grid">
                  {MOCK_MEMBERS.pendingRequests.map(member => (
                    <div key={member.id} className="cd-member-card">
                      <div className="cd-member-avatar">{member.avatar}</div>
                      <div className="cd-member-info">
                        <p className="cd-member-name">{member.name}</p>
                        <p className="cd-member-email">{member.email}</p>
                        <p className="cd-member-date">Requested {new Date(member.requestedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="cd-member-actions cd-member-actions--full">
                        <button className="cd-btn cd-btn--success">Accept</button>
                        <button className="cd-btn cd-btn--danger">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
