import { useState } from 'react';
import './MiniSitesDashboard.css';

// Mock data
const mockSites = [
  {
    id: 1,
    name: 'My Portfolio',
    description: 'Professional portfolio showcase',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    status: 'live',
    lastEdited: '2 hours ago',
    viewCount: 1250,
    url: 'arpit-portfolio',
    template: 'portfolio',
  },
  {
    id: 2,
    name: 'Business Card',
    description: 'Digital business card',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    status: 'live',
    lastEdited: '1 day ago',
    viewCount: 856,
    url: 'arpit-business',
    template: 'business',
  },
  {
    id: 3,
    name: 'Project Showcase',
    description: 'Latest projects and work',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    status: 'draft',
    lastEdited: '3 days ago',
    viewCount: 0,
    url: 'arpit-projects',
    template: 'showcase',
  },
  {
    id: 4,
    name: 'Service Page',
    description: 'Services and pricing',
    coverImage: 'https://images.unsplash.com/photo-1553531088-cfc62e12fbd8?w=500&h=300&fit=crop',
    status: 'draft',
    lastEdited: '5 days ago',
    viewCount: 0,
    url: 'arpit-services',
    template: 'services',
  },
  {
    id: 5,
    name: 'Event Landing',
    description: 'Conference event page',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop',
    status: 'live',
    lastEdited: '1 week ago',
    viewCount: 3420,
    url: 'tech-conference-2026',
    template: 'event',
  },
  {
    id: 6,
    name: 'Resume/CV',
    description: 'Online resume',
    coverImage: 'https://images.unsplash.com/photo-1586281142519-cd2860a49fea?w=500&h=300&fit=crop',
    status: 'live',
    lastEdited: '2 weeks ago',
    viewCount: 542,
    url: 'arpit-resume',
    template: 'resume',
  },
];

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
      </div>
    </div>
  );
}

function SiteCard({ site, onEdit, onPreview, onPublish, onMore }) {
  return (
    <div className="site-card">
      <div className="site-card-header">
        <div className="site-cover">
          <img src={site.coverImage} alt={site.name} />
          <div className="site-status-badge" style={{ backgroundColor: site.status === 'live' ? '#10b981' : '#8b5cf6' }}>
            {site.status === 'live' ? '🔴 Live' : '📝 Draft'}
          </div>
        </div>
      </div>

      <div className="site-card-body">
        <h3 className="site-name">{site.name}</h3>
        <p className="site-description">{site.description}</p>

        <div className="site-meta">
          <div className="meta-item">
            <span className="meta-label">Last Edited</span>
            <span className="meta-value">{site.lastEdited}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Views</span>
            <span className="meta-value">{site.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="site-card-footer">
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => onEdit(site.id)} title="Edit site">
            ✏️ Edit
          </button>
          <button className="btn btn-secondary" onClick={() => onPreview(site.id)} title="Preview site">
            👁️ Preview
          </button>
          <button
            className={`btn ${site.status === 'live' ? 'btn-unpublish' : 'btn-publish'}`}
            onClick={() => onPublish(site.id)}
            title={site.status === 'live' ? 'Unpublish site' : 'Publish site'}
          >
            {site.status === 'live' ? '🌐 Unpublish' : '🚀 Publish'}
          </button>
          <button className="btn btn-more" onClick={() => onMore(site.id)} title="More options">
            ⋮
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MiniSitesDashboard() {
  const [sites, setSites] = useState(mockSites);
  const [filter, setFilter] = useState('all'); // all, live, draft

  // Calculate stats
  const totalSites = sites.length;
  const totalViews = sites.reduce((sum, site) => sum + site.viewCount, 0);
  const liveSites = sites.filter(s => s.status === 'live');
  const thisMonthViews = sites.slice(0, 3).reduce((sum, site) => sum + site.viewCount, 0);

  // Filter sites
  const filteredSites = filter === 'all' ? sites : sites.filter(s => s.status === filter);

  // Mock handlers
  const handleCreateSite = () => {
    console.log('Navigate to: Create New Site');
    window.location.hash = '#/mini-sites/create';
  };

  const handleEdit = (siteId) => {
    console.log('Navigate to: Edit Site', siteId);
    window.location.hash = `#/mini-sites/edit/${siteId}`;
  };

  const handlePreview = (siteId) => {
    console.log('Navigate to: Preview Site', siteId);
    window.location.hash = `#/mini-sites/preview/${siteId}`;
  };

  const handlePublish = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    const newStatus = site.status === 'live' ? 'draft' : 'live';
    setSites(sites.map(s => (s.id === siteId ? { ...s, status: newStatus, lastEdited: 'just now' } : s)));
    console.log(`Site ${siteId} status changed to: ${newStatus}`);
  };

  const handleMore = (siteId) => {
    console.log('More options for site:', siteId);
    // Could show a dropdown menu with options like Duplicate, Delete, Share, etc.
  };

  const handleViewAll = (status) => {
    console.log(`View all ${status} sites`);
    setFilter(status);
  };

  return (
    <div className="mini-sites-dashboard">
      {/* Header */}
      <div className="msd-header">
        <div className="msd-header-content">
          <div>
            <h1 className="msd-title">Mini Sites</h1>
            <p className="msd-subtitle">Create beautiful websites with ease</p>
          </div>
          <button className="btn btn-create" onClick={handleCreateSite}>
            + Create New Site
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="msd-stats-section">
        <h2 className="section-title">Overview</h2>
        <div className="stats-grid">
          <StatCard
            icon="🌐"
            label="Total Sites"
            value={totalSites}
            subtext={`${liveSites.length} live`}
          />
          <StatCard
            icon="👁️"
            label="Total Views"
            value={totalViews.toLocaleString()}
            subtext="All time"
          />
          <StatCard
            icon="📅"
            label="This Month"
            value={thisMonthViews.toLocaleString()}
            subtext="Views"
          />
          <StatCard
            icon="🔗"
            label="Active Links"
            value={liveSites.length}
            subtext="Live sites"
          />
        </div>
      </div>

      {/* Filter Section */}
      <div className="msd-filter-section">
        <h2 className="section-title">Your Sites</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Sites ({sites.length})
          </button>
          <button
            className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
            onClick={() => setFilter('live')}
          >
            🔴 Live ({liveSites.length})
          </button>
          <button
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            📝 Draft ({sites.filter(s => s.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="msd-sites-grid">
        {filteredSites.length > 0 ? (
          filteredSites.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={handleEdit}
              onPreview={handlePreview}
              onPublish={handlePublish}
              onMore={handleMore}
            />
          ))
        ) : (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-text">No {filter !== 'all' ? filter : ''} sites found</p>
            <button className="btn btn-primary" onClick={handleCreateSite}>
              Create your first site
            </button>
          </div>
        )}
      </div>

      {/* Empty state when no sites */}
      {sites.length === 0 && (
        <div className="msd-empty-state">
          <div className="empty-content">
            <p className="empty-icon">🚀</p>
            <h3>No sites yet</h3>
            <p>Get started by creating your first mini site</p>
            <button className="btn btn-primary btn-lg" onClick={handleCreateSite}>
              Create New Site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
