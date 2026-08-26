import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonImg from '../SkeletonImg';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import { fetchConnections } from '../../store/slices/profileSlice';
import { apiRequest } from '../../services/api';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import EventCardFeed from './EventCardFeed';
import GroupCard from './GroupCard';

function PhotosIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function VideoIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
function EventIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }

export default function Feed({ onEventsClick, onProfileClick, onCreateEvent, onUserClick, onEventClick, onGroupClick, onGroupsClick }) {
  const dispatch = useDispatch();
  const { posts, loading, feedPage, feedHasMore } = useSelector(s => s.posts);
  const { user } = useSelector(s => s.auth);
  const { profile } = useSelector(s => s.profile);

  const [createOpen,     setCreateOpen]     = useState(false);
  const [createTab,      setCreateTab]      = useState('photo');
  const [creatorClicked, setCreatorClicked] = useState(false);
  const [isLoadingMore,  setIsLoadingMore]  = useState(false);
  const [events,         setEvents]         = useState([]);
  const [eventsLoading,  setEventsLoading]  = useState(false);
  const [groups,         setGroups]         = useState([]);
  const [groupsLoading,  setGroupsLoading]  = useState(false);
  const clickTimer = useRef(null);
  const feedRef = useRef(null);
  const authToken = user?.token ?? useSelector(s => s.auth.token);

  useEffect(() => {
    dispatch(fetchFeedPosts());
    dispatch(fetchConnections()); // candidates for @mention autocomplete in post/comment composers
    loadFeedEvents();
    loadFeedGroups();
  }, [dispatch]);

  async function loadFeedEvents() {
    setEventsLoading(true);
    try {
      const data = await apiRequest('/api/events?tab=upcoming&page=1&limit=100', { token: authToken });
      setEvents(data.events ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to load feed events:', err);
    } finally {
      setEventsLoading(false);
    }
  }

  async function loadFeedGroups() {
    setGroupsLoading(true);
    try {
      const data = await apiRequest('/api/groups?tab=suggested&page=1&limit=12', { token: authToken });
      setGroups(data.groups ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to load feed groups:', err);
    } finally {
      setGroupsLoading(false);
    }
  }

  // Infinite scroll: load more posts when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current || loading || isLoadingMore || !feedHasMore) return;

      const scrollPos = window.innerHeight + window.scrollY;
      const docHeight = document.body.offsetHeight;

      // Load more when user is within 800px of bottom
      if (scrollPos > docHeight - 800) {
        setIsLoadingMore(true);
        dispatch(fetchFeedPosts({ page: feedPage + 1, limit: 10 }))
          .finally(() => setIsLoadingMore(false));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [feedPage, loading, isLoadingMore, feedHasMore, dispatch]);

  function openCreate(tab = 'photo') { setCreateTab(tab); setCreateOpen(true); }

  function handleCreatorClick(tab = 'photo') {
    setCreatorClicked(true);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setCreatorClicked(false), 500);
    openCreate(tab);
  }

  // Combine posts, events, and groups, sort by creation time
  const combinedFeed = () => {
    const combined = [
      ...posts.map(p => ({ ...p, type: 'post', createdAt: p.createdAt })),
      ...events.map(e => ({ ...e, type: 'event', createdAt: e.createdAt })),
      ...groups.map(g => ({ ...g, type: 'group', createdAt: g.createdAt || new Date() })),
    ];
    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const feedItems = combinedFeed();
  const displayName = profile?.fullName ?? user?.fullName ?? 'You';
  const rawAvatar = profile?.avatar ?? user?.avatar ?? '';
  const avatarUrl = rawAvatar?.startsWith?.('http') ? rawAvatar : '';

  return (
    <main className="home-feed">
      {/* Post creator */}
      <div className={`post-creator${creatorClicked ? ' post-creator--clicked' : ''}`}>
        <div className="creator-top">
          <div className="creator-avatar" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onClick={onProfileClick}>
            {avatarUrl
              ? <SkeletonImg src={avatarUrl} alt={displayName} fallback={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{displayName[0]?.toUpperCase()}</span>} />
              : displayName[0]?.toUpperCase()}
          </div>
          <textarea
            className="creator-input"
            placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
            readOnly
            onClick={() => handleCreatorClick('photo')}
            rows={3}
          />
        </div>
        <div className="creator-actions">
          <button className="creator-media-btn" onClick={() => handleCreatorClick('photo')}><PhotosIcon /> Photos</button>
          <button className="creator-media-btn" onClick={() => handleCreatorClick('video')}><VideoIcon /> Video</button>
          <button className="creator-media-btn" onClick={() => onCreateEvent ? onCreateEvent() : handleCreatorClick('event')}><EventIcon /> Event</button>
          <button className="creator-post-btn"  onClick={() => handleCreatorClick('photo')}>Post</button>
        </div>
      </div>

      {createOpen && <CreatePostModal initialTab={createTab} onClose={() => setCreateOpen(false)} onNavigateToEvents={onEventsClick} onCreateEvent={onCreateEvent} />}

      {/* Groups Section */}
      {groups.length > 0 && !groupsLoading && (
        <div className="feed-section">
          <div className="feed-section-header">
            <h2>Suggested Groups</h2>
            {groups.length > 3 && <button className="feed-section-viewall" onClick={onGroupsClick}>View all</button>}
          </div>
          <div className="feed-groups-grid">
            {groups.slice(0, 3).map(group => (
              <GroupCard
                key={group._id}
                group={group}
                onJoin={() => loadFeedGroups()}
                onDetails={() => onGroupClick?.(group._id)}
                onShare={() => {
                  if (navigator.share) {
                    navigator.share({ title: group.name, text: `Check out ${group.name}!`, url: window.location.href });
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="feed-posts" ref={feedRef}>
        {(loading || eventsLoading || groupsLoading) && feedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5c6a8c' }}>Loading…</div>
        )}
        {!loading && !eventsLoading && !groupsLoading && feedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5c6a8c' }}>No posts or events yet.</div>
        )}
        {feedItems.map(item => (
          item.type === 'post'
            ? <PostCard key={item._id} post={item} onUserClick={onUserClick} />
            : item.type === 'event'
            ? <EventCardFeed key={item._id ?? item.id} event={item} onEventClick={onEventClick} onUserClick={onUserClick} />
            : item.type === 'group'
            ? <GroupCard key={item._id} group={item} onJoin={() => loadFeedGroups()} onDetails={() => onGroupClick?.(item._id)} onShare={() => {}} />
            : null
        ))}
        {isLoadingMore && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5c6a8c' }}>Loading more…</div>
        )}
        {!feedHasMore && feedItems.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#5c6a8c' }}>No more items</div>
        )}
      </div>
    </main>
  );
}