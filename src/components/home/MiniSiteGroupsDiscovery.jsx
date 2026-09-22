import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest, getMiniSiteGroupPosts, likeMiniSiteGroupPost, unlikeMiniSiteGroupPost, getMiniSiteGroupComments, createMiniSiteGroupComment, likeMiniSiteGroupComment, unlikeMiniSiteGroupComment, createMiniSiteGroupPost, reportMiniSiteGroup } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import CreatePostModal from './CreatePostModal';
import './MiniSiteGroupsDiscovery.css';

function GlobeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function JoinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function ReactIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
}

function CommentIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
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
  const [showDetail, setShowDetail] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
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

      if (suggestedRes?.data?.groups && Array.isArray(suggestedRes.data.groups)) {
        // Filter out groups that have already been joined
        const filteredSuggested = suggestedRes.data.groups.filter(g => !g.joined);
        setSuggestedGroups(filteredSuggested);
      } else {
        setSuggestedGroups([]);
      }
      if (joinedRes?.data?.groups && Array.isArray(joinedRes.data.groups)) {
        // Only show groups that have been joined
        const filteredJoined = joinedRes.data.groups.filter(g => g.joined);
        setJoinedGroups(filteredJoined);
      } else {
        setJoinedGroups([]);
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
            {group.privacy === 'public' && <><GlobeIcon /> Public</>}
            {group.privacy === 'private' && '🔒 Private'}
            {group.privacy === 'vetted' && '✓ Vetted'}
          </span>
        </div>

        <div className="msg-group-stats">
          <span>{group.memberCount.toLocaleString()} members</span>
          <span>{group.postsCount || 0} posts</span>
        </div>

        <div className="msg-group-actions">
          <button className="msg-view-btn" onClick={() => { setSelectedGroup(group); setViewMode('detail'); }} title="View details">
            View
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
                {group.privacy === 'public' && <><GlobeIcon /> Public</>}
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

  const GroupDetailFullView = ({ group, onClose, siteId, token }) => {
    const dispatch = useDispatch();
    const [detailTab, setDetailTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [postComments, setPostComments] = useState({});
    const [commentsLoading, setCommentsLoading] = useState({});
    const [commentText, setCommentText] = useState({});
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportCategory, setReportCategory] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const reportCategories = [
      'Sexual content',
      'Violent or repulsive content',
      'Hateful or abusive content',
      'Harassment or bullying',
      'Harmful or dangerous acts',
      'Suicide, self-harm or eating disorders',
      'Misinformation'
    ];

    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

    useEffect(() => {
      if (detailTab === 'posts') {
        loadPosts();
      }
    }, [detailTab]);

    const loadPosts = async () => {
      setPostsLoading(true);
      try {
        const data = await getMiniSiteGroupPosts(siteId, group._id, { page: 1, limit: 20 }, token);
        if (data?.data?.posts && Array.isArray(data.data.posts)) {
          setPosts(data.data.posts);
        } else if (data?.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
        dispatch(showToast({ message: 'Failed to load posts', type: 'error' }));
      } finally {
        setPostsLoading(false);
      }
    };

    const loadComments = async (postId) => {
      if (postComments[postId]) return;
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      try {
        const data = await getMiniSiteGroupComments(siteId, group._id, postId, { page: 1, limit: 10 }, token);
        const comments = data?.data?.comments || data?.comments || [];
        setPostComments(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
        console.error('Failed to load comments:', error);
        dispatch(showToast({ message: 'Failed to load comments', type: 'error' }));
      } finally {
        setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      }
    };

    const handleLikePost = async (postId) => {
      try {
        await likeMiniSiteGroupPost(siteId, group._id, postId, token);
        setPosts(posts.map(p => p._id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to like post', type: 'error' }));
      }
    };

    const handleUnlikePost = async (postId) => {
      try {
        await unlikeMiniSiteGroupPost(siteId, group._id, postId, token);
        setPosts(posts.map(p => p._id === postId ? { ...p, liked: false, likes: p.likes - 1 } : p));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to unlike post', type: 'error' }));
      }
    };

    const handleExpandComments = (postId) => {
      const newSet = new Set(expandedComments);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        loadComments(postId);
      }
      setExpandedComments(newSet);
    };

    const handleAddComment = async (postId) => {
      const text = commentText[postId]?.trim();
      if (!text) {
        dispatch(showToast({ message: 'Comment cannot be empty', type: 'error' }));
        return;
      }

      try {
        const data = await createMiniSiteGroupComment(siteId, group._id, postId, { text, media: [] }, token);
        const newComment = data?.data || data;
        setPostComments(prev => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])]
        }));
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        setPosts(posts.map(p => p._id === postId ? { ...p, comments: p.comments + 1 } : p));
        dispatch(showToast({ message: 'Comment posted!', type: 'success' }));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to post comment', type: 'error' }));
      }
    };

    const handleLikeComment = async (postId, commentId) => {
      try {
        await likeMiniSiteGroupComment(siteId, group._id, postId, commentId, token);
        setPostComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.map(c => c._id === commentId ? { ...c, liked: true, likes: c.likes + 1 } : c)
        }));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to like comment', type: 'error' }));
      }
    };

    const handleUnlikeComment = async (postId, commentId) => {
      try {
        await unlikeMiniSiteGroupComment(siteId, group._id, postId, commentId, token);
        setPostComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.map(c => c._id === commentId ? { ...c, liked: false, likes: c.likes - 1 } : c)
        }));
      } catch (error) {
        dispatch(showToast({ message: 'Failed to unlike comment', type: 'error' }));
      }
    };

    const handleReportSubmit = async () => {
      if (!reportCategory) {
        dispatch(showToast({ message: 'Please select a reason', type: 'error' }));
        return;
      }

      setIsReporting(true);
      try {
        await reportMiniSiteGroup(siteId, group._id, { reason: reportCategory }, token);
        dispatch(showToast({ message: 'Group reported successfully', type: 'success' }));
        setReportModalOpen(false);
        setReportCategory('');
      } catch (error) {
        dispatch(showToast({ message: error.message || 'Failed to report group', type: 'error' }));
      } finally {
        setIsReporting(false);
      }
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#070b14', color: '#e2e8f0', zIndex: 10000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable container */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Cover */}
          <div style={{ height: '240px', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1720 100%)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            {group.coverImg && <img src={group.coverImg} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

            {/* Back Button - Positioned over cover image */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
              }}
            >
              ←
            </button>
          </div>

          {/* Group Header with Avatar & Info */}
          <div style={{ background: '#0b0d17', padding: '0 32px 0', borderBottom: '1px solid #1a1f35', flexShrink: 0 }}>
          {/* Avatar overlapping cover + Info + Buttons row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px', marginTop: '-40px', position: 'relative', zIndex: 10, paddingBottom: '20px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#0d1720', border: '4px solid #0b0d17', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontSize: '28px', fontWeight: '800', color: '#fff' }}>
              {group.groupImg ? <img src={group.groupImg} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>G</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.01em' }}>{group.name}</h1>
              <p style={{ margin: '0', color: '#6b7a9e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>Created {new Date(group.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Action Buttons - on the RIGHT side */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button style={{ padding: '9px 22px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.15s, border-color 0.15s', whiteSpace: 'nowrap' }} onMouseOver={(e) => { e.target.style.background = 'rgba(239,68,68,0.18)'; e.target.style.borderColor = '#f87171'; }} onMouseOut={(e) => { e.target.style.background = 'rgba(239,68,68,0.1)'; e.target.style.borderColor = 'rgba(239,68,68,0.3)'; }}>Leave Group</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#111829', color: '#94a3b8', border: '1px solid #1a2338', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap' }} onMouseOver={(e) => { e.target.style.background = '#1a2040'; e.target.style.color = '#e2e8f0'; }} onMouseOut={(e) => { e.target.style.background = '#111829'; e.target.style.color = '#94a3b8'; }}>Share</button>
              <button onClick={() => setReportModalOpen(true)} style={{ padding: '9px 18px', background: 'none', color: '#64748b', border: '1px solid #1e2a40', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.15s, color 0.15s, border-color 0.15s', whiteSpace: 'nowrap' }} onMouseOver={(e) => { e.target.style.background = 'rgba(239,68,68,0.1)'; e.target.style.borderColor = 'rgba(239,68,68,0.3)'; e.target.style.color = '#f87171'; }} onMouseOut={(e) => { e.target.style.background = 'none'; e.target.style.borderColor = '#1e2a40'; e.target.style.color = '#64748b'; }}>Report</button>
            </div>
          </div>

          {/* Statistics Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 32px 24px', background: '#0b0d17' }}>
            <div style={{ background: '#111422', padding: '20px', borderRadius: '8px', border: '1px solid #1a1f35', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(226, 232, 240, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>TOTAL MEMBERS</p>
              <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>{group.memberCount || 0}</p>
            </div>
            {posts.length > 0 && (
              <div style={{ background: '#111422', padding: '20px', borderRadius: '8px', border: '1px solid #1a1f35', textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(226, 232, 240, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>TOTAL POSTS</p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>{posts.length}</p>
              </div>
            )}
          </div>

        </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1f35', padding: '0 32px', background: '#111422', flexShrink: 0 }}>
            {['about', 'posts'].map(tab => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: detailTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                  color: detailTab === tab ? '#60a5fa' : '#6b7a9e',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: '-1px'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: '#0b0d17', flex: 1, padding: '22px 32px 48px' }}>
          {detailTab === 'about' && (
            <>
              {group.description && (
                <div style={{ marginBottom: '24px', background: '#111422', padding: '20px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', color: '#fff' }}>ℹ️</span>
                    <h3 style={{ margin: '0', fontSize: '16px', color: '#e2e8f0', fontWeight: '600' }}>About this Group</h3>
                  </div>
                  <p style={{ margin: '0', color: '#b3bcc4', lineHeight: '1.6', fontSize: '14px' }}>{group.description}</p>
                </div>
              )}

              {group.mission && (
                <div style={{ marginBottom: '24px', background: '#111422', padding: '20px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#8b5cf6', color: '#fff' }}>🎯</span>
                    <h3 style={{ margin: '0', fontSize: '16px', color: '#e2e8f0', fontWeight: '600' }}>Group Mission</h3>
                  </div>
                  <p style={{ margin: '0', color: '#b3bcc4', lineHeight: '1.6', fontSize: '14px' }}>{group.mission}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#111422', padding: '16px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>ADMIN</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{group.admin?.fullName || 'Admin'}</p>
                </div>
                <div style={{ background: '#111422', padding: '16px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>PRIVACY</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>🌐 {group.privacy.charAt(0).toUpperCase() + group.privacy.slice(1)}</p>
                </div>
                <div style={{ background: '#111422', padding: '16px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>CATEGORY</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{group.category}</p>
                </div>
                <div style={{ background: '#111422', padding: '16px', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#7a8494', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>CREATED</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </>
          )}

          {detailTab === 'posts' && (
            <>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.18s', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}>
                <div
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '20px',
                    padding: '10px 16px',
                    color: '#64748b',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCreatePostOpen(true)}
                >
                  Write something to the group...
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }} onMouseOver={(e) => { e.target.style.background = '#334155'; e.target.style.color = '#e2e8f0'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#94a3b8'; }} onClick={() => setCreatePostOpen(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Photo
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }} onMouseOver={(e) => { e.target.style.background = '#334155'; e.target.style.color = '#e2e8f0'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#94a3b8'; }} onClick={() => setCreatePostOpen(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    Video
                  </button>
                </div>
              </div>

              {postsLoading ? (
                <p style={{ textAlign: 'center', color: '#6b7a9e', padding: '40px 0' }}>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7a9e', padding: '40px 0' }}>No posts yet. Be the first to post!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {posts.map(post => (
                    <div key={post._id} style={{ background: '#111422', paddingTop: '16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '0', borderRadius: '12px', border: '1px solid #1a1f35' }}>
                      <p style={{ margin: '0 0 6px', color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>{post.author?.fullName || 'Unknown'}</p>
                      <p style={{ margin: '0 0 14px', color: '#6b7a9e', fontSize: '13px' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                      <p style={{ margin: '0 0 14px', color: '#c8d0e0', lineHeight: '1.65', fontSize: '14px' }}>{post.caption || post.content}</p>

                      {/* Media Display */}
                      {post.media && post.media.length > 0 && (
                        <div style={{ position: 'relative', overflow: 'hidden', width: 'calc(100% + 32px)', marginLeft: '-16px', marginRight: '-16px', marginBottom: '0', borderRadius: '0', background: '#0f172a', minHeight: '120px' }}>
                          {post.media.map((m, idx) => (
                            <div key={idx} style={{ display: idx === 0 ? 'block' : 'none' }}>
                              {m.type === 'image' ? (
                                <img src={m.url} alt="Post media" style={{ width: '100%', height: 'auto', maxHeight: '400px', display: 'block', objectFit: 'contain', background: '#0d1424', flexShrink: 0 }} />
                              ) : m.type === 'video' ? (
                                <video src={m.url} style={{ width: '100%', height: 'auto', maxHeight: '400px', display: 'block', objectFit: 'contain', background: '#0d1424' }} controls />
                              ) : null}
                            </div>
                          ))}
                          {post.media.length > 1 && (
                            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                              {post.media.map((_, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === 0 ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}


                      {/* Post Actions */}
                      <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 0, padding: '12px 16px', borderTop: '1px solid #1a1f35', borderBottom: '1px solid #1a1f35', marginBottom: '12px', marginLeft: '-16px', marginRight: '-16px' }}>
                        <button
                          onClick={() => post.liked ? handleUnlikePost(post._id) : handleLikePost(post._id)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: post.liked ? '#ef4444' : '#6b7a9e',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '8px 0',
                            transition: 'background 0.18s ease, color 0.18s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                            e.currentTarget.style.color = '#a5b4fc';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = post.liked ? '#ef4444' : '#6b7a9e';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <ReactIcon /> React ({post.likes || 0})
                        </button>
                        <div style={{ width: '1px', background: '#1a1f35' }} />
                        <button
                          onClick={() => handleExpandComments(post._id)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: expandedComments.has(post._id) ? '#a5b4fc' : '#6b7a9e',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '8px 0',
                            transition: 'background 0.18s ease, color 0.18s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                            e.currentTarget.style.color = '#a5b4fc';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = expandedComments.has(post._id) ? '#a5b4fc' : '#6b7a9e';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <CommentIcon /> Comment ({post.comments || 0})
                        </button>
                        <div style={{ width: '1px', background: '#1a1f35' }} />
                        <button
                          style={{
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#6b7a9e',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '8px 0',
                            transition: 'background 0.18s ease, color 0.18s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                            e.currentTarget.style.color = '#a5b4fc';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#6b7a9e';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <ShareIcon /> Share
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(post._id) && (
                        <div style={{ marginTop: '0', paddingTop: '12px', paddingLeft: '16px', paddingRight: '16px', borderTop: '1px solid #1a1f35', marginLeft: '-16px', marginRight: '-16px' }}>
                          {commentsLoading[post._id] ? (
                            <p style={{ textAlign: 'center', color: '#6b7a9e', fontSize: '13px' }}>Loading comments...</p>
                          ) : (
                            <>
                              {postComments[post._id]?.map(comment => (
                                <div key={comment._id} style={{ marginBottom: '12px', padding: '8px', background: '#0f172a', borderRadius: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontWeight: '600', fontSize: '13px' }}>{comment.author?.fullName || 'Unknown'}</p>
                                      <p style={{ margin: '0 0 8px', color: '#b3bcc4', fontSize: '13px', lineHeight: '1.4' }}>{comment.text}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => comment.liked ? handleUnlikeComment(post._id, comment._id) : handleLikeComment(post._id, comment._id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: comment.liked ? '#60a5fa' : '#6b7a9e',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      padding: '4px 6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      borderRadius: '4px',
                                      transition: 'background 0.15s, color 0.15s'
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.background = 'rgba(96, 165, 250, 0.1)';
                                      e.target.style.color = '#60a5fa';
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.background = 'none';
                                      e.target.style.color = comment.liked ? '#60a5fa' : '#6b7a9e';
                                    }}
                                  >
                                    <span>{comment.liked ? '❤️' : '🤍'}</span>
                                    <span>{comment.likes || 0}</span>
                                  </button>
                                </div>
                              ))}

                              {/* Add Comment */}
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1a1f35', display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentText[post._id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: '#0f172a',
                                    color: '#e2e8f0',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit'
                                  }}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'background 0.15s'
                                  }}
                                  onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                                  onMouseOut={(e) => e.target.style.background = '#2563eb'}
                                >
                                  Post
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {createPostOpen && (
          <CreatePostModal
            onClose={() => setCreatePostOpen(false)}
            groupId={group._id}
            siteId={siteId}
            onPostCreate={async (postData) => {
              try {
                // Extract actual File objects from images (like main module does)
                const mediaFiles = postData.images && postData.images.length > 0
                  ? postData.images.map(img => img.file).filter(Boolean)
                  : [];

                await createMiniSiteGroupPost(siteId, group._id, {
                  caption: postData.caption,
                  mediaFiles
                }, token);
                dispatch(showToast({ message: 'Post created!', type: 'success' }));
                setCreatePostOpen(false);
                await loadPosts();
              } catch (error) {
                console.error('Failed to create post:', error);
                throw error;
              }
            }}
          />
        )}

        {reportModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setReportModalOpen(false)}>
            <div style={{ background: '#111422', borderRadius: '12px', border: '1px solid #1a1f35', padding: '28px', maxWidth: '420px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#e2e8f0' }}>Report</h3>
                <button onClick={() => setReportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b9cc8', cursor: 'pointer', fontSize: '24px', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>What's going on?</p>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#8b9cc8', lineHeight: '1.55' }}>We'll check for all community guidelines, so don't worry about making the perfect choice.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reportCategories.map(category => (
                  <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <input
                      type="radio"
                      name="report-category"
                      value={category}
                      checked={reportCategory === category}
                      onChange={(e) => setReportCategory(e.target.value)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '400' }}>{category}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1a1f35' }}>
                <button
                  onClick={() => setReportModalOpen(false)}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: '1px solid #1e2a40',
                    background: 'none',
                    color: '#8b9cc8',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#111829'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={isReporting || !reportCategory}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: reportCategory && !isReporting ? '#2563eb' : '#64748b',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isReporting || !reportCategory ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                    opacity: isReporting || !reportCategory ? 0.6 : 1
                  }}
                  onMouseOver={(e) => { if (!isReporting && reportCategory) e.target.style.background = '#1d4ed8'; }}
                  onMouseOut={(e) => { e.target.style.background = reportCategory && !isReporting ? '#2563eb' : '#64748b'; }}
                >
                  {isReporting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
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

  const displayGroups = activeTab === 'suggested' ? (suggestedGroups || []) : (joinedGroups || []);
  const isEmpty = !displayGroups || displayGroups.length === 0;

  // Show detail view as full page instead of overlay
  if (viewMode === 'detail' && selectedGroup) {
    return (
      <GroupDetailFullView
        group={selectedGroup}
        onClose={() => {
          setViewMode('list');
          setSelectedGroup(null);
        }}
        siteId={siteId}
        token={token}
      />
    );
  }

  // Show list view
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
