import { useDispatch } from 'react-redux';
import { joinGroup } from '../../store/slices/groupsSlice';
import './GroupCard.css';

function ShareIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}

function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
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

  const handleJoin = () => {
    dispatch(joinGroup(group._id)).then(action => {
      if (joinGroup.fulfilled.match(action)) {
        if (onJoin) onJoin(group._id);
      }
    });
  };

  return (
    <div className="gc-card">
      {/* Cover Image */}
      <div className="gc-cover" style={{ backgroundImage: `url(${group.coverImage || 'https://via.placeholder.com/400x200?text=Group'})` }}>
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

        {/* Actions */}
        <div className="gc-actions">
          <button className="gc-btn gc-btn--join" onClick={handleJoin}>
            Join Group
          </button>
          <button className="gc-btn gc-btn--details" onClick={() => onDetails?.(group._id)}>
            Details
          </button>
          <button className="gc-btn gc-btn--share" onClick={() => onShare?.(group)} title="Share group">
            <ShareIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
