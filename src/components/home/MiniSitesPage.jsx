import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AnimatedNav from './AnimatedNav';
import CreateNewSitePage from './CreateNewSitePage';
import SiteBuilderPage from './SiteBuilderPage';
import OrganizationRegistrationForm from './OrganizationRegistrationForm';
import OrganizationLoginForm from './OrganizationLoginForm';
import CommunitiesPage from './CommunitiesPage';
import CommunityManagementPanel from './CommunityManagementPanel';
import CommunityDashboard from './CommunityDashboard';
import MiniSitesLanding from './MiniSitesLanding';
import SiteManagementPage from './SiteManagementPage';
import Loader from '../Loader';
import SiteAnalyticsModal from './SiteAnalyticsModal';
import { ALEX_AVATAR } from './mockData';
import { apiRequest } from '../../services/api';
import { normalizeSite, timeAgo, siteUrl, displayUrl } from './miniSiteUtils';
import { SITE_TEMPLATES } from './templateContent';
import { ImageCarousel } from './MiniSiteCard';
import './MiniSiteCard.css';
import './MiniSitesPage.css';

/* ── Icons ── */
function GlobeIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function PlusIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function EyeIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function BarChartIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function LinkIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function DotsIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>; }
function FlagIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }
function UsersIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function LiveDotIcon() { return <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>; }
function PublishIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>; }
function UnpublishIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>; }
function AlertTriangleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function InboxIcon() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>; }
function LockIcon()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>; }
function KeyIcon()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L18 10"/></svg>; }
function BackArrowIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }

const VISIBILITY_META = {
  public:   { Icon: GlobeIcon, label: 'Public' },
  private:  { Icon: LockIcon,  label: 'Private' },
  password: { Icon: KeyIcon,   label: 'Password protected' },
};

function VisibilityBadge({ visibility }) {
  const meta = VISIBILITY_META[visibility] || VISIBILITY_META.private;
  const { Icon, label } = meta;
  return (
    <div className={`ms-visibility-badge ms-visibility-badge--${visibility}`} title={label}>
      <Icon /> {label}
    </div>
  );
}

// normalizeSite() exposes both a singular `coverImage` and a `coverImages`
// array — the array is the real per-site gallery a user uploads, so it
// takes priority; `coverImage` is only a single-image fallback for sites
// saved before the gallery field existed.
function siteImages(site) {
  if (site.coverImages?.length) return site.coverImages;
  return site.coverImage ? [site.coverImage] : [];
}

const TABS = [
  { id: 'my-sites',      label: 'My Sites' },
];

const JOINED_COMMUNITIES_DEMO = [
  {
    id: 'joined-1',
    name: 'Tech Innovators',
    description: 'A community for tech enthusiasts and innovators',
    memberCount: 234,
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop',
    joinedDate: '2026-08-15',
    type: 'Community',
  },
  {
    id: 'joined-2',
    name: 'Design Collective',
    description: 'Designers sharing ideas and collaborating on projects',
    memberCount: 189,
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop',
    joinedDate: '2026-08-10',
    type: 'Club',
  },
  {
    id: 'joined-3',
    name: 'Business Network',
    description: 'Connecting entrepreneurs and business professionals',
    memberCount: 456,
    cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop',
    joinedDate: '2026-08-05',
    type: 'Business',
  },
];

const JOINED_FILTER_TYPES = [
  { label: 'All' },
  { label: 'Club' },
  { label: 'Organization' },
  { label: 'Community' },
  { label: 'Business' },
  { label: 'Non-profit' },
  { label: 'Other' },
];

const REPORT_REASONS = [
  { value: 'spam',          label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'copyright',     label: 'Copyright violation' },
  { value: 'other',         label: 'Other' },
];

function ReportSiteModal({ site, authToken, onClose, onReported }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiRequest(`/api/mini-sites/public/${site.slug}/report`, {
        method: 'POST',
        token: authToken,
        body: { reason, description: details },
      });
      onReported(site.id);
      onClose();
    } catch (err) {
      setError(err.status === 404 ? "Reporting isn't available yet — coming soon." : (err.message || 'Failed to submit report'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ms-report-overlay" onClick={onClose}>
      <form className="ms-report-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="ms-report-title">Report "{site.name}"</h3>
        <label className="ms-report-label">Reason</label>
        <select className="ms-report-select" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REPORT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <label className="ms-report-label">Details (optional)</label>
        <textarea
          className="ms-report-textarea"
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add any extra context…"
        />
        {error && <p className="ms-report-error">{error}</p>}
        <div className="ms-report-actions">
          <button type="button" className="ms-action-btn ms-action-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="ms-action-btn ms-action-btn--report" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirmModal({ site, onCancel, onConfirm }) {
  return (
    <div className="ms-delete-overlay" onClick={onCancel}>
      <div className="ms-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ms-delete-icon"><AlertTriangleIcon /></div>
        <h3 className="ms-delete-title">Delete "{site.name}"?</h3>
        <p className="ms-delete-sub">This can't be undone. The site and all its content will be permanently removed.</p>
        <div className="ms-delete-actions">
          <button type="button" className="ms-action-btn ms-action-btn--secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="ms-delete-confirm-btn" onClick={() => onConfirm(site)}>
            <TrashIcon /> Delete Site
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders a small live mockup of a template's navbar+hero — using the
// template's actual copy and the chosen theme's real colors — instead of an
// unrelated stock photo, so the card shows what you'd actually get.
function TemplatePreview({ tpl, theme }) {
  const sections = useMemo(() => tpl.buildSections(theme), [tpl, theme]);
  const navbar = sections.find(s => s.type === 'navbar')?.content || {};
  const hero = sections.find(s => s.type === 'hero')?.content || {};

  return (
    <div className="ms-tpl-preview" style={{ background: theme.dark, color: theme.darkText }}>
      <div className="ms-tpl-preview-glow" style={{ background: theme.accent }} />
      <div className="ms-tpl-preview-nav">
        <span className="ms-tpl-preview-logo">{navbar.logoText}</span>
        <span className="ms-tpl-preview-navdots">
          {(navbar.links || []).slice(0, 3).map((_, i) => <i key={i} />)}
        </span>
        {navbar.ctaText && (
          <span className="ms-tpl-preview-navcta" style={{ background: theme.accent, color: theme.dark }}>{navbar.ctaText}</span>
        )}
      </div>
      <div className="ms-tpl-preview-hero">
        <span className="ms-tpl-preview-icon">{hero.icon}</span>
        <p className="ms-tpl-preview-headline">{hero.headline}</p>
        <p className="ms-tpl-preview-sub">{hero.subheadline}</p>
        <div className="ms-tpl-preview-btns">
          {hero.primaryButtonText && (
            <span className="ms-tpl-preview-btn-primary" style={{ background: theme.accent, color: theme.dark }}>{hero.primaryButtonText}</span>
          )}
          {hero.secondaryButtonText && (
            <span className="ms-tpl-preview-btn-secondary" style={{ borderColor: theme.accent2 }}>{hero.secondaryButtonText}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MiniSitesPage({
  onBack, onMessagesClick, onEventsClick, onGroupsClick,
  onCalendarClick, onCoursesClick, onLibraryClick, onMinisitesClick,
}) {
  const avatarUrl = useSelector(s => s.auth?.user?.avatar) || ALEX_AVATAR;
  const authToken = useSelector(s => s.auth?.token);
  const currentUserId = useSelector(s => s.auth?.user?._id ?? s.auth?.user?.id);
  const [activeTab,            setActiveTab]            = useState('my-sites');
  const [showCreateSite,       setShowCreateSite]       = useState(false);
  const [showOrgForm,          setShowOrgForm]          = useState(false);
  const [showOrgLogin,         setShowOrgLogin]         = useState(false);
  const [showCommunities,      setShowCommunities]      = useState(false);
  const [leftCommunities,      setLeftCommunities]      = useState(new Set());
  const [selectedJoinedType,   setSelectedJoinedType]   = useState('All');
  const [showLanding,          setShowLanding]          = useState(true);
  const [selectedOrg,          setSelectedOrg]          = useState(null);
  const [managedSite,          setManagedSite]          = useState(null);
  const [showCommunityMgmt,    setShowCommunityMgmt]    = useState(false);
  const [selectedSiteForCommunity, setSelectedSiteForCommunity] = useState(null);
  const [userOrganization,     setUserOrganization]    = useState(null);
  const [isOrgLoggedIn,        setIsOrgLoggedIn]       = useState(false);
  const [communityDashboard,   setCommunityDashboard]  = useState(null);
  const [pendingTemplate,      setPendingTemplate]     = useState(null); // template picked via "Use Template", applied on next create
  const [tplThemeChoice,   setTplThemeChoice]   = useState({}); // { [templateKey]: themeKey } — per-card theme override
  const [currentBuilder,   setCurrentBuilder]   = useState(null);
  const [openMenuId,       setOpenMenuId]       = useState(null);
  const [sites,            setSites]            = useState([]);
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [loading,          setLoading]          = useState(true);
  const [loadError,        setLoadError]        = useState('');
  const [busyId,           setBusyId]           = useState(null); // site id mid publish/delete
  const [loadingEditId,    setLoadingEditId]    = useState(null);
  const [analyticsSite,    setAnalyticsSite]    = useState(null);
  const [page,             setPage]             = useState(1);
  const [totalPages,       setTotalPages]       = useState(1);

  // "All Sites" tab — a public gallery of every user's published sites.
  const [allSites,          setAllSites]          = useState([]);
  const [allSitesLoaded,    setAllSitesLoaded]    = useState(false);
  const [allSitesLoading,   setAllSitesLoading]   = useState(false);
  const [allSitesError,     setAllSitesError]     = useState('');
  const [allSitesPage,      setAllSitesPage]      = useState(1);
  const [allSitesTotalPages, setAllSitesTotalPages] = useState(1);
  const [reportTarget,      setReportTarget]      = useState(null);
  const [deleteTarget,      setDeleteTarget]      = useState(null);
  const [allSitesSearch,    setAllSitesSearch]    = useState('');
  const [allSitesSearchTerm, setAllSitesSearchTerm] = useState(''); // debounced

  const fetchSites = useCallback(async (pageToLoad = 1, append = false) => {
    if (!authToken || !userOrganization?.id) return;
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page: String(pageToLoad), limit: '50' });
      const res = await apiRequest(`/api/organizations/${userOrganization.id}/mini-sites?${params}`, { token: authToken });
      const list = (res?.data ?? []).map(normalizeSite);
      setSites(prev => (append ? [...prev, ...list] : list));
      setTotalPages(res?.pagination?.totalPages ?? 1);
      setPage(pageToLoad);
    } catch (err) {
      setLoadError(err.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, [authToken, userOrganization?.id]);

  useEffect(() => { fetchSites(1, false); }, [fetchSites]);

  // /browse only ever returns already-published sites, so it doesn't bother
  // sending back `status` — default it to 'live' rather than normalizeSite's
  // usual 'draft' fallback, or every card in this tab would show "Draft".
  const fetchAllSites = useCallback(async (pageToLoad = 1, append = false, search = '') => {
    if (!authToken) return;
    setAllSitesLoading(true);
    setAllSitesError('');
    try {
      const params = new URLSearchParams({ page: String(pageToLoad), limit: '24', sort: '-views' });
      if (search) params.set('search', search);
      const res = await apiRequest(`/api/mini-sites/browse?${params}`, { token: authToken });
      const list = (res?.data ?? []).map(r => normalizeSite({ ...r, status: r.status ?? 'live' }));
      setAllSites(prev => (append ? [...prev, ...list] : list));
      setAllSitesTotalPages(res?.pagination?.totalPages ?? 1);
      setAllSitesPage(pageToLoad);
    } catch (err) {
      setAllSitesError(err.message || 'Failed to load sites');
    } finally {
      setAllSitesLoading(false);
      setAllSitesLoaded(true);
    }
  }, [authToken]);

  useEffect(() => {
    if (activeTab === 'all-sites' && !allSitesLoaded) fetchAllSites(1, false, allSitesSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allSitesLoaded, fetchAllSites]);

  // Debounce the search box, then re-query /browse from page 1.
  useEffect(() => {
    const t = setTimeout(() => setAllSitesSearchTerm(allSitesSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [allSitesSearch]);

  useEffect(() => {
    if (!allSitesLoaded) return; // first load already handled above
    fetchAllSites(1, false, allSitesSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSitesSearchTerm]);

  const handleReportSite = (siteId) => {
    // Update the reported flag on the site in all lists
    const updateReportedFlag = (siteList) =>
      siteList.map(site => site.id === siteId ? { ...site, reported: true } : site);

    setSites(prev => updateReportedFlag(prev));
    setAllSites(prev => updateReportedFlag(prev));
  };

  function handleNav(id) {
    if (id === 'create')      { setShowCreateSite(true); return; }
    if (id === 'communities') { setShowCommunities(true); return; }
    if (id === 'home')        onBack?.();
    if (id === 'courses')     onCoursesClick?.();
    if (id === 'library')     onLibraryClick?.();
    if (id === 'events')      onEventsClick?.();
    if (id === 'friends')     onGroupsClick?.();
    if (id === 'messages')    onMessagesClick?.();
    if (id === 'calendar')    onCalendarClick?.();
    if (id === 'minisites')   onMinisitesClick?.();
  }

  const handleCreateSite = () => {
    // Check if user is logged in
    if (!authToken) {
      alert('🔐 Please log in first to create a mini site');
      return;
    }
    // Check if organization exists
    if (!userOrganization) {
      alert('📋 Please create an organization first before creating mini sites');
      return;
    }
    // Check if logged into organization
    if (!isOrgLoggedIn) {
      alert('🔒 Please log in to your organization first');
      return;
    }
    setPendingTemplate(null);
    setShowCreateSite(true);
  };

  const handleUseTemplate = (tpl, theme) => { setPendingTemplate({ tpl, theme }); setShowCreateSite(true); };

  const handleOpenCommunityMgmt = (site) => {
    setSelectedSiteForCommunity(site);
    setShowCommunityMgmt(true);
  };

  const handleCommunityJoined = (community) => {
    // User joined a community, close the communities page
    setShowCommunities(false);
    alert(`✅ Successfully joined "${community.name}" community!`);
  };

  const handleOpenCommunityDashboard = (site) => {
    setCommunityDashboard(site);
  };

  const handleCloseCommunityDashboard = () => {
    setCommunityDashboard(null);
  };

  // Load organization and login session from localStorage on mount
  useEffect(() => {
    const savedOrg = localStorage.getItem('userOrganization');
    if (savedOrg) {
      try {
        setUserOrganization(JSON.parse(savedOrg));
        setIsOrgLoggedIn(true); // User has selected an organization
      } catch (err) {
        console.error('Failed to load organization:', err);
      }
    }

    // Check for login session (legacy, but keep for backward compatibility)
    const loginSession = localStorage.getItem('orgLoginSession');
    if (loginSession) {
      try {
        setIsOrgLoggedIn(true);
      } catch (err) {
        console.error('Failed to load login session:', err);
      }
    }
  }, []);

  const handleOrganizationSubmit = (formData) => {
    // Organization is already saved to localStorage in the form
    // Just update state to close form and display it
    const savedOrg = localStorage.getItem('userOrganization');
    if (savedOrg) {
      try {
        setUserOrganization(JSON.parse(savedOrg));
      } catch (err) {
        console.error('Failed to load organization:', err);
      }
    }
    setShowOrgForm(false);
  };

  const handleOrgLogin = (loginData) => {
    // Login session is already saved to localStorage in the form
    // Update state to reflect logged in status
    setIsOrgLoggedIn(true);
    setShowOrgLogin(false);
  };

  const handleSiteCreated = (newSite) => {
    // The site is created empty on the backend either way — a template just
    // seeds the builder's local (unsaved) starting sections, same as the
    // generic starter template does. Nothing is persisted until Save/Publish.
    const siteData = pendingTemplate ? { ...newSite, sections: pendingTemplate.tpl.buildSections(pendingTemplate.theme) } : newSite;
    const seeded = normalizeSite(siteData);
    setPendingTemplate(null);
    setSites(prev => [seeded, ...prev]);
    setShowCreateSite(false);
    setCurrentBuilder(seeded);
  };

  const handleBackFromBuilder = () => {
    setCurrentBuilder(null);
  };

  const handleSiteUpdate = (siteIdToUpdate, patch) => {
    setSites(prev => prev.map(s => (s.id === siteIdToUpdate ? { ...s, ...patch } : s)));
    setAllSites(prev => prev.map(s => (s.id === siteIdToUpdate ? { ...s, ...patch } : s)));
    setCurrentBuilder(prev => (prev && prev.id === siteIdToUpdate ? { ...prev, ...patch } : prev));
  };

  const handleEditSite = async (siteId) => {
    setOpenMenuId(null);
    setLoadingEditId(siteId);
    try {
      const res = await apiRequest(`/api/organizations/${userOrganization.id}/mini-sites/${siteId}`, { token: authToken });
      setCurrentBuilder(normalizeSite(res?.data));
    } catch (err) {
      alert(err.message || 'Failed to open site editor');
    } finally {
      setLoadingEditId(null);
    }
  };

  const handlePreviewSite = (site) => {
    if (!site.slug) return;
    // A draft has no public page yet — send them to the builder's own live preview
    // instead of a dead link.
    if (site.status !== 'published' && site.status !== 'live') { handleEditSite(site.id); return; }
    // Serve published site from the frontend using ?site= parameter format
    const previewUrl = `${window.location.origin}${window.location.pathname}?site=${encodeURIComponent(site.slug)}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleManageSite = (site) => {
    setManagedSite(site);
  };

  const handlePublishSite = async (site, e) => {
    e?.stopPropagation();
    setOpenMenuId(null);

    // Prevent publishing if no sections
    if (site.status !== 'live' && (!site.sections || site.sections.length === 0)) {
      alert('Please add at least one section to your site before publishing. Click Edit and add sections using the sidebar.');
      return;
    }

    setBusyId(site.id);
    const action = site.status === 'live' ? 'unpublish' : 'publish';
    try {
      const res = await apiRequest(`/api/mini-sites/${site.id}/${action}`, { method: 'POST', token: authToken, body: {} });
      handleSiteUpdate(site.id, normalizeSite({ ...site, ...res?.data }));
    } catch (err) {
      alert(err.message || `Failed to ${action} site`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteSite = (site, e) => {
    e?.stopPropagation();
    setOpenMenuId(null);
    setDeleteTarget(site);
  };

  const confirmDeleteSite = async (site) => {
    setDeleteTarget(null);
    setBusyId(site.id);
    try {
      await apiRequest(`/api/organizations/${userOrganization.id}/mini-sites/${site.id}`, { method: 'DELETE', token: authToken });
      setSites(prev => prev.filter(s => s.id !== site.id));
      setAllSites(prev => prev.filter(s => s.id !== site.id));
      dispatch(showToast({
        message: '✅ Mini site deleted successfully',
        type: 'success',
      }));
    } catch (err) {
      let errorMessage = 'Failed to delete mini site. Please try again.';
      if (err.status === 403) {
        errorMessage = 'You do not have permission to delete this site.';
      } else if (err.status === 404) {
        errorMessage = 'Mini site not found.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      dispatch(showToast({
        message: '❌ ' + errorMessage,
        type: 'error',
      }));
    } finally {
      setBusyId(null);
    }
  };

  const filteredSites = filterStatus === 'all' ? sites : sites.filter(s => s.status === filterStatus);
  const liveSites = sites.filter(s => s.status === 'live');
  const totalViews = sites.reduce((sum, s) => sum + (s.views || 0), 0);

  const STAT_CARDS = [
    { Icon: GlobeIcon,    label: 'TOTAL SITES', value: String(sites.length), color: '#3b82f6' },
    { Icon: EyeIcon,      label: 'TOTAL VIEWS', value: totalViews.toLocaleString(), color: '#10b981' },
    { Icon: BarChartIcon, label: 'LIVE SITES',  value: String(liveSites.length), color: '#8b5cf6' },
  ];

  // Show organization registration form (priority over landing page)
  if (showOrgForm) {
    return (
      <div className="ms-page">
        <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNav} />
        <OrganizationRegistrationForm
          onClose={() => setShowOrgForm(false)}
          onSubmit={handleOrganizationSubmit}
        />
      </div>
    );
  }

  // Show landing page
  if (showLanding) {
    return (
      <div className="ms-page">
        <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNav} />
        <MiniSitesLanding
          onCreateOrganization={() => setShowOrgForm(true)}
          onSelectOrganization={(org) => {
            setSelectedOrg(org);
            setUserOrganization(org);
            localStorage.setItem('userOrganization', JSON.stringify(org));
            setShowLanding(false);
          }}
        />
      </div>
    );
  }

  // Show site management page
  if (managedSite) {
    return (
      <SiteManagementPage
        site={managedSite}
        avatarUrl={avatarUrl}
        onBack={() => setManagedSite(null)}
      />
    );
  }

  // Show community dashboard
  if (communityDashboard) {
    return (
      <CommunityDashboard
        site={communityDashboard}
        onBack={handleCloseCommunityDashboard}
      />
    );
  }

  // Show organization login form
  if (showOrgLogin) {
    return (
      <div className="ms-page">
        <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNav} />
        <OrganizationLoginForm
          onClose={() => setShowOrgLogin(false)}
          onLogin={handleOrgLogin}
        />
      </div>
    );
  }

  // Show create site page
  if (showCreateSite) {
    return (
      <CreateNewSitePage
        organizationId={userOrganization?.id}
        onCancel={() => { setShowCreateSite(false); setPendingTemplate(null); }}
        onSiteCreated={handleSiteCreated}
        initialName={pendingTemplate ? `My ${pendingTemplate.tpl.name}` : ''}
        templateName={pendingTemplate?.tpl?.name}
      />
    );
  }

  // Show site builder page
  if (currentBuilder) {
    return (
      <SiteBuilderPage
        siteId={currentBuilder.id}
        site={currentBuilder}
        organizationId={userOrganization?.id}
        onBack={handleBackFromBuilder}
        onSiteUpdate={handleSiteUpdate}
      />
    );
  }

  // Show communities page
  if (showCommunities) {
    return (
      <div className="ms-page">
        <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNav} />
        <CommunitiesPage
          onBack={() => setShowCommunities(false)}
          onCommunityClick={handleCommunityJoined}
          onMessagesClick={onMessagesClick}
          onEventsClick={onEventsClick}
          onGroupsClick={onGroupsClick}
          onCalendarClick={onCalendarClick}
          onCoursesClick={onCoursesClick}
          onLibraryClick={onLibraryClick}
          onMinisitesClick={onMinisitesClick}
        />
      </div>
    );
  }

  // Show community management page
  if (showCommunityMgmt && selectedSiteForCommunity) {
    return (
      <CommunityManagementPanel
        onBack={() => {
          setShowCommunityMgmt(false);
          setSelectedSiteForCommunity(null);
        }}
        avatarUrl={avatarUrl}
      />
    );
  }

  // Show mini sites dashboard
  return (
    <>
    <div className="ms-page">
      <AnimatedNav activeId="minisites" avatarUrl={avatarUrl} onNavigate={handleNav} />

      <div className="ms-main">

        {/* Header */}
        <div className="ms-header">
          <div className="ms-header-left">
            {userOrganization && (
              <button className="ms-back-btn" onClick={() => {
                setUserOrganization(null);
                localStorage.removeItem('userOrganization');
                setShowLanding(true);
              }} title="Back to organizations">
                <BackArrowIcon />
              </button>
            )}
            <div>
              <h1 className="ms-title">Mini Sites</h1>
              <p className="ms-subtitle">
                {userOrganization
                  ? `Manage mini sites for ${userOrganization.name}`
                  : 'Build and manage your personal web pages'}
              </p>
            </div>
          </div>
          <div className="ms-header-buttons">
            {!authToken ? (
              <button className="ms-create-btn ms-create-btn--disabled" disabled title="Please log in first">
                <PlusIcon /> Log In Required
              </button>
            ) : !userOrganization ? (
              <button
                className="ms-create-btn ms-create-btn--primary"
                onClick={() => setShowOrgForm(true)}
                type="button"
                style={{ cursor: 'pointer' }}
              >
                <PlusIcon /> Create Organization
              </button>
            ) : !userOrganization ? (
              <button
                className="ms-create-btn ms-create-btn--primary"
                onClick={() => setShowOrgLogin(true)}
              >
                <PlusIcon /> Log In to Organization
              </button>
            ) : (
              <button className="ms-create-btn" onClick={handleCreateSite}>
                <PlusIcon /> Create New Site
              </button>
            )}
          </div>
        </div>

        {/* Organization Details */}
        {userOrganization && (
          <div className="ms-org-banner">
            <div className="ms-org-content">
              {userOrganization.logo && (
                <img src={userOrganization.logo} alt="Logo" className="ms-org-logo" />
              )}
              <div className="ms-org-info">
                <h2 className="ms-org-name">{userOrganization.name}</h2>
                <p className="ms-org-type">{userOrganization.type.charAt(0).toUpperCase() + userOrganization.type.slice(1)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="ms-stats">
          {STAT_CARDS.map(({ Icon, label, value, color }) => (
            <div className="ms-stat-card" key={label}>
              <div className="ms-stat-icon" style={{ color, background: color + '18' }}><Icon /></div>
              <div>
                <p className="ms-stat-value">{value}</p>
                <p className="ms-stat-label">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ms-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`ms-tab${activeTab === t.id ? ' ms-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* All Sites search */}
        {activeTab === 'all-sites' && (
          <div className="ms-filters">
            <input
              type="text"
              className="ms-browse-search"
              placeholder="Search all sites…"
              value={allSitesSearch}
              onChange={(e) => setAllSitesSearch(e.target.value)}
            />
          </div>
        )}

        {/* Filter buttons */}
        {activeTab === 'my-sites' && (
          <div className="ms-filters">
            <button
              className={`ms-filter-btn${filterStatus === 'all' ? ' ms-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({sites.length})
            </button>
            <button
              className={`ms-filter-btn${filterStatus === 'live' ? ' ms-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('live')}
            >
              <LiveDotIcon /> Live ({liveSites.length})
            </button>
          </div>
        )}

        {activeTab === 'my-sites' && loading && sites.length === 0 && (
          <Loader inline />
        )}

        {activeTab === 'my-sites' && !loading && loadError && sites.length === 0 && (
          <div className="ms-empty-state">
            <p className="ms-empty-icon"><AlertTriangleIcon /></p>
            <p className="ms-empty-text">{loadError}</p>
            <button className="ms-create-btn" onClick={() => fetchSites(1, false)}>Retry</button>
          </div>
        )}

        {activeTab === 'my-sites' && (!loading || sites.length > 0) && !loadError && (
          <div className="ms-sites-grid">
            {filteredSites.length > 0 ? (
              filteredSites.map(site => (
                <div
                  key={site.id}
                  className={`ms-site-card${openMenuId === site.id ? ' ms-site-card--menu-open' : ''}`}
                  onClick={() => setOpenMenuId(null)}
                  style={{ opacity: busyId === site.id ? 0.6 : 1, pointerEvents: busyId === site.id ? 'none' : 'auto' }}
                >
                  <div className="ms-site-thumb">
                    <ImageCarousel images={siteImages(site)} />
                    <VisibilityBadge visibility={site.visibility} />
                    <div className="ms-site-actions-overlay">
                      <button className="ms-site-action-btn" title="Preview" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}><EyeIcon /></button>
                      <button className="ms-site-action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}>{loadingEditId === site.id ? '…' : <EditIcon />}</button>
                    </div>
                  </div>
                  <div className="ms-site-info">
                    <div className="ms-site-row">
                      <span className="ms-site-name">{site.name}</span>
                      <div className="ms-site-menu-wrap">
                        <button
                          className="ms-site-dots"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === site.id ? null : site.id); }}
                        ><DotsIcon /></button>
                        {openMenuId === site.id && (
                          <div className="ms-site-dropdown">
                            <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}><EditIcon /> Edit</button>
                            <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); setOpenMenuId(null); }}><EyeIcon /> Preview</button>
                            <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); window.open('https://mentor-kink.vercel.app/', '_blank'); }}><KeyIcon /> Admin login</button>
                            <button className="ms-dd-item ms-dd-item--danger" onClick={(e) => handleDeleteSite(site, e)}><TrashIcon /> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ms-site-url"
                      onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}
                      title="Open public link"
                    >
                      {displayUrl(siteUrl(site))}
                    </button>
                    <div className="ms-site-meta">
                      <span className="ms-site-views"><EyeIcon /> {(site.views || 0).toLocaleString()}</span>
                      <span className="ms-site-edited">Edited {timeAgo(site.updatedAt) || 'just now'}</span>
                    </div>
                    <div className="ms-site-actions">
                      <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}>Edit</button>
                      {site.status === 'live' ? (
                        <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handleManageSite(site); }}>Manage</button>
                      ) : (
                        <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}>Preview</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ms-empty-state">
                <p className="ms-empty-icon"><InboxIcon /></p>
                <p className="ms-empty-text">Create your first site</p>
                <button className="ms-create-btn" onClick={handleCreateSite}>Create your first site</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-sites' && page < totalPages && (
          <div className="ms-load-more-wrap">
            <button className="ms-create-btn" disabled={loading} onClick={() => fetchSites(page + 1, true)}>
              {loading ? 'Loading…' : 'Load more sites'}
            </button>
          </div>
        )}

        {activeTab === 'all-sites' && allSitesLoading && allSites.length === 0 && (
          <Loader inline />
        )}

        {activeTab === 'all-sites' && !allSitesLoading && allSitesError && allSites.length === 0 && (
          <div className="ms-empty-state">
            <p className="ms-empty-icon"><AlertTriangleIcon /></p>
            <p className="ms-empty-text">{allSitesError}</p>
            <button className="ms-create-btn" onClick={() => fetchAllSites(1, false)}>Retry</button>
          </div>
        )}

        {activeTab === 'all-sites' && (!allSitesLoading || allSites.length > 0) && !allSitesError && (
          <div className="ms-sites-grid">
            {allSites.length > 0 ? (
              allSites.map(site => {
                const isMine = site.userId && site.userId === currentUserId;
                const alreadyReported = site.reported ?? false;
                return (
                  <div
                    key={site.id}
                    className={`ms-site-card${openMenuId === site.id ? ' ms-site-card--menu-open' : ''}`}
                    onClick={() => setOpenMenuId(null)}
                    style={{ opacity: busyId === site.id ? 0.6 : 1, pointerEvents: busyId === site.id ? 'none' : 'auto' }}
                  >
                    <div className="ms-site-thumb">
                      <ImageCarousel images={siteImages(site)} />
                      <VisibilityBadge visibility={site.visibility} />
                      <div className="ms-site-actions-overlay">
                        <button className="ms-site-action-btn" title="Preview" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}><EyeIcon /></button>
                        {isMine ? (
                          <button className="ms-site-action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}>{loadingEditId === site.id ? '…' : <EditIcon />}</button>
                        ) : (
                          <button className="ms-site-action-btn" title="Report" disabled={alreadyReported} onClick={(e) => { e.stopPropagation(); setReportTarget(site); }}><FlagIcon /></button>
                        )}
                      </div>
                    </div>
                    <div className="ms-site-info">
                      <div className="ms-site-row">
                        <span className="ms-site-name">{site.name}{isMine && <span className="ms-site-mine-badge"> · Yours</span>}</span>
                        {isMine && (
                          <div className="ms-site-menu-wrap">
                            <button
                              className="ms-site-dots"
                              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === site.id ? null : site.id); }}
                            ><DotsIcon /></button>
                            {openMenuId === site.id && (
                              <div className="ms-site-dropdown">
                                <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}><EditIcon /> Edit</button>
                                <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); setOpenMenuId(null); }}><EyeIcon /> Preview</button>
                                <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); window.open('https://mentor-kink.vercel.app/', '_blank'); }}><KeyIcon /> Admin login</button>
                                <button className="ms-dd-item ms-dd-item--danger" onClick={(e) => handleDeleteSite(site, e)}><TrashIcon /> Delete</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                      type="button"
                      className="ms-site-url"
                      onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}
                      title="Open public link"
                    >
                      {displayUrl(siteUrl(site))}
                    </button>
                      {!isMine && site.creatorName && (
                        <p className="ms-site-creator">
                          {site.creatorAvatar && <img src={site.creatorAvatar} alt={site.creatorName} className="ms-site-creator-avatar" />}
                          by {site.creatorName}
                        </p>
                      )}
                      <div className="ms-site-meta">
                        <span className="ms-site-views"><EyeIcon /> {site.views.toLocaleString()}</span>
                        <span className="ms-site-edited">Published {timeAgo(site.publishedAt) || 'recently'}</span>
                      </div>
                      <div className="ms-site-actions">
                        <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}>Preview</button>
                        {isMine ? (
                          <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}>Edit</button>
                        ) : (
                          <button
                            className="ms-action-btn ms-action-btn--report"
                            disabled={alreadyReported}
                            onClick={(e) => { e.stopPropagation(); setReportTarget(site); }}
                          >
                            {alreadyReported ? 'Already Reported ✓' : 'Report'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ms-empty-state">
                <p className="ms-empty-icon"><GlobeIcon /></p>
                <p className="ms-empty-text">{allSitesSearchTerm ? `No sites found for "${allSitesSearchTerm}"` : 'No public sites yet'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-sites' && allSitesPage < allSitesTotalPages && (
          <div className="ms-load-more-wrap">
            <button className="ms-create-btn" disabled={allSitesLoading} onClick={() => fetchAllSites(allSitesPage + 1, true)}>
              {allSitesLoading ? 'Loading…' : 'Load more sites'}
            </button>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="ms-templates-grid">
            {SITE_TEMPLATES.map(tpl => {
              const chosenKey = tplThemeChoice[tpl.key] || tpl.theme.key;
              const chosenTheme = tpl.themes.find(t => t.key === chosenKey) || tpl.theme;
              return (
                <div key={tpl.key} className="ms-tpl-card" style={{ background: chosenTheme.dark }}>
                  <div className="ms-tpl-thumb">
                    <TemplatePreview tpl={tpl} theme={chosenTheme} />
                    {tpl.tag && <span className="ms-tpl-tag">{tpl.tag}</span>}
                    <div className="ms-tpl-overlay">
                      <button className="ms-tpl-use-btn" onClick={() => handleUseTemplate(tpl, chosenTheme)}><PlusIcon /> Use Template</button>
                    </div>
                  </div>
                  <p className="ms-tpl-name">{tpl.name}</p>
                  <p className="ms-tpl-desc">{tpl.description}</p>
                  <div className="ms-tpl-themes">
                    {tpl.themes.map(t => (
                      <button
                        key={t.key}
                        type="button"
                        className={`ms-tpl-theme-dot${t.key === chosenKey ? ' ms-tpl-theme-dot--active' : ''}`}
                        style={{ background: t.dark, borderColor: t.accent }}
                        title={t.name}
                        onClick={() => setTplThemeChoice(prev => ({ ...prev, [tpl.key]: t.key }))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Joined Organizations Tab */}
        {activeTab === 'joined' && (
          <>
            {/* Filter Pills */}
            <div className="ms-joined-filters">
              {JOINED_FILTER_TYPES.map(type => (
                <button
                  key={type.label}
                  className={`ms-joined-filter-pill${selectedJoinedType === type.label ? ' ms-joined-filter-pill--active' : ''}`}
                  onClick={() => setSelectedJoinedType(type.label)}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="ms-joined-communities">
              {JOINED_COMMUNITIES_DEMO.filter(c =>
                !leftCommunities.has(c.id) &&
                (selectedJoinedType === 'All' || c.type === selectedJoinedType)
              ).map(community => (
              <div key={community.id} className="ms-joined-card">
                <div className="ms-joined-card-cover" style={{ backgroundImage: `url(${community.cover})` }} />
                <div className="ms-joined-card-content">
                  <div className="ms-joined-info">
                    <h3 className="ms-joined-name">{community.name}</h3>
                    <p className="ms-joined-members">{community.memberCount.toLocaleString()} members</p>
                  </div>
                  <p className="ms-joined-description">{community.description}</p>
                  <div className="ms-joined-footer">
                    <button
                      className="ms-joined-btn ms-joined-btn--view"
                      onClick={() => alert(`Opening ${community.name}`)}
                    >
                      View
                    </button>
                    <button
                      className="ms-joined-btn ms-joined-btn--leave"
                      onClick={() => setLeftCommunities(prev => new Set([...prev, community.id]))}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {JOINED_COMMUNITIES_DEMO.filter(c =>
              !leftCommunities.has(c.id) &&
              (selectedJoinedType === 'All' || c.type === selectedJoinedType)
            ).length === 0 && (
              <div className="ms-empty-state">
                <p className="ms-empty-icon">🌐</p>
                <p className="ms-empty-text">No joined communities yet</p>
                <p className="ms-empty-sub">Browse communities to join and collaborate with others</p>
              </div>
            )}
            </div>

            {/* Connect with more communities section */}
            <div className="ms-joined-footer-cta">
              <div className="ms-joined-cta-content">
                <p className="ms-joined-cta-text">Connect with more communities and grow your network</p>
                <button
                  className="ms-joined-cta-btn"
                  onClick={() => setShowCommunities(true)}
                >
                  Browse Communities →
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>

    {analyticsSite && (
      <SiteAnalyticsModal site={analyticsSite} authToken={authToken} onClose={() => setAnalyticsSite(null)} />
    )}

    {reportTarget && (
      <ReportSiteModal
        site={reportTarget}
        authToken={authToken}
        onClose={() => setReportTarget(null)}
        onReported={handleReportSite}
      />
    )}

    {deleteTarget && (
      <DeleteConfirmModal
        site={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteSite}
      />
    )}
    </>
  );
}
