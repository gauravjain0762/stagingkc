import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import './GroupsPage.css';
import AnimatedNav from './AnimatedNav';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import LikeButton from './LikeButton';
import PostActionsMenu from './PostActionsMenu';
import UserInvitations from './UserInvitations';
import ImageCropper from './ImageCropper';
import UserProfilePage from './UserProfilePage';
import GlobalSearch from './GlobalSearch';
import Loader from '../Loader';
import {
  fetchGroups, createGroup, updateGroup, fetchGroupPosts, fetchGroupMembers,
  changeMemberRole, removeMember, joinGroup, leaveGroup, reportGroup,
  fetchPendingRequests, acceptGroupRequest, rejectGroupRequest,
  fetchAdminDashboard, sendFriendRequest,
} from '../../store/slices/groupsSlice';
import { inviteUserToGroup } from '../../store/slices/invitationsSlice';
import { startDM } from '../../store/slices/messagesSlice';
import { fetchConnections } from '../../store/slices/profileSlice';
import { showToast } from '../../store/slices/toastSlice';
import { deletePost, editPost, pinPost, unpinPost, fetchComments } from '../../store/slices/commentsSlice';


/* ── UI icons ── */
function PlusIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function HeartIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function ChatIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function ShareIcon2()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }
function MoreIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>; }
function TrendingUpIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function SearchIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function GlobeIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function LockIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function CameraIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }
function CheckSmIcon()    { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function PinIcon()        { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ArrowRightIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function UsersIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function EditIcon()         { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }

/* ── Moderation Page icons ── */
function SaveIcon()         { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function RulesIcon()        { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function LockShieldIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function AlertCircleIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function PlusCircleIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }

/* ── Admin Dashboard icons ── */
function ExportIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function InviteIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>; }
function InsightsIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function ChevronLeftIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

/* ── Create Group Page icons ── */
function BackArrowIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function ShieldIcon2()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function GlobeIconLg()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function LockIconLg()       { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ChevronDownIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function PlantIcon()        { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 17 4 20 5c-1 4-4 7-8 7z"/><path d="M12 12C12 7 7 4 4 5c1 4 4 7 8 7z"/></svg>; }
function CheckCircleIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10" fill="none" stroke="white" strokeWidth="2"/></svg>; }

function BookmarkIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>; }
function AlertTriangleIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function InfoCircleIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }

/* ── Premium Role Dropdown ── */
const ROLE_CONFIG = {
  Admin:     { color: '#60a5fa', bg: 'rgba(59,130,246,0.14)',  border: 'rgba(59,130,246,0.32)'  },
  Moderator: { color: '#fbbf24', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.32)'  },
  Member:    { color: '#94a3b8', bg: 'rgba(100,116,139,0.14)', border: 'rgba(100,116,139,0.28)' },
};

const MEMBER_ROLES   = ['Admin', 'Moderator', 'Member'];

function RoleSelect({ value, memberId, openId, onToggle, onChange }) {
  const ref = useRef(null);
  const isOpen = openId === memberId;
  const cfg = ROLE_CONFIG[value] ?? ROLE_CONFIG.Member;

  useEffect(() => {
    if (!isOpen) return;
    function onOut(e) { if (ref.current && !ref.current.contains(e.target)) onToggle(null); }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [isOpen, onToggle]);

  return (
    <div className="adm-rs-wrap" ref={ref}>
      <button
        className="adm-rs-trigger"
        onClick={() => onToggle(isOpen ? null : memberId)}
        style={{ '--rs-color': cfg.color, '--rs-bg': cfg.bg, '--rs-border': cfg.border }}
      >
        <span className="adm-rs-dot" style={{ background: cfg.color }} />
        <span className="adm-rs-label">{value}</span>
        <span className={`adm-rs-chevron${isOpen ? ' adm-rs-chevron--up' : ''}`}><ChevronDownIcon /></span>
      </button>
      {isOpen && (
        <div className="adm-rs-dropdown">
          {Object.entries(ROLE_CONFIG).map(([role, rc]) => (
            <button
              key={role}
              className={`adm-rs-option${value === role ? ' adm-rs-option--active' : ''}`}
              onClick={() => { onChange(role); onToggle(null); }}
            >
              <span className="adm-rs-opt-dot" style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
              <span className="adm-rs-opt-label">{role}</span>
              {value === role && <CheckSmIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  'Technology & Software', 'Design & Creative', 'Business & Finance',
  'Education & Learning', 'Health & Wellness', 'Entertainment',
  'Sports & Fitness', 'Travel & Lifestyle',
];

/* ── Moderation Page mock data ── */
const COMMUNITY_RULES = [
  { id: 1, title: 'Be Professional & Respectful',  desc: 'Treat all members with courtesy. Zero tolerance for harassment, hate speech, or bullying.' },
  { id: 2, title: 'No Spam or Self-Promotion',     desc: 'Keep discussions relevant. Commercial posts require moderator approval before publishing.' },
  { id: 3, title: 'Protect Privacy',               desc: 'Do not share sensitive information or private conversations outside of this group.' },
];

const REPORTED_CONTENT = [
  { id: 1, quote: '"How to bypass..."',    author: 'Marcus J.', reason: 'Spam / Promotion', reporter: 'Jordan P.', img: 'https://picsum.photos/seed/rep1/44/44' },
  { id: 2, quote: '"You clearly don\'t..."', author: 'Marcus J.', reason: 'Harassment',       reporter: 'Taylor L.', img: 'https://picsum.photos/seed/rep2/44/44' },
];

/* ══════════════════════════
   Community Moderation Page
══════════════════════════ */
function CommunityModerationPage({ group, onBack, onFeedClick, onEventsClick, onCalendarClick, onMessagesClick, onLibraryClick, onCoursesClick, onMinisitesClick }) {
  const [postApproval,  setPostApproval]  = useState(true);
  const [commentPerms,  setCommentPerms]  = useState(true);
  const [rules,         setRules]         = useState(COMMUNITY_RULES);
  const [dismissed,       setDismissed]       = useState({});
  const [createPostOpen,  setCreatePostOpen]  = useState(false);

  function navClick(id) {
    if (id === 'create')   { setCreatePostOpen(true); return; }
    if (id === 'home')     onFeedClick?.();
    if (id === 'courses')  onCoursesClick?.();
    if (id === 'library')  onLibraryClick?.();
    if (id === 'events')   onEventsClick?.();
    if (id === 'friends')  onBack?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'messages')  onMessagesClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  const visible = REPORTED_CONTENT.filter(r => !dismissed[r.id]);

  return (
    <div className="mod-page">
      <AnimatedNav activeId="friends" onNavigate={navClick} />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}

      {/* Main */}
      <div className="mod-content">

        {/* Breadcrumb + Header */}
        <div className="mod-header-wrap">
          <div className="mod-header-left">
            <p className="mod-breadcrumb">
              <span className="mod-bc-link" onClick={onBack}>Groups</span>
              <span className="mod-bc-sep">›</span>
              Moderation &amp; Rules
            </p>
            <h1 className="mod-title">Community Moderation</h1>
            <p className="mod-subtitle">
              Manage rules, privacy controls, and member reports for <strong>{group?.name ?? 'Design Collective'}</strong>.
            </p>
          </div>
          <button className="mod-save-btn"><SaveIcon /> Save Changes</button>
        </div>

        {/* Two-column: Rules + Privacy */}
        <div className="mod-two-col">

          {/* Community Rules */}
          <div className="mod-card">
            <div className="mod-card-header">
              <div className="mod-card-icon mod-card-icon--gray"><RulesIcon /></div>
              <div className="mod-card-title-group">
                <p className="mod-card-title">Community Rules</p>
                <p className="mod-card-sub">Core guidelines for all members</p>
              </div>
              <button className="mod-add-rule-btn"><PlusCircleIcon /> Add Rule</button>
            </div>

            <div className="mod-rules-list">
              {rules.map(rule => (
                <div key={rule.id} className="mod-rule-item">
                  <span className="mod-rule-num">{rule.id}</span>
                  <div className="mod-rule-body">
                    <p className="mod-rule-title">{rule.title}</p>
                    <p className="mod-rule-desc">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Controls */}
          <div className="mod-card mod-card--privacy">
            <div className="mod-card-header mod-card-header--privacy">
              <div className="mod-card-icon mod-card-icon--blue"><LockShieldIcon /></div>
              <div className="mod-card-title-group">
                <p className="mod-card-title">Privacy Controls</p>
                <p className="mod-card-sub">Manage access levels</p>
              </div>
            </div>

            <div className="mod-privacy-list">
              {/* Group Visibility */}
              <div className="mod-privacy-row">
                <div>
                  <p className="mod-privacy-label">Group Visibility</p>
                  <p className="mod-privacy-desc">Who can find the group in search</p>
                </div>
                <span className="mod-visibility-pill">Private (Visible)</span>
              </div>

              {/* Post Approval */}
              <div className="mod-privacy-row">
                <div>
                  <p className="mod-privacy-label">Post Approval</p>
                  <p className="mod-privacy-desc">Admins must approve new posts</p>
                </div>
                <div className={`mod-toggle${postApproval ? ' mod-toggle--on' : ''}`} onClick={() => setPostApproval(v => !v)}>
                  <div className="mod-toggle-thumb" />
                </div>
              </div>

              {/* Comment Permissions */}
              <div className="mod-privacy-row">
                <div>
                  <p className="mod-privacy-label">Comment Permissions</p>
                  <p className="mod-privacy-desc">Allow threaded discussions</p>
                </div>
                <div className={`mod-toggle${commentPerms ? ' mod-toggle--on' : ''}`} onClick={() => setCommentPerms(v => !v)}>
                  <div className="mod-toggle-thumb" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reported Content */}
        <div className="mod-reported-card">
          <div className="mod-reported-header">
            <div className="mod-reported-left">
              <div className="mod-reported-icon"><AlertCircleIcon /></div>
              <div>
                <p className="mod-reported-title">Reported Content</p>
                <p className="mod-reported-sub">Review pending member reports</p>
              </div>
            </div>
            <div className="mod-reported-right">
              <span className="mod-pending-badge">{visible.length} PENDING</span>
              <button className="mod-view-all-btn">View All</button>
            </div>
          </div>

          <table className="mod-table">
            <thead>
              <tr>
                <th>CONTENT</th>
                <th>REASON</th>
                <th>REPORTER</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="mod-content-cell">
                      <img src={r.img} alt="" className="mod-content-thumb" />
                      <div>
                        <p className="mod-content-quote">{r.quote}</p>
                        <p className="mod-content-author">Posted by {r.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="mod-reason">{r.reason}</td>
                  <td className="mod-reporter">{r.reporter}</td>
                  <td>
                    <div className="mod-actions">
                      <button className="mod-dismiss-btn" onClick={() => setDismissed(p => ({ ...p, [r.id]: true }))}>Dismiss</button>
                      <button className="mod-remove-btn">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={4} className="mod-empty">No pending reports.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ── Admin Dashboard mock data ── */
const ADMIN_MEMBERS = [
  { id: 1, name: 'Sarah Jenkins',  title: 'UX Designer at Figma',          location: 'San Francisco, CA', mutual: 12, sharedAvatars: ['https://i.pravatar.cc/28?img=5','https://i.pravatar.cc/28?img=9','https://i.pravatar.cc/28?img=12'], role: 'group_admin', joined: 'Oct 12, 2023', img: 'https://i.pravatar.cc/40?img=1',  isFriend: true  },
  { id: 2, name: 'Marcus Thorne',  title: 'Backend Engineer at Vercel',     location: 'New York, NY',      mutual: 4,  sharedAvatars: ['https://i.pravatar.cc/28?img=16','https://i.pravatar.cc/28?img=20'],                              role: 'moderator',   joined: 'Nov 5, 2023',  img: 'https://i.pravatar.cc/40?img=3',  isFriend: false },
  { id: 3, name: 'Alex Rivera',    title: 'Product Manager at Notion',      location: 'Austin, TX',        mutual: 8,  sharedAvatars: ['https://i.pravatar.cc/28?img=25','https://i.pravatar.cc/28?img=33','https://i.pravatar.cc/28?img=44'], role: 'member',   joined: 'Jan 8, 2024',  img: 'https://i.pravatar.cc/40?img=5',  isFriend: true  },
  { id: 4, name: 'Elena Vance',    title: 'Graphic Designer · Freelance',   location: 'Berlin, Germany',   mutual: 2,  sharedAvatars: ['https://i.pravatar.cc/28?img=47','https://i.pravatar.cc/28?img=48'],                              role: 'member',      joined: 'Feb 20, 2024', img: 'https://i.pravatar.cc/40?img=9',  isFriend: false },
  { id: 5, name: 'James Okafor',   title: 'DevOps Lead at AWS',             location: 'Seattle, WA',       mutual: 5,  sharedAvatars: ['https://i.pravatar.cc/28?img=51','https://i.pravatar.cc/28?img=53','https://i.pravatar.cc/28?img=56'], role: 'member',   joined: 'Mar 14, 2024', img: 'https://i.pravatar.cc/40?img=12', isFriend: false },
  { id: 6, name: 'Priya Sharma',   title: 'Data Scientist at Google',       location: 'Bangalore, India',  mutual: 7,  sharedAvatars: ['https://i.pravatar.cc/28?img=60','https://i.pravatar.cc/28?img=57','https://i.pravatar.cc/28?img=43'], role: 'member',   joined: 'Apr 2, 2024',  img: 'https://i.pravatar.cc/40?img=16', isFriend: true  },
];

const INIT_PENDING = [
  { id: 101, name: 'Lucas Bennett',  location: 'Toronto, Canada',   mutual: 0, sharedAvatars: [],                                                                                                        requestedOn: 'Jun 20, 2026', bio: 'Full-stack dev, 5 yrs exp. Passionate about open source.',            img: 'https://i.pravatar.cc/40?img=11' },
  { id: 102, name: 'Amara Diallo',   location: 'Paris, France',     mutual: 3, sharedAvatars: ['https://i.pravatar.cc/28?img=5','https://i.pravatar.cc/28?img=9','https://i.pravatar.cc/28?img=12'],    requestedOn: 'Jun 21, 2026', bio: 'UI/UX designer focused on accessibility and design systems.',           img: 'https://i.pravatar.cc/40?img=20' },
  { id: 103, name: 'Kenji Watanabe', location: 'Tokyo, Japan',      mutual: 0, sharedAvatars: [],                                                                                                        requestedOn: 'Jun 22, 2026', bio: 'Backend engineer, Go & Rust enthusiast. Looking for like-minded devs.', img: 'https://i.pravatar.cc/40?img=33' },
  { id: 104, name: 'Sofia Herrera',  location: 'Madrid, Spain',     mutual: 6, sharedAvatars: ['https://i.pravatar.cc/28?img=25','https://i.pravatar.cc/28?img=33','https://i.pravatar.cc/28?img=44'],  requestedOn: 'Jun 22, 2026', bio: 'Frontend dev specialising in React. Active open source contributor.',    img: 'https://i.pravatar.cc/40?img=44' },
];

const ADMIN_POSTS = [
  {
    id: 1,
    author: 'Alex Vanguard',
    badge: 'ADMIN',
    badgeCls: 'adm-post-badge--admin',
    avatar: 'https://i.pravatar.cc/40?img=3',
    time: '2 hours ago',
    protocol: 'Encryption Protocol A-13',
    text: 'Critical update pushed to all nodes: security patch v2.4.9 is now live. Please synchronize your local buffers. This patch addresses the recursive vulnerability found in the primary decryption gateway of Sector 4.',
    img: 'https://picsum.photos/seed/server-rack-dark/600/280',
    likes: '1.2k',
    comments: 86,
  },
  {
    id: 2,
    author: 'Data Stream 04',
    badge: null,
    avatar: 'https://i.pravatar.cc/40?img=7',
    time: '5 hours ago',
    protocol: 'Automated Alert',
    alert: true,
    alertText: '[ALERT] Unusual traffic spikes detected in sector 7-G. Analyzing packet headers... Origins appear to be spoofed through multiple planetary relays. Level 4 response team standing by.',
    likes: 256,
    comments: 12,
  },
];

const GROUP_POSTS = [
  {
    _id: 'gp1',
    author: { fullName: 'Alex Vanguard', avatar: 'https://i.pravatar.cc/40?img=3' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    caption: 'Critical update pushed to all nodes: security patch v2.4.9 is now live. Please synchronize your local buffers. This patch addresses the recursive vulnerability found in the primary decryption gateway of Sector 4.',
    media: [{ url: 'https://picsum.photos/seed/server-rack-dark/600/280' }],
    likes: 1200, comments: 86, shares: 34, peopleReact: 4,
  },
  {
    _id: 'gp2',
    author: { fullName: 'Priya Sharma', avatar: 'https://i.pravatar.cc/40?img=16' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    caption: 'Just wrapped up the weekly sync — incredible ideas from the community this week. The collaboration here is next level. Drop your biggest win from this week in the comments 👇',
    likes: 312, comments: 47, shares: 19, peopleReact: 4,
  },
  {
    _id: 'gp3',
    author: { fullName: 'Marcus Thorne', avatar: 'https://i.pravatar.cc/40?img=7' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    caption: 'Reminder: our monthly open-source sprint starts this Friday. We have 6 open issues across 3 repos that need contributors. All skill levels welcome — DM me for the repo links!',
    media: [{ url: 'https://picsum.photos/seed/open-source-sprint/600/260' }],
    likes: 256, comments: 23, shares: 41, peopleReact: 3,
  },
];



function normalizeRole(role) {
  if (!role) return 'Member';
  const lower = role.toLowerCase();
  if (lower === 'admin' || lower === 'group_admin') return 'Admin';
  if (lower === 'moderator' || lower === 'mod') return 'Moderator';
  return 'Member';
}

function apiRole(displayRole) {
  const map = { Admin: 'group_admin', Moderator: 'moderator', Member: 'member' };
  return map[displayRole] ?? displayRole.toLowerCase();
}

/* ══════════════════════════
   Group Admin Dashboard
══════════════════════════ */
function GroupAdminDashboard({ group, onBack, onFeedClick, onEventsClick, onCalendarClick, onMessagesClick, onModerationClick, onLibraryClick, onCoursesClick, onMinisitesClick }) {
  const dispatch = useDispatch();
  const groupId = group?._id ?? group?.id;
  const { user: authUser } = useSelector(s => s.auth);
  const { friendRequestIds } = useSelector(s => s.groups);
  const rdxMembers  = useSelector(s => s.groups.groupMembers[groupId]  ?? []);
  const rdxPending  = useSelector(s => s.groups.pendingRequests[groupId] ?? null);
  const rdxPosts    = useSelector(s => s.groups.groupPosts[groupId]    ?? null);
  const rdxStats    = useSelector(s => s.groups.adminDashboard[groupId]?.stats ?? null);

  const [activeTab,      setActiveTab]      = useState('about');
  const [aboutExpanded,  setAboutExpanded]  = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [memberRoles,    setMemberRoles]    = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [filterRole,     setFilterRole]     = useState('');
  const [openMbrDrop,    setOpenMbrDrop]    = useState(null);
  const memberFilterRef = useRef(null);
  const [filterMutual,   setFilterMutual]   = useState('');
  const [filterDate,     setFilterDate]     = useState('');
  const [openPndDrop,    setOpenPndDrop]    = useState(null);
  const pendingFilterRef = useRef(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedInvites, setSelectedInvites] = useState(new Set());
  const [friendIds,      setFriendIds]      = useState(new Set());
  const [coverImg,       setCoverImg]       = useState(group?.coverImg ?? null);
  const [coverImgFile,   setCoverImgFile]   = useState(null);
  const [groupImg,       setGroupImg]       = useState(group?.groupImg ?? null);
  const [groupImgFile,   setGroupImgFile]   = useState(null);
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupMembers({ groupId }));
    dispatch(fetchGroupPosts({ groupId, page: 1 }));
    if (group?.privacy === 'private') dispatch(fetchPendingRequests({ groupId }));
    dispatch(fetchAdminDashboard(groupId));
    dispatch(fetchConnections());

    // Socket listeners for admin dashboard real-time updates
    const socket = io();

    // Join group room for group events
    socket.emit('join:group', { groupId });

    socket.on('group:new-post', (data) => {
      if (data.groupId === groupId) {
        dispatch(fetchGroupPosts({ groupId, page: 1 }));
      }
    });

    socket.on('group:member-joined', (data) => {
      if (data.groupId === groupId) {
        dispatch(fetchGroupMembers({ groupId }));
        dispatch(fetchAdminDashboard(groupId));
      }
    });

    socket.on('group:pending-request', (data) => {
      if (data.groupId === groupId && group?.privacy === 'private') {
        dispatch(fetchPendingRequests({ groupId }));
        dispatch(fetchAdminDashboard(groupId));
      }
    });

    // Listen for new invitations sent (for notification badge)
    socket.on('notification:new-invite', (data) => {
      console.log('New group invite received:', data);
      // This will trigger fetchUserInvitations in the notifications component
    });

    return () => {
      socket.emit('leave:group', { groupId });
      socket.off('group:new-post');
      socket.off('group:member-joined');
      socket.off('group:pending-request');
      socket.off('notification:new-invite');
    };
  }, [dispatch, groupId, group?.privacy]);

  useEffect(() => {
    if (rdxMembers.length === 0) return;
    const roles = {};
    const friends = new Set();
    rdxMembers.forEach(m => {
      const id = m._id ?? m.id;
      roles[id] = normalizeRole(m.role);
      if (m.isFriend) friends.add(id);
    });
    setMemberRoles(roles);
    setFriendIds(friends);
  }, [rdxMembers]);

  const baseMembers = rdxMembers.length > 0 ? rdxMembers : ADMIN_MEMBERS;
  const pendingList = rdxPending ?? (rdxPending === null ? INIT_PENDING : []);

  function handleCoverChange(e) {
    const file = e.target.files[0];
    if (file) {
      setCoverImg(URL.createObjectURL(file));
      setCoverImgFile(file);
      dispatch(updateGroup({ groupId, coverImg: file }));
    }
    e.target.value = '';
  }
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setGroupImg(URL.createObjectURL(file));
      setGroupImgFile(file);
      dispatch(updateGroup({ groupId, groupImg: file }));
    }
    e.target.value = '';
  }

  function navClick(id) {
    if (id === 'create')   { setCreatePostOpen(true); return; }
    if (id === 'home')     onFeedClick?.();
    if (id === 'courses')  onCoursesClick?.();
    if (id === 'library')  onLibraryClick?.();
    if (id === 'events')   onEventsClick?.();
    if (id === 'friends')  onBack?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'messages') onMessagesClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  function switchTab(tab) { setActiveTab(tab); setSearchQuery(''); setFilterRole(''); setFilterJoined(''); }
  function handleAccept(requestId) {
    dispatch(acceptGroupRequest({ groupId, requestId })).then(action => {
      if (acceptGroupRequest.fulfilled.match(action)) {
        // Re-fetch so new member appears in table and stats reflect updated counts
        dispatch(fetchGroupMembers({ groupId }));
        dispatch(fetchAdminDashboard(groupId));
      }
    });
  }
  function handleReject(requestId) {
    dispatch(rejectGroupRequest({ groupId, requestId })).then(action => {
      if (rejectGroupRequest.fulfilled.match(action)) {
        // Re-fetch stats so pendingCount stays accurate
        dispatch(fetchAdminDashboard(groupId));
      }
    });
  }

  useEffect(() => {
    if (!openMbrDrop) return;
    function onOut(e) { if (memberFilterRef.current && !memberFilterRef.current.contains(e.target)) setOpenMbrDrop(null); }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [openMbrDrop]);

  useEffect(() => {
    if (!openPndDrop) return;
    function onOut(e) { if (pendingFilterRef.current && !pendingFilterRef.current.contains(e.target)) setOpenPndDrop(null); }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [openPndDrop]);

  const hasMbrFilter = filterRole;
  const hasPndFilter = filterMutual || filterDate;

  const filteredMembers = baseMembers.filter(m => {
    const id = m._id ?? m.id;
    const role = memberRoles[id] ?? normalizeRole(m.role);
    return (m.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filterRole   || role === filterRole);
  });
  const filteredPending = pendingList.filter(r =>
    (r.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!filterMutual || (filterMutual === 'Has Mutual' ? r.mutual > 0 : r.mutual === 0)) &&
    (!filterDate   || (r.requestedOn ?? '').includes(filterDate))
  );

  // Resolve admin name + avatar from members list (API returns admin as ID only)
  const admId = group?.admin?._id ?? group?.admin;
  const admMember = baseMembers.find(m => (m._id ?? m.id) === admId)
                 ?? baseMembers.find(m => m.role === 'Admin' || m.role === 'group_admin');
  const admName   = admMember?.name ?? (typeof group?.admin === 'string' && group?.admin?.length < 30 ? group?.admin : '—');
  const admAvatar = admMember?.img ?? null;

  function fmtDate(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="adm-page">
      <AnimatedNav activeId="friends" onNavigate={navClick} />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} groupId={groupId} />}

      <div className="adm-content">

        {/* Cover + profile row */}
        <div className="adm-cover-section">

          {/* Banner */}
          <div className="adm-cover" style={{ background: '#0d1424', position: 'relative' }}>
            {(coverImg || group?.coverImg) ? (
              <img
                src={coverImg || group?.coverImg}
                alt="Group cover"
                className="adm-cover-img"
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#94a3b8' }}>{group?.category || 'Social Platform'}</span>
              </div>
            )}
            <button className="adm-cover-back-btn" onClick={onBack} title="Back to Groups">
              <BackArrowIcon />
            </button>
            <button className="adm-edit-cover-btn" onClick={() => coverInputRef.current?.click()}>
              <EditIcon /> Edit Cover
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          </div>

          {/* Photo + name + actions */}
          <div className="adm-profile-row">
            <div className="adm-group-photo-area">
              <img
                src={groupImg || group?.groupImg || `https://picsum.photos/seed/adm-gp-${group?._id || group?.id || 'default'}/120/120`}
                alt={group?.name}
                className="adm-group-photo-img"
              />
              <button className="adm-edit-photo-btn" onClick={() => photoInputRef.current?.click()}>
                <EditIcon />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <div className="adm-group-info">
              <h1 className="adm-title">{group?.name ?? 'Creative Directors United'}</h1>
            </div>

            <div className="adm-header-btns">
              <button className="adm-export-btn"><ExportIcon /> Export List</button>
            </div>
          </div>

        </div>

        {/* Stats row */}
        <div className="adm-stats-row">
          <div className="adm-stat-card" style={{ cursor: 'pointer' }} onClick={() => switchTab('members')}>
            <p className="adm-stat-label">Total Members</p>
            <p className="adm-stat-value">{(rdxStats?.memberCount ?? group?.memberCount ?? baseMembers.length).toLocaleString()}</p>
            <span className="adm-stat-pill adm-stat-pill--green">+12% this month</span>
          </div>
          {group?.privacy === 'private' && (
            <div className="adm-stat-card" style={{ cursor: 'pointer' }} onClick={() => switchTab('pending')}>
              <p className="adm-stat-label">Pending Requests</p>
              <p className="adm-stat-value">{rdxStats?.pendingCount ?? pendingList.length}</p>
              <span className={`adm-stat-pill ${(rdxStats?.pendingCount ?? pendingList.length) > 0 ? 'adm-stat-pill--amber' : 'adm-stat-pill--green'}`}>
                {(rdxStats?.pendingCount ?? pendingList.length) > 0 ? 'Needs Review' : 'All Clear'}
              </span>
            </div>
          )}
          <div className="adm-stat-card" style={{ cursor: 'pointer' }} onClick={() => switchTab('posts')}>
            <p className="adm-stat-label">Total Posts</p>
            <p className="adm-stat-value">{(rdxStats?.postsCount ?? 0).toLocaleString()}</p>
            <span className="adm-stat-pill adm-stat-pill--green">Published</span>
          </div>
        </div>

        {/* Members table card */}
        <div className="adm-table-card">
          <div className="adm-table-top">
            <div className="adm-tabs">
              <button className={`adm-tab${activeTab === 'about'   ? ' adm-tab--active' : ''}`} onClick={() => switchTab('about')}>
                About
              </button>
              <button className={`adm-tab${activeTab === 'posts'   ? ' adm-tab--active' : ''}`} onClick={() => switchTab('posts')}>
                Posts
              </button>
              <button className={`adm-tab${activeTab === 'members' ? ' adm-tab--active' : ''}`} onClick={() => switchTab('members')}>
                Members <span className="adm-tab-count">{(group?.memberCount ?? baseMembers.length).toLocaleString()}</span>
              </button>
              {group?.privacy === 'private' && (
                <button className={`adm-tab${activeTab === 'pending' ? ' adm-tab--active' : ''}`} onClick={() => switchTab('pending')}>
                  Pending Requests {pendingList.length > 0 && <span className="adm-tab-count">{pendingList.length}</span>}
                </button>
              )}
            </div>
            {activeTab !== 'posts' && activeTab !== 'about' && (
              <div className="prof-conn-filter-bar adm-filter-bar-override" ref={activeTab === 'members' ? memberFilterRef : activeTab === 'pending' ? pendingFilterRef : null}>
                <div className="prof-conn-search-wrap">
                  <svg className="prof-conn-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    className="prof-conn-search"
                    type="text"
                    placeholder={activeTab === 'members' ? 'Search members…' : 'Search applicants…'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                {activeTab === 'members' && (<>
                  <button
                    className="prof-conn-fbar-pill prof-conn-fbar-pill--action"
                    onClick={() => setShowInviteModal(true)}
                    title="Invite new members to the group"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Invite Members
                  </button>

                  <button
                    className={`prof-conn-fbar-pill prof-conn-fbar-pill--label${hasMbrFilter ? ' prof-conn-fbar-pill--has-filter' : ''}`}
                    onClick={() => { setFilterRole(''); setFilterJoined(''); setOpenMbrDrop(null); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Filters
                    {hasMbrFilter && <span className="prof-conn-fbar-dot" />}
                  </button>

                  <div className="prof-conn-fbar-item">
                    <button
                      className={`prof-conn-fbar-pill${filterRole ? ' prof-conn-fbar-pill--active' : ''}${openMbrDrop === 'role' ? ' prof-conn-fbar-pill--open' : ''}`}
                      onClick={() => setOpenMbrDrop(openMbrDrop === 'role' ? null : 'role')}
                    >
                      {filterRole || 'Role'} <ChevronDownIcon />
                    </button>
                    {openMbrDrop === 'role' && (
                      <div className="prof-conn-fbar-dropdown">
                        {MEMBER_ROLES.map(r => (
                          <button
                            key={r}
                            className={`prof-conn-fbar-opt${filterRole === r ? ' prof-conn-fbar-opt--active' : ''}`}
                            onClick={() => { setFilterRole(filterRole === r ? '' : r); setOpenMbrDrop(null); }}
                          >
                            {filterRole === r && <CheckSmIcon />} {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>


                  {hasMbrFilter && (
                    <button className="prof-conn-fbar-clear" onClick={() => { setFilterRole(''); setFilterJoined(''); setOpenMbrDrop(null); }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Clear
                    </button>
                  )}
                </>)}

                {activeTab === 'pending' && (<>
                  <button
                    className={`prof-conn-fbar-pill prof-conn-fbar-pill--label${hasPndFilter ? ' prof-conn-fbar-pill--has-filter' : ''}`}
                    onClick={() => { setFilterMutual(''); setFilterDate(''); setOpenPndDrop(null); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Filters
                    {hasPndFilter && <span className="prof-conn-fbar-dot" />}
                  </button>

                  <div className="prof-conn-fbar-item">
                    <button
                      className={`prof-conn-fbar-pill${filterMutual ? ' prof-conn-fbar-pill--active' : ''}${openPndDrop === 'mutual' ? ' prof-conn-fbar-pill--open' : ''}`}
                      onClick={() => setOpenPndDrop(openPndDrop === 'mutual' ? null : 'mutual')}
                    >
                      {filterMutual || 'Connection'} <ChevronDownIcon />
                    </button>
                    {openPndDrop === 'mutual' && (
                      <div className="prof-conn-fbar-dropdown">
                        {['Has Mutual', 'New to Network'].map(opt => (
                          <button
                            key={opt}
                            className={`prof-conn-fbar-opt${filterMutual === opt ? ' prof-conn-fbar-opt--active' : ''}`}
                            onClick={() => { setFilterMutual(filterMutual === opt ? '' : opt); setOpenPndDrop(null); }}
                          >
                            {filterMutual === opt && <CheckSmIcon />} {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="prof-conn-fbar-item">
                    <button
                      className={`prof-conn-fbar-pill${filterDate ? ' prof-conn-fbar-pill--active' : ''}${openPndDrop === 'date' ? ' prof-conn-fbar-pill--open' : ''}`}
                      onClick={() => setOpenPndDrop(openPndDrop === 'date' ? null : 'date')}
                    >
                      {filterDate || 'Date'} <ChevronDownIcon />
                    </button>
                    {openPndDrop === 'date' && (
                      <div className="prof-conn-fbar-dropdown">
                        {['Jun 20', 'Jun 21', 'Jun 22'].map(d => (
                          <button
                            key={d}
                            className={`prof-conn-fbar-opt${filterDate === d ? ' prof-conn-fbar-opt--active' : ''}`}
                            onClick={() => { setFilterDate(filterDate === d ? '' : d); setOpenPndDrop(null); }}
                          >
                            {filterDate === d && <CheckSmIcon />} {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {hasPndFilter && (
                    <button className="prof-conn-fbar-clear" onClick={() => { setFilterMutual(''); setFilterDate(''); setOpenPndDrop(null); }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Clear
                    </button>
                  )}
                </>)}
              </div>
            )}
          </div>

          {/* Posts tab */}
          {activeTab === 'posts' && (
            <div className="gd-body">
              <div className="gd-main">
                {(rdxPosts ?? GROUP_POSTS).map(p => (
                  <PostCard key={p._id} post={p} />
                ))}
                {rdxPosts?.length === 0 && <p className="adm-empty">No posts in this group yet.</p>}
              </div>
            </div>
          )}

          {/* Members table */}
          {activeTab === 'members' && (
            <>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>DATE JOINED</th>
                    <th>ASSIGN ROLE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => {
                    const mid = m._id ?? m.id;
                    const role = memberRoles[mid] ?? normalizeRole(m.role);
                    const isFriendOrRequested = friendIds.has(mid) || friendRequestIds.includes(mid);
                    const isSelfRow = mid === (authUser?._id ?? authUser?.id);
                    const isMemberAdmin = role === 'Admin';
                    return (
                    <tr key={mid}>
                      <td>
                        <div className="adm-member-cell">
                          {m.img
                            ? <img src={m.img} alt={m.name} className="adm-member-avatar" />
                            : <div className="adm-member-avatar" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials(m.name ?? '')}</div>
                          }
                          <div>
                            <p className="adm-member-name">{m.name}</p>
                            {m.location && (
                              <span className="gd-member-location"><PinIcon /> {m.location}</span>
                            )}
                            <div className="prof-conn-shared" style={{ marginTop: '2px' }}>
                              <div className="prof-conn-shared-avatars">
                                {(m.sharedAvatars ?? []).slice(0, 3).map((src, i) => (
                                  <img key={i} src={src} alt="" className="prof-conn-shared-dot" />
                                ))}
                              </div>
                              <span className="adm-member-mutual">
                                {(m.mutual ?? 0) > 0 ? `${m.mutual} mutual connections` : 'New to your network'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-date-cell">{m.joined}</td>
                      <td><span className="adm-member-mutual" style={{ textTransform: 'capitalize' }}>{role}</span></td>
                      <td>
                        <div className="adm-action-cell">
                          {!isSelfRow && (isFriendOrRequested ? (
                            <button
                              className="prof-conn-btn prof-conn-btn--msg"
                              onClick={() => {
                                dispatch(startDM(mid));
                                onMessagesClick?.();
                              }}
                            >Chat</button>
                          ) : (
                            <button
                              className="prof-conn-btn prof-conn-btn--add"
                              onClick={() => {
                                dispatch(sendFriendRequest(mid));
                                setFriendIds(s => new Set([...s, mid]));
                              }}
                            >Add Friend</button>
                          ))}
                          {!isSelfRow && !isMemberAdmin && (
                            <button
                              className="prof-conn-btn prof-conn-btn--remove"
                              onClick={() => {
                                dispatch(removeMember({ groupId, memberId: mid })).then(action => {
                                  if (removeMember.fulfilled.match(action)) {
                                    dispatch(fetchAdminDashboard(groupId));
                                  }
                                });
                              }}
                            >Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="adm-table-footer">
                <span className="adm-showing">Showing {filteredMembers.length} of {(group?.memberCount ?? baseMembers.length).toLocaleString()} members</span>
                <div className="adm-pagination">
                  <button className="adm-pg-btn"><ChevronLeftIcon /></button>
                  <button className="adm-pg-btn adm-pg-btn--active">1</button>
                  <button className="adm-pg-btn"><ChevronRightIcon /></button>
                </div>
              </div>
            </>
          )}

          {/* About tab */}
          {activeTab === 'about' && (
            <div className="adm-about-layout">

              <div className="adm-about-main">
                {/* Description */}
                <div className="adm-about-card">
                  <div className="adm-about-card-head">
                    <span className="adm-about-icon adm-about-icon--blue"><InfoCircleIcon /></span>
                    <span className="adm-about-card-title">About this Group</span>
                  </div>
                  <p className="adm-about-body">
                    {aboutExpanded || (group?.description ?? '').length <= 300
                      ? group?.description
                      : (group?.description ?? '').slice(0, 300) + '…'
                    }
                    {(group?.description ?? '').length > 300 && (
                      <>
                        {' '}
                        <button
                          onClick={() => setAboutExpanded(!aboutExpanded)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline',
                          }}
                        >
                          {aboutExpanded ? 'See less' : 'See more'}
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Mission */}
                <div className="adm-about-card">
                  <div className="adm-about-card-head">
                    <span className="adm-about-icon adm-about-icon--purple"><TrendingUpIcon /></span>
                    <span className="adm-about-card-title">Group Mission</span>
                  </div>
                  <p className="adm-about-body">
                    {group?.mission}
                  </p>
                </div>

                {/* Meta grid */}
                <div className="adm-about-meta-grid">
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Admin</span>
                    <div className="adm-about-meta-val-row">
                      {admAvatar
                        ? <img src={admAvatar} alt={admName} className="adm-about-admin-av" />
                        : <div className="adm-about-admin-av" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials(admName)}</div>
                      }
                      <span className="adm-about-meta-value">{admName}</span>
                    </div>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Privacy</span>
                    <div className="adm-about-meta-val-row">
                      {group?.privacy === 'private'
                        ? <><LockIcon /><span className="adm-about-meta-value">Private</span></>
                        : <><GlobeIcon /><span className="adm-about-meta-value">Public</span></>
                      }
                    </div>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Category</span>
                    <span className="adm-about-meta-value">{group?.category || '—'}</span>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Created</span>
                    <span className="adm-about-meta-value">{fmtDate(group?.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Group Info sidebar */}
              <div className="adm-about-sidebar">
                <div className="gd-card">
                  <h3 className="gd-card-title">Group Info</h3>
                  <div className="gd-info-rows">
                    <div className="gd-info-row">
                      {group?.privacy === 'private' ? <LockIcon /> : <GlobeIcon />}
                      <div>
                        <p className="gd-info-sub">{group?.privacy === 'private' ? 'Only members can see posts' : 'Anyone can view and join'}</p>
                        <p className="gd-info-label">{group?.privacy === 'private' ? 'Private Group' : 'Public Group'}</p>
                      </div>
                    </div>
                    <div className="gd-info-row">
                      <UsersIcon />
                      <div>
                        <p className="gd-info-sub">Total members</p>
                        <p className="gd-info-label">{group?.memberCount?.toLocaleString() || group?.members || '—'}</p>
                      </div>
                    </div>
                    {group?.createdAt && (
                      <div className="gd-info-row">
                        <InfoCircleIcon />
                        <div>
                          <p className="gd-info-sub">Group history</p>
                          <p className="gd-info-label">Created {fmtDate(group.createdAt)}</p>
                        </div>
                      </div>
                    )}
                    {admName && admName !== '—' && (
                      <div className="gd-info-row">
                        <OrganizerIcon />
                        <div>
                          <p className="gd-info-sub">Group Admin</p>
                          <p className="gd-info-label">{admName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Pending Requests table */}
          {activeTab === 'pending' && (
            filteredPending.length === 0 ? (
              <p className="adm-empty">No pending requests — you&apos;re all caught up.</p>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>APPLICANT</th>
                    <th>REQUESTED ON</th>
                    <th>BIO</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map(r => {
                    const rid = r._id ?? r.id;
                    return (
                    <tr key={rid}>
                      <td>
                        <div className="adm-member-cell">
                          {r.img
                            ? <img src={r.img} alt={r.name} className="adm-member-avatar" />
                            : <div className="adm-member-avatar" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials(r.name ?? '')}</div>
                          }
                          <div>
                            <p className="adm-member-name">{r.name}</p>
                            {r.location && (
                              <span className="gd-member-location"><PinIcon /> {r.location}</span>
                            )}
                            <div className="prof-conn-shared" style={{ marginTop: '2px' }}>
                              <div className="prof-conn-shared-avatars">
                                {(r.sharedAvatars ?? []).slice(0, 3).map((src, i) => (
                                  <img key={i} src={src} alt="" className="prof-conn-shared-dot" />
                                ))}
                              </div>
                              <span className="adm-member-mutual">
                                {(r.mutual ?? 0) > 0 ? `${r.mutual} mutual connections` : 'New to your network'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-date-cell">{r.requestedOn}</td>
                      <td className="adm-bio-cell">{r.bio}</td>
                      <td>
                        <div className="adm-req-actions">
                          <button className="adm-accept-btn" onClick={() => handleAccept(rid)}>Accept</button>
                          <button className="adm-reject-btn" onClick={() => handleReject(rid)}>Reject</button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>


        {/* Invite Members Modal */}
        {showInviteModal && (
          <InviteMembersModal
            groupId={groupId}
            groupName={group?.name}
            onClose={() => { setShowInviteModal(false); setSelectedInvites(new Set()); setInviteSearchQuery(''); }}
          />
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════
   Invite Members Modal
══════════════════════════ */
function InviteMembersModal({ groupId, groupName, onClose }) {
  const dispatch = useDispatch();
  const { connections } = useSelector(s => s.profile);
  const { invitingIds } = useSelector(s => s.invitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [isInviting, setIsInviting] = useState(false);

  // Fetch connections when modal opens
  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  // Filter connections based on search
  const filteredConnections = (connections || []).filter(conn => {
    const name = (conn.fullName || conn.name || '').toLowerCase();
    const email = (conn.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const handleInvite = async () => {
    if (selectedIds.size === 0) return;

    setIsInviting(true);
    let successCount = 0;
    const errorMessages = [];

    try {
      for (const userId of Array.from(selectedIds)) {
        try {
          await dispatch(inviteUserToGroup({ groupId, userId })).unwrap();
          setInvitedIds(prev => new Set([...prev, userId]));
          successCount++;
        } catch (err) {
          console.error(`Failed to invite user ${userId}:`, err);
          // Capture specific error message from API
          const errorMsg = err?.message || 'Failed to invite user';
          errorMessages.push(errorMsg);
        }
      }

      // Show results
      if (successCount > 0) {
        dispatch(showToast({
          type: 'success',
          message: `✓ Invited ${successCount} member${successCount > 1 ? 's' : ''} to ${groupName}`,
          duration: 3000
        }));
      }

      if (errorMessages.length > 0) {
        // Show the first unique error message
        const uniqueErrors = [...new Set(errorMessages)];
        dispatch(showToast({
          type: 'error',
          message: uniqueErrors[0], // Show specific error like "Invitation already sent"
          duration: 3000
        }));
      }

      // Close after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Invitation error:', err);
      dispatch(showToast({
        type: 'error',
        message: err?.message || 'Error sending invitations',
        duration: 3000
      }));
    } finally {
      setIsInviting(false);
    }
  };

  const handleToggle = (userId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>Invite Members to {groupName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Search */}
          <div className="prof-conn-search-wrap" style={{ marginBottom: 20 }}>
            <svg className="prof-conn-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="prof-conn-search"
              type="text"
              placeholder="Search connections by name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Connections list */}
          <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 20 }}>
            {filteredConnections.length > 0 ? (
              filteredConnections.map(conn => {
                const userId = conn._id || conn.id;
                const isSelected = selectedIds.has(userId);
                const isInviting = invitingIds.includes(userId);
                const wasInvited = invitedIds.has(userId);

                return (
                  <div
                    key={userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: 8,
                      marginBottom: 8,
                      border: '1px solid #2d3748',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      cursor: wasInvited ? 'default' : 'pointer',
                      opacity: wasInvited ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                    onClick={() => !wasInvited && handleToggle(userId)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => !wasInvited && handleToggle(userId)}
                      disabled={wasInvited}
                      style={{ marginRight: 12, cursor: wasInvited ? 'not-allowed' : 'pointer' }}
                    />

                    {/* Avatar */}
                    {conn.avatar ? (
                      <img
                        src={conn.avatar}
                        alt={conn.fullName || conn.name}
                        style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 12, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      >
                        {(conn.fullName || conn.name || '?')[0].toUpperCase()}
                      </div>
                    )}

                    {/* User info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 500 }}>
                        {conn.fullName || conn.name}
                      </p>
                      {conn.location && (
                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                          {conn.location}
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    {wasInvited && (
                      <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ Invited</span>
                    )}
                    {isInviting && (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Inviting...</span>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                {connections.length === 0
                  ? 'No connections yet. Make some friends first!'
                  : 'No matching connections found'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={selectedIds.size === 0 || isInviting}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                cursor: selectedIds.size > 0 && !isInviting ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 500,
                opacity: selectedIds.size > 0 && !isInviting ? 1 : 0.5
              }}
            >
              {isInviting ? 'Inviting...' : `Send Invites (${selectedIds.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   Create Group Page
══════════════════════════ */
function CreateGroupPage({ onBack, onFeedClick, onEventsClick, onCalendarClick, onMessagesClick, onCreateGroup, onLibraryClick, onCoursesClick, onMinisitesClick }) {
  const dispatch = useDispatch();
  const { creating, createError } = useSelector(s => s.groups);
  const [groupName,      setGroupName]      = useState('');
  const [mission,        setMission]        = useState('');
  const [description,    setDescription]    = useState('');
  const [category,       setCategory]       = useState('Technology & Software');
  const [privacy,        setPrivacy]        = useState('public');
  const [adminApproval,  setAdminApproval]  = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [coverImg,       setCoverImg]       = useState('');
  const [coverImgFile,   setCoverImgFile]   = useState(null);
  const [groupImg,       setGroupImg]       = useState('');
  const [groupImgFile,   setGroupImgFile]   = useState(null);
  const [coverCropQueue, setCoverCropQueue] = useState([]);
  const [coverCropIdx,   setCoverCropIdx]   = useState(0);
  const [photoCropQueue, setPhotoCropQueue] = useState([]);
  const [photoCropIdx,   setPhotoCropIdx]   = useState(0);
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  function handleCoverChange(e) {
    const f = e.target.files?.[0];
    if (f) { setCoverCropQueue([f]); setCoverCropIdx(0); }
    e.target.value = '';
  }
  function handlePhotoChange(e) {
    const f = e.target.files?.[0];
    if (f) { setPhotoCropQueue([f]); setPhotoCropIdx(0); }
    e.target.value = '';
  }

  function handleCoverCropComplete(croppedFile) {
    setCoverImgFile(croppedFile);
    setCoverImg(URL.createObjectURL(croppedFile));
    setCoverCropQueue([]);
    setCoverCropIdx(0);
  }
  function handlePhotoCropComplete(croppedFile) {
    setGroupImgFile(croppedFile);
    setGroupImg(URL.createObjectURL(croppedFile));
    setPhotoCropQueue([]);
    setPhotoCropIdx(0);
  }
  function handleCoverCropSkip() {
    const original = coverCropQueue[coverCropIdx];
    setCoverImgFile(original);
    setCoverImg(URL.createObjectURL(original));
    setCoverCropQueue([]);
    setCoverCropIdx(0);
  }
  function handlePhotoCropSkip() {
    const original = photoCropQueue[photoCropIdx];
    setGroupImgFile(original);
    setGroupImg(URL.createObjectURL(original));
    setPhotoCropQueue([]);
    setPhotoCropIdx(0);
  }

  function handleCreate() {
    if (creating) return;

    const name = groupName.trim();
    if (!name) {
      dispatch(showToast({ message: 'Group name is required', type: 'error' }));
      return;
    }
    if (name.length > 50) {
      dispatch(showToast({ message: 'Group name must be 50 characters or less', type: 'error' }));
      return;
    }
    if (mission && mission.length > 100) {
      dispatch(showToast({ message: 'Mission must be 100 characters or less', type: 'error' }));
      return;
    }

    dispatch(createGroup({
      name,
      mission,
      description,
      category,
      privacy,
      adminApproval,
      coverImg: coverImgFile,
      groupImg: groupImgFile,
    })).then(action => {
      if (createGroup.fulfilled.match(action)) {
        onCreateGroup?.(action.payload);
      } else if (createGroup.rejected.match(action)) {
        dispatch(showToast({ message: action.payload?.message ?? 'Failed to create group', type: 'error' }));
      }
    });
  }

  function navClick(id) {
    if (id === 'create')   { setCreatePostOpen(true); return; }
    if (id === 'home')     onFeedClick?.();
    if (id === 'courses')  onCoursesClick?.();
    if (id === 'library')  onLibraryClick?.();
    if (id === 'events')   onEventsClick?.();
    if (id === 'friends')  onBack?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'messages')  onMessagesClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  return (
    <div className="cg-page">
      <AnimatedNav activeId="friends" onNavigate={navClick} />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}

      {/* Main content */}
      <div className="cg-content">

        {/* Cover + Group Photo */}
        <div className="cg-cover-section">
          <div className="adm-cover" style={{ background: '#0d1424', position: 'relative' }}>
            {coverImg ? (
              <img
                src={coverImg}
                alt="Group cover"
                className="adm-cover-img"
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#94a3b8' }}>Social Platform</span>
              </div>
            )}
            <button className="gd-cover-back-btn" onClick={onBack} title="Back to Groups">
              <BackArrowIcon />
            </button>
            <button className="adm-edit-cover-btn" onClick={() => coverInputRef.current?.click()}>
              <EditIcon /> Edit Cover
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />

            {/* Centered profile photo overlapping cover bottom */}
            <div className="cg-photo-center">
              <div className="adm-group-photo-area">
                {groupImg ? (
                  <img
                    src={groupImg}
                    alt="Group photo"
                    className="adm-group-photo-img"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#94a3b8', fontSize: '32px', fontWeight: 700 }}>
                    G
                  </div>
                )}
                <button className="adm-edit-photo-btn" onClick={() => photoInputRef.current?.click()}>
                  <EditIcon />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="cg-layout" style={{ marginTop: '56px' }}>

          {/* Left column */}
          <div className="cg-left">

            {/* Group Identity */}
            <div className="cg-section">

              <div className="cg-field">
                <label className="cg-label">Group Name</label>
                <input className="cg-input" value={groupName} onChange={e => setGroupName(e.target.value)} maxLength={50} />
                <p className="cg-hint">Keep it short and descriptive. Max 50 characters.</p>
              </div>

              <div className="cg-field">
                <label className="cg-label">Group Mission</label>
                <input className="cg-input" value={mission} onChange={e => setMission(e.target.value)} maxLength={100} />
                <p className="cg-hint">A one-line purpose statement for your group. Max 100 characters.</p>
              </div>

              <div className="cg-field">
                <label className="cg-label">Description</label>
                <textarea className="cg-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={5} />
              </div>

              <div className="cg-field">
                <label className="cg-label">Category</label>
                <div className="cg-select-wrap">
                  <select className="cg-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="cg-chevron"><ChevronDownIcon /></span>
                </div>
              </div>
            </div>

            {/* Privacy & Access */}
            <div className="cg-section">
              <div className="cg-section-head"><ShieldIcon2 /> Privacy & Access</div>

              <div className="cg-privacy-grid">
                {/* Public */}
                <div className={`cg-privacy-card${privacy === 'public' ? ' cg-privacy-card--active' : ''}`} onClick={() => setPrivacy('public')}>
                  <div className="cg-privacy-card-top">
                    <span className={`cg-privacy-icon${privacy === 'public' ? ' active' : ''}`}><GlobeIconLg /></span>
                    <span className={`cg-radio${privacy === 'public' ? ' cg-radio--on' : ''}`}>
                      {privacy === 'public' && <span className="cg-radio-dot" />}
                    </span>
                  </div>
                  <p className="cg-privacy-title">Public Group</p>
                  <p className="cg-privacy-desc">Anyone can see who's in the group and what they post.</p>
                </div>
                {/* Private */}
                <div className={`cg-privacy-card${privacy === 'private' ? ' cg-privacy-card--active' : ''}`} onClick={() => setPrivacy('private')}>
                  <div className="cg-privacy-card-top">
                    <span className={`cg-privacy-icon${privacy === 'private' ? ' active' : ''}`}><LockIconLg /></span>
                    <span className={`cg-radio${privacy === 'private' ? ' cg-radio--on' : ''}`}>
                      {privacy === 'private' && <span className="cg-radio-dot" />}
                    </span>
                  </div>
                  <p className="cg-privacy-title">Private Group</p>
                  <p className="cg-privacy-desc">Only members can see who's in the group and what they post.</p>
                </div>
              </div>

              {/* Admin Approval toggle — only for private groups */}
              {privacy === 'private' && (
              <div className="cg-toggle-row">
                <div className="cg-toggle-icon"><ShieldIcon2 /></div>
                <div className="cg-toggle-info">
                  <p className="cg-toggle-title">Admin Approval</p>
                  <p className="cg-toggle-desc">Require admins to approve new member requests.</p>
                </div>
                <div className={`cg-toggle${adminApproval ? ' cg-toggle--on' : ''}`} onClick={() => setAdminApproval(v => !v)}>
                  <div className="cg-toggle-thumb" />
                </div>
              </div>
              )}
            </div>

          </div>

        </div>

        {/* Action buttons */}
        <div className="cg-form-actions">
          {createError && <p style={{ color: '#ef4444', fontSize: 13, margin: '0 8px 0 0' }}>{createError}</p>}
          <button className="cg-cancel-btn" onClick={onBack} disabled={creating}>Cancel</button>
          <button className="cg-create-btn" onClick={handleCreate} disabled={!groupName.trim() || creating}>
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>

      </div>

      {/* Cover Image Cropper */}
      {coverCropQueue.length > 0 && (
        <ImageCropper
          key={`cover-${coverCropIdx}`}
          file={coverCropQueue[coverCropIdx]}
          onSave={handleCoverCropComplete}
          onSkip={handleCoverCropSkip}
          onCancel={() => { setCoverCropQueue([]); setCoverCropIdx(0); }}
          defaultAspect="landscape"
          cropShape="rect"
        />
      )}

      {/* Photo Image Cropper */}
      {photoCropQueue.length > 0 && (
        <ImageCropper
          key={`photo-${photoCropIdx}`}
          file={photoCropQueue[photoCropIdx]}
          onSave={handlePhotoCropComplete}
          onSkip={handlePhotoCropSkip}
          onCancel={() => { setPhotoCropQueue([]); setPhotoCropIdx(0); }}
          defaultAspect="square"
          cropShape="round"
        />
      )}
    </div>
  );
}

/* ── Nav ── */

/* ── Mock data ── */
const HUB_CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Education', 'Health', 'Science', 'Finance', 'Arts'];

export const HUB_GROUPS = [
  { id: 1,  name: 'Neural Interface Labs',   category: 'Technology', members: '14.2k members', memberCount: 14200, memberAvatars: ['https://i.pravatar.cc/28?img=5','https://i.pravatar.cc/28?img=9','https://i.pravatar.cc/28?img=12'],  coverImg: 'https://picsum.photos/seed/hub-neural/400/200',  iconText: 'NI', color: '#2563eb', tab: 'suggested', privacy: 'public',  createdAt: 'February 8, 2022',   admin: 'Lena Hartmann',    mission: 'Push the boundary between human cognition and machine intelligence.',     description: 'Neural Interface Labs is a research-driven community for engineers, neuroscientists, and AI practitioners exploring brain-computer interfaces, neural decoding, and next-gen human-machine interaction. We share papers, tools, and collaborate on open research.' },
  { id: 2,  name: 'Quantum Finance Guild',   category: 'Finance',    members: '8.7k members',  memberCount: 8700,  memberAvatars: ['https://i.pravatar.cc/28?img=16','https://i.pravatar.cc/28?img=20','https://i.pravatar.cc/28?img=25'], coverImg: 'https://picsum.photos/seed/hub-quantum/400/200', iconText: 'QF', color: '#7c3aed', tab: 'suggested', privacy: 'private', createdAt: 'September 3, 2021',  admin: 'Ravi Menon',       mission: 'Apply quantum computing to financial modelling and risk.',                description: 'The Quantum Finance Guild connects quants, mathematicians, and fintech engineers exploring quantum algorithms for portfolio optimisation, derivatives pricing, and high-frequency trading. Private group — verified finance professionals only.' },
  { id: 3,  name: 'BioSynth Research',       category: 'Science',    members: '5.1k members',  memberCount: 5100,  memberAvatars: ['https://i.pravatar.cc/28?img=33','https://i.pravatar.cc/28?img=36','https://i.pravatar.cc/28?img=40'], coverImg: 'https://picsum.photos/seed/hub-bio/400/200',     iconText: 'BR', color: '#059669', tab: 'suggested', privacy: 'public',  createdAt: 'April 17, 2023',     admin: 'Dr. Yuki Tanaka',  mission: 'Accelerate synthetic biology through open collaboration.',              description: 'BioSynth Research brings together biologists, chemists, and computational scientists working on engineered biological systems. Members share protocols, discuss CRISPR tooling, and collaborate on open-source biology projects.' },
  { id: 4,  name: 'Digital Arts Collective', category: 'Design',     members: '11.3k members', memberCount: 11300, memberAvatars: ['https://i.pravatar.cc/28?img=44','https://i.pravatar.cc/28?img=47','https://i.pravatar.cc/28?img=48'], coverImg: 'https://picsum.photos/seed/hub-arts/400/200',    iconText: 'DA', color: '#db2777', tab: 'suggested', privacy: 'public',  createdAt: 'June 1, 2021',       admin: 'Mira Osei',        mission: 'Celebrate digital creativity in every medium.',                          description: 'The Digital Arts Collective is a vibrant space for illustrators, motion designers, 3D artists, and generative art creators. Share your work, get critique, explore new tools, and collaborate on community art projects and exhibitions.' },
  { id: 5,  name: 'Infratech Alliance',      category: 'Technology', members: '9.8k members',  memberCount: 9800,  memberAvatars: ['https://i.pravatar.cc/28?img=51','https://i.pravatar.cc/28?img=53','https://i.pravatar.cc/28?img=56'], coverImg: 'https://picsum.photos/seed/hub-infra/400/200',   iconText: 'IA', color: '#0891b2', tab: 'suggested', privacy: 'public',  createdAt: 'November 12, 2022',  admin: 'Chen Wei',         mission: 'Redefine infrastructure with open, scalable, cloud-native patterns.',    description: 'Infratech Alliance is the go-to community for DevOps engineers, SREs, and platform teams. Discussions cover Kubernetes, Terraform, observability, CI/CD, and modern infrastructure patterns. A collaborative space for sharing runbooks, incident postmortems, and tooling reviews.' },
  { id: 6,  name: 'CryptoVault Network',     category: 'Finance',    members: '18.5k members', memberCount: 18500, memberAvatars: ['https://i.pravatar.cc/28?img=57','https://i.pravatar.cc/28?img=60','https://i.pravatar.cc/28?img=3'],  coverImg: 'https://picsum.photos/seed/hub-crypto/400/200',  iconText: 'CV', color: '#d97706', tab: 'suggested', privacy: 'public',  createdAt: 'January 20, 2021',   admin: 'Andre Volta',      mission: 'Decode the future of decentralised finance for everyone.',               description: 'CryptoVault Network is one of the largest DeFi communities on the platform. Members analyse on-chain data, debate protocol governance, share alpha, and break down complex financial instruments in plain language. All experience levels welcome.' },
  { id: 7,  name: 'Health Matrix',           category: 'Health',     members: '6.4k members',  memberCount: 6400,  memberAvatars: ['https://i.pravatar.cc/28?img=7','https://i.pravatar.cc/28?img=11','https://i.pravatar.cc/28?img=14'], coverImg: 'https://picsum.photos/seed/hub-health/400/200',  iconText: 'HM', color: '#16a34a', tab: 'suggested', privacy: 'public',  createdAt: 'March 9, 2023',      admin: 'Dr. Priya Sood',   mission: 'Empower individuals with data-driven health and wellness knowledge.',     description: 'Health Matrix is a science-first wellness community for doctors, researchers, fitness professionals, and health-curious individuals. We discuss evidence-based nutrition, longevity research, mental health, and the quantified self movement.' },
  { id: 8,  name: 'Edu Nexus Academy',       category: 'Education',  members: '21.0k members', memberCount: 21000, memberAvatars: ['https://i.pravatar.cc/28?img=19','https://i.pravatar.cc/28?img=22','https://i.pravatar.cc/28?img=27'], coverImg: 'https://picsum.photos/seed/hub-edu/400/200',     iconText: 'EN', color: '#4f46e5', tab: 'suggested', privacy: 'public',  createdAt: 'August 5, 2020',     admin: 'James Okafor',     mission: 'Make quality education accessible and collaborative for all.',            description: 'Edu Nexus Academy connects educators, learners, and ed-tech builders. Share learning resources, discuss pedagogy, build study groups, and explore the latest trends in online education, MOOCs, and adaptive learning technologies.' },
  { id: 9,  name: 'Open Source Forge',       category: 'Technology', members: '1.2k members',  memberCount: 1200,  memberAvatars: ['https://i.pravatar.cc/28?img=30','https://i.pravatar.cc/28?img=32','https://i.pravatar.cc/28?img=35'], coverImg: 'https://picsum.photos/seed/hub-oss/400/200',     iconText: 'OS', color: '#2563eb', tab: 'yours',     privacy: 'public',  pendingReqs: 0,  createdAt: 'March 14, 2023',  admin: 'Alex Vanguard',  mission: 'Accelerate open-source adoption by connecting contributors worldwide.',   description: 'Open Source Forge is a collaborative hub for developers passionate about open-source software. We share projects, review code, host sprints, and mentor new contributors across all technology stacks.' },
  { id: 10, name: 'Digital Artists Hub',     category: 'Design',     members: '1.1k members',  memberCount: 1100,  memberAvatars: ['https://i.pravatar.cc/28?img=37','https://i.pravatar.cc/28?img=41','https://i.pravatar.cc/28?img=43'], coverImg: 'https://picsum.photos/seed/hub-dart/400/200',    iconText: 'DH', color: '#db2777', tab: 'yours',     privacy: 'private', pendingReqs: 7,  createdAt: 'July 2, 2023',    admin: 'Alex Vanguard',  mission: 'Celebrate and elevate digital art in all its forms.',                    description: 'A private creative space for digital artists to share work-in-progress, get constructive critique, discover tools, and collaborate on commissions and exhibitions.' },
  { id: 14, name: 'Full-Stack Builders',     category: 'Technology', members: '874 members',   memberCount: 874,   memberAvatars: ['https://i.pravatar.cc/28?img=45','https://i.pravatar.cc/28?img=49','https://i.pravatar.cc/28?img=52'], coverImg: 'https://picsum.photos/seed/hub-fsb/400/200',     iconText: 'FB', color: '#0891b2', tab: 'yours',     privacy: 'public',  pendingReqs: 0,  createdAt: 'January 9, 2024', admin: 'Alex Vanguard',  mission: 'Bridge the gap between frontend craft and backend engineering.',          description: 'Full-Stack Builders brings together engineers who love the entire stack. From API design to pixel-perfect UIs, we dive deep into architecture patterns, performance tuning, and real-world project challenges.' },
  { id: 11, name: 'UX Design Masters',       category: 'Design',     members: '3.5k members',  memberCount: 3500,  memberAvatars: ['https://i.pravatar.cc/28?img=54','https://i.pravatar.cc/28?img=58','https://i.pravatar.cc/28?img=62'], coverImg: 'https://picsum.photos/seed/hub-ux/400/200',      iconText: 'UX', color: '#7c3aed', tab: 'joined',    joined: true, privacy: 'public',  createdAt: 'May 22, 2022',      admin: 'Fatima Al-Rashid', mission: 'Master every facet of user experience design.',                          description: 'UX Design Masters is a practitioner community for UX researchers, interaction designers, and product designers. Monthly design challenges, critique sessions, job boards, and deep dives into research methodologies keep the community sharp.' },
  { id: 12, name: 'Modern Stack Devs',       category: 'Technology', members: '12.4k members', memberCount: 12400, memberAvatars: ['https://i.pravatar.cc/28?img=63','https://i.pravatar.cc/28?img=65','https://i.pravatar.cc/28?img=1'],  coverImg: 'https://picsum.photos/seed/hub-stack/400/200',   iconText: 'MS', color: '#0891b2', tab: 'joined',    joined: true, privacy: 'public',  createdAt: 'October 14, 2021',  admin: 'Soren Bjerg',      mission: 'Ship faster by sharing what actually works in production.',              description: 'Modern Stack Devs is a no-fluff engineering community where developers share real-world experiences with React, Next.js, TypeScript, Bun, and everything in between. Candid discussions about tooling, architecture trade-offs, and career growth.' },
  { id: 13, name: 'Beat Makers Collective',  category: 'Arts',       members: '22.9k members', memberCount: 22900, memberAvatars: ['https://i.pravatar.cc/28?img=15','https://i.pravatar.cc/28?img=18','https://i.pravatar.cc/28?img=21'], coverImg: 'https://picsum.photos/seed/hub-beats/400/200',   iconText: 'BM', color: '#d97706', tab: 'joined',    joined: true, privacy: 'public',  createdAt: 'July 30, 2020',     admin: 'DJ NovaCast',      mission: 'Connect music producers and grow the global beat-making community.',     description: 'Beat Makers Collective is the largest music production community on the platform. Share your beats, get feedback, collaborate with artists worldwide, discuss DAWs, sample packs, and the business side of music production.' },
];

const MODAL_CONTACTS = [
  { id: '1', name: 'Sarah Jenkins',   role: 'Product Designer',  color: '#b45309' },
  { id: '2', name: 'Marcus Chen',     role: 'Senior Engineer',   color: '#1d4ed8' },
  { id: '3', name: 'Elena Rodriguez', role: 'Marketing Lead',    color: '#be185d' },
  { id: '4', name: 'David Park',      role: 'Community Manager', color: '#6d28d9' },
];

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

/* ══════════════════════════
   Group Detail Page
══════════════════════════ */
const GD_MEMBERS = [
  { id: 1, name: 'Sarah Jenkins',  title: 'UX Designer at Figma',          location: 'San Francisco, CA', role: 'Admin',     joined: 'Oct 2023', mutual: 12, sharedAvatars: ['https://i.pravatar.cc/28?img=5','https://i.pravatar.cc/28?img=9','https://i.pravatar.cc/28?img=12'],  img: 'https://i.pravatar.cc/40?img=1',  isFriend: true  },
  { id: 2, name: 'Marcus Thorne',  title: 'Backend Engineer at Vercel',     location: 'New York, NY',      role: 'Moderator', joined: 'Nov 2023', mutual: 4,  sharedAvatars: ['https://i.pravatar.cc/28?img=16','https://i.pravatar.cc/28?img=20'],                                   img: 'https://i.pravatar.cc/40?img=3',  isFriend: false },
  { id: 3, name: 'Alex Rivera',    title: 'Product Manager at Notion',      location: 'Austin, TX',        role: 'Member',    joined: 'Jan 2024', mutual: 8,  sharedAvatars: ['https://i.pravatar.cc/28?img=25','https://i.pravatar.cc/28?img=33','https://i.pravatar.cc/28?img=44'],  img: 'https://i.pravatar.cc/40?img=5',  isFriend: true  },
  { id: 4, name: 'Elena Vance',    title: 'Graphic Designer · Freelance',   location: 'Berlin, Germany',   role: 'Member',    joined: 'Feb 2024', mutual: 2,  sharedAvatars: ['https://i.pravatar.cc/28?img=47','https://i.pravatar.cc/28?img=48'],                                   img: 'https://i.pravatar.cc/40?img=9',  isFriend: false },
  { id: 5, name: 'James Okafor',   title: 'DevOps Lead at AWS',             location: 'Seattle, WA',       role: 'Member',    joined: 'Mar 2024', mutual: 5,  sharedAvatars: ['https://i.pravatar.cc/28?img=51','https://i.pravatar.cc/28?img=53','https://i.pravatar.cc/28?img=56'],  img: 'https://i.pravatar.cc/40?img=12', isFriend: false },
  { id: 6, name: 'Priya Sharma',   title: 'Data Scientist at Google',       location: 'Bangalore, India',  role: 'Member',    joined: 'Apr 2024', mutual: 7,  sharedAvatars: ['https://i.pravatar.cc/28?img=60','https://i.pravatar.cc/28?img=57','https://i.pravatar.cc/28?img=43'],  img: 'https://i.pravatar.cc/40?img=16', isFriend: true  },
  { id: 7, name: 'Tom Barker',     title: 'iOS Developer at Apple',         location: 'Cupertino, CA',     role: 'Member',    joined: 'May 2024', mutual: 0,  sharedAvatars: [],                                                                                                        img: 'https://i.pravatar.cc/40?img=21', isFriend: false },
  { id: 8, name: 'Nina Petrova',   title: 'Cloud Architect at Microsoft',   location: 'London, UK',        role: 'Member',    joined: 'Jun 2024', mutual: 3,  sharedAvatars: ['https://i.pravatar.cc/28?img=45','https://i.pravatar.cc/28?img=49'],                                   img: 'https://i.pravatar.cc/40?img=25', isFriend: true  },
];

function GroupDetailPage({ group, onBack, onManage, onUserClick, onFeedClick, onEventsClick, onCalendarClick, onMessagesClick, onLibraryClick, onCoursesClick, onMinisitesClick }) {
  const dispatch = useDispatch();
  const groupId = group?._id ?? group?.id;
  const { user: authUser } = useSelector(s => s.auth);
  const { joiningIds, leavingIds, friendRequestIds } = useSelector(s => s.groups);
  const rdxPosts   = useSelector(s => s.groups.groupPosts[groupId]   ?? null);
  const rdxMembers = useSelector(s => s.groups.groupMembers[groupId] ?? null);

  const { pinnedPosts, deletingPostIds, editingPostIds, pinningPostIds } = useSelector(s => s.comments);
  const [detailTab,        setDetailTab]        = useState('about');
  const [aboutExpanded,    setAboutExpanded]    = useState(false);
  const [joinedLocal,      setJoinedLocal]      = useState(group.joined || false);
  const [pendingLocal,     setPendingLocal]     = useState(group.pending || false);
  const [createPostOpen,   setCreatePostOpen]   = useState(false);
  const [gdFriendIds,      setGdFriendIds]      = useState(() => new Set(GD_MEMBERS.filter(m => m.isFriend).map(m => m.id)));
  const [showLeaveModal,   setShowLeaveModal]   = useState(false);
  const [leaveReason,      setLeaveReason]      = useState('');
  const [showReportModal,  setShowReportModal]  = useState(false);
  const [reportSelected,   setReportSelected]   = useState('');
  const [reportDone,       setReportDone]       = useState(false);
  const [isReported,       setIsReported]       = useState(group?.reported ?? false);
  const [sharing,         setSharing]         = useState(false);

  const isJoining = joiningIds.includes(groupId);
  const isLeaving = leavingIds.includes(groupId);

  useEffect(() => {
    if (!groupId) return;
    dispatch(fetchGroupPosts({ groupId, page: 1 }));
    dispatch(fetchGroupMembers({ groupId }));
    dispatch(fetchConnections());

    // Socket listeners for real-time group updates
    const socket = io();
    socket.emit('join:group', { groupId });

    socket.on('group:new-post', (data) => {
      if (data.groupId === groupId) {
        dispatch(fetchGroupPosts({ groupId, page: 1 }));
      }
    });

    socket.on('group:member-joined', (data) => {
      if (data.groupId === groupId) {
        dispatch(fetchGroupMembers({ groupId }));
      }
    });

    socket.on('group:post-liked', (data) => {
      if (data.groupId === groupId) {
        dispatch({ type: 'comments/likePost/fulfilled', payload: { groupId, postId: data.postId, liked: true, likes: data.likesCount ?? data.likes } });
      }
    });

    socket.on('group:post-unliked', (data) => {
      if (data.groupId === groupId) {
        dispatch({ type: 'comments/unlikePost/fulfilled', payload: { groupId, postId: data.postId, liked: false, likes: data.likesCount ?? data.likes } });
      }
    });

    socket.on('group:post-comment', (data) => {
      if (data.groupId === groupId) {
        dispatch(fetchGroupPosts({ groupId, page: 1 }));
        if (data.postId && data.commentsCount > 0) {
          dispatch(fetchComments({ groupId, postId: data.postId, page: 1, limit: 50 }));
        }
      }
    });

    socket.on('group:updated', (data) => {
      if (data.groupId === groupId) {
        // Optionally refresh group detail
      }
    });

    return () => {
      socket.emit('leave:group', { groupId });
      socket.off('group:new-post');
      socket.off('group:member-joined');
      socket.off('group:post-liked');
      socket.off('group:post-unliked');
      socket.off('group:post-comment');
      socket.off('group:updated');
    };
  }, [dispatch, groupId]);

  useEffect(() => {
    if (group?.reported !== undefined) {
      setIsReported(group.reported);
    }
  }, [group?.reported]);

  useEffect(() => {
    if (rdxMembers) {
      setGdFriendIds(new Set(rdxMembers.filter(m => m.isFriend).map(m => m._id ?? m.id)));
    }
  }, [rdxMembers]);

  // Auto-fetch comments for all posts when they load
  useEffect(() => {
    if (!rdxPosts || rdxPosts.length === 0 || !groupId) return;
    rdxPosts.forEach(post => {
      dispatch(fetchComments({ groupId, postId: post._id, page: 1, limit: 50 }));
    });
  }, [rdxPosts, groupId, dispatch]);

  const GROUP_REPORT_REASONS = [
    'Spam or misleading content',
    'Hate speech or discrimination',
    'Harassment or bullying',
    'Violent or dangerous content',
    'Misinformation',
  ];

  function handleReportSubmit() {
    if (!reportSelected) return;
    dispatch(reportGroup({ groupId, reason: reportSelected })).then((result) => {
      if (reportGroup.fulfilled.match(result)) {
        setIsReported(true);
        setShowReportModal(false);
      }
      setReportDone(true);
    });
  }
  function handleReportClose() {
    setShowReportModal(false);
    setReportSelected('');
    setReportDone(false);
  }

  function handleShare() {
    setSharing(true);
    const groupName = group.name ?? 'Group';
    const groupUrl = `${window.location.origin}/groups/${groupId}`;
    const shareText = `Check out "${groupName}" on Kink Catalyst!`;

    if (navigator.share) {
      navigator.share({
        title: groupName,
        text: shareText,
        url: groupUrl,
      }).then(() => {
        dispatch(showToast({ message: 'Group shared!', type: 'success' }));
        setSharing(false);
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
        setSharing(false);
      });
    } else {
      navigator.clipboard.writeText(groupUrl).then(() => {
        dispatch(showToast({ message: 'Group link copied to clipboard!', type: 'success' }));
        setSharing(false);
      }).catch(() => {
        dispatch(showToast({ message: 'Failed to copy link', type: 'error' }));
        setSharing(false);
      });
    }
  }

  function handleLeaveConfirm() {
    dispatch(leaveGroup(groupId));
    setJoinedLocal(false);
    setPendingLocal(false);
    setShowLeaveModal(false);
    setLeaveReason('');
  }

  function navClick(id) {
    if (id === 'create')   { setCreatePostOpen(true); return; }
    if (id === 'home')     onFeedClick?.();
    if (id === 'courses')  onCoursesClick?.();
    if (id === 'library')  onLibraryClick?.();
    if (id === 'events')   onEventsClick?.();
    if (id === 'friends')  onBack?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'messages') onMessagesClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  const myId = authUser?._id ?? authUser?.id;
  const isOwned = !!myId && (group.admin === myId || group.admin?._id === myId);
  const isPrivate = group.privacy === 'private';
  // A pending join request isn't membership yet — Posts, Members, and
  // Report all stay locked until the group (or the admin, for private
  // groups) actually admits this user.
  const canViewMemberContent = (joinedLocal || isOwned) && !pendingLocal;

  // Leaving the group (or a pending request reverting) while sat on a
  // locked tab would otherwise strand the view there with no content.
  useEffect(() => {
    if (!canViewMemberContent && (detailTab === 'posts' || detailTab === 'members')) {
      setDetailTab('about');
    }
  }, [canViewMemberContent, detailTab]);

  // Resolve admin name + avatar from members list (API returns admin as ID only)
  const adminId = group.admin?._id ?? group.admin;
  const adminMember = rdxMembers?.find(m => (m._id ?? m.id) === adminId)
                   ?? rdxMembers?.find(m => m.role === 'Admin' || m.role === 'group_admin');
  const adminName   = adminMember?.name ?? (typeof group.admin === 'string' && group.admin.length < 30 ? group.admin : '—');
  const adminAvatar = adminMember?.img ?? null;

  // Format ISO date → "Jun 26, 2026"
  function fmtDate(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="gd-page">
      <AnimatedNav activeId="friends" onNavigate={navClick} />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} groupId={groupId} />}

      {/* Cover */}
      <div className="gd-cover-section">
        <div className="gd-cover">
          <img src={group.coverImg || `https://picsum.photos/seed/gd-${group._id ?? group.id}/1200/300`} alt={group.name} className="gd-cover-img" />
          <button className="gd-cover-back-btn" onClick={onBack} title="Back to Groups">
            <BackArrowIcon />
          </button>
        </div>

        {/* Profile row */}
        <div className="gd-profile-row">
          {group.groupImg
            ? <img src={group.groupImg} alt={group.name} className="gd-group-icon gd-group-icon--img" />
            : <div className="gd-group-icon" style={{ background: group.color }}>{group.iconText}</div>
          }
          <div className="gd-group-info">
            <h1 className="gd-title">{group.name}</h1>
            <p className="gd-meta">
              {group.members}
            </p>
          </div>
          <div className="gd-header-actions">
            {isOwned ? (
              <button className="gd-manage-btn" onClick={onManage}>Manage Group</button>
            ) : pendingLocal ? (
              <button className="gd-leave-btn" disabled>Pending Approval</button>
            ) : joinedLocal ? (
              <button className="gd-leave-btn" onClick={() => setShowLeaveModal(true)} disabled={isLeaving}>
                {isLeaving ? 'Leaving...' : 'Leave Group'}
              </button>
            ) : (
              <button
                className="gd-join-btn"
                onClick={() => {
                  setJoinedLocal(true);
                  dispatch(joinGroup(groupId)).then(action => {
                    if (joinGroup.fulfilled.match(action)) {
                      const isPending = action.payload.pending ?? false;
                      setJoinedLocal(action.payload.joined);
                      setPendingLocal(isPending);
                      if (isPending) {
                        dispatch(showToast({ message: 'Join request sent! Waiting for admin approval.', type: 'success' }));
                      }
                    } else if (joinGroup.rejected.match(action)) {
                      setJoinedLocal(false);
                      dispatch(showToast({ message: action.payload?.message ?? 'Failed to join group.', type: 'error' }));
                    }
                  });
                }}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </button>
            )}
            <button
              className="gd-share-btn"
              onClick={handleShare}
              disabled={sharing}
              title="Share this group with others"
            >
              <ShareIcon2 /> {sharing ? 'Sharing...' : 'Share'}
            </button>
            {!isOwned && (
              <button
                className="gd-report-btn"
                onClick={() => setShowReportModal(true)}
                disabled={isReported || !canViewMemberContent}
                title={!canViewMemberContent ? 'Join this group to report it' : undefined}
                style={{ opacity: (isReported || !canViewMemberContent) ? 0.6 : 1, cursor: (isReported || !canViewMemberContent) ? 'not-allowed' : 'pointer' }}
              >
                {isReported ? 'Reported' : 'Report'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {joinedLocal && <UserInvitations />}

      {/* Tabs + content card */}
      <div className="gd-tab-card">
      <div className="gd-tab-row">
        <button className={`gd-tab${detailTab === 'about'   ? ' gd-tab--active' : ''}`} onClick={() => setDetailTab('about')}>About</button>
        <button
          className={`gd-tab${detailTab === 'posts' ? ' gd-tab--active' : ''}${canViewMemberContent ? '' : ' gd-tab--locked'}`}
          onClick={() => canViewMemberContent && setDetailTab('posts')}
          disabled={!canViewMemberContent}
          title={canViewMemberContent ? undefined : 'Join this group to see posts'}
        >
          Posts{!canViewMemberContent && <LockIcon />}
        </button>
        <button
          className={`gd-tab${detailTab === 'members' ? ' gd-tab--active' : ''}${canViewMemberContent ? '' : ' gd-tab--locked'}`}
          onClick={() => canViewMemberContent && setDetailTab('members')}
          disabled={!canViewMemberContent}
          title={canViewMemberContent ? undefined : 'Join this group to see members'}
        >
          Members{!canViewMemberContent && <LockIcon />}
        </button>
      </div>

      {/* Body */}
      <div className="gd-body">

        {/* ── About tab ── */}
        {detailTab === 'about' && (
          <>
            <div className="gd-main">
              <div className="adm-about-main">

                <div className="adm-about-card">
                  <div className="adm-about-card-head">
                    <span className="adm-about-icon adm-about-icon--blue"><InfoCircleIcon /></span>
                    <span className="adm-about-card-title">About this Group</span>
                  </div>
                  <p className="adm-about-body">
                    {aboutExpanded || (group.description ?? '').length <= 300
                      ? group.description
                      : (group.description ?? '').slice(0, 300) + '…'
                    }
                    {(group.description ?? '').length > 300 && (
                      <>
                        {' '}
                        <button
                          onClick={() => setAboutExpanded(!aboutExpanded)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline',
                          }}
                        >
                          {aboutExpanded ? 'See less' : 'See more'}
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <div className="adm-about-card">
                  <div className="adm-about-card-head">
                    <span className="adm-about-icon adm-about-icon--purple"><TrendingUpIcon /></span>
                    <span className="adm-about-card-title">Group Mission</span>
                  </div>
                  <p className="adm-about-body">{group.mission || 'No mission statement defined.'}</p>
                </div>

                <div className="adm-about-meta-grid">
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Admin</span>
                    <div className="adm-about-meta-val-row">
                      {adminAvatar
                        ? <img src={adminAvatar} alt={adminName} className="adm-about-admin-av" />
                        : <div className="adm-about-admin-av" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials(adminName)}</div>
                      }
                      <span className="adm-about-meta-value">{adminName}</span>
                    </div>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Privacy</span>
                    <div className="adm-about-meta-val-row">
                      {isPrivate
                        ? <><LockIcon /><span className="adm-about-meta-value">Private</span></>
                        : <><GlobeIcon /><span className="adm-about-meta-value">Public</span></>
                      }
                    </div>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Category</span>
                    <span className="adm-about-meta-value">{group.category || '—'}</span>
                  </div>
                  <div className="adm-about-meta-card">
                    <span className="adm-about-meta-label">Created</span>
                    <span className="adm-about-meta-value">{fmtDate(group.createdAt)}</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="gd-sidebar">

              <div className="gd-card">
                <h3 className="gd-card-title">Group Info</h3>
                <div className="gd-info-rows">
                  <div className="gd-info-row">
                    {isPrivate ? <LockIcon /> : <GlobeIcon />}
                    <div>
                      <p className="gd-info-sub">{isPrivate ? 'Only members can see posts' : 'Anyone can view and join'}</p>
                      <p className="gd-info-label">{isPrivate ? 'Private Group' : 'Public Group'}</p>
                    </div>
                  </div>
                  <div className="gd-info-row">
                    <UsersIcon />
                    <div>
                      <p className="gd-info-sub">Total members</p>
                      <p className="gd-info-label">{group.members}</p>
                    </div>
                  </div>
                  {group.createdAt && (
                    <div className="gd-info-row">
                      <InfoCircleIcon />
                      <div>
                        <p className="gd-info-sub">Group history</p>
                        <p className="gd-info-label">Created {fmtDate(group.createdAt)}</p>
                      </div>
                    </div>
                  )}
                  {adminName && adminName !== '—' && (
                    <div className="gd-info-row">
                      <OrganizerIcon />
                      <div>
                        <p className="gd-info-sub">Group Admin</p>
                        <p className="gd-info-label">{adminName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Posts tab ── */}
        {detailTab === 'posts' && (
          <div className="gd-main">
          {!canViewMemberContent ? (
            <div className="gd-locked-notice">
              <LockIcon />
              <p>Join this group to see and create posts.</p>
            </div>
          ) : (
          <>
            {/* Create post compose box — only for members */}
            <div className="gd-compose-box" onClick={() => setCreatePostOpen(true)}>
                <div className="gd-compose-input-fake">
                  <span>Write something to the group...</span>
                </div>
                <div className="gd-compose-actions">
                  <button type="button" className="gd-compose-btn" onClick={e => { e.stopPropagation(); setCreatePostOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    Photo
                  </button>
                  <button type="button" className="gd-compose-btn" onClick={e => { e.stopPropagation(); setCreatePostOpen(true); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    Video
                  </button>
                </div>
            </div>

            {rdxPosts === null && <p style={{ padding: 24, color: '#94a3b8' }}>Loading posts...</p>}
            {rdxPosts?.map(p => {
              const pid = p._id ?? p.id;
              const isPostAuthor = (authUser?._id ?? authUser?.id) === (p.author?._id ?? p.author?.id);
              const isPinned = pinnedPosts[pid] ?? false;
              const isDeleting = deletingPostIds.includes(pid);
              const isPinning = pinningPostIds.includes(pid);

              return (
                <div key={pid} className={`gd-post-wrapper ${isPinned ? 'pinned' : ''}`}>
                  {isPinned && <div className="gd-post-pinned-badge">📌 Pinned</div>}
                  <div className="gd-post-header">
                    <PostCard post={p} groupId={groupId} />
                    <PostActionsMenu
                      isAuthor={isPostAuthor}
                      isAdmin={isOwned}
                      isPinned={isPinned}
                      onDelete={() => {
                        dispatch(deletePost({ groupId, postId: pid })).then((action) => {
                          if (deletePost.fulfilled.match(action)) {
                            dispatch(fetchGroupPosts({ groupId, page: 1 }));
                            dispatch(showToast({ message: 'Post deleted', type: 'success' }));
                          }
                        });
                      }}
                      onEdit={() => {}}
                      onPin={() => dispatch(pinPost({ groupId, postId: pid }))}
                      onUnpin={() => dispatch(unpinPost({ groupId, postId: pid }))}
                      isDeleting={isDeleting}
                      isPinning={isPinning}
                    />
                  </div>
                </div>
              );
            })}
            {rdxPosts?.length === 0 && (
              <p style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>
                No posts yet. Be the first to post!
              </p>
            )}
          </>
          )}
          </div>
        )}

        {/* ── Members tab ── */}
        {detailTab === 'members' && (
          <div className="gd-members-section">
          {!canViewMemberContent ? (
            <div className="gd-locked-notice">
              <LockIcon />
              <p>Join this group to see its members.</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>DATE JOINED</th>
                  <th>ROLE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {rdxMembers === null && (
                  <tr><td colSpan={4} style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>Loading members...</td></tr>
                )}
                {rdxMembers?.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>No members found.</td></tr>
                )}
                {(rdxMembers ?? []).map(m => {
                  const mid = m._id ?? m.id;
                  const isSelf = mid === myId;
                  const isAdmin = m.role === 'Admin' || m.role === 'group_admin';
                  const isFriendOrRequested = gdFriendIds.has(mid) || friendRequestIds.includes(mid);
                  return (
                  <tr key={mid}>
                    <td>
                      <div className="adm-member-cell" onClick={() => onUserClick?.(mid)} style={{ cursor: 'pointer' }}>
                        {m.img
                          ? <img src={m.img} alt={m.name} className="adm-member-avatar" />
                          : <div className="adm-member-avatar" style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials(m.name ?? '')}</div>
                        }
                        <div>
                          <p className="adm-member-name">{m.name}</p>
                          {m.location && (
                            <span className="gd-member-location"><PinIcon /> {m.location}</span>
                          )}
                          <div className="prof-conn-shared" style={{ marginTop: '2px' }}>
                            <div className="prof-conn-shared-avatars">
                              {(m.sharedAvatars ?? []).slice(0, 3).map((src, i) => (
                                <img key={i} src={src} alt="" className="prof-conn-shared-dot" />
                              ))}
                            </div>
                            <span className="adm-member-mutual">
                              {(m.mutual ?? 0) > 0 ? `${m.mutual} mutual connections` : 'New to your network'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="adm-date-cell">{m.joined}</td>
                    <td><span className="adm-member-mutual" style={{ textTransform: 'capitalize' }}>{normalizeRole(m.role)}</span></td>
                    <td>
                      <div className="adm-action-cell">
                        {!isSelf && (
                          friendRequestIds.includes(mid) ? (
                            <button className="prof-conn-btn prof-conn-btn--pending" disabled>
                              Request Pending
                            </button>
                          ) : gdFriendIds.has(mid) ? (
                            <button
                              className="prof-conn-btn prof-conn-btn--msg"
                              onClick={() => {
                                dispatch(startDM(mid));
                                onMessagesClick?.();
                              }}
                            >Chat</button>
                          ) : (
                            <button
                              className="prof-conn-btn prof-conn-btn--add"
                              onClick={() => {
                                dispatch(sendFriendRequest(mid));
                              }}
                            >Add Friend</button>
                          )
                        )}
                        {/* Only group admin can remove; cannot remove themselves or another admin */}
                        {isOwned && !isSelf && !isAdmin && (
                          <button
                            className="prof-conn-btn prof-conn-btn--remove"
                            onClick={() => dispatch(removeMember({ groupId, memberId: mid }))}
                          >Remove</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          </div>
        )}

      </div>
      </div>{/* /gd-tab-card */}

      {/* Report Group Modal */}
      {showReportModal && (
        <div className="report-overlay" onClick={e => { if (e.target === e.currentTarget) handleReportClose(); }}>
          <div className="report-modal">
            <div className="report-modal-header">
              <h2 className="report-modal-title">Report Group</h2>
              <button className="report-close-btn" onClick={handleReportClose}>✕</button>
            </div>
            {reportDone ? (
              <div className="report-success">
                <div className="report-success-icon">✓</div>
                <p>Thank you for your report. We'll review it and take action if it violates our community guidelines.</p>
                <button className="report-success-close" onClick={handleReportClose}>Done</button>
              </div>
            ) : (
              <>
                <div className="report-modal-body">
                  <h3 className="report-question">What's going on?</h3>
                  <p className="report-subtitle">We'll check for all community guidelines, so don't worry about making the perfect choice.</p>
                  <ul className="report-reasons">
                    {GROUP_REPORT_REASONS.map(reason => (
                      <li key={reason} className="report-reason-item">
                        <label className="report-reason-label">
                          <span className={`report-radio${reportSelected === reason ? ' report-radio--checked' : ''}`} />
                          <input
                            type="radio"
                            name="group-report-reason"
                            value={reason}
                            checked={reportSelected === reason}
                            onChange={() => setReportSelected(reason)}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                          />
                          <span className="report-reason-text">{reason}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="report-modal-footer">
                  <button className="report-submit-btn" onClick={handleReportSubmit} disabled={!reportSelected}>Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Leave Group Modal */}
      {showLeaveModal && (
        <div className="lgm-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="lgm-box" onClick={e => e.stopPropagation()}>
            <h2 className="lgm-title">Leave Group</h2>
            <p className="lgm-desc">Are you sure you want to leave <strong>{group.name}</strong>? You'll lose access to all group content.</p>
            <label className="lgm-label">Reason for leaving <span className="lgm-optional">(optional)</span></label>
            <textarea
              className="lgm-textarea"
              placeholder="Tell us why you're leaving..."
              value={leaveReason}
              onChange={e => setLeaveReason(e.target.value)}
              rows={3}
            />
            <div className="lgm-actions">
              <button className="lgm-cancel-btn" onClick={() => setShowLeaveModal(false)}>Cancel</button>
              <button className="lgm-confirm-btn" onClick={handleLeaveConfirm}>Leave Group</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function OrganizerIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }

/* ── Group Hub Card ── */
function GroupHubCard({ group, onManage, onView, isOwned }) {
  const dispatch = useDispatch();
  const { joiningIds } = useSelector(s => s.groups);
  const groupId = group._id ?? group.id;
  const [joined,  setJoined]  = useState(group.joined  || false);
  const [pending, setPending] = useState(group.pending || false);
  const isJoining = joiningIds.includes(groupId);

  // Sync when group prop refreshes (e.g. after re-fetch on back from detail)
  useEffect(() => {
    setJoined(group.joined  || false);
    setPending(group.pending || false);
  }, [group.joined, group.pending]);

  function handleJoin(e) {
    e.stopPropagation();
    if (joined || pending || isJoining) return;
    setJoined(true);
    dispatch(joinGroup(groupId)).then(action => {
      if (joinGroup.fulfilled.match(action)) {
        const isPending = action.payload.pending ?? false;
        setJoined(action.payload.joined);
        setPending(isPending);
        if (isPending) {
          dispatch(showToast({ message: 'Join request sent! Waiting for admin approval.', type: 'success' }));
        }
      } else if (joinGroup.rejected.match(action)) {
        setJoined(false);
        dispatch(showToast({ message: action.payload?.message ?? 'Failed to join group.', type: 'error' }));
      }
    });
  }

  const btnLabel = isJoining ? 'Joining...' : pending ? 'Pending' : joined ? 'Joined' : 'Join Group';
  const coverSrc = group.coverImg || group.coverUrl || `https://picsum.photos/seed/hub-${groupId}/400/200`;
  const pendingReqs = group.pendingReqs ?? group.pendingCount ?? 0;

  return (
    <div className={`hub-card${isOwned ? '' : ' hub-card--clickable'}`} onClick={isOwned ? undefined : onView}>
      <div className="hub-card-cover">
        <img src={coverSrc} alt={group.name} className="hub-card-cover-img" />
        <span className="hub-card-badge">{group.category}</span>
      </div>
      <div className="hub-card-icon-wrap">
        {group.groupImg
          ? <img src={group.groupImg} alt={group.name} className="hub-card-icon hub-card-icon--img" />
          : <div className="hub-card-icon" style={{ background: group.color ?? '#3b82f6' }}>{group.iconText ?? (group.name?.[0] ?? '?')}</div>
        }
      </div>
      <div className="hub-card-body">
        <p className="hub-card-name">{group.name}</p>

        {isOwned ? (
          <>
            <div className="hub-card-stats">
              <div className="hub-card-stat">
                <span className="hub-card-stat-value">{(group.memberCount ?? 0).toLocaleString()}</span>
                <span className="hub-card-stat-label">Active Members</span>
              </div>
              {group.privacy === 'private' && (
                <>
                  <div className="hub-card-stat-div" />
                  <div className="hub-card-stat">
                    <span className={`hub-card-stat-value${pendingReqs > 0 ? ' hub-card-stat-value--alert' : ''}`}>
                      {pendingReqs}
                    </span>
                    <span className="hub-card-stat-label">Pending Requests</span>
                  </div>
                </>
              )}
            </div>
            <button className="hub-card-manage" onClick={e => { e.stopPropagation(); onManage?.(); }}>
              Manage Group
            </button>
          </>
        ) : (
          <>
            <div className="hub-card-conn-members">
              <div className="prof-conn-shared-avatars">
                {(group.memberAvatars || []).map((src, i) => (
                  <img key={i} src={src} alt="" className="prof-conn-shared-dot" />
                ))}
              </div>
              <span className="prof-conn-shared-text">{group.members ?? group.memberCount?.toLocaleString()}</span>
            </div>
            <button
              className={`hub-card-join${(joined || pending) ? ' hub-card-join--joined' : ''}`}
              onClick={handleJoin}
              disabled={isJoining || joined || pending}
            >
              {btnLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Create Group Modal ── */
function CreateGroupModal({ onClose }) {
  const [groupName,     setGroupName]     = useState('');
  const [description,   setDescription]   = useState('');
  const [privacy,       setPrivacy]       = useState('public');
  const [selected,      setSelected]      = useState([]);
  const [contactSearch, setContactSearch] = useState('');

  function toggleContact(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  const filtered = MODAL_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="grp-overlay" onClick={onClose}>
      <div className="grp-modal" onClick={e => e.stopPropagation()}>
        <div className="grp-modal-header">
          <div>
            <h2 className="grp-modal-title">Create New Group</h2>
            <p className="grp-modal-subtitle">Build a community around your interest.</p>
          </div>
          <button className="grp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="grp-modal-body">
          <div className="grp-form-row">
            <div className="grp-img-upload"><CameraIcon /><span className="grp-img-badge"><CheckSmIcon /></span></div>
            <div className="grp-form-fields">
              <div className="grp-field">
                <label className="grp-label">Group Name</label>
                <input className="grp-input" placeholder="Enter group name..." value={groupName} onChange={e => setGroupName(e.target.value)} />
              </div>
              <div className="grp-field">
                <label className="grp-label">Description (Optional)</label>
                <textarea className="grp-textarea" placeholder="What's this group about?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <div className="grp-privacy-row">
            <span className="grp-privacy-label">Privacy</span>
            <div className="grp-privacy-toggle">
              <button type="button" className={`grp-privacy-btn${privacy === 'public'  ? ' grp-privacy-btn--active' : ''}`} onClick={() => setPrivacy('public')}><GlobeIcon /> Public</button>
              <button type="button" className={`grp-privacy-btn${privacy === 'private' ? ' grp-privacy-btn--active' : ''}`} onClick={() => setPrivacy('private')}><LockIcon /> Private</button>
            </div>
          </div>
          <div className="grp-contacts-section">
            <div className="grp-contacts-header">
              <span className="grp-contacts-title">Suggested Contacts</span>
              <div className="grp-contacts-right">
                <div className="grp-search-wrap"><SearchIcon /><input className="grp-contact-search" placeholder="Search..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} /></div>
                <button className="grp-select-all" onClick={() => setSelected(MODAL_CONTACTS.map(c => c.id))}>Select All</button>
              </div>
            </div>
            <div className="grp-contact-list">
              {filtered.map(c => {
                const checked = selected.includes(c.id);
                return (
                  <div key={c.id} className={`grp-contact-item${checked ? ' grp-contact-item--selected' : ''}`} onClick={() => toggleContact(c.id)}>
                    <div className="grp-contact-avatar" style={{ background: c.color }}>{initials(c.name)}</div>
                    <div className="grp-contact-info">
                      <p className="grp-contact-name">{c.name}</p>
                      <p className="grp-contact-role">{c.role}</p>
                    </div>
                    <div className={`grp-checkbox${checked ? ' grp-checkbox--checked' : ''}`}>{checked && <CheckSmIcon />}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grp-modal-footer">
          <button className="grp-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="grp-submit-btn">Create Group <ArrowRightIcon /></button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   Main Component
══════════════════════════ */
export default function GroupsPage({ onBack, onEventsClick, onCalendarClick, onMessagesClick, onLibraryClick, onCoursesClick, onMinisitesClick, initialGroupId, onInitGroupConsumed, startCreate, onViewStateChange }) {
  const dispatch = useDispatch();
  const { groups, groupsLoading, groupsTab } = useSelector(s => s.groups);
  const { user: authUser } = useSelector(s => s.auth);
  const myId = authUser?._id ?? authUser?.id;

  const [showCreate,     setShowCreate]     = useState(startCreate || false);
  const [showAdmin,      setShowAdmin]      = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [showDetail,     setShowDetail]     = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [adminGroup,     setAdminGroup]     = useState(null);
  const [detailGroup,    setDetailGroup]    = useState(null);
  const [detailFromHome, setDetailFromHome] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [hubTab,         setHubTab]         = useState('suggested');
  const [hubCat,         setHubCat]         = useState('All');

  useEffect(() => {
    dispatch(fetchGroups({ tab: hubTab, category: hubCat === 'All' ? '' : hubCat }));
  }, [dispatch, hubTab, hubCat]);

  // Handle user profile navigation
  useEffect(() => {
    if (showUserProfile && selectedUserId) {
      // For now, just log - wire to ProfilePage navigation when available
      console.log('Viewing user profile:', selectedUserId);
      // TODO: Navigate to user profile page or show profile modal
    }
  }, [showUserProfile, selectedUserId]);

  // Search keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Socket listeners for hub updates (group created, member joined, etc.)
  useEffect(() => {
    const socket = io();
    socket.emit('join-room', 'groups-hub');

    socket.on('group:created', (data) => {
      // Refresh groups to show newly created group
      dispatch(fetchGroups({ tab: hubTab, category: hubCat === 'All' ? '' : hubCat }));
    });

    socket.on('group:member-count-changed', (data) => {
      // Update specific group's member count
      dispatch(fetchGroups({ tab: hubTab, category: hubCat === 'All' ? '' : hubCat }));
    });

    return () => {
      socket.emit('leave-room', 'groups-hub');
      socket.off('group:created');
      socket.off('group:member-count-changed');
    };
  }, [dispatch, hubTab, hubCat]);

  useEffect(() => {
    if (!initialGroupId) return;
    const found = groups.find(g => (g._id ?? g.id) === initialGroupId);
    if (found) {
      setDetailGroup(found);
      setShowDetail(true);
      setDetailFromHome(true);
    }
    onInitGroupConsumed?.();
  }, [initialGroupId, groups]);

  // Report the currently-open group/create-flow up to HomePage so it can
  // keep the URL in sync (?section=groups&id=&create=) for refresh restore.
  useEffect(() => {
    onViewStateChange?.({
      groupId: showDetail ? (detailGroup?._id ?? detailGroup?.id ?? null) : null,
      createOpen: showCreate,
    });
  }, [showDetail, detailGroup, showCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (showCreate) {
    return (
      <CreateGroupPage
        onBack={() => setShowCreate(false)}
        onFeedClick={onBack}
        onEventsClick={onEventsClick}
        onCalendarClick={onCalendarClick}
        onMessagesClick={onMessagesClick}
        onLibraryClick={onLibraryClick}
        onCoursesClick={onCoursesClick}
        onMinisitesClick={onMinisitesClick}
        onCreateGroup={createdGroup => { setShowCreate(false); setAdminGroup(createdGroup); setShowAdmin(true); }}
      />
    );
  }

  if (showModeration) {
    return (
      <CommunityModerationPage
        group={adminGroup}
        onBack={() => setShowModeration(false)}
        onFeedClick={onBack}
        onEventsClick={onEventsClick}
        onCalendarClick={onCalendarClick}
        onMessagesClick={onMessagesClick}
        onLibraryClick={onLibraryClick}
        onCoursesClick={onCoursesClick}
        onMinisitesClick={onMinisitesClick}
      />
    );
  }

  if (showAdmin) {
    return (
      <GroupAdminDashboard
        group={adminGroup}
        onBack={() => setShowAdmin(false)}
        onFeedClick={onBack}
        onEventsClick={onEventsClick}
        onCalendarClick={onCalendarClick}
        onMessagesClick={onMessagesClick}
        onLibraryClick={onLibraryClick}
        onCoursesClick={onCoursesClick}
        onMinisitesClick={onMinisitesClick}
        onModerationClick={() => setShowModeration(true)}
      />
    );
  }

  if (showUserProfile && selectedUserId) {
    return (
      <UserProfilePage
        userId={selectedUserId}
        onBack={() => {
          setShowUserProfile(false);
          setSelectedUserId(null);
        }}
        onMessageUser={onMessagesClick}
        onEventsClick={onEventsClick}
        onEventsCreateClick={() => {}}
        onGroupsClick={() => setShowUserProfile(false)}
        onCoursesClick={onCoursesClick}
        onLibraryClick={onLibraryClick}
        onMinisitesClick={onMinisitesClick}
        onUserClick={(userId) => setSelectedUserId(userId)}
        onEventClick={() => {}}
      />
    );
  }

  if (showDetail) {
    return (
      <GroupDetailPage
        group={detailGroup}
        onBack={() => {
          setShowDetail(false);
          // Re-fetch so hub reflects any join/leave done inside detail page
          dispatch(fetchGroups({ tab: hubTab, category: hubCat === 'All' ? '' : hubCat }));
          if (detailFromHome) onBack?.();
        }}
        onManage={() => { setAdminGroup(detailGroup); setShowDetail(false); setShowAdmin(true); }}
        onUserClick={(userId) => {
          setShowDetail(false);
          setSelectedUserId(userId);
          setShowUserProfile(true);
        }}
        onFeedClick={onBack}
        onEventsClick={onEventsClick}
        onCalendarClick={onCalendarClick}
        onMessagesClick={onMessagesClick}
        onLibraryClick={onLibraryClick}
        onCoursesClick={onCoursesClick}
        onMinisitesClick={onMinisitesClick}
      />
    );
  }

  function navClick(id) {
    if (id === 'create')   { setCreatePostOpen(true); return; }
    if (id === 'home')     onBack?.();
    if (id === 'courses')  onCoursesClick?.();
    if (id === 'library')  onLibraryClick?.();
    if (id === 'events')   onEventsClick?.();
    if (id === 'calendar')  onCalendarClick?.();
    if (id === 'messages')  onMessagesClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  // Show API groups only when they belong to the current tab
  const displayGroups = (groupsTab === hubTab) ? groups : [];

  return (
    <div className="grp-page">

      <AnimatedNav activeId="friends" onNavigate={navClick} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="grp-hub-main">

        {/* Header: tabs + create button */}
        <div className="grp-hub-top">
          <div className="grp-hub-tabs">
            <button className={`grp-hub-tab${hubTab === 'suggested' ? ' grp-hub-tab--active' : ''}`} onClick={() => setHubTab('suggested')}>Suggested Groups</button>
            <button className={`grp-hub-tab${hubTab === 'yours'     ? ' grp-hub-tab--active' : ''}`} onClick={() => setHubTab('yours')}>My Created Groups</button>
            <button className={`grp-hub-tab${hubTab === 'joined'    ? ' grp-hub-tab--active' : ''}`} onClick={() => setHubTab('joined')}>Joined Groups</button>
          </div>
          <button className="grp-hub-create-btn" onClick={() => setShowCreate(true)}>
            <PlusIcon /> Create Group
          </button>
        </div>

        {/* Category chips */}
        <div className="grp-hub-cats">
          {HUB_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`grp-hub-cat${hubCat === cat ? ' grp-hub-cat--active' : ''}`}
              onClick={() => setHubCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Group cards grid */}
        <div className="grp-hub-grid">
          {groupsLoading && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Loader inline />
            </div>
          )}
          {!groupsLoading && displayGroups.map(g => {
            const gOwned = !!myId && (g.admin === myId || g.admin?._id === myId);
            return (
              <GroupHubCard
                key={g._id ?? g.id}
                group={g}
                isOwned={gOwned}
                onView={() => { setDetailGroup(g); setShowDetail(true); }}
                onManage={gOwned ? () => { setAdminGroup(g); setShowAdmin(true); } : undefined}
              />
            );
          })}
          {!groupsLoading && displayGroups.length === 0 && (
            <div className="grp-hub-empty-state">
              <p className="grp-hub-empty-title">
                {hubTab === 'yours'   ? 'You haven\'t created any groups yet' :
                 hubTab === 'joined'  ? 'You haven\'t joined any groups yet'  :
                                        'No groups found'}
              </p>
              <p className="grp-hub-empty-sub">
                {hubTab === 'yours'  ? 'Create your first group to build a community around your interests.' :
                 hubTab === 'joined' ? 'Explore suggested groups and join ones that match your interests.'    :
                                       'Try a different category or check back later.'}
              </p>
              {hubTab !== 'suggested' && (
                <button className="grp-hub-empty-cta" onClick={() => hubTab === 'yours' ? setShowCreate(true) : setHubTab('suggested')}>
                  {hubTab === 'yours' ? 'Create Group' : 'Browse Suggested'}
                </button>
              )}
            </div>
          )}
        </div>

      </main>

      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}

    </div>
  );
}
