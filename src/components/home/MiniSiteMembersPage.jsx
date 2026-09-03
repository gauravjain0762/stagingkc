import { useState } from 'react';
import './MiniSiteMembersPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

const DEMO_MEMBERS = [
  { _id: '1', fullName: 'Sarah Anderson', avatar: 'https://picsum.photos/seed/user1/100/100', location: 'San Francisco, CA' },
  { _id: '2', fullName: 'Mike Johnson', avatar: 'https://picsum.photos/seed/user2/100/100', location: 'New York, NY' },
  { _id: '3', fullName: 'Emily Chen', avatar: 'https://picsum.photos/seed/user3/100/100', location: 'Seattle, WA' },
  { _id: '4', fullName: 'David Martinez', avatar: 'https://picsum.photos/seed/user4/100/100', location: 'Austin, TX' },
  { _id: '5', fullName: 'Jessica Lee', avatar: 'https://picsum.photos/seed/user5/100/100', location: 'Los Angeles, CA' },
  { _id: '6', fullName: 'James Wilson', avatar: 'https://picsum.photos/seed/user6/100/100', location: 'Boston, MA' },
];

export default function MiniSiteMembersPage({ siteName, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = DEMO_MEMBERS.filter(member =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="msg-members-page">
      <div className="msg-members-header">
        <div className="msg-members-title-wrap">
          <button className="msg-members-back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="msg-members-title">Members</h1>
        </div>

        <div className="msg-members-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="msg-members-search-input"
          />
        </div>
      </div>

      <div className="msg-members-list">
        {filteredMembers.length === 0 ? (
          <div className="msg-members-empty">
            <p>No members found</p>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div key={member._id} className="msg-member-card">
              <img
                src={member.avatar}
                alt={member.fullName}
                className="msg-member-avatar"
              />
              <div className="msg-member-info">
                <h3 className="msg-member-name">{member.fullName}</h3>
                <p className="msg-member-location">{member.location}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
