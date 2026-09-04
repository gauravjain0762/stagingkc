/* Single source of truth for section-type metadata used across the
   Add Section picker, Properties panel and the live preview renderer. */

export const SECTION_TYPES = [
  { type: 'navbar',      label: 'Navbar',       description: 'Site logo, navigation links and a call-to-action button' },
  { type: 'hero',        label: 'Hero',         description: 'Big headline, subtext and call-to-action buttons' },
  { type: 'text',        label: 'Text',         description: 'Simple heading and paragraph content' },
  { type: 'grid',        label: 'Features',     description: 'Grid of features or services with icons' },
  { type: 'gallery',     label: 'Gallery',      description: 'Image grid for portfolio or work samples' },
  { type: 'members',     label: 'Members',      description: 'Display community members list' },
  { type: 'calendar',    label: 'Calendar',     description: 'Events calendar for scheduling' },
  { type: 'form',        label: 'Contact Form', description: 'Contact form with customizable fields' },
  { type: 'cta',         label: 'Call to Action', description: 'Focused banner driving a single action' },
  { type: 'testimonial', label: 'Testimonials', description: 'Quotes and reviews from customers' },
  { type: 'footer',      label: 'Footer',       description: 'Closing text, links and copyright' },
];

export const createId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function defaultStyle() {
  return {
    background: '#f5f1e8',
    backgroundImage: '',
    overlayOpacity: 0.4,
    textColor: '#042d5d',
    accentColor: '#3b82f6',
    paddingTop: 20,
    paddingBottom: 20,
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
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
    style.align = 'center';
  }
  if (type === 'hero') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
    style.accentColor = '#3b82f6';
    style.align = 'center';
  }
  if (type === 'text') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
    style.align = 'center';
  }
  if (type === 'gallery') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'grid') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'form') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'cta') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'testimonial') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'members') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'calendar') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  if (type === 'footer') {
    style.background = '#f5f1e8';
    style.textColor = '#042d5d';
  }
  return style;
}

function defaultContent(type) {
  switch (type) {
    case 'navbar':
      return {
        logoText: 'Logo',
        links: [
          { label: 'Feed', url: '#feed' },
          { label: 'Members', url: '#members' },
          { label: 'Calendar', url: '#calendar' },
          { label: 'Groups', url: '#groups' },
        ],
        secondaryCtaText: 'Join Community',
        secondaryCtaLink: '#',
        ctaText: 'Contact',
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
    case 'members':
      return {
        headline: 'Members',
        subheadline: 'Meet our community members',
        items: [
          { name: 'Member One', role: 'Founder', avatar: '👤' },
          { name: 'Member Two', role: 'Contributor', avatar: '👤' },
          { name: 'Member Three', role: 'Moderator', avatar: '👤' },
        ],
      };
    case 'calendar':
      return {
        headline: 'Events',
        subheadline: 'Upcoming events and meetings',
        items: [
          { title: 'Community Meetup', date: '2026-09-15', time: '6:00 PM' },
          { title: 'Workshop', date: '2026-09-22', time: '10:00 AM' },
          { title: 'Weekly Call', date: '2026-09-29', time: '3:00 PM' },
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
  // Navbar links are fixed: Feed, Members, Calendar
  // Users cannot change these - they can add other sections via "Add Section"
  navbar.content = {
    ...navbar.content,
    links: [
      { label: 'Feed', url: '#feed' },
      { label: 'Members', url: '#members' },
      { label: 'Calendar', url: '#calendar' },
    ],
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
