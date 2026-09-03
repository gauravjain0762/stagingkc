import { useState, useEffect } from 'react';
import AnimatedNav from './AnimatedNav';
import { ALEX_AVATAR } from './mockData';
import './CommunitiesPage.css';

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function GlobalIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

// Community type filters
const COMMUNITY_TYPES = [
  { label: 'All' },
  { label: 'Club' },
  { label: 'Organization' },
  { label: 'Community' },
  { label: 'Business' },
  { label: 'Non-profit' },
  { label: 'Other' },
];

// Mock communities data
const MOCK_COMMUNITIES = [
  {
    id: 'comm-1',
    name: 'Tech Innovators',
    siteId: 'site-1',
    description: 'A community for tech enthusiasts and innovators',
    memberCount: 234,
    visibility: 'public',
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop',
    status: 'active',
    type: 'Community',
  },
  {
    id: 'comm-2',
    name: 'Design Collective',
    siteId: 'site-2',
    description: 'Designers sharing ideas and collaborating on projects',
    memberCount: 189,
    visibility: 'public',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop',
    status: 'active',
    type: 'Club',
  },
  {
    id: 'comm-3',
    name: 'Business Network',
    siteId: 'site-3',
    description: 'Connecting entrepreneurs and business professionals',
    memberCount: 456,
    visibility: 'public',
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop',
    status: 'active',
    type: 'Business',
  },
  {
    id: 'comm-4',
    name: 'Creative Writers',
    siteId: 'site-4',
    description: 'A space for writers to share and develop their craft',
    memberCount: 120,
    visibility: 'public',
    cover: 'https://images.unsplash.com/photo-150784272343-583f20270319?w=600&h=300&fit=crop',
    status: 'active',
    type: 'Club',
  },
  {
    id: 'comm-5',
    name: 'Fitness & Wellness',
    siteId: 'site-5',
    description: 'Health and fitness community for all levels',
    memberCount: 567,
    visibility: 'public',
    cover: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=600&h=300&fit=crop',
    status: 'active',
    type: 'Organization',
  },
];

export default function CommunitiesPage({
  onBack,
  onCommunityClick,
  onMessagesClick,
  onEventsClick,
  onGroupsClick,
  onCalendarClick,
  onCoursesClick,
  onLibraryClick,
  onMinisitesClick,
}) {
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [joinedCommunities, setJoinedCommunities] = useState(new Set());
  const [loadingId, setLoadingId] = useState(null);

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleJoinCommunity = async (communityId) => {
    setLoadingId(communityId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    setJoinedCommunities(prev => new Set([...prev, communityId]));
    setLoadingId(null);
  };

  const handleViewCommunity = (community) => {
    onCommunityClick?.(community);
  };

  function handleNav(id) {
    if (id === 'home')        onBack?.();
    if (id === 'courses')     onCoursesClick?.();
    if (id === 'library')     onLibraryClick?.();
    if (id === 'events')      onEventsClick?.();
    if (id === 'friends')     onGroupsClick?.();
    if (id === 'messages')    onMessagesClick?.();
    if (id === 'calendar')    onCalendarClick?.();
    if (id === 'minisites')   onMinisitesClick?.();
  }

  return (
    <div className="communities-page">
      <AnimatedNav avatarUrl={ALEX_AVATAR} activeId="minisites" onNavigate={handleNav} />

      <div className="communities-container" style={{ marginLeft: '72px' }}>
        {/* Header */}
        <div className="communities-header">
          <button className="communities-back-btn" onClick={onBack} title="Back">
            <BackIcon />
          </button>
          <div className="communities-title-section">
            <h1 className="communities-title">Communities</h1>
            <p className="communities-subtitle">Discover and join communities to collaborate with others</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="communities-search-wrap">
          <div className="communities-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="communities-search-input"
            />
          </div>
        </div>

        {/* Type filters */}
        <div className="communities-types">
          {COMMUNITY_TYPES.map(type => (
            <button
              key={type.label}
              className={`communities-type${selectedType === type.label ? ' communities-type--active' : ''}`}
              onClick={() => setSelectedType(type.label)}
            >
              {type.label}
            </button>
          ))}
        </div>

      {/* Communities Grid */}
      <div className="communities-grid">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map(community => {
            const isJoined = joinedCommunities.has(community.id);
            const isLoading = loadingId === community.id;

            return (
              <div key={community.id} className="community-card">
                {/* Cover Image */}
                <div className="community-card-cover" style={{ backgroundImage: `url(${community.cover})` }} />

                {/* Content */}
                <div className="community-card-content">
                  {/* Info */}
                  <div className="community-card-info">
                    <h3 className="community-name">{community.name}</h3>
                    <p className="community-members">
                      <UsersIcon /> {community.memberCount.toLocaleString()} members
                    </p>
                  </div>

                  {/* Description */}
                  <p className="community-description">{community.description}</p>

                  {/* Footer */}
                  <div className="community-card-footer">
                    <div className="community-badge">
                      <GlobalIcon /> Public
                    </div>
                    {isJoined ? (
                      <button
                        className="community-btn community-btn--joined"
                        onClick={() => handleViewCommunity(community)}
                      >
                        <CheckIcon /> Joined
                      </button>
                    ) : (
                      <button
                        className="community-btn community-btn--join"
                        onClick={() => handleJoinCommunity(community.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Joining...' : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="communities-empty">
            <p className="communities-empty-icon">🔍</p>
            <p className="communities-empty-text">No communities found</p>
            <p className="communities-empty-sub">Try searching with different keywords</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
