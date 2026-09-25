import { useDispatch } from 'react-redux';
import { joinGroup } from '../../store/slices/groupsSlice';
import SkeletonImg from '../SkeletonImg';
import './GroupCard.css';

function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
}

function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}

const TYPE_CONFIG = {
  public: { label: 'Public', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  private: { label: 'Private', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  vetted: { label: 'Vetted', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

export default function GroupCard({ group, onJoin, onDetails, onShare }) {
  const dispatch = useDispatch();
  const groupType = group.groupType || 'public';
  const typeConfig = TYPE_CONFIG[groupType] || TYPE_CONFIG.public;
  const authorName = group.admin?.fullName || 'Group admin';
  const authorAvatar = group.admin?.avatar?.startsWith?.('http') ? group.admin.avatar : '';
  const authorInitials = authorName.split(' ').map(part => part[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

  const handleOpenGroup = () => {
    onDetails?.(group._id);
  };

  return (
    <div className="gc-card">
      {/* Cover Image - fallback to group profile photo */}
      <div className="gc-cover" style={{ backgroundImage: `url(${group.coverImg || group.groupImg || group.coverImage || group.profileImage || 'https://via.placeholder.com/400x200?text=Group'})` }}>
        <div className="gc-overlay" />
      </div>

      {/* Content */}
      <div className="gc-content">
        {/* Header with type badge */}
        <div className="gc-header">
          <h3 className="gc-name">{group.name}</h3>
          <span className="gc-type" style={{ color: typeConfig.color, background: typeConfig.bg }}>
            {typeConfig.label}
          </span>
        </div>

        <div className="gc-author">
          <div className="gc-author-avatar">
            {authorAvatar
              ? <SkeletonImg src={authorAvatar} alt={authorName} fallback={<span>{authorInitials}</span>} />
              : authorInitials}
          </div>
          <span className="gc-author-name">{authorName}</span>
        </div>

        {/* Category and Description */}
        <p className="gc-category">{group.category || 'General'}</p>
        {group.description && (
          <p className="gc-desc">{group.description.slice(0, 80)}...</p>
        )}

        {/* Members count */}
        <div className="gc-members">
          <UsersIcon />
          <span>{group.memberCount || 0} members</span>
        </div>

        {/* Actions - Match event card style (both open group details) */}
        <div className="post-actions">
          <button className="post-action-btn" onClick={handleOpenGroup}>
            Join Group
          </button>
          <div className="post-action-sep" />
          <button className="post-action-btn" onClick={handleOpenGroup}>
            <InfoIcon /> Details
          </button>
          <div className="post-action-sep" />
          <button className="post-action-btn" onClick={() => onShare?.(group)} title="Share group">
            <ShareIcon /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
