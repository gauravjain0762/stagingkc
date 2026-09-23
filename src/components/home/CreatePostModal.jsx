import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, editPost } from '../../store/slices/postsSlice';
import { createGroupPost } from '../../store/slices/groupsSlice';
import { showToast } from '../../store/slices/toastSlice';
import { apiRequest } from '../../services/api';
import { shiftMentionsOnEdit, trimWithMentions } from './mentionUtils.jsx';
import ImageCropper from './ImageCropper';
import VideoTrimmer from './VideoTrimmer';
import './CreatePost.css';

const EMOJI_LIST = [
  '😀','😁','😂','🤣','😊','😍','😘','😎','🤔','🙄','😴','😭',
  '😢','😅','😉','😇','🥳','😱','🤩','😜','🤗','🙌','👏','👍',
  '👎','🙏','💪','🔥','✨','🎉','❤️','🧡','💛','💚','💙','💜',
  '🖤','💯','⭐','🌟','☀️','🌈','🍕','🍔','☕','🎂','🎁','📸',
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

// Split caption text into plain runs + colored #hashtag / @mention tokens for
// the highlight overlay behind the textarea (LinkedIn/Instagram style).
// Mentions use the tracked offset/length spans (so a multi-word token like
// "@Mark Johnson" highlights in full); hashtags fall back to regex since they
// don't need id tracking.
const HASHTAG_RE = /#[\w]+/g;
function renderHighlighted(text, mentions = []) {
  const spans = mentions
    .filter(m => typeof m.offset === 'number' && typeof m.length === 'number')
    .map(m => ({ start: m.offset, end: m.offset + m.length }));
  let hm;
  HASHTAG_RE.lastIndex = 0;
  while ((hm = HASHTAG_RE.exec(text)) !== null) {
    const start = hm.index, end = start + hm[0].length;
    if (spans.some(s => start < s.end && end > s.start)) continue;
    spans.push({ start, end });
  }
  spans.sort((a, b) => a.start - b.start);

  const nodes = [];
  let last = 0;
  spans.forEach((s, i) => {
    if (s.start > last) nodes.push(text.slice(last, s.start));
    nodes.push(<span key={i} className="cp-tag">{text.slice(s.start, s.end)}</span>);
    last = s.end;
  });
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function PhotoTabIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function VideoTabIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
}
function EventTabIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function GlobeIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function FriendsIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ChevronDownIcon() {
  return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const VISIBILITY_OPTIONS = [
  { id: 'anyone',  label: 'Anyone',       icon: <GlobeIcon />   },
  { id: 'friends', label: 'Friends only', icon: <FriendsIcon /> },
  { id: 'only_me', label: 'Only me',      icon: <LockIcon />    },
];
function UploadPhotoIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/><path d="M14 3v4h4"/></svg>;
}
function UploadVideoIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
}
function HashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
}
function AtIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
}
function EmojiIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

const TABS = [
  { id: 'photo', label: 'Photo', icon: <PhotoTabIcon /> },
  { id: 'video', label: 'Video', icon: <VideoTabIcon /> },
  { id: 'event', label: 'Event', icon: <EventTabIcon /> },
];

export default function CreatePostModal({ onClose, initialTab = 'photo', onNavigateToEvents, onCreateEvent, groupId, siteId, editingPost, onPostCreate, onPostEdit, isMinSiteFeed = false }) {
  const dispatch = useDispatch();
  const { user: authUser, token } = useSelector(s => s.auth);
  const { profile } = useSelector(s => s.profile);
  const { creating, editingId } = useSelector(s => s.posts);

  const isEditMode = !!editingPost;

  const [tab,           setTab]           = useState(initialTab);
  // Posts use 'content' field, not 'caption'
  const [caption,       setCaption]       = useState(editingPost?.content ?? editingPost?.caption ?? '');
  // Video tab: single file, goes through the trimmer before landing here.
  const [mediaFile,     setMediaFile]     = useState(null);
  const [mediaPreview,  setMediaPreview]  = useState(null);
  const [pendingVideo,  setPendingVideo]  = useState(null); // raw File awaiting trim/skip
  // Photo tab — each selected image lands here only after it's been through
  // the crop queue (cropped or explicitly skipped).
  const [images,        setImages]        = useState(() => {
    // Pre-populate with existing images if editing
    if (editingPost?.images && Array.isArray(editingPost.images)) {
      return editingPost.images.map((img, idx) => ({
        id: `existing-${idx}`,
        url: typeof img === 'string' ? img : img.url,
        file: null
      }));
    }
    return [];
  });
  // Files picked but not yet cropped/skipped, processed one at a time.
  const [cropQueue,     setCropQueue]     = useState([]);
  const [cropIndex,     setCropIndex]     = useState(0);
  const [dragOver,      setDragOver]      = useState(false);
  const [error,         setError]         = useState('');
  const [visibility,    setVisibility]    = useState(editingPost?.visibility ?? 'anyone');
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [emojiOpen,     setEmojiOpen]     = useState(false);
  // @mention — query is the partial name typed after "@", results come from
  // a local (non-Redux) fetch so it can't clobber ProfilePage's shared
  // connections list if both happen to be mounted at once.
  const [mentionOpen,    setMentionOpen]    = useState(false);
  const [mentionQuery,   setMentionQuery]   = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  // Tracked { userId, username, offset, length } spans within `caption`, sent to the
  // backend on submit so @mentions render as clickable profile links (see mentionUtils.jsx).
  const [mentions,       setMentions]       = useState(() => editingPost?.mentions ?? []);

  const fileInputRef  = useRef(null);
  const dropdownRef   = useRef(null);
  const emojiRef       = useRef(null);
  const mentionRef      = useRef(null);
  const textareaRef     = useRef(null);
  const highlightRef    = useRef(null);
  const displayName = profile?.fullName ?? authUser?.fullName ?? 'You';
  const avatarUrl = profile?.avatar || '';

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function onOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [dropdownOpen]);

  useEffect(() => {
    function onOutsideClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
    }
    if (emojiOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [emojiOpen]);

  useEffect(() => {
    function onOutsideClick(e) {
      if (mentionRef.current && !mentionRef.current.contains(e.target)) setMentionOpen(false);
    }
    if (mentionOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [mentionOpen]);

  // Debounced @mention search — pulls from BOTH connections and followers
  // (Instagram/LinkedIn suggest anyone you're linked to), merged + deduped +
  // filtered by the typed text. Local fetch, not a Redux dispatch (avoids
  // clobbering ProfilePage's shared connections list).
  useEffect(() => {
    if (!mentionOpen) return;
    let cancelled = false;
    setMentionLoading(true);
    const timer = setTimeout(() => {
      const qs = mentionQuery ? `?search=${encodeURIComponent(mentionQuery)}&limit=10` : '?limit=10';
      Promise.all([
        apiRequest(`/api/users/me/connections${qs}`, { token }).catch(() => ({})),
        apiRequest(`/api/users/me/followers${qs}`, { token }).catch(() => ({})),
      ])
        .then(([conn, folw]) => {
          if (cancelled) return;
          const merged = [...(conn.connections ?? []), ...(folw.followers ?? [])];
          const byId = {};
          for (const u of merged) {
            const id = u.id ?? u._id;
            if (id && !byId[id]) byId[id] = { id, name: u.name ?? u.fullName ?? '', avatar: u.avatar?.startsWith?.('http') ? u.avatar : '' };
          }
          let list = Object.values(byId);
          const q = mentionQuery.toLowerCase();
          if (q) list = list.filter(u => u.name.toLowerCase().includes(q));
          setMentionResults(list.slice(0, 6));
        })
        .finally(() => { if (!cancelled) setMentionLoading(false); });
    }, 220);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [mentionOpen, mentionQuery, token]);

  function insertAtCursor(text) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? caption.length;
    const end = el?.selectionEnd ?? caption.length;
    const next = caption.slice(0, start) + text + caption.slice(end);
    setMentions(prev => shiftMentionsOnEdit(caption, next, prev));
    setCaption(next);
    if (error) setError('');
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function handleCaptionChange(e) {
    const value = e.target.value;
    const cursor = e.target.selectionStart ?? value.length;
    setMentions(prev => shiftMentionsOnEdit(caption, value, prev));
    setCaption(value);
    if (error) setError('');

    const before = value.slice(0, cursor);
    const match = before.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  }

  function handleMentionSelect(person) {
    const el = textareaRef.current;
    const cursor = el?.selectionStart ?? caption.length;
    const before = caption.slice(0, cursor);
    const after = caption.slice(cursor);
    const match = before.match(/@(\w*)$/);
    const offset = match ? match.index : before.length;
    const token = `@${person.name}`;
    const replaced = before.replace(/@(\w*)$/, `${token} `);
    const next = replaced + after;
    setMentions(prev => [...prev, { userId: person.id, username: person.name, offset, length: token.length }]);
    setCaption(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(replaced.length, replaced.length);
    });
  }

  function switchTab(t) {
    if (t === 'event') {
      onClose();
      if (onCreateEvent) onCreateEvent();
      else onNavigateToEvents?.();
      return;
    }
    setTab(t);
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setPendingVideo(null);
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setCropQueue([]);
    setCropIndex(0);
    setError('');
  }

  const CAPTION_MAX = 2000;
  const PHOTO_MAX_MB = 10;
  const VIDEO_MAX_MB = 200;
  const PHOTO_MAX_COUNT = 10;
  const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

  function validateFile(file, type) {
    const allowed = type === 'photo' ? ALLOWED_IMAGE : ALLOWED_VIDEO;
    const maxMB   = type === 'photo' ? PHOTO_MAX_MB : VIDEO_MAX_MB;
    if (!allowed.includes(file.type)) {
      return type === 'photo'
        ? 'Only JPG, PNG, GIF or WebP images are allowed.'
        : 'Only MP4, WebM, OGG or MOV videos are allowed.';
    }
    if (file.size > maxMB * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxMB} MB.`;
    }
    return null;
  }

  // Video tab — validated file goes to the trimmer before becoming mediaFile.
  function handleFileSelect(file) {
    if (!file) return;
    const err = validateFile(file, 'video');
    if (err) { setError(err); return; }
    setError('');
    setPendingVideo(file);
  }

  function handleTrimSave(trimmedFile) {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(trimmedFile);
    setMediaPreview(URL.createObjectURL(trimmedFile));
    setPendingVideo(null);
  }

  function handleTrimCancel() {
    setPendingVideo(null);
  }

  // Photo tab — validate everything picked, then queue the valid ones for
  // the one-at-a-time crop flow (Facebook/Instagram-style multi-upload).
  function handleFilesSelect(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    const room = PHOTO_MAX_COUNT - images.length - cropQueue.length;
    if (room <= 0) {
      setError(`You can add up to ${PHOTO_MAX_COUNT} photos per post.`);
      return;
    }

    const toQueue = [];
    let firstError = '';
    for (const file of files.slice(0, room)) {
      const err = validateFile(file, 'photo');
      if (err) { firstError = firstError || err; continue; }
      toQueue.push(file);
    }
    if (files.length > room) {
      firstError = firstError || `You can add up to ${PHOTO_MAX_COUNT} photos per post.`;
    }
    setError(firstError);
    if (!toQueue.length) return;

    setCropQueue(toQueue);
    setCropIndex(0);
  }

  function handleInputChange(e) {
    if (tab === 'photo') handleFilesSelect(e.target.files);
    else handleFileSelect(e.target.files[0]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (tab === 'photo') handleFilesSelect(e.dataTransfer.files);
    else handleFileSelect(e.dataTransfer.files[0]);
  }

  function removeMedia() {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setError('');
  }

  function advanceCropQueue() {
    if (cropIndex + 1 >= cropQueue.length) {
      setCropQueue([]);
      setCropIndex(0);
    } else {
      setCropIndex(i => i + 1);
    }
  }

  function handleCropSave(croppedFile) {
    setImages(prev => [...prev, { id: `${Date.now()}-${prev.length}`, file: croppedFile, url: URL.createObjectURL(croppedFile) }]);
    advanceCropQueue();
  }

  function handleCropSkip() {
    const original = cropQueue[cropIndex];
    setImages(prev => [...prev, { id: `${Date.now()}-${prev.length}`, file: original, url: URL.createObjectURL(original) }]);
    advanceCropQueue();
  }

  // Cancel abandons only the images still waiting in the queue — anything
  // already cropped/skipped this round stays in the preview grid.
  function handleCropCancelAll() {
    setCropQueue([]);
    setCropIndex(0);
  }

  function removeImage(id) {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter(i => i.id !== id);
    });
    setError('');
  }

  async function handleSaveEdit() {
    if (caption.length > CAPTION_MAX) {
      setError(`Caption is too long. Maximum ${CAPTION_MAX} characters.`);
      return;
    }
    if (!caption.trim()) {
      setError('Caption cannot be empty.');
      return;
    }
    setError('');
    const { text: trimmedCaption, mentions: finalMentions } = trimWithMentions(caption, mentions);

    if (siteId && onPostEdit) {
      // Mini-site post edit
      try {
        await onPostEdit({
          postId: editingPost._id,
          content: trimmedCaption,
          visibility,
          mentions: finalMentions
        });
        dispatch(showToast({ message: 'Post updated', type: 'success' }));
        onClose();
      } catch (err) {
        console.error('Failed to update post:', err);
        setError('Failed to update post. Please try again.');
      }
    } else {
      // General post edit via Redux
      const result = await dispatch(editPost({ postId: editingPost._id, caption: trimmedCaption, visibility, mentions: finalMentions }));
      if (editPost.fulfilled.match(result)) {
        dispatch(showToast({ message: 'Post updated', type: 'success' }));
        onClose();
      } else {
        setError(result.payload || 'Failed to update post. Please try again.');
      }
    }
  }

  async function handlePost() {
    if (isEditMode) return handleSaveEdit();

    const hasMedia = tab === 'photo' ? images.length > 0 : !!mediaFile;

    // Caption length
    if (caption.length > CAPTION_MAX) {
      setError(`Caption is too long. Maximum ${CAPTION_MAX} characters.`);
      return;
    }
    // Require caption OR media
    if (!caption.trim() && !hasMedia) {
      setError('Write something or add a photo / video before posting.');
      return;
    }
    // Video tab — require a file
    if (tab === 'video' && !mediaFile) {
      setError('Select a video to post.');
      return;
    }
    // Re-validate in case state drifted
    if (tab === 'video' && mediaFile) {
      const err = validateFile(mediaFile, 'video');
      if (err) { setError(err); return; }
    }
    if (tab === 'photo') {
      for (const img of images) {
        const err = validateFile(img.file, 'photo');
        if (err) { setError(err); return; }
      }
    }

    setError('');
    const mediaFiles = tab === 'photo' ? images.map(i => i.file) : (mediaFile ? [mediaFile] : []);
    const { text: trimmedCaption, mentions: finalMentions } = trimWithMentions(caption, mentions);

    // If onPostCreate callback is provided (from MiniSiteFeed), use it for mini-site posts
    if (onPostCreate && typeof onPostCreate === 'function') {
      try {
        await onPostCreate({
          caption: trimmedCaption,
          content: trimmedCaption,
          images: images,
          video: tab === 'video' ? mediaFile : null,
          visibility: visibility,
          mentions: finalMentions
        });
      } catch (err) {
        setError(err?.message || 'Failed to create post.');
      }
    } else {
      // Use Redux thunk for general posts or group posts
      const thunk = groupId
        ? createGroupPost({ groupId, caption: trimmedCaption, media: mediaFiles })
        : createPost({ caption: trimmedCaption, mediaFile, mediaFiles, visibility, mentions: finalMentions });
      const result = await dispatch(thunk);
      if (!result.error) {
        const post = result.payload?.post ?? result.payload;
        if (groupId && post?.status === 'pending') {
          dispatch(showToast({ message: 'Post submitted — waiting for admin approval.', type: 'success' }));
        }
        onClose();
      } else {
        setError(result.payload || 'Failed to create post. Please try again.');
      }
    }
  }

  return (
    <div className="cp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-title" data-minisite={isMinSiteFeed ? "true" : undefined}>

        {/* Header */}
        <div className="cp-header">
          <div>
            <h2 className="cp-title" id="cp-title">{isEditMode ? 'Edit Post' : 'Create Post'}</h2>
            <p className="cp-subtitle">{isEditMode ? 'Update your caption or audience.' : isMinSiteFeed ? 'Share an update, photo or post with your organization' : 'Share an update, photo, or event with your network.'}</p>
          </div>
          <button className="cp-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        {!isEditMode && (
          <div className="cp-tabs">
            {TABS.filter(t => !isMinSiteFeed || t.id !== 'event').map(t => (
              <button
                key={t.id}
                className={`cp-tab${tab === t.id ? ' cp-tab--active' : ''}`}
                onClick={() => switchTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="cp-body">
          {/* Audience row — only for feed posts, not group posts, not mini-site feed */}
          {!groupId && !isMinSiteFeed && (
            <div className="cp-audience-row">
              <div className="cp-audience-wrap" ref={dropdownRef}>
                <button
                  className={`cp-audience-chip${dropdownOpen ? ' cp-audience-chip--open' : ''}`}
                  type="button"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  {VISIBILITY_OPTIONS.find(o => o.id === visibility)?.icon}
                  {VISIBILITY_OPTIONS.find(o => o.id === visibility)?.label}
                  <span className={`cp-chevron${dropdownOpen ? ' cp-chevron--up' : ''}`}><ChevronDownIcon /></span>
                </button>

                {dropdownOpen && (
                  <ul className="cp-visibility-dropdown" role="listbox">
                    {VISIBILITY_OPTIONS.map(opt => (
                      <li key={opt.id} role="option" aria-selected={visibility === opt.id}>
                        <button
                          className={`cp-vis-option${visibility === opt.id ? ' cp-vis-option--active' : ''}`}
                          onClick={() => { setVisibility(opt.id); setDropdownOpen(false); }}
                        >
                          <span className="cp-vis-icon">{opt.icon}</span>
                          <span className="cp-vis-label">{opt.label}</span>
                          {visibility === opt.id && <span className="cp-vis-check"><CheckIcon /></span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          <div style={{ position: 'relative' }} ref={mentionRef}>
            {isMinSiteFeed ? (
              // Mini-site feed textarea - completely separate styling
              <textarea
                ref={textareaRef}
                className="ms-post-textarea"
                placeholder="What's on your mind?"
                value={caption}
                onChange={handleCaptionChange}
                rows={3}
                maxLength={CAPTION_MAX + 50}
                style={{
                  width: '100%',
                  background: '#0f1720',
                  border: 'none',
                  borderRadius: 0,
                  outline: 'none',
                  boxShadow: 'none',
                  color: '#e2e8f0',
                  fontSize: 15,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.6,
                  resize: 'none',
                  minHeight: 72,
                  padding: '12px 0',
                }}
              />
            ) : (
              // Main feed textarea with highlighting
              <div className="cp-input-wrap">
                <div ref={highlightRef} className="cp-highlight" aria-hidden="true">
                  {renderHighlighted(caption, mentions)}{'​'}
                </div>
                <textarea
                  ref={textareaRef}
                  className={`cp-textarea cp-textarea--overlay${caption.length > CAPTION_MAX ? ' cp-textarea--error' : ''}`}
                  placeholder="What's on your mind?"
                  value={caption}
                  onChange={handleCaptionChange}
                  onScroll={e => { if (highlightRef.current) highlightRef.current.scrollTop = e.target.scrollTop; }}
                  rows={3}
                  maxLength={CAPTION_MAX + 50}
                />
              </div>
            )}
            {caption.length > CAPTION_MAX - 100 && (
              <span style={{
                position: 'absolute', bottom: 8, right: 10,
                fontSize: 11,
                color: caption.length > CAPTION_MAX ? '#ef4444' : 'rgba(255,255,255,0.35)',
              }}>
                {caption.length}/{CAPTION_MAX}
              </span>
            )}
            {mentionOpen && (
              <div className="cp-mention-dropdown">
                {mentionLoading && <div className="cp-mention-empty">Searching…</div>}
                {!mentionLoading && mentionResults.length === 0 && (
                  <div className="cp-mention-empty">No matching connections.</div>
                )}
                {!mentionLoading && mentionResults.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    className="cp-mention-item"
                    onClick={() => handleMentionSelect(person)}
                  >
                    <span className="cp-mention-avatar">
                      {person.avatar
                        ? <img src={person.avatar} alt={person.name} />
                        : getInitials(person.name)}
                    </span>
                    <span className="cp-mention-name">{person.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Existing media — read-only in edit mode, since editing only supports caption/visibility */}
          {isEditMode && editingPost.media?.length > 0 && (
            <div className="cp-photo-grid">
              {editingPost.media.map((m, i) => (
                <div key={m.id ?? m.url ?? i} className="cp-photo-thumb">
                  {m.type === 'video'
                    ? <video src={m.url} className="cp-photo-thumb-img" />
                    : <img src={m.url} alt="" className="cp-photo-thumb-img" />
                  }
                </div>
              ))}
            </div>
          )}

          {/* Media upload / preview */}
          {tab === 'photo' ? (
            images.length > 0 ? (
              <div className="cp-photo-grid">
                {images.map(img => (
                  <div key={img.id} className="cp-photo-thumb">
                    <img src={img.url} alt="" className="cp-photo-thumb-img" />
                    <button className="cp-remove-media" onClick={() => removeImage(img.id)} aria-label="Remove photo">✕</button>
                  </div>
                ))}
                {images.length < PHOTO_MAX_COUNT && (
                  <button
                    type="button"
                    className="cp-photo-add-more"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PlusIcon />
                    <span>Add more</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`cp-upload-zone${dragOver ? ' cp-upload-zone--dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <div className="cp-upload-icon"><UploadPhotoIcon /></div>
                <p className="cp-upload-title">Select images to share</p>
                <p className="cp-upload-sub">JPG, PNG or GIF, up to {PHOTO_MAX_MB}MB each — pick multiple at once</p>
              </div>
            )
          ) : tab === 'video' ? (
            mediaPreview ? (
              <div className="cp-preview">
                <video src={mediaPreview} controls className="cp-preview-img" />
                <button className="cp-remove-media" onClick={removeMedia} aria-label="Remove media">✕</button>
              </div>
            ) : (
              <div
                className={`cp-upload-zone${dragOver ? ' cp-upload-zone--dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <div className="cp-upload-icon"><UploadVideoIcon /></div>
                <p className="cp-upload-title">Drag and drop your videos here</p>
              </div>
            )
          ) : (
            <div className="cp-event-placeholder">Event creation coming soon.</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={tab === 'photo' ? 'image/*' : 'video/*'}
            multiple={tab === 'photo'}
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </div>

        {/* Footer */}
        <div className="cp-footer">
          {!isMinSiteFeed && (
          <div className="cp-footer-icons">
            <button className="cp-footer-icon-btn" type="button" title="Add hashtag" onClick={() => insertAtCursor('#')}><HashIcon /></button>
            <button
              className="cp-footer-icon-btn"
              type="button"
              title="Mention someone"
              onClick={() => { insertAtCursor('@'); setMentionQuery(''); setMentionOpen(true); }}
            >
              <AtIcon />
            </button>
            <div className="cp-emoji-wrap" ref={emojiRef}>
              <button className="cp-footer-icon-btn" type="button" title="Add emoji" onClick={() => setEmojiOpen(v => !v)}><EmojiIcon /></button>
              {emojiOpen && (
                <div className="cp-emoji-popover">
                  {EMOJI_LIST.map(em => (
                    <button key={em} type="button" className="cp-emoji-btn" onClick={() => insertAtCursor(em)}>{em}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
          {error && <p className="cp-error">{error}</p>}
          {isEditMode ? (
            <button className="cp-post-btn" onClick={handlePost} disabled={editingId === editingPost._id}>
              {editingId === editingPost._id ? 'Saving…' : <><span>Save</span><SendIcon /></>}
            </button>
          ) : (
            <button className="cp-post-btn" onClick={handlePost} disabled={creating || tab === 'event'}>
              {creating ? 'Posting…' : <><span>Post</span><SendIcon /></>}
            </button>
          )}
        </div>

      </div>

      {cropQueue.length > 0 && (
        <ImageCropper
          key={cropIndex}
          file={cropQueue[cropIndex]}
          index={cropIndex}
          total={cropQueue.length}
          onCancel={handleCropCancelAll}
          onSkip={handleCropSkip}
          onSave={handleCropSave}
        />
      )}

      {pendingVideo && (
        <VideoTrimmer
          file={pendingVideo}
          onCancel={handleTrimCancel}
          onSave={handleTrimSave}
        />
      )}
    </div>
  );
}
