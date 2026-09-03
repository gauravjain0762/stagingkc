import { useState } from 'react';
import './MiniSitesLanding.css';

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

export default function MiniSitesLanding({ onCreateOrganization, onSelectOrganization }) {
  const [activeTab, setActiveTab] = useState('suggested');
  const [searchTerm, setSearchTerm] = useState('');

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

  const DEMO_CREATED = [
    {
      id: 'created-1',
      name: 'My Developer Community',
      description: 'My community for developers',
      memberCount: 12,
      logo: '💻',
      createdDate: '2026-08-01',
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
            <div className="msl-cards-grid">
              {DEMO_CREATED.map(org => (
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
                    <button className="msl-manage-btn">Manage</button>
                  </div>
                </div>
              ))}
            </div>
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
        <button className="msl-create-org-btn" onClick={onCreateOrganization}>
          <PlusIcon /> Create Organization
        </button>
      </div>

      <div className="msl-tabs">
        <button
          className={`msl-tab${activeTab === 'suggested' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          Suggested Communities
        </button>
        <button
          className={`msl-tab${activeTab === 'joined' ? ' msl-tab--active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Joined Communities
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
