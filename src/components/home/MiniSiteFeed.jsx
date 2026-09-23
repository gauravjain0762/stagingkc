import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SkeletonImg from '../SkeletonImg';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import './MiniSiteFeed.css';

function PhotosIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}

function VideoIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
}

function EventIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

const DEMO_POSTS = [
  {
    _id: 'demo-1',
    author: { _id: 'user-1', fullName: 'Sarah Anderson', avatar: 'https://picsum.photos/seed/user1/100/100' },
    content: 'Excited to announce our latest community initiative! Join us as we build something amazing together. Your ideas matter!',
    images: ['https://picsum.photos/seed/post1/600/400'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likesCount: 156,
    commentsCount: 24,
    sharesCount: 12,
  },
  {
    _id: 'demo-2',
    author: { _id: 'user-2', fullName: 'Mike Johnson', avatar: 'https://picsum.photos/seed/user2/100/100' },
    content: 'Just wrapped up an amazing workshop. Great insights shared by our community members. Let\'s keep the momentum going!',
    images: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likesCount: 89,
    commentsCount: 18,
    sharesCount: 5,
  },
  {
    _id: 'demo-3',
    author: { _id: 'user-3', fullName: 'Emily Chen', avatar: 'https://picsum.photos/seed/user3/100/100' },
    content: 'Love the new features we launched this week! The community feedback has been invaluable. Here\'s what we\'ve accomplished:',
    images: ['https://picsum.photos/seed/post2/600/400'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 234,
    commentsCount: 52,
    sharesCount: 28,
  },
];

export default function MiniSiteFeed({ siteId, siteName }) {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState('photo');
  const [creatorClicked, setCreatorClicked] = useState(false);
  const clickTimer = useRef(null);
  const feedRef = useRef(null);

  // Load posts from API on mount
  useEffect(() => {
    if (siteId && token) {
      loadPosts();
    }
  }, [siteId, token]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Use ONLY mini-site feed endpoint - don't fall back to general posts
      const data = await apiRequest(`/api/mini-sites/${siteId}/feed?page=1&limit=10`, {
        token
      });

      console.log('Mini-site feed response:', data);

      if (data?.success === false && data?.message?.includes('not a member')) {
        setIsMember(false);
        setCanPost(false);
        dispatch(showToast({
          message: 'ℹ️ You can view posts but need to join to post',
          type: 'info'
        }));
      } else if (data?.data) {
        // Handle both array and paginated response
        const postsList = Array.isArray(data.data) ? data.data : data.data?.posts || [];
        setPosts(postsList);
        setIsMember(true);
        setCanPost(true);
      } else if (data?.posts) {
        // Handle direct posts response
        setPosts(data.posts);
        setIsMember(true);
        setCanPost(true);
      } else {
        // Empty feed
        setPosts([]);
        setIsMember(true);
        setCanPost(true);
      }
    } catch (err) {
      console.error('Failed to load mini-site posts:', err);
      if (err?.message?.includes('403') || err?.message?.includes('not a member')) {
        setIsMember(false);
        setCanPost(false);
        dispatch(showToast({
          message: 'ℹ️ Join this organization to post in the feed',
          type: 'info'
        }));
      } else {
        dispatch(showToast({
          message: '❌ Failed to load mini-site posts',
          type: 'error'
        }));
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (tab = 'photo') => {
    setCreateTab(tab);
    setCreateOpen(true);
  };

  const handleCreatorClick = (tab = 'photo') => {
    setCreatorClicked(true);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setCreatorClicked(false), 500);
    openCreate(tab);
  };

  // Handle post creation - intercept from CreatePostModal
  const handlePostCreate = async (postData) => {
    if (!canPost) {
      dispatch(showToast({
        message: '❌ You must join this organization to post',
        type: 'error'
      }));
      return;
    }

    try {
      // Extract data from the post creation modal
      const caption = postData?.caption || postData?.content || '';
      const images = postData?.images || [];
      const video = postData?.video || null;

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('content', caption);
      formData.append('visibility', 'public');

      // Add image files
      images.forEach((img, idx) => {
        if (img.file) {
          formData.append('images', img.file);
        } else if (img instanceof File) {
          formData.append('images', img);
        }
      });

      // Add video file
      if (video) {
        formData.append('video', video);
      }

      // Use ONLY mini-site feed endpoint - organization-specific posts
      const response = await apiRequest(`/api/mini-sites/${siteId}/feed`, {
        method: 'POST',
        token,
        body: formData,
        isFormData: true
      });

      console.log('Post creation response:', response);

      if (response?.post) {
        // Add new post to the feed
        setPosts([response.post, ...posts]);
        setCreateOpen(false);
        dispatch(showToast({
          message: '✅ Post created in mini-site feed!',
          type: 'success'
        }));
        // Refresh posts to ensure we have the latest
        setTimeout(async () => {
          try {
            console.log('Refreshing mini-site feed...');
            // Use ONLY mini-site endpoint
            const data = await apiRequest(`/api/mini-sites/${siteId}/feed?page=1&limit=10`, {
              token
            });

            if (data?.data) {
              const postsList = Array.isArray(data.data) ? data.data : data.data?.posts || [];
              setPosts(postsList);
              console.log('Mini-site feed refreshed with', postsList.length, 'posts');
            } else if (data?.posts) {
              setPosts(data.posts);
              console.log('Mini-site feed refreshed with', data.posts.length, 'posts');
            }
          } catch (err) {
            console.error('Failed to refresh mini-site feed:', err);
          }
        }, 500);
      } else if (response?.data) {
        setPosts([response.data, ...posts]);
        setCreateOpen(false);
        dispatch(showToast({
          message: '✅ Post created in mini-site feed!',
          type: 'success'
        }));
        // Refresh posts for this case too
        setTimeout(async () => {
          try {
            console.log('Refreshing mini-site feed...');
            const data = await apiRequest(`/api/mini-sites/${siteId}/feed?page=1&limit=10`, {
              token
            });

            if (data?.data) {
              const postsList = Array.isArray(data.data) ? data.data : data.data?.posts || [];
              setPosts(postsList);
              console.log('Mini-site feed refreshed with', postsList.length, 'posts');
            } else if (data?.posts) {
              setPosts(data.posts);
              console.log('Mini-site feed refreshed with', data.posts.length, 'posts');
            }
          } catch (err) {
            console.error('Failed to refresh mini-site feed:', err);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      dispatch(showToast({
        message: `❌ ${err?.message || 'Failed to create post'}`,
        type: 'error'
      }));
    }
  };

  const displayName = 'You';
  const avatarUrl = '';

  // Handle post updates (likes, comments, etc)
  const handlePostUpdate = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(p => p._id === updatedPost._id ? updatedPost : p)
    );
  };

  return (
    <main className="home-feed minisite-feed-container">
      {/* Post creator - Only visible to members */}
      {canPost && <div className={`post-creator${creatorClicked ? ' post-creator--clicked' : ''}`}>
        <div className="creator-top">
          <div
            className="creator-avatar"
            style={{
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {avatarUrl ? (
              <SkeletonImg
                src={avatarUrl}
                alt={displayName}
                fallback={
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {displayName[0]?.toUpperCase()}
                  </span>
                }
              />
            ) : (
              displayName[0]?.toUpperCase()
            )}
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
          <button className="creator-media-btn" onClick={() => handleCreatorClick('photo')}>
            <PhotosIcon /> Photos
          </button>
          <button className="creator-media-btn" onClick={() => handleCreatorClick('video')}>
            <VideoIcon /> Video
          </button>
          <button className="creator-post-btn" onClick={() => handleCreatorClick('photo')}>
            Post
          </button>
        </div>
      </div>}

      {/* View-only notice for non-members */}
      {!canPost && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#111422',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #1a1f35'
        }}>
          <p style={{ margin: '0', color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
            You can view posts but need to join this organization to post
          </p>
        </div>
      )}

      {createOpen && (
        <CreatePostModal
          initialTab={createTab}
          onClose={() => setCreateOpen(false)}
          onPostCreate={handlePostCreate}
          isMinSiteFeed={true}
          siteId={siteId}
        />
      )}

      <div className="feed-posts" ref={feedRef}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No posts yet. {canPost && 'Be the first to post!'}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} siteId={siteId} canLike={canPost} onPostUpdate={handlePostUpdate} />
          ))
        )}
      </div>
    </main>
  );
}
