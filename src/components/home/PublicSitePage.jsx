import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { apiRequest } from '../../services/api';
import WebsitePreview from './WebsitePreview';
import MiniSiteFeed from './MiniSiteFeed';
import MiniSiteFooter from './MiniSiteFooter';
import MiniSiteGroupsPage from './MiniSiteGroupsPage';
import MiniSiteCalendarPage from './MiniSiteCalendarPage';
import MiniSiteMembersPage from './MiniSiteMembersPage';
import Loader from '../Loader';
import { normalizeSite } from './miniSiteUtils';
import './PublicSitePage.css';
import './MiniSitesLanding.css'; // For modal styles

function siteTokenKey(slug) {
  return `site-token-${slug}`;
}

function SearchIcon() {
  return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function LockIcon() {
  return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
}
function KeyIcon() {
  return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L18 10"/></svg>;
}

export default function PublicSitePage({ slug }) {
  const { token, user } = useSelector(s => s.auth);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | forbidden | needs-password | error
  const [site, setSite] = useState(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showFeed, setShowFeed] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOrgMember, setIsOrgMember] = useState(false);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState(null);
  const [orgDetailLoading, setOrgDetailLoading] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      console.log('🔄 Loading public site with slug:', slug);

      if (cancelled) return;

      try {
        // Fetch published site from backend API (no auth required)
        const backendUrl = import.meta.env.VITE_API_URL || 'https://kick-analyst-backend-production.jay886631.workers.dev';
        const apiUrl = `${backendUrl}/api/mini-sites/public/${slug}`;
        console.log('📡 Calling API:', apiUrl);
        const response = await fetch(apiUrl);

        console.log('✅ Response status:', response.status);

        if (cancelled) return;

        if (!response.ok) {
          console.warn('⚠️ API returned status:', response.status);
          if (response.status === 404) {
            setStatus('notfound');
          } else {
            setStatus('error');
          }
          return;
        }

        const text = await response.text();
        console.log('📄 Response text (first 200 chars):', text.slice(0, 200));

        let jsonData;
        try {
          jsonData = JSON.parse(text);
          console.log('✅ API Response:', jsonData);
        } catch (parseErr) {
          console.error('❌ Response is not JSON, it\'s HTML/text:', text.slice(0, 500));
          setStatus('error');
          return;
        }

        if (!jsonData?.data) {
          console.warn('⚠️ No data in response');
          setStatus('notfound');
          return;
        }

        const foundSite = jsonData.data;

        console.log('📦 Site data loaded:', foundSite);
        console.log('📋 Sections:', foundSite?.sections);
        if (foundSite?.sections) {
          const footerSection = foundSite.sections.find(s => s.type === 'footer');
          console.log('🔗 Footer section:', footerSection);
        }

        // Check visibility
        if (foundSite.visibility === 'private') {
          console.warn('⚠️ Site is private');
          setStatus('forbidden');
          return;
        }

        if (foundSite.visibility === 'members') {
          console.warn('⚠️ Site is members-only');
          setStatus('needs-password');
          return;
        }

        // Public site
        console.log('✅ Site is public, setting ready status');
        setSite(normalizeSite(foundSite));
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('❌ Failed to load site:', err);
        console.error('Error details:', err.message);
        setStatus('error');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  // Demo mode: Skip view tracking since we're using localStorage
  useEffect(() => {
    if (status !== 'ready' || viewTracked.current) return;
    viewTracked.current = true;
    console.log('📊 View tracked for site:', slug);
  }, [status, slug]);

  // Check if user is a member of the organization
  useEffect(() => {
    if (!site?.organizationId || !token || !user) {
      setIsMember(false);
      return;
    }

    const checkMembership = async () => {
      try {
        const data = await apiRequest(`/api/organizations/${site.organizationId}/members`, {
          token
        });
        const isUserMember = data?.data?.some(member => member._id === user._id || member.id === user._id || member.userId === user._id);
        setIsMember(isUserMember || false);
      } catch (err) {
        console.error('Failed to check membership:', err);
        setIsMember(false);
      }
    };

    checkMembership();
  }, [site?.organizationId, token, user?.id, user?._id]);

  // Listen for navigation link clicks
  useEffect(() => {
    const handleOpenFeed = (e) => {
      setShowFeed(true);
      setShowMembers(false);
      setShowCalendar(false);
      setShowGroups(false);
    };
    const handleOpenMembers = (e) => {
      setShowFeed(false);
      setShowMembers(true);
      setShowCalendar(false);
      setShowGroups(false);
    };
    const handleOpenCalendar = (e) => {
      setShowFeed(false);
      setShowMembers(false);
      setShowCalendar(true);
      setShowGroups(false);
    };
    const handleOpenGroups = (e) => {
      setShowFeed(false);
      setShowMembers(false);
      setShowCalendar(false);
      setShowGroups(true);
    };

    window.addEventListener('openFeed', handleOpenFeed);
    window.addEventListener('openMembers', handleOpenMembers);
    window.addEventListener('openCalendar', handleOpenCalendar);
    window.addEventListener('openGroups', handleOpenGroups);

    return () => {
      window.removeEventListener('openFeed', handleOpenFeed);
      window.removeEventListener('openMembers', handleOpenMembers);
      window.removeEventListener('openCalendar', handleOpenCalendar);
      window.removeEventListener('openGroups', handleOpenGroups);
    };
  }, []);

  // Listen for navbar section link clicks and exit feed view
  useEffect(() => {
    const handleNavClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href) {
        const url = new URL(target.href);
        const hash = url.hash;
        // If clicking a section link (not feed), exit feed view
        if (hash && hash !== '#feed' && showFeed) {
          setShowFeed(false);
        }
      }
    };

    window.addEventListener('click', handleNavClick);
    return () => window.removeEventListener('click', handleNavClick);
  }, [showFeed]);

  // Handle organization modal from mini site join link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showOrgModal = params.get('showOrgModal');
    const orgId = params.get('orgId');

    if (showOrgModal === 'true' && orgId) {
      fetchOrgDetailModal(orgId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchOrgDetailModal = async (orgId) => {
    setOrgDetailLoading(true);
    try {
      const data = await apiRequest(`/api/organizations/${orgId}`, {
        token: token
      });
      if (data?.data) {
        setSelectedOrgDetail(data.data);

        // Check if user is a member of this organization
        if (token && user) {
          try {
            const membersData = await apiRequest(`/api/organizations/${orgId}/members`, {
              token
            });
            const isUserMember = membersData?.data?.some(member => member._id === user._id || member.id === user._id || member.userId === user._id);
            setIsOrgMember(isUserMember || false);
          } catch (err) {
            console.error('Failed to check organization membership:', err);
            setIsOrgMember(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch organization details:', err);
    } finally {
      setOrgDetailLoading(false);
    }
  };

  const handleJoinOrgFromModal = async (org) => {
    try {
      const endpoint = org.visibility === 'private'
        ? `/api/organizations/${org.id}/join-request`
        : `/api/organizations/${org.id}/join`;

      await apiRequest(endpoint, {
        method: 'POST',
        token: token
      });
      // Update membership status and close modal
      setIsOrgMember(true);
      setSelectedOrgDetail(null);
    } catch (err) {
      console.error('Failed to join organization:', err);
    }
  };

  const handleViewSite = (org) => {
    if (org?.id && site?.slug) {
      // Navigate to site with proper URL format: ?site=slug
      window.location.href = `/?site=${site.slug}`;
    }
  };

  async function handleVerifyPassword(e) {
    e.preventDefault();
    setVerifying(true);
    setPasswordError('');
    try {
      // Demo mode: Accept any password for members-only sites
      await new Promise(resolve => setTimeout(resolve, 600));

      const sites = JSON.parse(localStorage.getItem('demoSites') || '[]');
      const foundSite = sites.find(s => s.slug === slug && s.status === 'live');

      if (!foundSite) {
        setStatus('notfound');
        return;
      }

      if (foundSite.visibility !== 'members') {
        setStatus('notfound');
        return;
      }

      // Demo: Accept any non-empty password
      if (!password.trim()) {
        setPasswordError('Please enter a password');
        setVerifying(false);
        return;
      }

      localStorage.setItem(siteTokenKey(slug), 'demo-token');
      setSite(normalizeSite(foundSite));
      setStatus('ready');
    } catch (err) {
      setPasswordError(err.message || 'Invalid password');
    } finally {
      setVerifying(false);
    }
  }

  if (status === 'loading') {
    return <Loader />;
  }

  if (status === 'notfound') {
    return (
      <div className="pub-site-state">
        <span className="pub-site-state-icon"><SearchIcon /></span>
        <h1>Site not found</h1>
        <p>This mini site doesn't exist or may have been removed.</p>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="pub-site-state">
        <span className="pub-site-state-icon"><LockIcon /></span>
        <h1>This site is private</h1>
        <p>The owner has restricted access to this site.</p>
      </div>
    );
  }

  if (status === 'needs-password') {
    return (
      <div className="pub-site-state">
        <form className="pub-site-password-card" onSubmit={handleVerifyPassword}>
          <span className="pub-site-state-icon"><KeyIcon /></span>
          <h1>Password Protected</h1>
          <p>Enter the password to view this site.</p>
          <input
            type="password"
            className="pub-site-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {passwordError && <p className="pub-site-password-error">{passwordError}</p>}
          <button type="submit" className="pub-site-password-submit" disabled={verifying || !password}>
            {verifying ? 'Checking…' : 'View Site'}
          </button>
        </form>
      </div>
    );
  }

  // Don't render until site data is fully loaded
  if (status !== 'ready' || !site) {
    return <Loader />;
  }

  // Render site with different views
  const renderNavbarOnly = () => (
    site?.sections?.[0]?.type === 'navbar' && (
      <WebsitePreview
        sections={[site.sections[0]]}
        device="desktop"
        interactive={false}
        siteId={site?.id}
        contactEmail={site?.contactInfo?.email}
        isMember={isMember}
      />
    )
  );

  const footerSection = site?.sections?.find(s => s.type === 'footer');

  return (
    <div className="pub-site-page">
      {showFeed ? (
        <>
          {renderNavbarOnly()}
          <div className="pub-site-feed-inline">
            <MiniSiteFeed siteId={site.id} siteName={site.name} />
          </div>
          <MiniSiteFooter section={footerSection} />
        </>
      ) : showMembers ? (
        <>
          {renderNavbarOnly()}
          <div className="pub-site-view-inline">
            <MiniSiteMembersPage
              siteId={site.id}
              siteName={site.name}
              onBack={() => setShowMembers(false)}
            />
          </div>
          <MiniSiteFooter section={footerSection} />
        </>
      ) : showCalendar ? (
        <>
          {renderNavbarOnly()}
          <MiniSiteCalendarPage siteName={site.name} />
          <MiniSiteFooter section={footerSection} />
        </>
      ) : showGroups ? (
        <>
          {renderNavbarOnly()}
          <MiniSiteGroupsPage siteName={site.name} />
          <MiniSiteFooter section={footerSection} />
        </>
      ) : (
        <WebsitePreview
          key={site.id}
          sections={site?.sections || []}
          device="desktop"
          interactive={false}
          siteId={site?.id}
          contactEmail={site?.contactInfo?.email}
          isMember={isMember}
        />
      )}

      {/* Organization Detail Modal */}
      {selectedOrgDetail && (
        <div className="msl-modal-overlay" onClick={() => { setSelectedOrgDetail(null); setIsOrgMember(false); }}>
          <div className="msl-modal-content msl-modal-content--large" onClick={(e) => e.stopPropagation()}>
            <button className="msl-modal-close" onClick={() => { setSelectedOrgDetail(null); setIsOrgMember(false); }}>✕</button>

            {/* Cover Image */}
            {selectedOrgDetail.coverImage && (
              <div className="msl-modal-cover">
                <img src={selectedOrgDetail.coverImage} alt="Cover" />
              </div>
            )}

            <div className="msl-modal-header">
              <div className="msl-modal-header-content">
                {selectedOrgDetail.logo && (
                  <img src={selectedOrgDetail.logo} alt="Logo" className="msl-modal-logo" />
                )}
                <div>
                  <h2 className="msl-modal-title">{selectedOrgDetail.name}</h2>
                  <p className="msl-modal-meta">{selectedOrgDetail.memberCount || 0} members • {selectedOrgDetail.miniSitesCount || 0} site{selectedOrgDetail.miniSitesCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {orgDetailLoading ? (
              <div className="msl-modal-body">
                <p className="msl-modal-text">Loading details...</p>
              </div>
            ) : (
              <div className="msl-modal-body">
                {selectedOrgDetail.shortDescription && (
                  <div className="msl-modal-section">
                    <h3 className="msl-modal-section-title">Overview</h3>
                    <p className="msl-modal-text">{selectedOrgDetail.shortDescription}</p>
                  </div>
                )}

                {selectedOrgDetail.fullDescription && (
                  <div className="msl-modal-section">
                    <h3 className="msl-modal-section-title">Description</h3>
                    <p className="msl-modal-text">{selectedOrgDetail.fullDescription}</p>
                  </div>
                )}

                <div className="msl-modal-footer">
                  {isOrgMember ? (
                    <button
                      className="msl-modal-btn msl-modal-btn--primary"
                      onClick={() => handleViewSite(selectedOrgDetail)}
                    >
                      View Site
                    </button>
                  ) : selectedOrgDetail.visibility === 'invite' ? (
                    <div className="msl-modal-message">
                      🔐 This organization is invite-only. You need an invite link to join.
                    </div>
                  ) : (
                    <>
                      <button
                        className="msl-modal-btn"
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#c8d0e0' }}
                        onClick={() => setSelectedOrgDetail(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="msl-modal-btn msl-modal-btn--primary"
                        onClick={() => handleJoinOrgFromModal(selectedOrgDetail)}
                      >
                        {selectedOrgDetail.visibility === 'private' ? 'Send Request' : 'Join'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
