import { useState } from 'react';
import { IconPhoto, IconImagePlus } from '@tabler/icons-react';
import ContactFormSection from './ContactFormSection';

const DEVICE_WIDTH = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

// In the builder canvas (interactive=true) a nav-link click must not
// navigate — it's editing, not browsing. On the real published/preview
// render (interactive=false), an in-page "#id" link smooth-scrolls to the
// matching section; anything else (an external URL) is left to navigate
// normally. For mini sites, special links like #feed navigate to pages.
function handleNavLinkClick(e, url, interactive, siteId) {
  if (interactive) { e.preventDefault(); return; }
  if (!url) return;

  e.preventDefault();

  // Handle join organization link
  if (url.includes('action=joinOrganization')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const orgId = params.get('orgId');
    if (orgId) {
      window.location.href = `/?action=joinOrganization&orgId=${orgId}`;
    }
    return;
  }

  // Handle special mini site links
  if (url === '#feed') {
    window.location.hash = 'feed';
    window.dispatchEvent(new CustomEvent('openFeed', { detail: { siteId } }));
    return;
  }
  if (url === '#members') {
    window.location.hash = 'members';
    window.dispatchEvent(new CustomEvent('openMembers', { detail: { siteId } }));
    return;
  }
  if (url === '#calendar') {
    window.location.hash = 'calendar';
    window.dispatchEvent(new CustomEvent('openCalendar', { detail: { siteId } }));
    return;
  }
  if (url === '#groups') {
    window.location.hash = 'groups';
    window.dispatchEvent(new CustomEvent('openGroups', { detail: { siteId } }));
    return;
  }

  // Handle regular anchor links
  if (url.startsWith('#') && url.length > 1) {
    const target = document.getElementById(url.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }
}

const BODY_TRUNCATE_AT = 240;

function TextBody({ text }) {
  const [expanded, setExpanded] = useState(false);
  const body = text || '';
  const isLong = body.length > BODY_TRUNCATE_AT;
  const shown = expanded || !isLong ? body : `${body.slice(0, BODY_TRUNCATE_AT).trimEnd()}…`;

  return (
    <>
      <p>{shown}</p>
      {isLong && (
        <button type="button" className="wp-text-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

function SectionContent({ section, interactive, siteId, contactEmail }) {
  const c = section.content || {};

  switch (section.type) {
    case 'navbar':
      return (
        <div className="wp-navbar">
          <div className="wp-navbar-brand">
            {c.logo && <img src={c.logo} alt="Logo" className="wp-navbar-logo-img" />}
            <div className="wp-navbar-logo">{c.logoText}</div>
          </div>
          <nav className="wp-navbar-links">
            {(c.links || []).map((l, i) => (
              <a key={i} href={l.url} onClick={(e) => handleNavLinkClick(e, l.url, interactive, siteId)}>{l.label}</a>
            ))}
          </nav>
          <div className="wp-navbar-actions">
            {c.secondaryCtaText && (
              <a href={c.secondaryCtaLink || '#'} className="wp-btn wp-btn-secondary wp-navbar-cta" onClick={(e) => handleNavLinkClick(e, c.secondaryCtaLink, interactive, siteId)}>
                {c.secondaryCtaText}
              </a>
            )}
            {c.ctaText && (
              <a href={c.ctaLink || '#'} className="wp-btn wp-btn-primary wp-navbar-cta" onClick={(e) => handleNavLinkClick(e, c.ctaLink, interactive, siteId)}>
                {c.ctaText}
              </a>
            )}
          </div>
        </div>
      );

    case 'hero':
      const heroContent = c.content || c;
      const heroImage = heroContent.image || c.image;
      return (
        <div className="wp-hero">
          <div className="wp-hero-content">
            <h1>{heroContent.headline}</h1>
            <p>{heroContent.subheadline}</p>
            <div className="wp-hero-buttons">
              {heroContent.primaryButtonText && (
                <a href={heroContent.primaryButtonLink || '#'} className="wp-btn wp-btn-primary" onClick={(e) => handleNavLinkClick(e, heroContent.primaryButtonLink, interactive, siteId)}>
                  {heroContent.primaryButtonText}
                </a>
              )}
              {heroContent.secondaryButtonText && (
                <a href={heroContent.secondaryButtonLink || '#'} className="wp-btn wp-btn-secondary" onClick={(e) => handleNavLinkClick(e, heroContent.secondaryButtonLink, interactive, siteId)}>
                  {heroContent.secondaryButtonText}
                </a>
              )}
            </div>
          </div>
          <div className="wp-hero-image">
            {heroImage ? (
              <img src={heroImage} alt={heroContent.headline} className="wp-hero-img" />
            ) : (
              <div className="wp-placeholder-img">
                <IconImagePlus className="wp-placeholder-img-icon" />
                <span className="wp-placeholder-img-text">Add Photo</span>
              </div>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="wp-text-section">
          <h2>{c.headline}</h2>
          <TextBody text={c.body} />
        </div>
      );

    case 'grid':
      return (
        <div className="wp-grid-section">
          <h2>{c.headline}</h2>
          <div className="wp-grid">
            {(c.items || []).map((item, i) => (
              <div key={i} className="wp-grid-item">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="wp-gallery-section">
          <h2>{c.headline}</h2>
          <div className="wp-gallery-grid">
            {(c.items || []).map((item, i) => (
              <div key={i} className="wp-gallery-item">
                {item.image ? (
                  <img src={item.image} alt={item.caption} className="wp-gallery-img" />
                ) : (
                  <div className="wp-gallery-placeholder">
                    <IconPhoto className="wp-gallery-placeholder-icon" />
                    <span className="wp-gallery-placeholder-text">Add Photo</span>
                  </div>
                )}
                {item.caption && <p className="wp-gallery-caption">{item.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'form':
      // If it's a contact form with site ID, use the email-sending version
      if (siteId && contactEmail) {
        return <ContactFormSection siteId={siteId} contactEmail={contactEmail} />;
      }
      // Otherwise, render generic form template (editable in preview)
      return (
        <div className="wp-form-section">
          <h2>{c.headline}</h2>
          {c.subheadline && <p className="wp-form-sub">{c.subheadline}</p>}
          <form className="wp-form" onSubmit={(e) => e.preventDefault()}>
            {(c.fields || []).map((f, i) =>
              f.type === 'textarea' ? (
                <textarea key={i} placeholder={f.label} />
              ) : (
                <input key={i} type={f.type || 'text'} placeholder={f.label} />
              )
            )}
            <button type="submit" className="wp-btn wp-btn-primary">{c.submitButtonText || 'Submit'}</button>
          </form>
        </div>
      );

    case 'cta':
      return (
        <div className="wp-cta-section">
          <h2>{c.headline}</h2>
          <p>{c.subheadline}</p>
          {c.buttonText && (
            <a href={c.buttonLink || '#'} className="wp-btn wp-btn-primary" onClick={(e) => handleNavLinkClick(e, c.buttonLink, interactive, siteId)}>
              {c.buttonText}
            </a>
          )}
        </div>
      );

    case 'testimonial':
      return (
        <div className="wp-testimonial-section">
          <h2>{c.headline}</h2>
          <div className="wp-testimonial-grid">
            {(c.items || []).map((t, i) => (
              <div key={i} className="wp-testimonial-card">
                <p className="wp-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <p className="wp-testimonial-author">{t.author}</p>
                {t.role && <p className="wp-testimonial-role">{t.role}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'footer':
      const SocialIcons = {
        linkedin: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        ),
        youtube: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        ),
        instagram: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.015-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
          </svg>
        ),
        facebook: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      };

      return (
        <div className="wp-footer-section">
          {c.social && Object.keys(c.social).some(k => c.social[k]) && (
            <div className="wp-footer-social">
              {c.social.linkedin && (
                <a href={c.social.linkedin} target="_blank" rel="noopener noreferrer" className="wp-social-link" title="LinkedIn">
                  {SocialIcons.linkedin}
                </a>
              )}
              {c.social.youtube && (
                <a href={c.social.youtube} target="_blank" rel="noopener noreferrer" className="wp-social-link" title="YouTube">
                  {SocialIcons.youtube}
                </a>
              )}
              {c.social.instagram && (
                <a href={c.social.instagram} target="_blank" rel="noopener noreferrer" className="wp-social-link" title="Instagram">
                  {SocialIcons.instagram}
                </a>
              )}
              {c.social.facebook && (
                <a href={c.social.facebook} target="_blank" rel="noopener noreferrer" className="wp-social-link" title="Facebook">
                  {SocialIcons.facebook}
                </a>
              )}
            </div>
          )}
          <div className="wp-footer-links">
            {(c.links || []).map((l, i) => (
              <a key={i} href={l.url} onClick={(e) => handleNavLinkClick(e, l.url, interactive, siteId)}>{l.label}</a>
            ))}
          </div>
          <p className="wp-footer-text">{c.text}</p>
        </div>
      );

    default:
      return (
        <div className="wp-default-section">
          <h2>{section.name}</h2>
          <p className="wp-section-type">Type: {section.type}</p>
        </div>
      );
  }
}

export default function WebsitePreview({
  sections,
  selectedSectionId,
  onSelectSection,
  device = 'desktop',
  interactive = true,
  siteId,
  contactEmail,
}) {
  const visibleSections = sections.filter((section) =>
    device === 'mobile' ? section.visibleOnMobile !== false : section.visibleOnDesktop !== false
  );

  return (
    <div className={`wp-preview-container ${interactive ? 'wp-preview-container--interactive' : ''}`}>
      <div className="wp-canvas" style={{ width: DEVICE_WIDTH[device] || '100%' }}>
        {/* Website Sections Preview */}
        <div className="wp-content">
          {visibleSections.length === 0 && (
            <div className="wp-empty-state">
              <span style={{ fontSize: 40 }}>🧱</span>
              <p>No sections yet — add one from the sidebar.</p>
            </div>
          )}

          {visibleSections.map((section) => {
            const style = section.style || {};
            const wrapperStyle = {
              background: style.background,
              color: style.textColor,
              paddingTop: style.paddingTop != null ? `${style.paddingTop}px` : undefined,
              paddingBottom: style.paddingBottom != null ? `${style.paddingBottom}px` : undefined,
              paddingLeft: section.type === 'navbar' && style.paddingTop != null ? `${style.paddingTop}px` : undefined,
              paddingRight: section.type === 'navbar' && style.paddingTop != null ? `${style.paddingTop}px` : undefined,
              textAlign: style.align,
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
              overflow: style.borderRadius ? 'hidden' : undefined,
              '--wp-accent': style.accentColor || '#3b82f6',
              '--wp-btn-radius': `${style.buttonRadius ?? 8}px`,
              ...(section.type === 'form'
                ? {
                    '--wp-form-bg': style.formFieldBackground || '#ffffff',
                    '--wp-form-text': style.formFieldTextColor || '#1f2937',
                    '--wp-form-placeholder': style.formPlaceholderColor || '#9ca3af',
                  }
                : null),
              ...(style.contentWidth === 'boxed' ? { maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' } : null),
              ...(style.backgroundImage
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,${style.overlayOpacity ?? 0}), rgba(0,0,0,${style.overlayOpacity ?? 0})), url(${style.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : null),
            };

            return (
              <div
                key={section.id}
                id={section.id}
                className={[
                  'wp-section',
                  `wp-section-${section.type}`,
                  interactive ? 'wp-section--interactive' : '',
                  interactive && selectedSectionId === section.id ? 'wp-section--selected' : '',
                ].join(' ').trim()}
                style={wrapperStyle}
                onClick={interactive ? () => onSelectSection(section.id) : undefined}
              >
                <SectionContent section={section} interactive={interactive} siteId={siteId} contactEmail={contactEmail} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
