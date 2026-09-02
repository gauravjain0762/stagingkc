import './CommunityView.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function LinkIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

function GlobeIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function SettingsIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>;
}

export default function CommunityView({ site, onBack, onViewPublic, onViewAdmin }) {
  const webUrl = `https://kickanalyst.com/${site.slug}`;
  const adminUrl = `https://kickanalyst.com/${site.slug}/admin`;

  return (
    <div className="community-view">
      {/* Header */}
      <div className="cv-header">
        <button className="cv-back-btn" onClick={onBack}>
          <BackIcon /> Back
        </button>
        <div className="cv-title-section">
          <h1>{site.name}</h1>
          <p>Community Links</p>
        </div>
      </div>

      {/* Links Container */}
      <div className="cv-container">
        <div className="cv-links-grid">
          {/* Public Website */}
          <div className="cv-link-card cv-link-card--public" onClick={onViewPublic}>
            <div className="cv-link-icon">
              <GlobeIcon />
            </div>
            <div className="cv-link-content">
              <h3>Public Website</h3>
              <p className="cv-link-description">View your site as visitors see it</p>
              <div className="cv-link-url">
                <LinkIcon style={{ width: 16, height: 16 }} />
                <code>{webUrl}</code>
              </div>
            </div>
            <div className="cv-link-arrow">→</div>
          </div>

          {/* Admin Panel */}
          <div className="cv-link-card cv-link-card--admin" onClick={onViewAdmin}>
            <div className="cv-link-icon">
              <SettingsIcon />
            </div>
            <div className="cv-link-content">
              <h3>Admin Panel</h3>
              <p className="cv-link-description">Manage members, events, and settings</p>
              <div className="cv-link-url">
                <LinkIcon style={{ width: 16, height: 16 }} />
                <code>{adminUrl}</code>
              </div>
            </div>
            <div className="cv-link-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}
