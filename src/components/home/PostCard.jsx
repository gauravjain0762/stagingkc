import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import SkeletonImg from '../SkeletonImg';
import { useDispatch, useSelector } from 'react-redux';
import { apiRequest } from '../../services/api';
import {
  likePost, commentPost, sharePost, likeComment, replyToComment, fetchPostComments, syncPostComments,
  deletePost, reportPost, addCommentRealtime,
  editComment, deleteComment, editReply, deleteReply,
} from '../../store/slices/postsSlice';
import { createComment as createGroupComment, fetchComments as fetchGroupComments } from '../../store/slices/commentsSlice';
import { blockUser } from '../../store/slices/usersSlice';
import { showToast } from '../../store/slices/toastSlice';
import ReportModal from './ReportModal';
import CreatePostModal from './CreatePostModal';
import ReactionsModal from './ReactionsModal';
import ShareSheet from './ShareSheet';
import './ShareSheet.css';
import { postPermalink } from '../../utils/permalink';
import { getMentionQuery, shiftMentionsOnEdit, insertMention, trimWithMentions, renderTaggedText, MentionDropdown } from './mentionUtils.jsx';
import { joinPostRoom, leavePostRoom } from '../../services/socket';
import './PostCard.css';

const CAPTION_TRUNCATE_LENGTH = 200;
const BURST_EMOJIS = ['😊', '❤️', '🔥', '✨', '💫', '⭐', '🎉', '👏'];
const EMOJI_LIST = [
  '😀','😁','😂','🤣','😊','😍','😘','😎','🤔','🙄','😴','😭',
  '😢','😅','😉','😇','🥳','😱','🤩','😜','🤗','🙌','👏','👍',
  '👎','🙏','💪','🔥','✨','🎉','❤️','🧡','💛','💚','💙','💜',
  '🖤','💯','⭐','🌟','☀️','🌈','🍕','🍔','☕','🎂','🎁','📸',
];
const BURST_PATHS = [
  { dx: -48, dy: -64, rot: -30 },
  { dx: -22, dy: -78, rot:  15 },
  { dx:   8, dy: -82, rot: -10 },
  { dx:  36, dy: -68, rot:  25 },
  { dx:  52, dy: -42, rot: -20 },
  { dx: -58, dy: -38, rot:  30 },
  { dx: -12, dy: -72, rot: -18 },
  { dx:  28, dy: -56, rot:  22 },
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}


function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function MoreIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>; }
function ReportIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function FlagIcon()    { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }
function BlockIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function EditIcon()    { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>; }
function TrashIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function GlobeIcon()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline', verticalAlign:'middle' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function FriendsIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline', verticalAlign:'middle' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function LockIcon()    { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline', verticalAlign:'middle' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function PinIcon()     { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline', verticalAlign:'middle' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }

const VISIBILITY_META = {
  anyone:   { Icon: GlobeIcon,   label: 'Anyone' },
  friends:  { Icon: FriendsIcon, label: 'Friends only' },
  only_me:  { Icon: LockIcon,    label: 'Only me' },
};

// LinkedIn-style reactions. `id` is what we send to the backend.
export const REACTIONS = [
  { id: 'like',       emoji: '👍', label: 'Like',       color: '#378fe9' },
  { id: 'celebrate',  emoji: '👏', label: 'Celebrate',  color: '#6dae4f' },
  { id: 'support',    emoji: '🫶', label: 'Support',    color: '#b393c8' },
  { id: 'love',       emoji: '❤️', label: 'Love',       color: '#df704d' },
  { id: 'insightful', emoji: '💡', label: 'Insightful', color: '#f5bb5c' },
  { id: 'funny',      emoji: '😄', label: 'Funny',      color: '#44bfd0' },
];
export const REACTION_MAP = Object.fromEntries(REACTIONS.map(r => [r.id, r]));
function ReactIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>; }
function CommentIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function ShareIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>; }
function BookmarkIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>; }
function EmojiIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>; }
function SendIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function PlayIcon()    { return <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 21 12 6 21"/></svg>; }
function CloseIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ChevronBigLeft()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronBigRight() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function ChevronSmallLeft()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronSmallRight() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];
function nameColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function nameInitials(name = '') {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

// Reorders a flat replies list so each reply appears directly after the
// specific reply it's threaded under (via r.replyingTo, a reply id — not
// the @mention text, which can't tell two replies from the same person
// apart), instead of always landing at the chronological end. Until the
// backend actually populates replyingTo, every reply's value is null, so
// this is a no-op that preserves today's plain chronological order.
// Each reply also gets a `depth` (0 = directly answers the top-level
// comment, 1 = answers a reply, 2 = answers a reply-to-a-reply, ...) so the
// UI can indent it — visual proof of the tree, not just posting order.
function threadReplies(replies) {
  const byParent = new Map(); // parent reply id (or 'root') -> replies, in original order
  for (const r of replies) {
    const key = r.replyingTo ?? 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(r);
  }
  const out = [];
  function walk(key, depth) {
    for (const r of byParent.get(key) ?? []) {
      out.push({ ...r, depth });
      walk(r.id, depth + 1);
    }
  }
  walk('root', 0);
  // Guard against a reply pointing at an id that isn't in this list (e.g.
  // bad data) — don't silently drop it, just tack it on the end.
  const placed = new Set(out.map(r => r.id));
  for (const r of replies) if (!placed.has(r.id)) out.push({ ...r, depth: 0 });
  return out;
}

// Backend soft-delete detection — don't rely on one exact flag name. Some
// responses replace `text` with the literal placeholder string instead of
// (or in addition to) setting a boolean, so treat that as deleted too.
function isDeletedComment(c) {
  if (c.deleted || c.isDeleted || c.is_deleted) return true;
  const t = (c.text ?? '').trim().toLowerCase();
  return t === '[deleted]' || t === 'this comment has been deleted.' || t === 'this reply has been deleted.';
}

function normalizeComment(c) {
  if (!c) return null;
  const cid = c._id ?? c.id;
  if (!cid) {
    console.warn('PostCard: comment has no recognizable id, dropping it from the list.', c);
    return null;
  }
  const name = c.author?.fullName ?? 'Unknown';
  return {
    id: cid,
    authorId: c.author?._id ?? c.author?.id ?? null,
    avatar: c.author?.avatar?.startsWith?.('http') ? c.author.avatar : '',
    initials: nameInitials(name),
    color: nameColor(name),
    name,
    time: timeAgo(c.createdAt),
    text: c.text ?? '',
    mentions: c.mentions ?? [],
    likes: typeof c.likes === 'number' ? c.likes : (Array.isArray(c.likes) ? c.likes.length : 0),
    deleted: isDeletedComment(c),
    isReported: !!c.isReported,
    editedAt: c.editedAt ?? null,
    replies: threadReplies((c.replies ?? []).filter(Boolean).map(r => {
      const rName = r.author?.fullName ?? 'Unknown';
      return {
        id: r._id ?? r.id,
        authorId: r.author?._id ?? r.author?.id ?? null,
        avatar: r.author?.avatar?.startsWith?.('http') ? r.author.avatar : '',
        initials: nameInitials(rName),
        color: nameColor(rName),
        name: rName,
        mentions: r.mentions ?? [],
        // Which specific reply this answers, per the backend — not yet
        // populated until that field ships server-side (see replyToComment
        // in postsSlice.js), so this reads null for now and threadReplies
        // below just falls back to plain chronological order.
        replyingTo: r.replyingTo ?? r.replyingToId ?? r.parentReplyId ?? null,
        time: timeAgo(r.createdAt),
        text: r.text ?? '',
        likes: typeof r.likes === 'number' ? r.likes : 0,
        deleted: isDeletedComment(r),
        isReported: !!r.isReported,
        editedAt: r.editedAt ?? null,
      };
    }).filter(r => !r.deleted)),
  };
}

export default function PostCard({ post, onUserClick, groupId, siteId, canLike, onPostUpdate }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector(s => s.auth);
  const { likingIds, commentingId, commentsLoadingIds, deletingId, sharingId, deletingCommentId } = useSelector(s => s.posts);
  const { connections, profile } = useSelector(s => s.profile);
  const groupComments = groupId ? useSelector(s => s.comments.commentsByPost[post._id] ?? []) : [];
  // Logged-in user's avatar for the comment composer (profile is the freshest
  // source; auth.user is the fallback right after login).
  const rawMyAvatar = profile?.avatar ?? user?.avatar ?? '';
  const myAvatar = rawMyAvatar?.startsWith?.('http') ? rawMyAvatar : '';

  const { blockingId } = useSelector(s => s.users);

  const isStatic = typeof post.likes === 'number';

  const [comment,         setComment]         = useState('');
  const [commentMentions, setCommentMentions] = useState([]);
  const [commentDropdown, setCommentDropdown] = useState(null); // { start, end, candidates } | null
  const [commentEmojiOpen, setCommentEmojiOpen] = useState(false);
  const commentInputRef = useRef(null);
  const commentEmojiRef = useRef(null);
  const [localReaction,   setLocalReaction]   = useState(null);
  const [reacting,        setReacting]        = useState(false);
  const [particles,       setParticles]       = useState([]);
  const [pickerOpen,      setPickerOpen]      = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [menuOpensUp,     setMenuOpensUp]     = useState(false);
  const pickerTimer = useRef(null);
  const [shareOpen,       setShareOpen]       = useState(false);
  const shareCounted = useRef(false);
  const [reportOpen,      setReportOpen]      = useState(false);
  const [showComments,    setShowComments]    = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [likedComments,   setLikedComments]   = useState(new Set());
  const [replyingTo,      setReplyingTo]      = useState(null);
  const [replyText,       setReplyText]       = useState('');
  const [replyMentions,   setReplyMentions]   = useState([]);
  const [replyDropdown,   setReplyDropdown]   = useState(null); // { start, end, candidates } | null
  const [replyEmojiOpen,  setReplyEmojiOpen]  = useState(false);
  const replyInputRef = useRef(null);
  const replyEmojiRef = useRef(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [editOpen,        setEditOpen]        = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const menuRef = useRef(null);
  const menuDropdownRef = useRef(null);

  // Per-comment/reply "..." menu (Edit/Delete for your own, Report for others').
  const [commentMenuOpenId, setCommentMenuOpenId]     = useState(null);
  const [editingCommentId,  setEditingCommentId]      = useState(null);
  const [editDraft,         setEditDraft]             = useState('');
  const [commentDeleteTarget, setCommentDeleteTarget] = useState(null); // { commentId, replyId } | null
  const [commentReportTarget, setCommentReportTarget] = useState(null); // { commentId, replyId } | null
  const commentMenuRef = useRef(null);
  const editInputRef = useRef(null);

  // Mini-site specific API handlers
  const miniSiteAPI = async (endpoint, options = {}) => {
    if (!siteId) return null;
    return apiRequest(`/api/mini-sites/${siteId}/feed${endpoint}`, {
      token,
      ...options
    });
  };

  function mentionCandidates(query) {
    const q = query.toLowerCase();
    return (connections ?? [])
      .filter(p => (p.name ?? '').toLowerCase().includes(q))
      .slice(0, 5);
  }

  function toggleReplies(id) {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCommentLike(commentId) {
    setLikedComments(prev => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    if (siteId) {
      miniSiteAPI(`/${post._id}/comments/${commentId}/like`, { method: 'POST' })
        .catch(err => {
          console.error('Failed to like comment:', err);
          dispatch(showToast({ message: 'Failed to like comment', type: 'error' }));
        });
    } else {
      dispatch(likeComment({ postId: post._id, commentId }));
    }
  }

  function toggleCommentMenu(id) {
    setCommentMenuOpenId(prev => (prev === id ? null : id));
  }

  // parentId is null for a top-level comment's own menu, or the top-level
  // comment's id when this is a reply's menu (replies always need their
  // parent id too, since the edit/delete/report endpoints are nested one
  // level under /comments/:commentId/replies/:replyId).
  function startEditComment(item) {
    setCommentMenuOpenId(null);
    setEditingCommentId(item.id);
    setEditDraft(item.text);
    requestAnimationFrame(() => editInputRef.current?.focus());
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditDraft('');
  }

  async function saveEditComment(commentId, parentId) {
    const text = editDraft.trim();
    if (!text) return;

    if (siteId) {
      // Mini-site post comment edit
      const endpoint = parentId
        ? `/${post._id}/comments/${parentId}/replies/${commentId}`
        : `/${post._id}/comments/${commentId}`;
      try {
        await miniSiteAPI(endpoint, {
          method: 'PATCH',
          body: { text, mentions: [] }
        });
        cancelEditComment();
        dispatch(showToast({ message: 'Comment updated', type: 'success' }));
      } catch (err) {
        console.error('Failed to save comment:', err);
        dispatch(showToast({ message: 'Failed to save changes', type: 'error' }));
      }
    } else {
      const action = parentId
        ? editReply({ postId: post._id, commentId: parentId, replyId: commentId, text, mentions: [] })
        : editComment({ postId: post._id, commentId, text, mentions: [] });
      const result = await dispatch(action);
      const ok = parentId ? editReply.fulfilled.match(result) : editComment.fulfilled.match(result);
      if (ok) {
        cancelEditComment();
      } else {
        dispatch(showToast({ message: result.payload?.message ?? 'Failed to save changes', type: 'error' }));
      }
    }
  }

  function openDeleteCommentConfirm(commentId, parentId) {
    setCommentMenuOpenId(null);
    setCommentDeleteTarget({ commentId, parentId });
  }

  function closeDeleteCommentConfirm() { setCommentDeleteTarget(null); }

  async function handleDeleteCommentConfirm() {
    if (!commentDeleteTarget) return;
    const { commentId, parentId } = commentDeleteTarget;

    if (siteId) {
      // Mini-site post comment delete
      const endpoint = parentId
        ? `/${post._id}/comments/${parentId}/replies/${commentId}`
        : `/${post._id}/comments/${commentId}`;
      try {
        await miniSiteAPI(endpoint, { method: 'DELETE' });
        dispatch(showToast({ message: parentId ? 'Reply deleted' : 'Comment deleted', type: 'success' }));
      } catch (err) {
        console.error('Failed to delete comment:', err);
        dispatch(showToast({ message: 'Failed to delete', type: 'error' }));
      }
    } else {
      const action = parentId
        ? deleteReply({ postId: post._id, commentId: parentId, replyId: commentId })
        : deleteComment({ postId: post._id, commentId });
      const result = await dispatch(action);
      const ok = parentId ? deleteReply.fulfilled.match(result) : deleteComment.fulfilled.match(result);
      if (ok) {
        dispatch(showToast({ message: parentId ? 'Reply deleted' : 'Comment deleted', type: 'success' }));
      } else {
        dispatch(showToast({ message: result.payload?.message ?? 'Failed to delete', type: 'error' }));
      }
    }

    setCommentDeleteTarget(null);
  }

  function openReportComment(commentId, parentId) {
    setCommentMenuOpenId(null);
    setCommentReportTarget({ commentId, parentId });
  }

  // target is undefined when "Reply" is clicked on the top-level comment
  // itself, or { replyId, userId, name } when clicked on one of its replies.
  // replyingTo tracks { commentId, replyId } so the box can be rendered
  // directly under whichever row (the comment or that specific reply) was
  // actually clicked, instead of always in one fixed spot — replies still
  // all attach to the same top-level commentId either way (flat, like
  // Instagram), this only changes *where the box renders* and, when
  // replying to a specific reply, pre-tags it with "@ThatPerson " so the
  // new reply is unambiguous about who it's answering.
  function openReplyBox(commentId, target) {
    const replyId = target?.replyId ?? null;
    const isSame = replyingTo?.commentId === commentId && replyingTo?.replyId === replyId;
    if (isSame) {
      setReplyingTo(null);
      setReplyText('');
      setReplyMentions([]);
      setReplyDropdown(null);
      setReplyEmojiOpen(false);
      return;
    }
    setReplyingTo({ commentId, replyId });
    setReplyDropdown(null);
    setReplyEmojiOpen(false);
    if (target) {
      const { text, mention, cursor } = insertMention('', 0, 0, { id: target.userId, name: target.name });
      setReplyText(text);
      setReplyMentions([mention]);
      requestAnimationFrame(() => {
        replyInputRef.current?.focus();
        replyInputRef.current?.setSelectionRange(cursor, cursor);
      });
    } else {
      setReplyText('');
      setReplyMentions([]);
    }
  }

  function handleReplyTextChange(e) {
    const next = e.target.value;
    const cursor = e.target.selectionStart;
    setReplyMentions(prev => shiftMentionsOnEdit(replyText, next, prev));
    setReplyText(next);
    const q = getMentionQuery(next, cursor);
    setReplyDropdown(q ? { start: q.start, end: cursor, candidates: mentionCandidates(q.query) } : null);
  }

  function pickReplyMention(person) {
    if (!replyDropdown) return;
    const { text, mention, cursor } = insertMention(replyText, replyDropdown.start, replyDropdown.end, person);
    setReplyMentions(prev => [...prev, mention]);
    setReplyText(text);
    setReplyDropdown(null);
    requestAnimationFrame(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function handleSendReply(commentId) {
    if (!replyText.trim()) return;
    const { text, mentions } = trimWithMentions(replyText, replyMentions);

    if (siteId) {
      // Mini-site post reply
      miniSiteAPI(`/${post._id}/comments/${commentId}/replies`, {
        method: 'POST',
        body: { text, mentions, replyingTo: replyingTo?.replyId ?? null }
      })
        .then(() => {
          setExpandedReplies(prev => new Set(prev).add(commentId));
          setReplyText('');
          setReplyMentions([]);
          setReplyDropdown(null);
          setReplyingTo(null);
          dispatch(showToast({ message: 'Reply posted!', type: 'success' }));
        })
        .catch(err => {
          console.error('Failed to post reply:', err);
          dispatch(showToast({ message: 'Failed to post reply', type: 'error' }));
        });
    } else {
      dispatch(replyToComment({ postId: post._id, commentId, text, mentions, replyingTo: replyingTo?.replyId ?? null }));
      setExpandedReplies(prev => new Set(prev).add(commentId));
      setReplyText('');
      setReplyMentions([]);
      setReplyDropdown(null);
      setReplyingTo(null);
    }
  }

  const userId = user?.id ?? user?._id;
  const authorId      = post.author?._id ?? post.author?.id ?? post.author?.userId ?? post.authorId ?? post.userId;
  const isOwner       = !!userId && !!authorId && userId === authorId;
  const authorName    = post.author?.fullName || 'Unknown';
  const rawAuthorAv   = post.author?.avatar ?? '';
  const authorAvatar  = rawAuthorAv?.startsWith?.('http') ? rawAuthorAv : '';
  const authorLocation = post.author?.location ?? '';

  // Handle both general posts (post.media) and mini-site posts (post.images)
  const mediaItems  = (() => {
    // If post has media array with items (general posts), use it
    const mediaArray = post.media?.filter(m => m?.url?.startsWith?.('http')) ?? [];
    if (mediaArray.length > 0) {
      return mediaArray;
    }

    // If post has images array (mini-site posts), convert to media format
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images
        .filter(url => typeof url === 'string' && url.length > 0)
        .map(url => ({ url, type: 'image' }));
    }

    return [];
  })();
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const goPrevSlide = () => setSlideIndex(i => (i - 1 + mediaItems.length) % mediaItems.length);
  const goNextSlide = () => setSlideIndex(i => (i + 1) % mediaItems.length);
  const visMeta     = VISIBILITY_META[post.visibility] ?? VISIBILITY_META.anyone;
  const caption        = post.caption ?? '';
  const captionIsLong  = caption.length > CAPTION_TRUNCATE_LENGTH;
  const captionShown   = captionExpanded || !captionIsLong ? caption : caption.slice(0, CAPTION_TRUNCATE_LENGTH).trimEnd();

  function handleAuthorClick() {
    if (!onUserClick) return;
    if (!authorId) {
      console.warn('PostCard: no author id anywhere on this post — full post object below.', post);
      dispatch(showToast({ message: "Can't open this profile — the post is missing author info.", type: 'error' }));
      return;
    }
    onUserClick(authorId);
  }

  function handleCommentAuthorClick(id) {
    if (!onUserClick) return;
    if (!id) {
      dispatch(showToast({ message: "Can't open this profile — missing user info.", type: 'error' }));
      return;
    }
    onUserClick(id);
  }

  const likeCount    = isStatic ? post.likes    : (post.likesCount ?? post.likes?.length ?? 0);
  const commentCount = groupId ? groupComments.length : (isStatic ? post.comments : (post.commentsCount ?? post.comments?.length ?? 0));
  const shareCount   = isStatic ? post.shares   : (post.shares?.length   ?? 0);
  const recentReactors = isStatic ? [] : (post.recentReactors ?? []);

  // Current reaction: local for static (profile) posts, Redux for feed posts.
  const myReaction   = isStatic ? localReaction : (post.myReaction ?? null);
  const myReactionMeta = myReaction ? REACTION_MAP[myReaction] : null;
  const isLiked   = !!myReaction;
  const displayLikeCount = isStatic ? (post.likes + (localReaction ? 1 : 0)) : likeCount;
  const isLiking  = isStatic ? false : likingIds.includes(post._id);
  const isSharing = isStatic ? false : sharingId === post._id;
  const isCommenting = isStatic ? false : commentingId === post._id;
  const commentsLoading = !isStatic && commentsLoadingIds.includes(post._id);

  const realComments = (groupId ? groupComments : (post.comments ?? []))
    .map(normalizeComment)
    .filter(Boolean)
    .filter(c => !c.deleted);

  useEffect(() => {
    if (!menuOpen) return;
    function onOut(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [menuOpen]);

  useEffect(() => {
    if (!commentMenuOpenId) return;
    function onOut(e) { if (commentMenuRef.current && !commentMenuRef.current.contains(e.target)) setCommentMenuOpenId(null); }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [commentMenuOpenId]);

  // The "..." dropdown opens downward by default, which cuts it off for posts
  // near the bottom of the viewport (nothing clips it — it just renders past
  // the visible fold). Flip it upward when there isn't room below, as long as
  // there's actually more room above — and as a hard backstop for whichever
  // direction it ends up in, cap its height to whatever space is actually
  // available and let it scroll, so it can never render past the fold no
  // matter how tall the menu or how little room either direction has.
  useLayoutEffect(() => {
    if (!menuOpen) return;
    const wrap = menuRef.current;
    const dropdown = menuDropdownRef.current;
    if (!wrap || !dropdown) return;
    const MARGIN = 12;
    const wrapRect = wrap.getBoundingClientRect();
    const spaceBelow = window.innerHeight - wrapRect.bottom - MARGIN;
    const spaceAbove = wrapRect.top - MARGIN;
    const opensUp = dropdown.scrollHeight > spaceBelow && spaceAbove > spaceBelow;
    setMenuOpensUp(opensUp);
    dropdown.style.maxHeight = `${Math.max(opensUp ? spaceAbove : spaceBelow, 120)}px`;
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(pickerTimer.current), []);

  // Feed/list endpoints only return a comment count, not the real comments —
  // fetch the actual thread the first time this post's comments are opened.
  useEffect(() => {
    if (isStatic || !showComments || post.commentsLoaded) return;

    // For mini-site posts, ONLY use mini-site API - never general posts API
    if (siteId) {
      console.log(`📍 Mini-site comment fetch: post=${post._id}, siteId=${siteId}, onPostUpdate=${!!onPostUpdate}`);
      miniSiteAPI(`/${post._id}/comments`)
        .then(data => {
          console.log(`✅ Mini-site comments received: ${data?.data?.length || 0} comments`);
          if (data?.data) {
            if (onPostUpdate) {
              console.log(`✅ Calling onPostUpdate callback with commentsLoaded=true`);
              onPostUpdate({
                ...post,
                comments: data.data,
                commentsCount: data.data.length,
                commentsLoaded: true
              });
            } else {
              console.warn(`⚠️ onPostUpdate callback not provided!`);
            }
          }
        })
        .catch(err => console.error('❌ Mini-site comment fetch failed:', err));
      return; // Important: return here to prevent calling general API
    }

    // For group posts
    if (groupId) {
      console.log(`👥 Group comment fetch: post=${post._id}, groupId=${groupId}`);
      dispatch(fetchGroupComments({ groupId, postId: post._id, page: 1, limit: 50 }));
      return;
    }

    // For general posts only (should NOT happen in mini-site context!)
    console.warn(`🌐 GENERAL posts API: post=${post._id}, NO siteId (${siteId}) or groupId (${groupId})`);
    dispatch(fetchPostComments(post._id));
  }, [showComments, post.commentsLoaded, isStatic, post._id, dispatch, groupId, siteId]);

  // Subscribe to real-time updates (comments, reactions) for this post
  useEffect(() => {
    const postId = post._id ?? post.id;
    if (!postId || isStatic) return;
    // Join post room immediately to get real-time reactions, likes, comments
    joinPostRoom(postId);
    return () => leavePostRoom(postId);
  }, [post._id, post.id, isStatic]);

  // Backstop for the live comment:created socket event, in case it's dropped
  // or never reaches this client — silently resyncs the open comments panel
  // every few seconds so new comments from other users still show up without
  // a manual refresh, same reasoning as the chat window's syncMessages poll.
  useEffect(() => {
    if (isStatic || !showComments || !post.commentsLoaded) return;

    const id = setInterval(() => {
      // For mini-site posts, sync via mini-site API
      if (siteId) {
        miniSiteAPI(`/${post._id}/comments`)
          .then(data => {
            if (data?.data && onPostUpdate) {
              onPostUpdate({
                ...post,
                comments: data.data,
                commentsCount: data.data.length,
                commentsLoaded: true
              });
            }
          })
          .catch(err => console.error('❌ Mini-site comment sync failed:', err));
      } else {
        // For general/group posts, use Redux sync
        dispatch(syncPostComments(post._id));
      }
    }, 6000);
    return () => clearInterval(id);
  }, [isStatic, showComments, post.commentsLoaded, post._id, dispatch, siteId, onPostUpdate]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrevSlide();
      if (e.key === 'ArrowRight') goNextSlide();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxOpen, mediaItems.length]);

  function triggerBurst() {
    setReacting(true);
    const burst = BURST_PATHS.map((p, i) => ({ id: Date.now() + i, emoji: BURST_EMOJIS[i], ...p }));
    setParticles(burst);
    setTimeout(() => { setReacting(false); setParticles([]); }, 700);
  }

  // Pick a specific reaction from the hover picker. Same reaction again = toggle off.
  function pickReaction(reactionId) {
    setPickerOpen(false);
    const remove = myReaction === reactionId;
    if (isStatic) {
      setLocalReaction(remove ? null : reactionId);
      if (!remove) triggerBurst();
      return;
    }
    if (!userId) {
      return;
    }
    if (!remove) triggerBurst();

    // Mini-site post: use mini-site API
    if (siteId) {
      miniSiteAPI(`/${post._id}/like`, {
        method: 'POST',
        body: { reaction: reactionId, remove }
      })
        .then(data => {
          console.log('✅ Mini-site like success:', data);
          // Callback to update post in parent
          if (onPostUpdate) {
            onPostUpdate({
              ...post,
              likesCount: data.data?.likesCount ?? data.likesCount,
              myReaction: data.data?.myReaction ?? data.myReaction,
              recentReactors: data.data?.recentReactors ?? data.recentReactors
            });
          }
        })
        .catch(err => {
          console.error('❌ Mini-site like failed:', err);
          dispatch(showToast({ message: 'Failed to react to post', type: 'error' }));
        });
    } else {
      // General post: use Redux thunk
      const result = dispatch(likePost({ postId: post._id, userId, reaction: reactionId, remove }));
      if (result?.catch) {
        result.catch(err => console.error('❌ [likePost] Rejected:', err));
      }
    }
  }

  // Plain click on the button: toggle current reaction, defaulting to Like.
  function handleReactClick() {
    if (myReaction) pickReaction(myReaction); // toggles off
    else pickReaction('like');
  }

  function openPicker() {
    clearTimeout(pickerTimer.current);
    setPickerOpen(true);
  }
  function closePickerSoon() {
    clearTimeout(pickerTimer.current);
    pickerTimer.current = setTimeout(() => setPickerOpen(false), 220);
  }

  // Opens the share sheet, which shares a real permalink (/p/:id) so the link
  // unfurls with the post's photo and caption on WhatsApp and friends.
  function handleShare() {
    if (isStatic || isSharing) return;
    setShareOpen(true);
  }

  // Counted once per opened sheet, and only when a share actually happens —
  // browsing the sheet and closing it shouldn't inflate the counter.
  function handleShared() {
    if (shareCounted.current) return;
    shareCounted.current = true;

    if (siteId) {
      // Mini-site post share
      miniSiteAPI(`/${post._id}/share`, { method: 'POST' })
        .catch(err => {
          console.error('Failed to share post:', err);
          dispatch(showToast({ message: 'Failed to share post', type: 'error' }));
        });
    } else {
      dispatch(sharePost(post._id));
    }
  }

  function handleCommentTextChange(e) {
    const next = e.target.value;
    const cursor = e.target.selectionStart;
    setCommentMentions(prev => shiftMentionsOnEdit(comment, next, prev));
    setComment(next);
    const q = getMentionQuery(next, cursor);
    setCommentDropdown(q ? { start: q.start, end: cursor, candidates: mentionCandidates(q.query) } : null);
  }

  function pickCommentMention(person) {
    if (!commentDropdown) return;
    const { text, mention, cursor } = insertMention(comment, commentDropdown.start, commentDropdown.end, person);
    setCommentMentions(prev => [...prev, mention]);
    setComment(text);
    setCommentDropdown(null);
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function insertCommentEmoji(emoji) {
    const input = commentInputRef.current;
    const start = input?.selectionStart ?? comment.length;
    const end = input?.selectionEnd ?? comment.length;
    const next = comment.slice(0, start) + emoji + comment.slice(end);
    // Keep any already-tagged @mention offsets correct if this emoji lands before them.
    setCommentMentions(prev => shiftMentionsOnEdit(comment, next, prev));
    setComment(next);
    const cursor = start + emoji.length;
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function insertReplyEmoji(emoji) {
    const input = replyInputRef.current;
    const start = input?.selectionStart ?? replyText.length;
    const end = input?.selectionEnd ?? replyText.length;
    const next = replyText.slice(0, start) + emoji + replyText.slice(end);
    setReplyMentions(prev => shiftMentionsOnEdit(replyText, next, prev));
    setReplyText(next);
    const cursor = start + emoji.length;
    requestAnimationFrame(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  useEffect(() => {
    function onOutsideClick(e) {
      if (replyEmojiRef.current && !replyEmojiRef.current.contains(e.target)) setReplyEmojiOpen(false);
    }
    if (replyEmojiOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [replyEmojiOpen]);

  useEffect(() => {
    function onOutsideClick(e) {
      if (commentEmojiRef.current && !commentEmojiRef.current.contains(e.target)) setCommentEmojiOpen(false);
    }
    if (commentEmojiOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [commentEmojiOpen]);

  function handleComment() {
    if (!comment.trim()) return;
    if (isStatic) { setComment(''); return; }
    if (!isCommenting) {
      const { text, mentions } = trimWithMentions(comment, commentMentions);
      // Optimistic comment: show locally before API response
      const optimisticComment = {
        _id: `temp_${Date.now()}`,
        text,
        author: { _id: userId, fullName: user?.fullName ?? 'You', avatar: myAvatar },
        createdAt: new Date().toISOString(),
        likes: [],
        likesCount: 0,
        replies: [],
        mentions,
        pending: true,
      };

      if (siteId) {
        // Mini-site post comment
        miniSiteAPI(`/${post._id}/comments`, {
          method: 'POST',
          body: { text, mentions }
        })
          .then(() => {
            setShowComments(true);
            dispatch(showToast({ message: 'Comment posted!', type: 'success' }));
            // Fetch fresh comments
            miniSiteAPI(`/${post._id}/comments`)
              .then(data => {
                if (data?.comments) {
                  // Update post with fresh comments
                  if (onPostUpdate) {
                    onPostUpdate({
                      ...post,
                      comments: data.comments,
                      commentsCount: data.comments.length,
                      commentsLoaded: true
                    });
                  }
                }
              });
          })
          .catch(err => {
            console.error('Failed to post comment:', err);
            dispatch(showToast({ message: 'Failed to post comment', type: 'error' }));
          });
      } else if (groupId) {
        dispatch(createGroupComment({ groupId, postId: post._id, text })).then(() => {
          setShowComments(true);
          dispatch(fetchGroupComments({ groupId, postId: post._id, page: 1, limit: 50 }));
        });
      } else {
        dispatch(addCommentRealtime({ postId: post._id, comment: optimisticComment }));
        dispatch(commentPost({ postId: post._id, text, mentions }));
      }

      setComment('');
      setCommentMentions([]);
      setCommentDropdown(null);
      setShowComments(true);
    }
  }

  function openReport() { setMenuOpen(false); setReportOpen(true); }

  // Unlike "Report Post" (openReport, above), this skips the reason-picker
  // modal entirely and submits a fixed reason straight away.
  async function handleFlagInappropriate() {
    setMenuOpen(false);
    const result = await dispatch(reportPost({ postId: post._id, reason: 'Misinformation' }));
    if (reportPost.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Post reported', type: 'success' }));
    } else {
      dispatch(showToast({ message: result.payload ?? 'Failed to report post', type: 'error' }));
    }
  }

  function openEdit() { setMenuOpen(false); setEditOpen(true); }

  function openDeleteConfirm() { setMenuOpen(false); setDeleteConfirmOpen(true); }

  async function handleDeleteConfirm() {
    const result = await dispatch(deletePost(post._id));
    if (deletePost.fulfilled.match(result)) {
      setDeleteConfirmOpen(false);
      dispatch(showToast({ message: 'Post deleted', type: 'success' }));
    } else {
      dispatch(showToast({ message: result.payload ?? 'Failed to delete post', type: 'error' }));
    }
  }

  function openBlockConfirm() { setMenuOpen(false); setBlockConfirmOpen(true); }

  async function handleBlockConfirm() {
    if (!authorId) return;
    const result = await dispatch(blockUser(authorId));
    if (blockUser.fulfilled.match(result)) {
      setBlockConfirmOpen(false);
      dispatch(showToast({ message: `${authorName} has been blocked`, type: 'success' }));
    } else {
      dispatch(showToast({ message: result.payload ?? 'Failed to block user', type: 'error' }));
    }
  }

  return (
    <>
      <article className="post-card">
        {/* Header */}
        <div className="post-header">
          <div
            className="post-avatar"
            style={{ overflow: 'hidden', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: authorId ? 'pointer' : 'default' }}
            onClick={handleAuthorClick}
          >
            {authorAvatar
              ? <SkeletonImg
                  src={authorAvatar}
                  alt={authorName}
                  fallback={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{getInitials(authorName)}</span>}
                />
              : getInitials(authorName)
            }
          </div>
          <div className="post-meta">
            <p className="post-author-row">
              <span
                className="post-author"
                style={{ cursor: authorId ? 'pointer' : 'default' }}
                onClick={handleAuthorClick}
              >
                {authorName}
              </span>
            </p>
            {authorLocation && <p className="post-author-loc"><PinIcon /> {authorLocation}</p>}
            <p className="post-time">{timeAgo(post.createdAt)}</p>
          </div>
          {isOwner && (
            <span className="post-visibility post-visibility--header"><visMeta.Icon /> {visMeta.label}</span>
          )}
          {post.isReported ? (
            <span className="post-reported-label">Reported</span>
          ) : (
          <div className="post-menu-wrap" ref={menuRef}>
            <button className="post-more-btn" onClick={() => setMenuOpen(v => !v)}><MoreIcon /></button>
            {menuOpen && (
              <div className={`post-menu-dropdown${menuOpensUp ? ' post-menu-dropdown--up' : ''}`} ref={menuDropdownRef}>
                {isOwner ? (
                  <>
                    <button className="post-menu-item" onClick={openEdit}>
                      <span className="post-menu-icon post-menu-icon--blue"><EditIcon /></span>
                      <span className="post-menu-text"><span className="post-menu-item-title">Edit Post</span><span className="post-menu-item-sub">Change caption or audience</span></span>
                    </button>
                    <div className="post-menu-divider" />
                    <button className="post-menu-item" onClick={openDeleteConfirm}>
                      <span className="post-menu-icon post-menu-icon--red"><TrashIcon /></span>
                      <span className="post-menu-text"><span className="post-menu-item-title">Delete Post</span><span className="post-menu-item-sub">Remove this post permanently</span></span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="post-menu-item" onClick={openReport}>
                      <span className="post-menu-icon post-menu-icon--red"><ReportIcon /></span>
                      <span className="post-menu-text"><span className="post-menu-item-title">Report Post</span><span className="post-menu-item-sub">Submit a report for review</span></span>
                    </button>
                    <div className="post-menu-divider" />
                    <button className="post-menu-item" onClick={handleFlagInappropriate}>
                      <span className="post-menu-icon post-menu-icon--blue"><FlagIcon /></span>
                      <span className="post-menu-text"><span className="post-menu-item-title">Flag as inappropriate</span><span className="post-menu-item-sub">Mark as offensive content</span></span>
                    </button>
                    <div className="post-menu-divider" />
                    {/* <button className="post-menu-item" onClick={openBlockConfirm}>
                      <span className="post-menu-icon post-menu-icon--red"><BlockIcon /></span>
                      <span className="post-menu-text"><span className="post-menu-item-title">Block {authorName}</span><span className="post-menu-item-sub">You won't see their posts anymore</span></span>
                    </button> */}
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>

        {isOwner && post.hiddenFromPublic && (
          <div className="post-hidden-banner">
            <ReportIcon />
            <span>Your post is hidden from the public due to multiple reports. Only you can see it.</span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="post-text">
            {renderTaggedText(captionShown, post.mentions, onUserClick)}
            {captionIsLong && !captionExpanded && '… '}
            {captionIsLong && (
              <button type="button" className="post-caption-toggle" onClick={() => setCaptionExpanded(v => !v)}>
                {captionExpanded ? ' See less' : 'See more'}
              </button>
            )}
          </p>
        )}

        {/* Media */}
        {mediaItems.length > 0 && (
          <div className="post-image-wrap post-image-slider">
            {mediaItems.length > 1 && (
              <span className="post-slider-count">{slideIndex + 1}/{mediaItems.length}</span>
            )}
            {mediaItems[slideIndex]?.type === 'video'
              ? (
                <div className="post-video-thumb" onClick={() => setLightboxOpen(true)}>
                  <video
                    src={mediaItems[slideIndex].url}
                    className="post-image"
                    preload="metadata"
                    style={{ height: 'auto', maxHeight: '600px', width: '100%', display: 'block', objectFit: 'contain', background: '#0d1424' }}
                  />
                  <span className="post-video-play"><PlayIcon /></span>
                </div>
              ) : (
                <div onClick={() => setLightboxOpen(true)} style={{ cursor: 'pointer' }}>
                  <SkeletonImg src={mediaItems[slideIndex]?.url} alt="" className="post-image" imgStyle={{ height: 'auto', maxHeight: '600px', objectFit: 'contain', background: '#0d1424' }} />
                </div>
              )
            }
            {mediaItems.length > 1 && (
              <>
                <button className="post-slider-arrow post-slider-arrow--prev" onClick={goPrevSlide} aria-label="Previous image" type="button"><ChevronSmallLeft /></button>
                <button className="post-slider-arrow post-slider-arrow--next" onClick={goNextSlide} aria-label="Next image" type="button"><ChevronSmallRight /></button>
                <div className="post-slider-dots">
                  {mediaItems.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`post-slider-dot${i === slideIndex ? ' post-slider-dot--active' : ''}`}
                      onClick={() => setSlideIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Fullscreen lightbox */}
        {lightboxOpen && mediaItems.length > 0 && (
          <div className="post-lightbox" onClick={() => setLightboxOpen(false)}>
            <button className="post-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close" type="button"><CloseIcon /></button>
            {mediaItems.length > 1 && (
              <span className="post-lightbox-count">{slideIndex + 1} / {mediaItems.length}</span>
            )}
            {mediaItems.length > 1 && (
              <button className="post-lightbox-arrow post-lightbox-arrow--prev" onClick={e => { e.stopPropagation(); goPrevSlide(); }} aria-label="Previous" type="button"><ChevronBigLeft /></button>
            )}
            <div className="post-lightbox-stage" onClick={e => e.stopPropagation()}>
              {mediaItems[slideIndex]?.type === 'video'
                ? <video src={mediaItems[slideIndex].url} controls autoPlay className="post-lightbox-media" />
                : <img src={mediaItems[slideIndex]?.url} alt="" className="post-lightbox-media" />
              }
            </div>
            {mediaItems.length > 1 && (
              <button className="post-lightbox-arrow post-lightbox-arrow--next" onClick={e => { e.stopPropagation(); goNextSlide(); }} aria-label="Next" type="button"><ChevronBigRight /></button>
            )}
          </div>
        )}

        {/* Title / tags / description (album-style posts) */}
        {post.title && (
          <div className="post-body">
            <p className="post-title">{post.title}</p>
            {post.tags && <p className="post-tags">{post.tags}</p>}
            {post.description && <p className="post-description">{post.description}</p>}
          </div>
        )}

        {/* People react row */}
        {likeCount > 0 && !isStatic && (
          <div className="post-people-react" style={{ cursor: 'pointer' }} onClick={() => setReactionsModalOpen(true)}>
            <div className="post-reader-avatars">
              {recentReactors.slice(0, 4).map((r, i) => (
                <div key={r._id ?? r.id ?? i} className="post-reader-dot">
                  {r.avatar?.startsWith?.('http')
                    ? <img src={r.avatar} alt={r.fullName ?? ''} />
                    : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 10, fontWeight: 700, background: '#3b82f6', color: '#fff' }}>
                        {getInitials(r.fullName ?? '')}
                      </span>
                    )
                  }
                </div>
              ))}
            </div>
            <span className="post-react-text">+{likeCount} people react this post</span>
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <div
            className="react-burst-wrap"
            onMouseEnter={openPicker}
            onMouseLeave={closePickerSoon}
          >
            {pickerOpen && (
              <div
                className="react-picker"
                onMouseEnter={openPicker}
                onMouseLeave={closePickerSoon}
              >
                {REACTIONS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className="react-picker-btn"
                    title={r.label}
                    onClick={() => pickReaction(r.id)}
                  >
                    <span className="react-picker-emoji">{r.emoji}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              className={`post-action-btn${isLiked ? ' post-action-btn--active' : ''}`}
              onClick={handleReactClick}
              disabled={isLiking}
              style={myReactionMeta ? { color: myReactionMeta.color } : undefined}
            >
              <span className={`react-label${reacting ? ' react-label--spring' : ''}`}>
                {myReactionMeta
                  ? <><span className="react-current-emoji">{myReactionMeta.emoji}</span> {myReactionMeta.label} ({displayLikeCount})</>
                  : <><ReactIcon /> React ({displayLikeCount})</>
                }
              </span>
            </button>
            {particles.map(p => (
              <span
                key={p.id}
                className="react-particle"
                style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}
              >
                {p.emoji}
              </span>
            ))}
          </div>
          <div className="post-action-sep" />
          <button className="post-action-btn" onClick={() => setShowComments(v => !v)}>
            <CommentIcon /> Comment ({commentCount})
          </button>
          <div className="post-action-sep" />
          <button className="post-action-btn" onClick={handleShare} disabled={isSharing}>
            <ShareIcon /> Share
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="post-comments-section">
            {commentsLoading && (
              <p style={{ textAlign: 'center', padding: '10px', color: '#5c6a8c', fontSize: 13 }}>Loading comments…</p>
            )}
            {!commentsLoading && realComments.length === 0 && (post.commentsLoaded || commentCount === 0) && (
              <p style={{ textAlign: 'center', padding: '10px', color: '#5c6a8c', fontSize: 13 }}>No comments yet.</p>
            )}
            {realComments.map(c => (
              <div key={c.id} className="pc-thread">
                {/* Top-level comment */}
                <div className="pc-comment">
                  <div className="pc-avatar" style={{ background: c.avatar ? 'transparent' : '#3b82f6', cursor: 'pointer' }} onClick={() => handleCommentAuthorClick(c.authorId)}>
                    {c.avatar ? <img src={c.avatar} alt={c.name} className="pc-avatar-img" /> : c.initials}
                  </div>
                  <div className="pc-body">
                    {editingCommentId === c.id ? (
                      <div className="pc-edit-wrap">
                        <input
                          ref={editInputRef}
                          type="text"
                          className="pc-edit-input"
                          value={editDraft}
                          onChange={e => setEditDraft(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEditComment(c.id, null)}
                        />
                        <button type="button" className="pc-edit-save" onClick={() => saveEditComment(c.id, null)} disabled={!editDraft.trim()}>Save</button>
                        <button type="button" className="pc-edit-cancel" onClick={cancelEditComment}>Cancel</button>
                      </div>
                    ) : (
                      <div className="pc-bubble">
                        <span className="pc-name" style={{ cursor: 'pointer' }} onClick={() => handleCommentAuthorClick(c.authorId)}>{c.name}</span>
                        <div className="pc-bubble-meta">
                          <span className="pc-time">{c.time}{c.editedAt ? ' · edited' : ''}</span>
                          <div className="pc-comment-menu-wrap" ref={commentMenuOpenId === c.id ? commentMenuRef : null}>
                            <button type="button" className="pc-comment-more-btn" onClick={() => toggleCommentMenu(c.id)}><MoreIcon /></button>
                            {commentMenuOpenId === c.id && (
                              <div className="pc-comment-menu-dropdown">
                                {c.authorId === userId ? (
                                  <>
                                    <button type="button" className="pc-comment-menu-item" onClick={() => startEditComment(c)}><EditIcon /> Edit</button>
                                    <button type="button" className="pc-comment-menu-item pc-comment-menu-item--danger" onClick={() => openDeleteCommentConfirm(c.id, null)}><TrashIcon /> Delete</button>
                                  </>
                                ) : !c.isReported && (
                                  <button type="button" className="pc-comment-menu-item pc-comment-menu-item--danger" onClick={() => openReportComment(c.id, null)}><ReportIcon /> Report</button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="pc-text">{renderTaggedText(c.text, c.mentions, onUserClick)}</p>
                      </div>
                    )}
                    <div className="pc-actions">
                      {editingCommentId !== c.id && (
                        <>
                          <button className={`pc-act${likedComments.has(c.id) ? ' pc-act--liked' : ''}`} onClick={() => handleCommentLike(c.id)}>
                            Like ({c.likes})
                          </button>
                          <span className="pc-dot">·</span>
                          <button className="pc-act" onClick={() => openReplyBox(c.id)}>Reply</button>
                        </>
                      )}
                      {c.replies.length > 0 && (
                        <>
                          <span className="pc-dot">·</span>
                          <button className="pc-act pc-act--view" onClick={() => toggleReplies(c.id)}>
                            {expandedReplies.has(c.id) ? `Hide replies` : `View ${c.replies.length} replies`}
                          </button>
                        </>
                      )}
                    </div>

                    {replyingTo?.commentId === c.id && replyingTo?.replyId === null && (
                      <div className="pc-reply-input-wrap">
                        <input
                          ref={replyInputRef}
                          type="text"
                          className="pc-reply-input"
                          placeholder={`Reply to ${c.name}...`}
                          value={replyText}
                          onChange={handleReplyTextChange}
                          onKeyDown={e => e.key === 'Enter' && handleSendReply(c.id)}
                          autoFocus
                        />
                        {replyDropdown && <MentionDropdown candidates={replyDropdown.candidates} onPick={pickReplyMention} />}
                        <div className="comment-emoji-wrap" ref={replyEmojiRef}>
                          <button type="button" className="comment-icon-btn" onClick={() => setReplyEmojiOpen(v => !v)}><EmojiIcon /></button>
                          {replyEmojiOpen && (
                            <div className="comment-emoji-popover">
                              {EMOJI_LIST.map(em => (
                                <button key={em} type="button" className="comment-emoji-btn" onClick={() => insertReplyEmoji(em)}>{em}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="pc-reply-send" onClick={() => handleSendReply(c.id)} disabled={!replyText.trim()}>
                          <SendIcon />
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {expandedReplies.has(c.id) && c.replies.length > 0 && (
                      <div className="pc-replies">
                        {c.replies.map(r => (
                          <div
                            key={r.id}
                            className={`pc-comment pc-comment--reply${r.depth > 0 ? ' pc-comment--nested' : ''}`}
                            style={r.depth > 0 ? { marginLeft: r.depth * 22 } : undefined}
                          >
                            <div className="pc-avatar pc-avatar--sm" style={{ background: r.avatar ? 'transparent' : '#3b82f6', cursor: 'pointer' }} onClick={() => handleCommentAuthorClick(r.authorId)}>
                              {r.avatar ? <img src={r.avatar} alt={r.name} className="pc-avatar-img" /> : r.initials}
                            </div>
                            <div className="pc-body">
                              {editingCommentId === r.id ? (
                                <div className="pc-edit-wrap">
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    className="pc-edit-input"
                                    value={editDraft}
                                    onChange={e => setEditDraft(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveEditComment(r.id, c.id)}
                                  />
                                  <button type="button" className="pc-edit-save" onClick={() => saveEditComment(r.id, c.id)} disabled={!editDraft.trim()}>Save</button>
                                  <button type="button" className="pc-edit-cancel" onClick={cancelEditComment}>Cancel</button>
                                </div>
                              ) : (
                                <div className="pc-bubble pc-bubble--reply">
                                  <span className="pc-name" style={{ cursor: 'pointer' }} onClick={() => handleCommentAuthorClick(r.authorId)}>{r.name}</span>
                                  <div className="pc-bubble-meta">
                                    <span className="pc-time">{r.time}{r.editedAt ? ' · edited' : ''}</span>
                                    <div className="pc-comment-menu-wrap" ref={commentMenuOpenId === r.id ? commentMenuRef : null}>
                                      <button type="button" className="pc-comment-more-btn" onClick={() => toggleCommentMenu(r.id)}><MoreIcon /></button>
                                      {commentMenuOpenId === r.id && (
                                        <div className="pc-comment-menu-dropdown">
                                          {r.authorId === userId ? (
                                            <>
                                              <button type="button" className="pc-comment-menu-item" onClick={() => startEditComment(r)}><EditIcon /> Edit</button>
                                              <button type="button" className="pc-comment-menu-item pc-comment-menu-item--danger" onClick={() => openDeleteCommentConfirm(r.id, c.id)}><TrashIcon /> Delete</button>
                                            </>
                                          ) : !r.isReported && (
                                            <button type="button" className="pc-comment-menu-item pc-comment-menu-item--danger" onClick={() => openReportComment(r.id, c.id)}><ReportIcon /> Report</button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="pc-text">{renderTaggedText(r.text, r.mentions, onUserClick)}</p>
                                </div>
                              )}
                              {editingCommentId !== r.id && (
                                <div className="pc-actions">
                                  <button className={`pc-act${likedComments.has(r.id) ? ' pc-act--liked' : ''}`} onClick={() => handleCommentLike(r.id)}>
                                    Like ({r.likes})
                                  </button>
                                  <span className="pc-dot">·</span>
                                  <button className="pc-act" onClick={() => openReplyBox(c.id, { replyId: r.id, userId: r.authorId, name: r.name })}>Reply</button>
                                </div>
                              )}

                              {replyingTo?.commentId === c.id && replyingTo?.replyId === r.id && (
                                <div className="pc-reply-input-wrap">
                                  <input
                                    ref={replyInputRef}
                                    type="text"
                                    className="pc-reply-input"
                                    placeholder={`Reply to ${r.name}...`}
                                    value={replyText}
                                    onChange={handleReplyTextChange}
                                    onKeyDown={e => e.key === 'Enter' && handleSendReply(c.id)}
                                    autoFocus
                                  />
                                  {replyDropdown && <MentionDropdown candidates={replyDropdown.candidates} onPick={pickReplyMention} />}
                                  <div className="comment-emoji-wrap" ref={replyEmojiRef}>
                                    <button type="button" className="comment-icon-btn" onClick={() => setReplyEmojiOpen(v => !v)}><EmojiIcon /></button>
                                    {replyEmojiOpen && (
                                      <div className="comment-emoji-popover">
                                        {EMOJI_LIST.map(em => (
                                          <button key={em} type="button" className="comment-emoji-btn" onClick={() => insertReplyEmoji(em)}>{em}</button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button className="pc-reply-send" onClick={() => handleSendReply(c.id)} disabled={!replyText.trim()}>
                                    <SendIcon />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button className="pc-view-all" onClick={() => setShowComments(v => !v)}>
              Hide comments
            </button>
          </div>
        )}

        {/* Comment bar */}
        <div className="post-comment-bar">
          <div
            className="comment-avatar"
            style={{ cursor: userId ? 'pointer' : 'default', background: myAvatar ? 'transparent' : '#3b82f6' }}
            onClick={() => handleCommentAuthorClick(userId)}
          >
            {myAvatar
              ? <img src={myAvatar} alt={user?.fullName ?? ''} className="pc-avatar-img" />
              : getInitials(user?.fullName ?? 'A')}
          </div>
          <div className="comment-input-wrap">
            <input
              ref={commentInputRef}
              type="text"
              className="comment-input"
              placeholder="Write A Comment..."
              value={comment}
              onChange={handleCommentTextChange}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              disabled={isCommenting}
            />
            {commentDropdown && <MentionDropdown candidates={commentDropdown.candidates} onPick={pickCommentMention} />}
            <div className="comment-input-icons">
              <div className="comment-emoji-wrap" ref={commentEmojiRef}>
                <button className="comment-icon-btn" onClick={() => setCommentEmojiOpen(v => !v)}><EmojiIcon /></button>
                {commentEmojiOpen && (
                  <div className="comment-emoji-popover">
                    {EMOJI_LIST.map(em => (
                      <button key={em} type="button" className="comment-emoji-btn" onClick={() => insertCommentEmoji(em)}>{em}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className={`comment-icon-btn comment-send-btn${comment.trim() ? ' active' : ''}`} tabIndex={-1} onClick={handleComment}><SendIcon /></button>
            </div>
          </div>
        </div>
      </article>

      {shareOpen && (
        <ShareSheet
          post={post}
          url={postPermalink(post._id)}
          onShared={handleShared}
          onClose={() => { setShareOpen(false); shareCounted.current = false; }}
        />
      )}

      {reportOpen && <ReportModal postId={post._id} onClose={() => setReportOpen(false)} />}

      {commentReportTarget && (
        <ReportModal
          postId={post._id}
          commentId={commentReportTarget.parentId ?? commentReportTarget.commentId}
          replyId={commentReportTarget.parentId ? commentReportTarget.commentId : undefined}
          onClose={() => setCommentReportTarget(null)}
        />
      )}

      {reactionsModalOpen && (
        <ReactionsModal postId={post._id} onClose={() => setReactionsModalOpen(false)} onUserClick={onUserClick} />
      )}

      {editOpen && <CreatePostModal editingPost={post} onClose={() => setEditOpen(false)} />}

      {commentDeleteTarget && (
        <div className="dpm-overlay" onClick={closeDeleteCommentConfirm}>
          <div className="dpm-box" onClick={e => e.stopPropagation()}>
            <h2 className="dpm-title">{commentDeleteTarget.parentId ? 'Delete Reply' : 'Delete Comment'}</h2>
            <p className="dpm-desc">
              Are you sure you want to delete this {commentDeleteTarget.parentId ? 'reply' : 'comment'}? This action cannot be undone.
            </p>
            <div className="dpm-actions">
              <button className="dpm-cancel-btn" onClick={closeDeleteCommentConfirm} type="button">Cancel</button>
              <button
                className="dpm-confirm-btn"
                onClick={handleDeleteCommentConfirm}
                disabled={deletingCommentId === commentDeleteTarget.commentId}
                type="button"
              >
                {deletingCommentId === commentDeleteTarget.commentId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="dpm-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="dpm-box" onClick={e => e.stopPropagation()}>
            <h2 className="dpm-title">Delete Post</h2>
            <p className="dpm-desc">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="dpm-actions">
              <button className="dpm-cancel-btn" onClick={() => setDeleteConfirmOpen(false)} type="button">Cancel</button>
              <button className="dpm-confirm-btn" onClick={handleDeleteConfirm} disabled={deletingId === post._id} type="button">
                {deletingId === post._id ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockConfirmOpen && (
        <div className="dpm-overlay" onClick={() => setBlockConfirmOpen(false)}>
          <div className="dpm-box" onClick={e => e.stopPropagation()}>
            <h2 className="dpm-title">Block {authorName}?</h2>
            <p className="dpm-desc">They won't be able to see your profile or posts, and you won't see theirs either. You can unblock them anytime from your settings.</p>
            <div className="dpm-actions">
              <button className="dpm-cancel-btn" onClick={() => setBlockConfirmOpen(false)} type="button">Cancel</button>
              <button className="dpm-confirm-btn" onClick={handleBlockConfirm} disabled={blockingId === authorId} type="button">
                {blockingId === authorId ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}