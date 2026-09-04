import { useState, useEffect, useRef } from 'react';
import WebsitePreview from './WebsitePreview';
import MiniSiteFeed from './MiniSiteFeed';
import MiniSiteGroupsPage from './MiniSiteGroupsPage';
import MiniSiteCalendarPage from './MiniSiteCalendarPage';
import MiniSiteMembersPage from './MiniSiteMembersPage';
import Loader from '../Loader';
import { normalizeSite } from './miniSiteUtils';
import './PublicSitePage.css';

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
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | forbidden | needs-password | error
  const [site, setSite] = useState(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showFeed, setShowFeed] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
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
      />
    )
  );

  return (
    <div className="pub-site-page">
      {showFeed ? (
        <>
          {renderNavbarOnly()}
          <div className="pub-site-feed-inline">
            <MiniSiteFeed siteId={site.id} siteName={site.name} />
          </div>
        </>
      ) : showMembers ? (
        <>
          {renderNavbarOnly()}
          <div className="pub-site-view-inline">
            <MiniSiteMembersPage
              siteName={site.name}
              onBack={() => setShowMembers(false)}
            />
          </div>
        </>
      ) : showCalendar ? (
        <>
          {renderNavbarOnly()}
          <MiniSiteCalendarPage siteName={site.name} />
        </>
      ) : showGroups ? (
        <>
          {renderNavbarOnly()}
          <MiniSiteGroupsPage siteName={site.name} />
        </>
      ) : (
        <WebsitePreview
          key={site.id}
          sections={site?.sections || []}
          device="desktop"
          interactive={false}
          siteId={site?.id}
          contactEmail={site?.contactInfo?.email}
        />
      )}
      <div className="pub-site-footer">Made with Kink Catalyst Mini Sites</div>
    </div>
  );
}
