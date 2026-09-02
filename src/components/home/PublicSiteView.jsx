import { useState } from 'react';
import './PublicSiteView.css';

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}

function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}

function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
}

export default function PublicSiteView({ site, onBack }) {
  const [copied, setCopied] = useState(false);

  const webUrl = `https://kickanalyst.com/${site.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="public-site-view">
      {/* Header */}
      <div className="psv-header">
        <button className="psv-back-btn" onClick={onBack}>
          <BackIcon /> Back
        </button>
        <div className="psv-header-content">
          <h1>{site.name}</h1>
          <p>Public Website View</p>
        </div>
      </div>

      {/* URL Bar */}
      <div className="psv-url-bar">
        <div className="psv-url-display">
          <span className="psv-url-protocol">https://</span>
          <input
            type="text"
            className="psv-url-input"
            value={`kickanalyst.com/${site.slug}`}
            readOnly
          />
        </div>
        <button className="psv-copy-btn" onClick={handleCopy}>
          <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Website Preview */}
      <div className="psv-preview-container">
        <div className="psv-preview-window">
          {/* Mock Website */}
          <div className="psv-site-content">
            {/* Navbar */}
            <nav className="psv-navbar">
              <div className="psv-navbar-brand">
                <span className="psv-logo-emoji">🌐</span>
                <span className="psv-brand-name">{site.name}</span>
              </div>
              <div className="psv-nav-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#contact">Contact</a>
              </div>
              <button className="psv-nav-cta">Get Started</button>
            </nav>

            {/* Hero Section */}
            <section className="psv-hero">
              <div className="psv-hero-content">
                <h2>Welcome to {site.name}</h2>
                <p>Your professional online presence starts here. Built with modern design and powerful features.</p>
                <button className="psv-hero-btn">Explore Now</button>
              </div>
              <div className="psv-hero-image">
                <div className="psv-image-placeholder">
                  <span>Website Preview</span>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="psv-features">
              <h3>Key Features</h3>
              <div className="psv-feature-grid">
                <div className="psv-feature-card">
                  <div className="psv-feature-icon">⚡</div>
                  <h4>Fast & Reliable</h4>
                  <p>Lightning-fast loading speeds and 99.9% uptime.</p>
                </div>
                <div className="psv-feature-card">
                  <div className="psv-feature-icon">🎨</div>
                  <h4>Modern Design</h4>
                  <p>Beautiful, responsive design that works on all devices.</p>
                </div>
                <div className="psv-feature-card">
                  <div className="psv-feature-icon">📊</div>
                  <h4>Analytics</h4>
                  <p>Track visitors and monitor your site's performance.</p>
                </div>
                <div className="psv-feature-card">
                  <div className="psv-feature-icon">🔒</div>
                  <h4>Secure</h4>
                  <p>Enterprise-grade security and data protection.</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="psv-footer">
              <p>&copy; 2026 {site.name}. All rights reserved.</p>
              <div className="psv-social-links">
                <a href="#twitter">Twitter</a>
                <a href="#linkedin">LinkedIn</a>
                <a href="#github">GitHub</a>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="psv-action-bar">
        <p className="psv-info">This is a preview of how your website looks to visitors</p>
        <div className="psv-actions">
          <button className="psv-action-btn psv-action-btn--secondary" onClick={onBack}>
            Back to Dashboard
          </button>
          <button className="psv-action-btn psv-action-btn--primary">
            <ShareIcon /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
