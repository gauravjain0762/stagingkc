import { useState } from 'react';
import './MiniSiteGroupsPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}

function InfoCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}

function TrendingUpIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></svg>;
}

function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

const DEMO_SUGGESTED_GROUPS = [
  { id: 1, name: 'Tech Innovators', category: 'Technology', members: '2.5k', icon: '💻', color: '#2563eb', cover: 'https://picsum.photos/seed/tech1/400/200', description: 'A community for tech professionals and innovators who are passionate about cutting-edge technology and digital transformation. Connect, share ideas, and collaborate on groundbreaking projects.', createdAt: 'Aug 15, 2025', mission: 'To advance technology and foster innovation in the digital age.' },
  { id: 2, name: 'Design Collective', category: 'Design', members: '1.8k', icon: '🎨', color: '#7c3aed', cover: 'https://picsum.photos/seed/design1/400/200', description: 'Designers unite! Share your work, get feedback, and stay inspired with the latest design trends and best practices.', createdAt: 'Sep 22, 2025', mission: 'Creating beautiful and functional design solutions.' },
  { id: 3, name: 'Content Creators', category: 'Media', members: '3.2k', icon: '📹', color: '#db2777', cover: 'https://picsum.photos/seed/content1/400/200', description: 'For podcasters, YouTubers, and content creators. Share tips, discuss growth strategies, and support each other.', createdAt: 'Jul 10, 2025', mission: 'Empowering creators to build their audience and brand.' },
  { id: 4, name: 'Business Leaders', category: 'Business', members: '1.5k', icon: '💼', color: '#0891b2', cover: 'https://picsum.photos/seed/business1/400/200', description: 'Executive networking group for business leaders and entrepreneurs looking to scale their ventures.', createdAt: 'Oct 03, 2025', mission: 'Building a network of visionary business leaders.' },
  { id: 5, name: 'Startup Network', category: 'Entrepreneurship', members: '2.1k', icon: '🚀', color: '#d97706', cover: 'https://picsum.photos/seed/startup1/400/200', description: 'Connect with founders and startup enthusiasts. Discuss fundraising, growth, and startup life.', createdAt: 'Nov 18, 2025', mission: 'Supporting startups through networking and knowledge sharing.' },
  { id: 6, name: 'Marketing Guild', category: 'Marketing', members: '2.8k', icon: '📊', color: '#059669', cover: 'https://picsum.photos/seed/marketing1/400/200', description: 'Marketing professionals sharing strategies, tools, and insights for modern marketing.', createdAt: 'Jun 05, 2025', mission: 'Elevating marketing excellence through collaboration.' },
];

const DEMO_JOINED_GROUPS = [
  { id: 11, name: 'Web Developers', category: 'Technology', members: '4.2k', icon: '🌐', color: '#2563eb', cover: 'https://picsum.photos/seed/web1/400/200', description: 'A vibrant community of web developers sharing code, tutorials, and best practices.', createdAt: 'May 12, 2025', mission: 'Building the web together.' },
  { id: 12, name: 'Product Managers', category: 'Business', members: '2.9k', icon: '🎯', color: '#0891b2', cover: 'https://picsum.photos/seed/product1/400/200', description: 'Product managers discussing strategy, user research, and product development.', createdAt: 'Aug 30, 2025', mission: 'Delivering exceptional products and user experiences.' },
];

const DEMO_MEMBERS = [
  { id: 1, name: 'Sarah Anderson', role: 'Admin', joined: 'Aug 27, 2025', avatar: '👩‍💼' },
  { id: 2, name: 'Alex Kumar', role: 'Member', joined: 'Sep 10, 2025', avatar: '👨‍💻' },
  { id: 3, name: 'Emma Wilson', role: 'Member', joined: 'Sep 15, 2025', avatar: '👩‍🎨' },
  { id: 4, name: 'James Chen', role: 'Member', joined: 'Sep 20, 2025', avatar: '👨‍🔬' },
];

const DEMO_POSTS = [
  {
    id: 1,
    author: 'Sarah Anderson',
    avatar: '👩‍💼',
    time: '2h ago',
    caption: 'Just launched our new community initiative! Excited to see everyone getting involved and sharing their ideas. Let\'s build something great together.',
    image: 'https://picsum.photos/seed/post1/600/300',
    likes: 124,
    comments: 18,
    shares: 12,
  },
  {
    id: 2,
    author: 'Alex Kumar',
    avatar: '👨‍💻',
    time: '5h ago',
    caption: 'Great session today! Learned so much from the community about best practices and new approaches. Thanks everyone for the insights.',
    image: null,
    likes: 87,
    comments: 23,
    shares: 8,
  },
  {
    id: 3,
    author: 'Emma Wilson',
    avatar: '👩‍🎨',
    time: '1d ago',
    caption: 'Sharing my latest project with the group. Would love feedback from experienced members!',
    image: 'https://picsum.photos/seed/post3/600/300',
    likes: 156,
    comments: 42,
    shares: 19,
  },
];

function GroupCard({ group, isJoined, onClick }) {
  return (
    <div className="msg-group-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Cover Photo */}
      <div className="msg-group-cover" style={{ backgroundImage: `url(${group.cover})` }} />

      {/* Content */}
      <div className="msg-group-card-content">
        <div className="msg-group-header">
          <div className="msg-group-info">
            <h3 className="msg-group-name">{group.name}</h3>
            <p className="msg-group-meta">{group.category}</p>
          </div>
        </div>
        <button
          className={`msg-group-btn ${isJoined ? 'msg-group-btn--joined' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {isJoined ? 'Joined' : 'Join Group'}
        </button>
      </div>
    </div>
  );
}

function MiniSiteGroupDetailView({ group, isJoined, onBack, onJoinClick }) {
  const [detailTab, setDetailTab] = useState('about');
  const [aboutExpanded, setAboutExpanded] = useState(false);

  return (
    <div className="msg-detail-page">
      {/* Cover Section */}
      <div className="msg-gd-cover-section">
        <div className="msg-gd-cover">
          <img src={group.cover} alt={group.name} className="msg-gd-cover-img" />
          <button className="msg-gd-back-btn" onClick={onBack} title="Back to Groups">
            <BackIcon />
          </button>
        </div>

        {/* Profile Row */}
        <div className="msg-gd-profile-row">
          <div className="msg-gd-group-info">
            <h1 className="msg-gd-title">{group.name}</h1>
            <p className="msg-gd-meta">Created {group.createdAt}</p>
          </div>
          <div className="msg-gd-actions">
            {isJoined ? (
              <button className="msg-gd-joined-btn">✓ Joined</button>
            ) : (
              <button className="msg-gd-join-btn" onClick={onJoinClick}>Join Group</button>
            )}
            <button className="msg-gd-share-btn" title="Share this group">
              <ShareIcon /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="msg-gd-tab-card">
        <div className="msg-gd-tab-row">
          <button
            className={`msg-gd-tab ${detailTab === 'about' ? 'msg-gd-tab--active' : ''}`}
            onClick={() => setDetailTab('about')}
          >
            About
          </button>
          {isJoined && (
            <button
              className={`msg-gd-tab ${detailTab === 'posts' ? 'msg-gd-tab--active' : ''}`}
              onClick={() => setDetailTab('posts')}
            >
              Posts
            </button>
          )}
          <button
            className={`msg-gd-tab ${detailTab === 'members' ? 'msg-gd-tab--active' : ''}`}
            onClick={() => setDetailTab('members')}
          >
            Members
          </button>
        </div>

        {/* Tab Content */}
        <div className="msg-gd-body">
          {/* About Tab */}
          {detailTab === 'about' && (
            <>
              <div className="msg-gd-main">
                {/* About Card */}
                <div className="msg-gd-about-card">
                  <div className="msg-gd-card-header">
                    <span className="msg-gd-card-title">About this Group</span>
                  </div>
                  <p className="msg-gd-card-body">
                    {aboutExpanded || group.description.length <= 300
                      ? group.description
                      : group.description.slice(0, 300) + '…'
                    }
                    {group.description.length > 300 && (
                      <>
                        {' '}
                        <button
                          onClick={() => setAboutExpanded(!aboutExpanded)}
                          className="msg-gd-see-more-btn"
                        >
                          {aboutExpanded ? 'See less' : 'See more'}
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Mission Card */}
                <div className="msg-gd-about-card">
                  <div className="msg-gd-card-header">
                    <span className="msg-gd-card-title">Group Mission</span>
                  </div>
                  <p className="msg-gd-card-body">{group.mission}</p>
                </div>

                {/* Info Grid */}
                <div className="msg-gd-info-grid">
                  <div className="msg-gd-info-card">
                    <span className="msg-gd-info-label">Category</span>
                    <span className="msg-gd-info-value">{group.category}</span>
                  </div>
                  <div className="msg-gd-info-card">
                    <span className="msg-gd-info-label">Privacy</span>
                    <span className="msg-gd-info-value">Public</span>
                  </div>
                  <div className="msg-gd-info-card">
                    <span className="msg-gd-info-label">Members</span>
                    <span className="msg-gd-info-value">{group.members}</span>
                  </div>
                  <div className="msg-gd-info-card">
                    <span className="msg-gd-info-label">Created</span>
                    <span className="msg-gd-info-value">{group.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="msg-gd-sidebar">
                <div className="msg-gd-card">
                  <h3 className="msg-gd-card-title">Group Info</h3>
                  <div className="msg-gd-info-rows">
                    <div className="msg-gd-info-row">
                      <div className="msg-gd-info-sub-row">
                        <p className="msg-gd-info-sub">Total members</p>
                      </div>
                      <p className="msg-gd-info-label">{group.members}</p>
                    </div>
                    <div className="msg-gd-info-row">
                      <div className="msg-gd-info-sub-row">
                        <p className="msg-gd-info-sub">Created</p>
                      </div>
                      <p className="msg-gd-info-label">{group.createdAt}</p>
                    </div>
                    <div className="msg-gd-info-row">
                      <div className="msg-gd-info-sub-row">
                        <p className="msg-gd-info-sub">Privacy</p>
                      </div>
                      <p className="msg-gd-info-label">Public</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Posts Tab */}
          {detailTab === 'posts' && isJoined && (
            <div className="msg-gd-main">
              {/* Compose Box */}
              <div className="msg-gd-compose-box">
                <div className="msg-gd-compose-input-fake">
                  <span>Write something to the group...</span>
                </div>
                <div className="msg-gd-compose-actions">
                  <button type="button" className="msg-gd-compose-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    Photo
                  </button>
                  <button type="button" className="msg-gd-compose-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    Video
                  </button>
                </div>
              </div>

              {/* Posts */}
              {DEMO_POSTS.map(post => (
                <div key={post.id} className="msg-gd-post-card">
                  {/* Post Header */}
                  <div className="msg-gd-post-header">
                    <div className="msg-gd-post-author-info">
                      <div className="msg-gd-post-meta">
                        <p className="msg-gd-post-author">{post.author}</p>
                        <p className="msg-gd-post-time">{post.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="msg-gd-post-content">
                    <p className="msg-gd-post-caption">{post.caption}</p>
                    {post.image && (
                      <img src={post.image} alt="" className="msg-gd-post-image" />
                    )}
                  </div>

                  {/* Post Stats */}
                  <div className="msg-gd-post-stats">
                    <span>👍 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>↗️ {post.shares}</span>
                  </div>

                  {/* Post Actions */}
                  <div className="msg-gd-post-actions">
                    <button className="msg-gd-post-action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                      Like
                    </button>
                    <button className="msg-gd-post-action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Comment
                    </button>
                    <button className="msg-gd-post-action-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Members Tab */}
          {detailTab === 'members' && (
            <div className="msg-gd-members-section">
              <table className="msg-gd-members-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>ROLE</th>
                    <th>JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_MEMBERS.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="msg-gd-member-cell">
                          <span className="msg-gd-member-name">{m.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="msg-gd-member-role">{m.role}</span>
                      </td>
                      <td>
                        <span className="msg-gd-member-date">{m.joined}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'technology', label: 'Technology' },
  { id: 'design', label: 'Design' },
  { id: 'business', label: 'Business' },
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'science', label: 'Science' },
  { id: 'finance', label: 'Finance' },
  { id: 'arts', label: 'Arts' },
];

export default function MiniSiteGroupsPage({ siteName }) {
  const [activeTab, setActiveTab] = useState('suggested');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filterGroups = (groups) => {
    return groups.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' ||
        g.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  };

  const suggestedGroups = filterGroups(DEMO_SUGGESTED_GROUPS);
  const joinedGroups = filterGroups(DEMO_JOINED_GROUPS);

  const displayGroups = activeTab === 'suggested' ? suggestedGroups : joinedGroups;

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setShowDetail(true);
  };

  const handleBackClick = () => {
    setShowDetail(false);
    setSelectedGroup(null);
  };

  const handleJoinGroup = () => {
    // Demo: Just toggle state
    if (selectedGroup) {
      const isCurrentlyJoined = activeTab === 'joined' || DEMO_JOINED_GROUPS.some(g => g.id === selectedGroup.id);
      if (!isCurrentlyJoined) {
        // Add to joined groups in demo
        setSelectedGroup({ ...selectedGroup, joined: true });
      }
    }
  };

  if (showDetail && selectedGroup) {
    return (
      <MiniSiteGroupDetailView
        group={selectedGroup}
        isJoined={DEMO_JOINED_GROUPS.some(g => g.id === selectedGroup.id)}
        onBack={handleBackClick}
        onJoinClick={handleJoinGroup}
      />
    );
  }

  return (
    <div className="msg-groups-page">
      <div className="msg-groups-header">
        <div className="msg-groups-tabs">
          <button
            className={`msg-groups-tab ${activeTab === 'suggested' ? 'msg-groups-tab--active' : ''}`}
            onClick={() => setActiveTab('suggested')}
          >
            Suggested Groups
          </button>
          <button
            className={`msg-groups-tab ${activeTab === 'joined' ? 'msg-groups-tab--active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            Joined Groups
          </button>
        </div>
      </div>

      <div className="msg-groups-search">
        <div className="msg-search-input-wrap">
          <SearchIcon />
          <input
            type="text"
            placeholder={`Search ${activeTab} groups...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="msg-search-input"
          />
          {searchTerm && (
            <button
              className="msg-search-clear"
              onClick={() => setSearchTerm('')}
              type="button"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <div className="msg-groups-filters">
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat.id}
            className={`msg-groups-filter-pill ${selectedCategory === cat.id ? 'msg-groups-filter-pill--active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="msg-groups-grid">
        {displayGroups.length === 0 ? (
          <div className="msg-groups-empty">
            <p>
              {activeTab === 'suggested'
                ? 'No suggested groups found'
                : "You haven't joined any groups yet"}
            </p>
            {activeTab === 'joined' && (
              <button
                className="msg-groups-explore-btn"
                onClick={() => setActiveTab('suggested')}
              >
                Browse Suggested Groups
              </button>
            )}
          </div>
        ) : (
          displayGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              isJoined={activeTab === 'joined'}
              onClick={() => handleGroupClick(group)}
            />
          ))
        )}
      </div>
    </div>
  );
}
