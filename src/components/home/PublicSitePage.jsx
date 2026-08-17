import { useState, useEffect, useRef } from 'react';
import WebsitePreview from './WebsitePreview';
import { apiRequest } from '../../services/api';
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
  const viewTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      const savedToken = localStorage.getItem(siteTokenKey(slug));
      try {
        const res = await apiRequest(
          `/api/mini-sites/public/${encodeURIComponent(slug)}`,
          savedToken ? { token: savedToken } : {}
        );
        if (cancelled) return;
        setSite(normalizeSite(res?.data));
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        // The backend returns an identical 404 "Site not found" for a truly
        // missing slug, a private site, AND a password-protected one — there's
        // no way to tell them apart from this response alone (confirmed live).
        // Only /verify-password can disambiguate (401 = wrong password, so it
        // IS password-protected; 404 = not a password site at all), so default
        // to showing the password gate and let a verify-password attempt
        // downgrade to "not found" if it turns out there's nothing to unlock.
        if (err.status === 403) setStatus('forbidden');
        else setStatus('needs-password');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  // Record the page view once the site actually renders.
  useEffect(() => {
    if (status !== 'ready' || viewTracked.current) return;
    viewTracked.current = true;
    const referrer = document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return ''; } })() : '';
    apiRequest(`/api/mini-sites/public/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
      body: { referrer },
    }).catch(() => {});
  }, [status, slug]);

  async function handleVerifyPassword(e) {
    e.preventDefault();
    setVerifying(true);
    setPasswordError('');
    try {
      const res = await apiRequest(`/api/mini-sites/public/${encodeURIComponent(slug)}/verify-password`, {
        method: 'POST',
        body: { password },
      });
      if (res?.token) localStorage.setItem(siteTokenKey(slug), res.token);
      setSite(normalizeSite(res?.data));
      setStatus('ready');
    } catch (err) {
      // 404 here means this slug was never password-protected in the first
      // place (truly missing, or a private site) — now we know for sure.
      if (err.status === 404) { setStatus('notfound'); return; }
      setPasswordError(err.message || 'Invalid password');
    } finally {
      setVerifying(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="pub-site-state">
        <div className="pub-site-spinner" />
        <p>Loading site…</p>
      </div>
    );
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

  return (
    <div className="pub-site-page">
      <WebsitePreview sections={site?.sections || []} device="desktop" interactive={false} />
      <div className="pub-site-footer">Made with Kink Catalyst Mini Sites</div>
    </div>
  );
}
