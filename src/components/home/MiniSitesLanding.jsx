import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getOrganizations } from '../../services/organizationApi';
import './MiniSitesLanding.css';

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function StatusBadge({ status, rejectionReason }) {
  const getStatusConfig = () => {
    switch(status) {
      case 'pending':
        return { emoji: '⏳', text: 'Awaiting admin approval', bgColor: '#fbbf24', textColor: '#000' };
      case 'approved':
        return { emoji: '✅', text: 'Active', bgColor: '#10b981', textColor: '#fff' };
      case 'rejected':
        return { emoji: '❌', text: `Rejected: ${rejectionReason || 'No reason provided'}`, bgColor: '#ef4444', textColor: '#fff' };
      default:
        return { emoji: '❓', text: 'Unknown', bgColor: '#6b7280', textColor: '#fff' };
    }
  };

  const config = getStatusConfig();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: config.bgColor,
      color: config.textColor,
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '8px'
    }}>
      <span>{config.emoji}</span>
      <span>{config.text}</span>
    </div>
  );
}

export default function MiniSitesLanding({ onCreateOrganization, onSelectOrganization }) {
  const authToken = useSelector(s => s.auth?.token);
  const [activeTab, setActiveTab] = useState('suggested');
  const [searchTerm, setSearchTerm] = useState('');
  const [createdOrgs, setCreatedOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    if (activeTab === 'mycreated' && authToken && createdOrgs.length === 0) {
      fetchUserOrganizations();
    }
  }, [activeTab, authToken, createdOrgs.length]);

  const fetchUserOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await getOrganizations({ limit: 50 });
      setCreatedOrgs(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setCreatedOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const DEMO_SUGGESTED = [
    {
      id: 'sugg-1',
      name: 'Tech Innovators Community',
      description: 'Connect with tech enthusiasts and innovators',
      memberCount: 234,
      logo: '🚀',
    },
    {
      id: 'sugg-2',
      name: 'Design Collective',
      description: 'Designers sharing ideas and collaborating',
      memberCount: 189,
      logo: '🎨',
    },
  ];

  const DEMO_JOINED = [
    {
      id: 'joined-1',
      name: 'Tech Innovators',
      description: 'A community for tech enthusiasts',
      memberCount: 234,
      logo: '🚀',
      joinedDate: '2026-08-15',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'suggested':
        return (
          <div className="msl-content">
            <div className="msl-search-wrap">
              <div className="msl-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="msl-search-input"
                />
              </div>
            </div>
            <div className="msl-cards-grid">
              {DEMO_SUGGESTED.map(org => (
                <div key={org.id} className="msl-org-card">
                  <div className="msl-card-cover">
                    <span className="msl-card-cover-text">Social Platform</span>
                  </div>
                  <div className="msl-card-content">
                    <div className="msl-org-header">
                      <div className="msl-org-info">
                        <h3 className="msl-org-name">{org.name}</h3>
                        <p className="msl-org-members">{org.memberCount.toLocaleString()} members</p>
                      </div>
                    </div>
                    <p className="msl-org-description">{org.description}</p>
                    <button className="msl-join-btn">Join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'joined':
        return (
          <div className="msl-content">
            <div className="msl-cards-grid">
              {DEMO_JOINED.map(org => (
                <div key={org.id} className="msl-org-card" onClick={() => onSelectOrganization?.(org)}>
                  <div className="msl-card-cover">
                    <span className="msl-card-cover-text">Social Platform</span>
                  </div>
                  <div className="msl-card-content">
                    <div className="msl-org-header">
                      <div className="msl-org-info">
                        <h3 className="msl-org-name">{org.name}</h3>
                        <p className="msl-org-members">{org.memberCount.toLocaleString()} members</p>
                      </div>
                    </div>
                    <p className="msl-org-description">{org.description}</p>
                    <button className="msl-view-btn">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mycreated':
        return (
          <div className="msl-content">
            {loadingOrgs ? (
              <div className="msl-empty-state">
                Loading organizations...
              </div>
            ) : createdOrgs.length === 0 ? (
              <div className="msl-empty-state">
                <p>No organizations created yet</p>
                <button
                  className="msl-create-org-btn"
                  onClick={onCreateOrganization}
                >
                  + Create Your First Organization
                </button>
              </div>
            ) : (
              <div className="msl-cards-grid">
                {createdOrgs.map(org => (
                  <div
                    key={org.id}
                    className={`msl-org-card ${org.status !== 'approved' ? 'msl-org-card--disabled' : ''}`}
                    onClick={() => org.status === 'approved' && onSelectOrganization?.(org)}
                  >
                    <div className="msl-card-cover" style={{
                      backgroundImage: org.coverImage ? `url(${org.coverImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!org.coverImage && <span className="msl-card-cover-text">Social Platform</span>}
                    </div>
                    <div className="msl-card-content">
                      <div className="msl-org-header">
                        <div className="msl-org-info">
                          <h3 className="msl-org-name">{org.name}</h3>
                          <p className="msl-org-members">{org.memberCount || 0} members</p>
                        </div>
                      </div>
                      <p className="msl-org-description">{org.shortDescription || org.description || ''}</p>
                      <button
                        className={`msl-manage-btn ${org.status !== 'approved' ? 'msl-manage-btn--disabled' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (org.status === 'approved') {
                            onSelectOrganization?.(org);
                          }
                        }}
                        disabled={org.status !== 'approved'}
                      >
                        {org.status === 'pending' ? 'Pending Admin Approval' : org.status === 'rejected' ? 'Rejected' : 'Manage'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mini-sites-landing">
      <div className="msl-header">
        <div className="msl-title-section">
          <h1 className="msl-title">Mini Sites</h1>
          <p className="msl-subtitle">Discover and manage your communities</p>
        </div>
        {activeTab === 'mycreated' && createdOrgs.length === 0 && (
          <button className="msl-create-org-btn" onClick={onCreateOrganization}>
            <PlusIcon /> Create Organization
          </button>
        )}
      </div>

      <div className="msl-tabs">
        <button
          className={`msl-tab${activeTab === 'suggested' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          Suggested Organizations
        </button>
        <button
          className={`msl-tab${activeTab === 'joined' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Joined Organizations
        </button>
        <button
          className={`msl-tab${activeTab === 'mycreated' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('mycreated')}
        >
          My Created
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
