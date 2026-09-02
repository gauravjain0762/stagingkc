/* Single source of truth for section-type metadata used across the
   Add Section picker, Properties panel and the live preview renderer. */

export const SECTION_TYPES = [
  { type: 'navbar',      label: 'Navbar',       icon: '🧭', description: 'Site logo, navigation links and a call-to-action button' },
  { type: 'hero',        label: 'Hero',         icon: '🎯', description: 'Big headline, subtext and call-to-action buttons' },
  { type: 'text',        label: 'Text',         icon: '📝', description: 'Simple heading and paragraph content' },
  { type: 'grid',        label: 'Features',     icon: '⚙️', description: 'Grid of features or services with icons' },
  { type: 'gallery',     label: 'Gallery',      icon: '🖼️', description: 'Image grid for portfolio or work samples' },
  { type: 'form',        label: 'Contact Form', icon: '📧', description: 'Contact form with customizable fields' },
  { type: 'cta',         label: 'Call to Action', icon: '📣', description: 'Focused banner driving a single action' },
  { type: 'testimonial', label: 'Testimonials', icon: '💬', description: 'Quotes and reviews from customers' },
  { type: 'footer',      label: 'Footer',       icon: '🔗', description: 'Closing text, links and copyright' },
];

export const createId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function defaultStyle() {
  return {
    background: '#ffffff',
    backgroundImage: '',
    overlayOpacity: 0.4,
    textColor: '#1f2937',
    accentColor: '#3b82f6',
    paddingTop: 60,
    paddingBottom: 60,
    align: 'center',
    borderRadius: 0,
    buttonRadius: 8,
    contentWidth: 'full',
  };
}

export const BUTTON_SHAPES = [
  { label: 'Square', value: 0 },
  { label: 'Rounded', value: 8 },
  { label: 'Pill', value: 999 },
];

export const SPACING_PRESETS = [
  { label: 'S', paddingTop: 24, paddingBottom: 24 },
  { label: 'M', paddingTop: 60, paddingBottom: 60 },
  { label: 'L', paddingTop: 100, paddingBottom: 100 },
  { label: 'XL', paddingTop: 140, paddingBottom: 140 },
];

function defaultStyleForType(type) {
  const style = defaultStyle();
  if (type === 'navbar') {
    style.paddingTop = 18;
    style.paddingBottom = 18;
    style.align = 'left';
  }
  if (type === 'hero') {
    style.background = '#4f5ede';
    style.textColor = '#ffffff';
    style.accentColor = '#f59e0b';
    style.align = 'left';
    style.paddingTop = 90;
    style.paddingBottom = 90;
  }
  if (type === 'cta') {
    style.background = '#111827';
    style.textColor = '#ffffff';
    style.paddingTop = 80;
    style.paddingBottom = 80;
  }
  if (type === 'footer') {
    style.background = '#1f2937';
    style.textColor = '#ffffff';
    style.paddingTop = 40;
    style.paddingBottom = 40;
  }
  return style;
}

function defaultContent(type) {
  switch (type) {
    case 'navbar':
      return {
        logoText: 'YourBrand',
        links: [
          { label: 'Home', url: '#home' },
          { label: 'About', url: '#about' },
          { label: 'Services', url: '#services' },
          { label: 'Contact', url: '#contact' },
        ],
        secondaryCtaText: 'Join Community',
        secondaryCtaLink: '#',
        ctaText: 'Get Started',
        ctaLink: '#',
      };
    case 'hero':
      return {
        icon: '🎯',
        headline: 'Your Headline Here',
        subheadline: 'Premium content for your hero section',
        primaryButtonText: 'Learn More',
        primaryButtonLink: '#',
        secondaryButtonText: 'Get Started',
        secondaryButtonLink: '#',
        image: '',
      };
    case 'text':
      return {
        icon: '📝',
        headline: 'About',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      };
    case 'grid':
      return {
        headline: 'Services',
        items: [
          { icon: '⚡', title: 'Feature One', description: 'Description for feature one' },
          { icon: '🚀', title: 'Feature Two', description: 'Description for feature two' },
          { icon: '💡', title: 'Feature Three', description: 'Description for feature three' },
        ],
      };
    case 'gallery':
      return {
        headline: 'Portfolio',
        items: [
          { image: '', caption: 'Project One' },
          { image: '', caption: 'Project Two' },
          { image: '', caption: 'Project Three' },
          { image: '', caption: 'Project Four' },
        ],
      };
    case 'form':
      return {
        headline: 'Contact',
        subheadline: "Send us a message and we'll get back to you.",
        fields: [
          { label: 'Your Name', type: 'text' },
          { label: 'Your Email', type: 'email' },
          { label: 'Your Message', type: 'textarea' },
        ],
        submitButtonText: 'Submit',
      };
    case 'cta':
      return {
        headline: 'Ready to get started?',
        subheadline: 'Join thousands of happy customers today.',
        buttonText: 'Get Started',
        buttonLink: '#',
      };
    case 'testimonial':
      return {
        headline: 'What People Say',
        items: [
          { quote: 'This service completely changed how we work. Highly recommended!', author: 'Jamie Rivera', role: 'Product Manager' },
          { quote: "Outstanding quality and support from start to finish.", author: 'Alex Chen', role: 'Founder' },
        ],
      };
    case 'footer':
      return {
        text: `© ${new Date().getFullYear()} Your Website. All rights reserved.`,
        links: [
          { label: 'Home', url: '#home' },
          { label: 'About', url: '#about' },
          { label: 'Contact', url: '#contact' },
        ],
      };
    default:
      return {};
  }
}

export function createSection(type) {
  const meta = SECTION_TYPES.find(s => s.type === type) || SECTION_TYPES[0];
  return {
    id: createId(),
    type: meta.type,
    name: meta.label,
    icon: meta.icon,
    content: defaultContent(meta.type),
    style: defaultStyleForType(meta.type),
    visibleOnDesktop: true,
    visibleOnMobile: true,
  };
}

// A factory (not a static array) so every new site gets its own fresh ids —
// and, critically, so the navbar/footer's default links can point at the
// *real* ids of the sections generated alongside them, instead of guessed
// text like "#about" that happens to match nothing once rendered.
export function createStarterSections() {
  const hero = { ...createSection('hero'), name: 'Hero' };
  const about = { ...createSection('text'), name: 'About' };
  const services = { ...createSection('grid'), name: 'Services' };
  const portfolio = { ...createSection('gallery'), name: 'Portfolio' };
  const contact = { ...createSection('form'), name: 'Contact' };
  const footer = { ...createSection('footer'), name: 'Footer' };

  const navbar = { ...createSection('navbar'), name: 'Navbar' };
  navbar.content = {
    ...navbar.content,
    links: [
      { label: 'Home', url: `#${hero.id}` },
      { label: 'About', url: `#${about.id}` },
      { label: 'Services', url: `#${services.id}` },
      { label: 'Contact', url: `#${contact.id}` },
    ],
    ctaLink: `#${contact.id}`,
  };

  footer.content = {
    ...footer.content,
    links: [
      { label: 'Home', url: `#${hero.id}` },
      { label: 'About', url: `#${about.id}` },
      { label: 'Contact', url: `#${contact.id}` },
    ],
  };

  return [navbar, hero, about, services, portfolio, contact, footer];
}

// Back-compat for any existing call sites expecting a ready-made array.
export const DEFAULT_STARTER_SECTIONS = createStarterSections();
