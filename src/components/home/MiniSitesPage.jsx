import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AnimatedNav from './AnimatedNav';
import CreateNewSitePage from './CreateNewSitePage';
import SiteBuilderPage from './SiteBuilderPage';
import Loader from '../Loader';
import SiteAnalyticsModal from './SiteAnalyticsModal';
import { ALEX_AVATAR } from './mockData';
import { apiRequest } from '../../services/api';
import { normalizeSite, timeAgo, siteUrl, displayUrl } from './miniSiteUtils';
import { SITE_TEMPLATES } from './templateContent';
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
function LiveDotIcon() { return <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>; }
function DraftIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function PublishIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>; }
function UnpublishIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>; }
function AlertTriangleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function InboxIcon() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>; }
function LockIcon()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>; }
function KeyIcon()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L18 10"/></svg>; }

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

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&fit=crop';

const TABS = [
  { id: 'all-sites', label: 'All Sites' },
  { id: 'my-sites',  label: 'My Sites' },
  { id: 'templates', label: 'Templates' },
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
  const [activeTab,        setActiveTab]        = useState('my-sites');
  const [showCreateSite,   setShowCreateSite]   = useState(false);
  const [pendingTemplate,  setPendingTemplate]  = useState(null); // template picked via "Use Template", applied on next create
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
    if (!authToken) return;
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ status: 'all', sort: '-updatedAt', page: String(pageToLoad), limit: '50' });
      const res = await apiRequest(`/api/mini-sites?${params}`, { token: authToken });
      const list = (res?.data ?? []).map(normalizeSite);
      setSites(prev => (append ? [...prev, ...list] : list));
      setTotalPages(res?.pagination?.totalPages ?? 1);
      setPage(pageToLoad);
    } catch (err) {
      setLoadError(err.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

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
    if (id === 'create')    { setShowCreateSite(true); return; }
    if (id === 'home')      onBack?.();
    if (id === 'courses')   onCoursesClick?.();
    if (id === 'library')   onLibraryClick?.();
    if (id === 'events')    onEventsClick?.();
    if (id === 'friends')   onGroupsClick?.();
    if (id === 'messages')  onMessagesClick?.();
    if (id === 'calendar')  onCalendarClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  const handleCreateSite = () => { setPendingTemplate(null); setShowCreateSite(true); };

  const handleUseTemplate = (tpl, theme) => { setPendingTemplate({ tpl, theme }); setShowCreateSite(true); };

  const handleSiteCreated = (newSite) => {
    // The site is created empty on the backend either way — a template just
    // seeds the builder's local (unsaved) starting sections, same as the
    // generic starter template does. Nothing is persisted until Save/Publish.
    const seeded = pendingTemplate ? { ...newSite, sections: pendingTemplate.tpl.buildSections(pendingTemplate.theme) } : newSite;
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
      const res = await apiRequest(`/api/mini-sites/${siteId}`, { token: authToken });
      setCurrentBuilder(normalizeSite(res?.data));
    } catch (err) {
      alert(err.message || 'Failed to open site editor');
    } finally {
      setLoadingEditId(null);
    }
  };

  const handlePreviewSite = (site) => {
    if (!site.slug) return;
    // A draft has no public page yet (the /public/:slug endpoint 404s for
    // anything unpublished) — send them to the builder's own live preview
    // instead of a dead link.
    if (site.status !== 'live') { handleEditSite(site.id); return; }
    window.open(siteUrl(site), '_blank', 'noopener,noreferrer');
  };

  const handlePublishSite = async (site, e) => {
    e?.stopPropagation();
    setOpenMenuId(null);
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
      await apiRequest(`/api/mini-sites/${site.id}`, { method: 'DELETE', token: authToken });
      setSites(prev => prev.filter(s => s.id !== site.id));
      setAllSites(prev => prev.filter(s => s.id !== site.id));
    } catch (err) {
      alert(err.message || 'Failed to delete site');
    } finally {
      setBusyId(null);
    }
  };

  const filteredSites = filterStatus === 'all' ? sites : sites.filter(s => s.status === filterStatus);
  const liveSites = sites.filter(s => s.status === 'live');
  const draftSites = sites.filter(s => s.status === 'draft');
  const totalViews = sites.reduce((sum, s) => sum + (s.views || 0), 0);

  const STAT_CARDS = [
    { Icon: GlobeIcon,    label: 'TOTAL SITES', value: String(sites.length), color: '#3b82f6' },
    { Icon: EyeIcon,      label: 'TOTAL VIEWS', value: totalViews.toLocaleString(), color: '#10b981' },
    { Icon: BarChartIcon, label: 'LIVE SITES',  value: String(liveSites.length), color: '#8b5cf6' },
    { Icon: LinkIcon,     label: 'DRAFT SITES', value: String(draftSites.length), color: '#f59e0b' },
  ];

  // Show create site page
  if (showCreateSite) {
    return (
      <CreateNewSitePage
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
        onBack={handleBackFromBuilder}
        onSiteUpdate={handleSiteUpdate}
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
          <div>
            <h1 className="ms-title">Mini Sites</h1>
            <p className="ms-subtitle">Build and manage your personal web pages</p>
          </div>
          <button className="ms-create-btn" onClick={handleCreateSite}><PlusIcon /> Create New Site</button>
        </div>

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
            <button
              className={`ms-filter-btn${filterStatus === 'draft' ? ' ms-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('draft')}
            >
              <DraftIcon /> Draft ({draftSites.length})
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
            {/* New site card */}
            <button className="ms-new-card" onClick={handleCreateSite}>
              <div className="ms-new-icon"><PlusIcon /></div>
              <p className="ms-new-label">Create New Site</p>
              <p className="ms-new-sub">Start from scratch or use a template</p>
            </button>

            {filteredSites.length > 0 ? (
              filteredSites.map(site => (
                <div
                  key={site.id}
                  className={`ms-site-card${openMenuId === site.id ? ' ms-site-card--menu-open' : ''}`}
                  onClick={() => setOpenMenuId(null)}
                  style={{ opacity: busyId === site.id ? 0.6 : 1, pointerEvents: busyId === site.id ? 'none' : 'auto' }}
                >
                  <div className="ms-site-thumb">
                    <img src={site.coverImage || FALLBACK_THUMB} alt={site.name} />
                    <div className={`ms-site-badge ms-site-badge--${site.status}`}>
                      {site.status === 'live' ? <><LiveDotIcon /> Live</> : <><DraftIcon /> Draft</>}
                    </div>
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
                            <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); setAnalyticsSite(site); setOpenMenuId(null); }}><BarChartIcon /> Analytics</button>
                            <button className="ms-dd-item" onClick={(e) => handlePublishSite(site, e)}>{site.status === 'live' ? <><UnpublishIcon /> Unpublish</> : <><PublishIcon /> Publish</>}</button>
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
                      <span className="ms-site-views"><EyeIcon /> {site.views.toLocaleString()}</span>
                      <span className="ms-site-edited">Edited {timeAgo(site.updatedAt) || 'just now'}</span>
                    </div>
                    <div className="ms-site-actions">
                      <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handleEditSite(site.id); }}>Edit</button>
                      <button className="ms-action-btn ms-action-btn--secondary" onClick={(e) => { e.stopPropagation(); handlePreviewSite(site); }}>Preview</button>
                      <button className={`ms-action-btn ${site.status === 'live' ? 'ms-action-btn--unpublish' : 'ms-action-btn--publish'}`} onClick={(e) => handlePublishSite(site, e)}>
                        {site.status === 'live' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ms-empty-state">
                <p className="ms-empty-icon"><InboxIcon /></p>
                <p className="ms-empty-text">No {filterStatus !== 'all' ? filterStatus : ''} sites found</p>
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
                      <img src={site.coverImage || FALLBACK_THUMB} alt={site.name} />
                      <div className={`ms-site-badge ms-site-badge--${site.status}`}>
                        {site.status === 'live' ? <><LiveDotIcon /> Live</> : <><DraftIcon /> Draft</>}
                      </div>
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
                                <button className="ms-dd-item" onClick={(e) => { e.stopPropagation(); setAnalyticsSite(site); setOpenMenuId(null); }}><BarChartIcon /> Analytics</button>
                                <button className="ms-dd-item" onClick={(e) => handlePublishSite(site, e)}>{site.status === 'live' ? <><UnpublishIcon /> Unpublish</> : <><PublishIcon /> Publish</>}</button>
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
