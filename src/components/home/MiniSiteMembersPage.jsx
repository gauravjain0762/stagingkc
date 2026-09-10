import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import './MiniSiteMembersPage.css';

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function PinIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline-block', verticalAlign:'-2px', marginRight: '6px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}

const DEMO_MEMBERS = [
  { _id: '1', fullName: 'Sarah Anderson', avatar: 'https://picsum.photos/seed/user1/100/100', location: 'San Francisco, CA' },
  { _id: '2', fullName: 'Mike Johnson', avatar: 'https://picsum.photos/seed/user2/100/100', location: 'New York, NY' },
  { _id: '3', fullName: 'Emily Chen', avatar: 'https://picsum.photos/seed/user3/100/100', location: 'Seattle, WA' },
  { _id: '4', fullName: 'David Martinez', avatar: 'https://picsum.photos/seed/user4/100/100', location: 'Austin, TX' },
  { _id: '5', fullName: 'Jessica Lee', avatar: 'https://picsum.photos/seed/user5/100/100', location: 'Los Angeles, CA' },
  { _id: '6', fullName: 'James Wilson', avatar: 'https://picsum.photos/seed/user6/100/100', location: 'Boston, MA' },
];

export default function MiniSiteMembersPage({ siteId, siteName, onBack }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector(s => s.auth);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (siteId && token) {
      fetchMembers();
    }
  }, [siteId, token]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Try mini-site members endpoint first
      let data = await apiRequest(`/api/mini-sites/${siteId}/members?limit=50`, {
        token
      }).catch(() => null);

      // Fallback to general users/connections endpoint if mini-site endpoint doesn't exist
      if (!data) {
        data = await apiRequest(`/api/users/me/connections?limit=50`, {
          token
        });
      }

      if (data?.success === false && data?.message?.includes('not a member')) {
        dispatch(showToast({
          message: 'ℹ️ You must join to view members',
          type: 'info'
        }));
        setMembers([]);
      } else if (data?.data) {
        const membersList = Array.isArray(data.data) ? data.data : data.data?.members || [];
        setMembers(membersList);
      } else if (data?.members) {
        setMembers(data.members);
      } else if (data?.connections) {
        setMembers(data.connections);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
      if (err?.message?.includes('403')) {
        dispatch(showToast({
          message: 'ℹ️ You must join to view members',
          type: 'info'
        }));
      } else {
        dispatch(showToast({
          message: '❌ Failed to load members',
          type: 'error'
        }));
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    (member.fullName || member.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (memberId) => {
    // Check if user is logged in
    if (!token || !user) {
      // Redirect to login - user must be logged in to view profiles
      dispatch(showToast({
        message: 'ℹ️ Please login to view member profiles',
        type: 'info'
      }));
      window.location.href = `/login`;
      return;
    }

    // Redirect to member's profile page on main platform
    window.location.href = `/profile/${memberId}`;
  };

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
        {loading ? (
          <div className="msg-members-empty">
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="msg-members-empty">
            <p>{members.length === 0 ? 'No members yet' : 'No members found'}</p>
          </div>
        ) : (
          filteredMembers.map(member => {
            const hasAvatar = member.avatar && member.avatar.startsWith('http');
            return (
              <div key={member._id || member.userId || member.id} className="msg-member-card">
                {hasAvatar ? (
                  <img
                    src={member.avatar}
                    alt={member.fullName || member.name}
                    className="msg-member-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="msg-member-avatar msg-member-avatar-fallback"
                  style={{ display: hasAvatar ? 'none' : 'flex' }}
                >
                  KA
                </div>
                <div className="msg-member-info">
                  <h3 className="msg-member-name">{member.fullName || member.name}</h3>
                  <p className="msg-member-location">{member.location ? <><PinIcon />{member.location}</> : (member.email || 'Member')}</p>
                </div>
                <button
                  className="msg-member-profile-btn"
                  onClick={() => handleViewProfile(member._id || member.userId || member.id)}
                >
                  View Profile
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
