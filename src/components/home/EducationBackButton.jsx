import './EducationBackButton.css';

// Shared back button for the whole Education module, matching the Create
// Group page's circular icon-only back button (.cg-back-btn in
// GroupsPage.css) so navigation looks consistent across the app instead of
// each Education page having its own ad-hoc "← Back to X" text link.
export default function EducationBackButton({ onClick, label = 'Back', className = '' }) {
  return (
    <button type="button" className={`edu-back-btn${className ? ` ${className}` : ''}`} onClick={onClick} aria-label={label} title={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
    </button>
  );
}
