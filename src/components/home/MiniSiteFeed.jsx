import { useState, useRef, useEffect } from 'react';
import SkeletonImg from '../SkeletonImg';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
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
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState('photo');
  const [creatorClicked, setCreatorClicked] = useState(false);
  const clickTimer = useRef(null);
  const feedRef = useRef(null);

  // Load posts from localStorage on mount
  useEffect(() => {
    loadPosts();
  }, [siteId]);

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem(`minisite-feed-${siteId}`);
      if (stored) {
        setPosts(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const savePosts = (newPosts) => {
    try {
      localStorage.setItem(`minisite-feed-${siteId}`, JSON.stringify(newPosts));
      setPosts(newPosts);
    } catch (err) {
      console.error('Failed to save posts:', err);
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
  const handlePostCreate = (postData) => {
    try {
      // Extract data from the post creation modal
      const caption = postData?.caption || postData?.content || '';
      const images = postData?.images || [];

      const newPost = {
        _id: `post-${Date.now()}`,
        author: {
          _id: 'demo-user',
          fullName: 'You',
          avatar: '',
        },
        content: caption,
        images: images.map(img => typeof img === 'string' ? img : img.src),
        createdAt: new Date().toISOString(),
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        comments: [],
        shares: [],
        sharesCount: 0,
      };

      const updatedPosts = [newPost, ...posts];
      savePosts(updatedPosts);
      setCreateOpen(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const displayName = 'You';
  const avatarUrl = '';

  return (
    <main className="home-feed minisite-feed-container">
      {/* Post creator */}
      <div className={`post-creator${creatorClicked ? ' post-creator--clicked' : ''}`}>
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
      </div>

      {createOpen && (
        <CreatePostModal
          initialTab={createTab}
          onClose={() => setCreateOpen(false)}
          onPostCreate={handlePostCreate}
        />
      )}

      <div className="feed-posts" ref={feedRef}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </main>
  );
}
