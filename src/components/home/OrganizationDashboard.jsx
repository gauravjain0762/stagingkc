import { useState } from 'react';
import './OrganizationDashboard.css';

function BackArrowIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

export default function OrganizationDashboard({ organization, onBack, onCreateMiniSite }) {
  const [miniSites, setMiniSites] = useState([]); // Start with no mini sites

  const handleCreateMiniSite = () => {
    onCreateMiniSite?.();
  };

  return (
    <div className="org-dashboard">
      {/* Header */}
      <div className="org-dashboard-header">
        <button className="org-dashboard-back-btn" onClick={onBack} title="Back to organizations">
          <BackArrowIcon />
        </button>
        <div className="org-dashboard-title-section">
          <h1 className="org-dashboard-title">Organization Dashboard</h1>
          <p className="org-dashboard-subtitle">Manage your organization and mini sites</p>
        </div>
      </div>

      {/* Organization Info */}
      <div className="org-dashboard-container">
        <div className="org-info-card">
          <div className="org-info-header">
            <h2>Organization Information</h2>
          </div>
          <div className="org-info-content">
            {organization.logo && (
              <img src={organization.logo} alt="Logo" className="org-info-logo" />
            )}
            <div className="org-info-details">
              <div className="org-info-row">
                <label>Name:</label>
                <span>{organization.name}</span>
              </div>
              <div className="org-info-row">
                <label>Type:</label>
                <span>{organization.type?.charAt(0).toUpperCase() + organization.type?.slice(1)}</span>
              </div>
              <div className="org-info-row">
                <label>Description:</label>
                <span>{organization.description || 'No description'}</span>
              </div>
              {organization.shortDescription && (
                <div className="org-info-row">
                  <label>Short Description:</label>
                  <span>{organization.shortDescription}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini Sites Section */}
        <div className="org-mini-sites-section">
          <div className="org-mini-sites-header">
            <div>
              <h2>Mini Sites</h2>
              <p>You can create 1 mini site for this organization</p>
            </div>
            {miniSites.length === 0 && (
              <button className="org-create-minisite-btn" onClick={handleCreateMiniSite}>
                <PlusIcon /> Create Mini Site
              </button>
            )}
          </div>

          {miniSites.length === 0 ? (
            <div className="org-empty-state">
              <div className="org-empty-icon">🌐</div>
              <h3>No mini sites yet</h3>
              <p>Create your first mini site to get started</p>
              <button className="org-empty-btn" onClick={handleCreateMiniSite}>
                <PlusIcon /> Create Mini Site
              </button>
            </div>
          ) : (
            <div className="org-mini-sites-list">
              {miniSites.map(site => (
                <div key={site.id} className="org-mini-site-card">
                  <div className="org-mini-site-info">
                    <h3>{site.name}</h3>
                    <p>{site.description}</p>
                    <div className="org-mini-site-meta">
                      <span>Created: {new Date(site.createdAt).toLocaleDateString()}</span>
                      <span>{site.status}</span>
                    </div>
                  </div>
                  <div className="org-mini-site-actions">
                    <button className="org-action-btn">Edit</button>
                    <button className="org-action-btn">Preview</button>
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
