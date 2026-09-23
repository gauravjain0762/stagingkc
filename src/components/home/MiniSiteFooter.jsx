export default function MiniSiteFooter({ section }) {
  if (!section) return null;

  const { content, style = {} } = section;
  if (!content) return null;

  // Use section's style colors or fallback to defaults
  const background = style.background || '#0d1526';
  const textColor = style.textColor || '#94a3b8';
  const accentColor = style.accentColor || '#3b82f6';

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

  const hasSocial = content.social && Object.keys(content.social).some(k => content.social[k]);
  const hasLinks = content.links && content.links.length > 0;
  const hasText = content.text;

  if (!hasSocial && !hasLinks && !hasText) return null;

  const linkBgColor = (() => {
    const rgb = hexToRgb(background);
    if (!rgb) return background;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  })();

  return (
    <footer className="mini-site-footer" style={{ background, color: textColor }}>
      {hasSocial && (
        <div className="mini-site-footer-social">
          {content.social.linkedin && (
            <a href={content.social.linkedin} target="_blank" rel="noopener noreferrer" className="mini-site-social-link" title="LinkedIn" style={{ backgroundColor: linkBgColor, color: accentColor }}>
              {SocialIcons.linkedin}
            </a>
          )}
          {content.social.youtube && (
            <a href={content.social.youtube} target="_blank" rel="noopener noreferrer" className="mini-site-social-link" title="YouTube" style={{ backgroundColor: linkBgColor, color: accentColor }}>
              {SocialIcons.youtube}
            </a>
          )}
          {content.social.instagram && (
            <a href={content.social.instagram} target="_blank" rel="noopener noreferrer" className="mini-site-social-link" title="Instagram" style={{ backgroundColor: linkBgColor, color: accentColor }}>
              {SocialIcons.instagram}
            </a>
          )}
          {content.social.facebook && (
            <a href={content.social.facebook} target="_blank" rel="noopener noreferrer" className="mini-site-social-link" title="Facebook" style={{ backgroundColor: linkBgColor, color: accentColor }}>
              {SocialIcons.facebook}
            </a>
          )}
        </div>
      )}

      {hasLinks && (
        <div className="mini-site-footer-links">
          {content.links.map((link, i) => (
            <a key={i} href={link.url} style={{ color: accentColor }}>{link.label}</a>
          ))}
        </div>
      )}

      {hasText && <p className="mini-site-footer-text" style={{ color: textColor }}>{content.text}</p>}
    </footer>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
