import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import './MiniSiteGroupsDiscovery.css';

function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function JoinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function LoadingSpinner() {
  return <div className="msg-spinner" />;
}

export default function MiniSiteGroupsDiscovery({ siteId }) {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('suggested');
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);
  const [ageVerificationOpen, setAgeVerificationOpen] = useState(false);
  const [ageVerificationGroup, setAgeVerificationGroup] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [siteId, token]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const [suggestedRes, joinedRes] = await Promise.all([
        apiRequest(`/api/mini-sites/${siteId}/groups/suggested?page=1&limit=20`, { token }),
        token ? apiRequest(`/api/mini-sites/${siteId}/groups/joined?page=1&limit=20`, { token }) : Promise.resolve(null),
      ]);

      if (suggestedRes?.data?.groups) {
        setSuggestedGroups(suggestedRes.data.groups);
      }
      if (joinedRes?.data?.groups) {
        setJoinedGroups(joinedRes.data.groups);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading groups:', error);
      dispatch(showToast({ message: 'Failed to load groups', type: 'error' }));
      setLoading(false);
    }
  };

  const handleJoin = async (group) => {
    if (group.privacy === 'vetted') {
      setAgeVerificationGroup(group);
      setAgeVerificationOpen(true);
      return;
    }
    await joinGroup(group._id);
  };

  const handleAgeVerify = async () => {
    if (!birthDate) {
      dispatch(showToast({ message: 'Please enter your birth date', type: 'error' }));
      return;
    }
    setVerifying(true);
    await joinGroup(ageVerificationGroup._id, birthDate);
    setVerifying(false);
  };

  const joinGroup = async (groupId, bDate = null) => {
    setJoiningId(groupId);
    try {
      const payload = bDate ? { birthDate: bDate } : {};
      const response = await apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/join`, {
        method: 'POST',
        token,
        data: payload,
      });

      if (response?.success) {
        dispatch(showToast({ message: 'Successfully joined the group!', type: 'success' }));
        loadGroups();
        setAgeVerificationOpen(false);
        setBirthDate('');
      } else if (response?.data?.pending) {
        dispatch(showToast({ message: 'Request sent! Awaiting admin approval.', type: 'info' }));
        loadGroups();
        setAgeVerificationOpen(false);
        setBirthDate('');
      } else {
        dispatch(showToast({ message: response?.message || 'Failed to join group', type: 'error' }));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      dispatch(showToast({ message: error.message || 'Failed to join group', type: 'error' }));
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    setLeavingId(groupId);
    try {
      const response = await apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}/leave`, {
        method: 'POST',
        token,
      });

      if (response?.success) {
        dispatch(showToast({ message: 'Left the group', type: 'success' }));
        loadGroups();
      } else {
        dispatch(showToast({ message: response?.message || 'Failed to leave group', type: 'error' }));
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      dispatch(showToast({ message: 'Failed to leave group', type: 'error' }));
    } finally {
      setLeavingId(null);
    }
  };

  const fetchGroupDetail = async (groupId) => {
    try {
      const response = await apiRequest(`/api/mini-sites/${siteId}/groups/${groupId}`, { token });
      if (response?.data) {
        setSelectedGroup(response.data);
      }
    } catch (error) {
      console.error('Error fetching group detail:', error);
    }
  };

  const GroupCard = ({ group, onView, onJoin, onLeave, isJoining, isLeaving }) => (
    <div className="msg-group-card">
      <div className="msg-group-cover">
        {group.coverImg ? (
          <img src={group.coverImg} alt={group.name} className="msg-group-cover-img" />
        ) : (
          <div className="msg-group-cover-placeholder">Social Platform</div>
        )}
      </div>

      <div className="msg-group-photo">
        {group.groupImg ? (
          <img src={group.groupImg} alt={group.name} />
        ) : (
          <div className="msg-group-photo-placeholder">G</div>
        )}
      </div>

      <div className="msg-group-content">
        <h3 className="msg-group-name">{group.name}</h3>
        {group.mission && <p className="msg-group-mission">{group.mission}</p>}

        <div className="msg-group-meta">
          <span className="msg-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{group.category}</span>
          <span className="msg-privacy">
            {group.privacy === 'public' && '🌍 Public'}
            {group.privacy === 'private' && '🔒 Private'}
            {group.privacy === 'vetted' && '✓ Vetted'}
          </span>
        </div>

        <div className="msg-group-stats">
          <span>{group.memberCount.toLocaleString()} members</span>
          <span>{group.postsCount || 0} posts</span>
        </div>

        <div className="msg-group-actions">
          <button className="msg-view-btn" onClick={() => { fetchGroupDetail(group._id); onView(group); }} title="View details">
            <EyeIcon />
          </button>
          {group.joined ? (
            <button
              className="msg-action-btn msg-leave-btn"
              onClick={() => onLeave(group._id)}
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave'}
            </button>
          ) : group.pending ? (
            <button className="msg-action-btn msg-pending-btn" disabled>
              Request Sent
            </button>
          ) : (
            <button
              className="msg-action-btn msg-join-btn"
              onClick={() => onJoin(group)}
              disabled={isJoining}
            >
              {isJoining ? <LoadingSpinner /> : <><JoinIcon /> Join</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const GroupDetailModal = ({ group, onClose }) => {
    if (!group) return null;
    return (
      <div className="msg-modal-overlay" onClick={onClose}>
        <div className="msg-modal" onClick={e => e.stopPropagation()}>
          <div className="msg-modal-header">
            <h2>Group Details</h2>
            <button className="msg-modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="msg-modal-body">
            {group.coverImg && (
              <img src={group.coverImg} alt={group.name} className="msg-modal-cover" />
            )}

            <h3 className="msg-modal-name">{group.name}</h3>
            {group.mission && <p className="msg-modal-mission">{group.mission}</p>}

            <div className="msg-modal-meta">
              <span className="msg-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{group.category}</span>
              <span className="msg-privacy">
                {group.privacy === 'public' && '🌍 Public'}
                {group.privacy === 'private' && '🔒 Private'}
                {group.privacy === 'vetted' && '✓ Vetted'}
              </span>
            </div>

            {group.description && (
              <div className="msg-modal-section">
                <h4>Description</h4>
                <p>{group.description}</p>
              </div>
            )}

            <div className="msg-modal-stats">
              <div className="msg-stat-box">
                <p className="msg-stat-label">Members</p>
                <p className="msg-stat-value">{group.memberCount.toLocaleString()}</p>
              </div>
              <div className="msg-stat-box">
                <p className="msg-stat-label">Posts</p>
                <p className="msg-stat-value">{group.postsCount || 0}</p>
              </div>
              <div className="msg-stat-box">
                <p className="msg-stat-label">Created</p>
                <p className="msg-stat-value">{new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {group.admin && (
              <div className="msg-modal-section">
                <h4>Admin</h4>
                <div className="msg-admin-card">
                  {group.admin.avatar && (
                    <img src={group.admin.avatar} alt={group.admin.fullName} className="msg-admin-avatar" />
                  )}
                  <p className="msg-admin-name">{group.admin.fullName}</p>
                </div>
              </div>
            )}
          </div>

          <div className="msg-modal-footer">
            <button className="msg-modal-btn-close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const AgeVerificationModal = ({ open, group, onClose, onVerify, loading: verifyLoading }) => {
    if (!open || !group) return null;
    return (
      <div className="msg-modal-overlay" onClick={onClose}>
        <div className="msg-modal msg-modal-age" onClick={e => e.stopPropagation()}>
          <div className="msg-modal-header">
            <h2>Age Verification</h2>
            <button className="msg-modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="msg-modal-body">
            <p className="msg-age-text">This group requires members to be at least {group.minAge} years old.</p>
            <p className="msg-age-subtext">Please enter your birth date to verify your age.</p>

            <div className="msg-age-form">
              <input
                type="date"
                className="msg-age-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="msg-modal-footer">
            <button className="msg-modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="msg-modal-btn-verify"
              onClick={onVerify}
              disabled={!birthDate || verifyLoading}
            >
              {verifyLoading ? 'Verifying...' : 'Verify & Join'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const displayGroups = activeTab === 'suggested' ? suggestedGroups : joinedGroups;
  const isEmpty = displayGroups.length === 0;

  return (
    <div className="msg-groups-discovery">
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

      <div className="msg-groups-container">
        {loading ? (
          <div className="msg-loading">Loading groups...</div>
        ) : isEmpty ? (
          <div className="msg-empty">
            <p>{activeTab === 'suggested' ? 'No groups to discover' : 'No groups joined yet'}</p>
          </div>
        ) : (
          <div className="msg-groups-grid">
            {displayGroups.map(group => (
              <GroupCard
                key={group._id}
                group={group}
                onView={() => {}}
                onJoin={handleJoin}
                onLeave={handleLeave}
                isJoining={joiningId === group._id}
                isLeaving={leavingId === group._id}
              />
            ))}
          </div>
        )}
      </div>

      <GroupDetailModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      <AgeVerificationModal
        open={ageVerificationOpen}
        group={ageVerificationGroup}
        onClose={() => {
          setAgeVerificationOpen(false);
          setBirthDate('');
        }}
        onVerify={handleAgeVerify}
        loading={verifying}
      />
    </div>
  );
}
