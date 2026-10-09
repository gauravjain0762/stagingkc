import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, COURSES, RESOURCES, categoryLabel, categoryColor } from './educationData';
import AnimatedNav from './AnimatedNav';
import EducationDetailPage from './EducationDetailPage';
import EducationMyLearningPage from './EducationMyLearningPage';
import EducationProgressPage from './EducationProgressPage';
import EducatorProfilePage from './EducatorProfilePage';
import EducationStorefrontPage from './EducationStorefrontPage';
import EducationSubscriptionPage from './EducationSubscriptionPage';
import UpcomingEducationPage from './UpcomingEducationPage';
import BecomeEducatorPage from './BecomeEducatorPage';
import EducatorDashboardPage from './EducatorDashboardPage';
import EducatorWorkspacePage from './EducatorWorkspacePage';
import EducatorPlansPage from './EducatorPlansPage';
import EducationBackButton from './EducationBackButton';
import './EventsPage.css';
import './EducationCenterPage.css';

function SearchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function BookIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>; }
function HeartIcon({ filled }) { return <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function ChevronDownIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function CompassIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>; }

const BROWSE_TABS = ['All', 'Courses', 'Articles', 'Videos', 'Classes'];
const DEFAULT_EDU_FILTERS = {
  access: 'All',
  level: 'All',
  format: 'All',
  status: 'All',
  categories: new Set(),
};
const CATEGORY_OPTIONS = [
  'Safety & Consent',
  'Communication',
  'Rope',
  'Power Exchange',
  'Sensation',
  ...CATEGORIES.map(c => c.label).filter(l => !['Safety & Consent', 'Communication', 'Rope', 'Power Exchange', 'Sensation'].includes(l)),
];
const extras = [
  { id: 'rope-safety', title: 'Rope Safety: Foundations', desc: 'Build a thoughtful foundation in rope safety, communication, and responsible practice.', type: 'Course', category: 'safety-consent', instructor: 'Jane Doe', level: 'Beginner', points: 120, rating: 4.8, img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&fit=crop', isFree: false, price: 'Gold', tier: 'Gold', accessType: 'gold', duration: '4 modules · 3 hours', source: 'KC', status: 'In Progress', progress: 65, module: 'Module 2 of 4', whatYouLearn: ['Understand essential safety principles and risk awareness', 'Build clear communication and check-in habits', 'Prepare thoughtfully and recognize when to pause'], whoFor: 'Beginners who want a careful, informed foundation. No prior experience is required.', tags: ['Safety', 'Consent', 'Rope', 'Foundations'], curriculum: [
    { id: 'foundations', title: 'Module 1 — Foundations', lessons: [
      { id: 'intro', title: 'Lesson 1 — Introduction', type: 'Video lesson', duration: '8 min', completed: true, content: 'Meet your instructor and learn how to use this course. We will begin with a shared vocabulary and a thoughtful approach to learning.' },
      { id: 'safety', title: 'Lesson 2 — Safety', type: 'Reading', duration: '12 min', completed: true, content: 'Explore core safety principles, communication practices, and ways to make informed choices before beginning any activity.' },
      { id: 'advanced-safety', title: 'Lesson 3 — Advanced Safety', type: 'Video lesson', duration: '18 min', locked: true, content: 'This lesson unlocks after completing the Foundations quiz.' },
      { id: 'foundations-quiz', title: 'Foundations Quiz', type: 'Quiz', duration: '5 questions', content: 'Check your understanding of the foundations before moving on.' },
    ] },
    { id: 'practical', title: 'Module 2 — Practical Skills', lessons: [
      { id: 'communication-practice', title: 'Lesson 1 — Communication', type: 'Video lesson', duration: '14 min', content: 'Practice clear check-ins and learn how to keep communication open throughout a learning experience.' },
      { id: 'practical-skills', title: 'Lesson 2 — Practical Skills', type: 'Demonstration', duration: '16 min', content: 'A guided demonstration of preparation, pacing, and making adjustments as you learn.' },
      { id: 'practical-assessment', title: 'Module 2 Assessment', type: 'Assessment', duration: '10 min', content: 'Apply the module concepts to a set of practical scenarios.' },
    ] },
    { id: 'advanced', title: 'Module 3 — Advanced', lessons: [
      { id: 'advanced-practice', title: 'Lesson 1 — Building Confidence', type: 'Video lesson', duration: '20 min', content: 'Bring the earlier ideas together in a more advanced practice plan.' },
      { id: 'final-assessment', title: 'Final Assessment', type: 'Assessment', duration: '15 min', content: 'Complete the final assessment to finish the course and earn your points.' },
    ] },
  ] },
  { id: 'kc-webinar', title: 'Building Your Creator Business', desc: 'A live session on turning your expertise into a sustainable learning business.', type: 'Webinar', category: 'business', instructor: 'KC Education', img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&fit=crop', isFree: true, duration: 'Live · Oct 18', source: 'KC', status: 'Upcoming' },
  { id: 'kc-class', title: 'Consent in Practice: Open Class', desc: 'A welcoming class on building clear communication and consent into every experience.', type: 'Workshop', category: 'communication', instructor: 'KC Educators', format: 'In-person', img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&q=80&fit=crop', isFree: true, duration: 'Live · Oct 24', source: 'KC', status: 'Upcoming' },
  { id: 'platinum-masterclass', title: 'Advanced Facilitation Masterclass', desc: 'Design richer learning spaces with advanced facilitation frameworks and guided practice.', type: 'Course', category: 'communication', instructor: 'Avery James', level: 'Advanced', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&fit=crop', isFree: false, price: 'Platinum', tier: 'Platinum', accessType: 'locked', requiredMembership: 'Gold', duration: '6 modules', source: 'Educator', status: 'Available' },
  { id: 'negotiation-basics', title: 'Negotiation Basics', desc: 'Build confidence with practical negotiation frameworks and guided scenarios.', type: 'Course', category: 'communication', instructor: 'KC Educators', level: 'Beginner', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&fit=crop', isFree: true, duration: '5 lessons', source: 'KC', status: 'In Progress', progress: 32 },
  { id: 'consent-foundations', title: 'Consent Foundations', desc: 'Explore ongoing consent, boundaries, and clear communication.', type: 'Course', category: 'safety-consent', instructor: 'Jane Doe', level: 'Beginner', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop', isFree: true, duration: '6 lessons', source: 'KC', status: 'In Progress', progress: 80 },
  { id: 'completed-rope-safety', title: 'Rope Safety', desc: 'Foundations in communication, preparation, and informed practice.', type: 'Course', category: 'safety-consent', instructor: 'Jane Doe', level: 'Beginner', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&fit=crop', isFree: false, duration: 'Completed Sep 20', source: 'KC', status: 'Completed', points: 20 },
  { id: 'completed-consent', title: 'Consent Foundations', desc: 'Core concepts for practicing clear and ongoing consent.', type: 'Course', category: 'safety-consent', instructor: 'KC Educators', level: 'Beginner', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop', isFree: true, duration: 'Completed Sep 18', source: 'KC', status: 'Completed', points: 30 },
  { id: 'educator-subscription', title: 'Communication & Connection Studio', desc: 'A monthly collection of classes and guided practices for stronger communication.', type: 'Course', category: 'communication', instructor: 'Jane Doe', level: 'Intermediate', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop', isFree: false, accessType: 'subscription', subscriptionName: "Jane's Studio", duration: 'Monthly · 8 lessons', source: 'Educator', status: 'Available', rating: 4.9, points: 90, tags: ['Communication', 'Relationships', 'Practice'] },
  { id: 'jane-webinar', title: 'Negotiation: Live Q&A', desc: 'Bring your questions to an educator-led live conversation about negotiation and respectful communication.', type: 'Webinar', category: 'communication', instructor: 'Jane Doe', level: 'All levels', img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&fit=crop', isFree: true, format: 'Online', duration: 'Live · Oct 28', source: 'Educator', status: 'Upcoming' },
  { id: 'jane-workshop', title: 'Aftercare Planning Workshop', desc: 'Create a practical aftercare plan through guided prompts and educator feedback.', type: 'Workshop', category: 'safety-consent', instructor: 'Jane Doe', level: 'Intermediate', img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&q=80&fit=crop', isFree: false, price: '$35', format: 'Online', duration: 'Live · Nov 02', source: 'Educator', status: 'Upcoming' },
  { id: 'rope-workshop-live', title: 'Rope Workshop', desc: 'A practical, educator-led workshop covering preparation, communication, and safe rope fundamentals.', type: 'Workshop', category: 'safety-consent', instructor: 'Jane Doe', level: 'Beginner', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&fit=crop', isFree: false, price: '$25', format: 'Online', duration: '90 minutes', source: 'Educator', status: 'Upcoming', eventDate: 'Oct 20', eventTime: '7:00 PM', eventMode: 'Online', whatYouLearn: ['Prepare thoughtfully and communicate clearly', 'Explore foundational rope safety practices', 'Identify ways to keep learning at a comfortable pace'] },
  { id: 'kc-workshop', title: 'Portfolio Review Workshop', desc: 'Get practical feedback and leave with a clear next step for your portfolio.', type: 'Workshop', category: 'design', instructor: 'KC Educators', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop', isFree: true, duration: 'Recorded · 90 min', source: 'KC', status: 'Recorded' },
];
const items = [
  ...COURSES.map((course, i) => ({ ...course, type: 'Course', source: i % 3 === 0 ? 'KC' : 'Educator', level: course.difficulty, status: i === 0 ? 'In Progress' : i === 2 ? 'Completed' : 'Available', isLive: false })),
  ...RESOURCES.map(resource => ({ ...resource, type: resource.type === 'Video' ? 'Video' : 'Article', instructor: resource.author || 'KC Education', isFree: true, source: 'KC', status: 'Available', duration: resource.type === 'Video' ? '12 min' : '8 min read' })),
  ...extras,
];

function EducationCard({ item, onOpen }) {
  const access = item.isFree ? 'Free' : item.tier || item.price || 'Paid';
  return <button className="ec-card" onClick={() => onOpen(item)}>
    <span className="ec-image"><img src={item.img} alt="" /><span className="ec-pill">{item.type}</span><span className="ec-source">{item.source}</span></span>
    <span className="ec-card-content"><span className="ec-category" style={{ color: categoryColor(item.category) }}>{categoryLabel(item.category)}</span><strong>{item.title}</strong><span className="ec-card-desc">{item.desc || `A practical ${item.level?.toLowerCase() || ''} learning experience with ${item.instructor}.`}</span><span className="ec-meta">{item.instructor} <i>·</i> {item.level || item.duration || 'Self paced'}</span><span className="ec-access-row"><i className={`ec-access ec-access-${access.toLowerCase().replace(/[^a-z]/g, '')}`}>{access}</i>{item.price?.startsWith('$') && <b>{item.price}</b>}</span>{item.progress > 0 && <span className="ec-card-progress"><span>Progress <b>{item.progress}%</b></span><i><b style={{ width: `${item.progress}%` }} /></i></span>}<span className="ec-card-cta">View</span></span>
  </button>;
}

export default function EducationCenterPage({ avatarUrl, onNavigate }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState('home');
  const [activeEducator, setActiveEducator] = useState(null);
  const [activeStore, setActiveStore] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(false);
  const [subscriptionReturn, setSubscriptionReturn] = useState('store');
  const [subscribedEducators, setSubscribedEducators] = useState(() => new Set());
  const [filter, setFilter] = useState('All');
  const [category, setCategory] = useState('All topics');
  const [selected, setSelected] = useState(null);
  const [joined, setJoined] = useState(() => new Set(['data-science-for-business', 'kc-workshop']));
  const [purchased, setPurchased] = useState(() => new Set(['advanced-ui-design-systems', 'financial-modeling-for-leaders']));
  const [saved, setSaved] = useState(() => new Set(['ux-research-methods', 'res-2', 'res-5', 'kc-class']));
  const [view, setView] = useState('all');
  const [browseType, setBrowseType] = useState('All');
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_EDU_FILTERS, categories: new Set() }));
  const [pendingF, setPendingF] = useState(() => ({ ...DEFAULT_EDU_FILTERS, categories: new Set() }));
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!showFilter) return;
    const onKeyDown = e => { if (e.key === 'Escape') setShowFilter(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showFilter]);

  function openFilter() {
    setPendingF({ ...filters, categories: new Set(filters.categories) });
    setShowFilter(true);
  }
  function commitFilters(next) {
    setFilters(next);
    setShowFilter(false);
  }
  function applyFilters() {
    commitFilters({ ...pendingF, categories: new Set(pendingF.categories) });
  }
  function resetFilters() {
    const def = { ...DEFAULT_EDU_FILTERS, categories: new Set() };
    setPendingF(def);
    commitFilters(def);
    setCategory('All topics');
  }

  const activeFilterCount =
    filters.categories.size +
    (filters.access !== 'All' ? 1 : 0) +
    (filters.level !== 'All' ? 1 : 0) +
    (filters.format !== 'All' ? 1 : 0) +
    (filters.status !== 'All' ? 1 : 0);

  const [notice, setNotice] = useState('');
  const [dashboardSection, setDashboardSection] = useState('Overview');
  const [educatorProfile, setEducatorProfile] = useState({ displayName: 'Jane Doe', title: 'Certified Educator', location: '', bio: 'I create thoughtful, practical learning experiences for the community.', experience: '6+ years of community education experience', qualifications: 'Certified Relationship & Consent Educator; Advanced Facilitation Certificate', areas: 'Safety & Consent, Communication', specialties: 'Consent & Safety, Communication, Negotiation, Rope Foundations', website: '', profileImage: '', isPublic: true, showLocation: true });
  const [educatorCourses, setEducatorCourses] = useState([
    { id: 'sample-consent-course', title: 'Consent Foundations', category: 'Safety & Consent', status: 'Published', learners: 128, updated: 'Updated recently', level: 'Beginner', modules: [] },
    { id: 'sample-communication-course', title: 'Communication & Connection', category: 'Communication', status: 'Draft', learners: 0, updated: 'Draft · not published', level: 'Intermediate', modules: [] },
  ]);

  const filtered = useMemo(() => items.filter(item => {
    const textMatch = `${item.title} ${item.desc || ''} ${item.instructor}`.toLowerCase().includes(query.toLowerCase());
    const topicMap = {
      'Safety & Consent': ['safety-consent'],
      Communication: ['communication'],
      Rope: ['rope', 'safety-consent'],
      'Power Exchange': ['power-exchange'],
      Sensation: ['sensation']
    };
    const matchesCategoryName = catName => {
      if (catName === 'All topics' || catName === 'All') return true;
      return categoryLabel(item.category) === catName || topicMap[catName]?.includes(item.category);
    };

    let catMatch = true;
    if (filters.categories && filters.categories.size > 0) {
      catMatch = Array.from(filters.categories).some(catName => matchesCategoryName(catName));
    } else if (category && category !== 'All topics') {
      catMatch = matchesCategoryName(category);
    }

    let filterMatch = browseType === 'All' || (browseType === 'Classes' ? ['Webinar', 'Workshop'].includes(item.type) : item.type === browseType.slice(0, -1));
    const format = item.format || (item.status === 'Upcoming' ? 'Live' : item.status === 'Recorded' || item.type === 'Video' ? 'Recorded' : item.type);
    const access = item.isFree ? 'Free' : item.tier || 'Paid';

    if (filters.level && filters.level !== 'All') {
      filterMatch = filterMatch && (item.level || '').toLowerCase() === filters.level.toLowerCase();
    }
    if (filters.access && filters.access !== 'All') {
      if (filters.access === 'Paid') filterMatch = filterMatch && !item.isFree;
      else if (filters.access === 'Free') filterMatch = filterMatch && item.isFree;
      else filterMatch = filterMatch && access.toLowerCase() === filters.access.toLowerCase();
    }
    if (filters.format && filters.format !== 'All') {
      if (filters.format === 'Online' || filters.format === 'In-person') {
        filterMatch = filterMatch && (item.format || 'Online') === filters.format;
      } else {
        filterMatch = filterMatch && (format === filters.format || item.type === filters.format);
      }
    }
    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'Purchased') filterMatch = filterMatch && joined.has(item.id);
      else if (filters.status === 'Subscribed') filterMatch = filterMatch && item.status === 'Subscribed';
      else filterMatch = filterMatch && item.status === filters.status;
    }

    const viewMatch = view === 'all' || (view === 'learning' ? joined.has(item.id) || item.status === 'In Progress' || item.status === 'Completed' : saved.has(item.id));
    return textMatch && catMatch && filterMatch && viewMatch;
  }), [query, category, filter, joined, saved, view, browseType, filters]);

  const openDiscovery = () => {
    setPage('discovery');
    setBrowseType('All');
    const def = { ...DEFAULT_EDU_FILTERS, categories: new Set() };
    setFilters(def);
    setPendingF(def);
    setCategory('All topics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyQuickFilter = (nextCategory, nextBrowseType) => {
    setCategory(nextCategory);
    setBrowseType(nextBrowseType);
    const newCats = nextCategory === 'All topics' ? new Set() : new Set([nextCategory]);
    const newFilters = { ...DEFAULT_EDU_FILTERS, categories: newCats };
    setFilters(newFilters);
    setPendingF(newFilters);
    setPage('discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetQuickFilters = () => {
    setCategory('All topics');
    setBrowseType('All');
    const def = { ...DEFAULT_EDU_FILTERS, categories: new Set() };
    setFilters(def);
    setPendingF(def);
  };
  const quickFiltersActive = category !== 'All topics' || browseType !== 'All';
  const openUpcoming = () => { setPage('upcoming'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const section = (title, collection, sub = '') => <section className="ec-section" key={title}><div className="ec-section-heading"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div><button onClick={title.toLowerCase().startsWith('upcoming') ? openUpcoming : openDiscovery}>{title.toLowerCase().startsWith('upcoming') ? 'View Upcoming' : 'View All'}</button></div><div className="ec-grid">{collection.slice(0, 4).map(item => <EducationCard key={item.id} item={item} onOpen={setSelected} />)}</div></section>;
  // Horizontal-scroll variant for the Top Pick / Trending strips — fixed-width
  // cards in a scrollable row instead of the wrapping grid the other sections use.
  const scrollSection = (title, collection, sub = '') => <section className="ec-scroll-section" key={title}><div className="ec-section-heading"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div><button className="ec-explore-all-btn" onClick={openDiscovery}>Explore All Education</button></div><div className="ec-scroll-row">{collection.slice(0, 6).map(item => <EducationCard key={item.id} item={item} onOpen={setSelected} />)}</div></section>;
  const topPicks = items.slice(0, 6);
  const trending = [...items].sort((a, b) => (b.rating || 4.8) - (a.rating || 4.7)).slice(0, 6);
  const recommended = items.slice(3, 7);
  const continueItems = items.filter(item => item.status === 'In Progress' || joined.has(item.id));
  const popular = [...items].sort((a, b) => (b.rating || 4.8) - (a.rating || 4.7)).slice(0, 4);
  const upcoming = items.filter(item => item.status === 'Upcoming' || item.type === 'Webinar');
  const free = items.filter(item => item.isFree).slice(0, 4);
  const newItems = items.slice(-4);
  const courses = items.filter(item => item.type === 'Course');
  const recorded = items.filter(item => item.status === 'Recorded' || (item.type === 'Video' && !item.isLive));
  const topics = ['All topics', 'Safety & Consent', 'Communication', 'Rope', 'Power Exchange', 'Sensation', ...CATEGORIES.map(c => c.label)];
  if (selected) return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducationDetailPage item={selected} isJoined={joined.has(selected.id) || purchased.has(selected.id)} isSaved={saved.has(selected.id)} onToggleSaved={() => setSaved(prev => { const next = new Set(prev); next.has(selected.id) ? next.delete(selected.id) : next.add(selected.id); return next; })} onOpenEducator={() => { setActiveEducator(selected.instructor || 'Jane Doe'); setActiveStore(false); setSelected(null); }} onBack={() => setSelected(null)} onStart={() => { setJoined(prev => new Set(prev).add(selected.id)); setNotice(`${selected.title} added to My Learning.`); setSelected(null); }} onAccessGranted={() => { setJoined(prev => new Set(prev).add(selected.id)); setPurchased(prev => new Set(prev).add(selected.id)); }} /></>;
  if (activeSubscription && activeEducator) return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducationSubscriptionPage educatorName={activeEducator} subscribed={subscribedEducators.has(activeEducator)} onBack={() => { setActiveSubscription(false); setActiveStore(subscriptionReturn === 'store'); }} onSubscribe={() => setSubscribedEducators(prev => new Set(prev).add(activeEducator))} /></>;
  if (activeStore && activeEducator) return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducationStorefrontPage educatorName={activeEducator} profile={activeEducator === 'Jane Doe' ? educatorProfile : undefined} items={items} subscribed={subscribedEducators.has(activeEducator)} onBack={() => setActiveStore(false)} onOpenSubscription={() => { setSubscriptionReturn('store'); setActiveSubscription(true); }} onOpenEducation={setSelected} /></>;
  if (activeEducator) return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducatorProfilePage educatorName={activeEducator} profile={activeEducator === 'Jane Doe' ? educatorProfile : undefined} items={items} onBack={() => setActiveEducator(null)} onOpenStore={() => setActiveStore(true)} onOpenSubscription={() => { setSubscriptionReturn('profile'); setActiveSubscription(true); }} onOpenEducation={setSelected} /></>;
  if (page === 'upcoming') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><UpcomingEducationPage items={items.filter(item => item.status === 'Upcoming' || item.isLive)} onBack={() => setPage('home')} onOpenEducator={name => { setActiveEducator(name); setActiveStore(false); }} onBrowseAll={openDiscovery} /></>;
  if (page === 'learning') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducationMyLearningPage items={items} joined={joined} purchased={purchased} saved={saved} onRemoveSaved={id => setSaved(prev => { const next = new Set(prev); next.delete(id); return next; })} onBack={() => setPage('home')} onOpen={setSelected} onProgress={() => setPage('progress')} /></>;
  if (page === 'progress') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducationProgressPage onBack={() => setPage('learning')} /></>;
  if (page === 'become-educator') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><BecomeEducatorPage onBack={() => setPage('home')} /></>;
  if (page === 'educator-plans') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducatorPlansPage onBack={() => setPage('educator-workspace')} /></>;
  if (page === 'educator-workspace') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducatorWorkspacePage onBack={() => setPage('home')} coursesCount={educatorCourses.length} onOpenTool={tool => { if (tool === 'Plans') { setPage('educator-plans'); return; } const tabs = { 'Educator Dashboard': 'Overview', 'Create Course': 'Education', 'Total Courses': 'Education', 'Plans': 'Subscriptions', 'Course Builder': 'Education', 'Student Management': 'Students', 'Subscription Management': 'Subscriptions', Events: 'Events', Analytics: 'Analytics', Financials: 'Financial', 'KC Contribution': 'KC Contribution' }; if (tool === 'Educator Store') { setActiveEducator('Jane Doe'); setActiveStore(true); } else { setDashboardSection(tabs[tool] || 'Overview'); setPage('educator-dashboard'); } }} /></>;
  if (page === 'educator-dashboard') return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><EducatorDashboardPage initialSection={dashboardSection} profile={educatorProfile} onProfileChange={updates => setEducatorProfile(prev => ({ ...prev, ...updates }))} courses={educatorCourses} onCoursesChange={setEducatorCourses} onBack={() => setPage('educator-workspace')} onOpenProfile={() => { setActiveEducator('Jane Doe'); setActiveStore(false); }} onOpenStore={() => { setActiveEducator('Jane Doe'); setActiveStore(true); }} /></>;
  return <><AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={onNavigate} /><main className="ec-page">
    <div className="ec-topbar">{page === 'discovery' && <EducationBackButton onClick={() => setPage('home')} label="Education home" className="edu-back-btn--inline" />}<label className="ec-search ec-search-compact"><SearchIcon /><input aria-label="Search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" /></label><div className="ec-top-actions"><button className="ec-educator-cta" onClick={() => setPage('become-educator')}>Become a Certified Educator</button><button className="ec-educator-workspace-cta" onClick={() => setPage('educator-workspace')}>Educator Workspace</button><button onClick={() => setPage('learning')}><BookIcon /> My Learning</button><button className={view === 'saved' ? 'active' : ''} onClick={() => { setView(view === 'saved' ? 'all' : 'saved'); setFilter('All'); openDiscovery(); }}><HeartIcon filled={view === 'saved'} /> Saved <span>{saved.size}</span></button></div></div>
    {page === 'home' && <>
    <section className="ec-hub-banner">
      <span className="ec-hub-banner-icon"><CompassIcon /></span>
      <div className="ec-hub-banner-copy">
        <h2>Explore the Education Hub</h2>
        <p>Discover courses, articles, videos, and live classes from KC and independent educators — everything there is to learn, all in one place.</p>
      </div>
      <button className="ec-hub-banner-btn" onClick={openDiscovery}>Explore Education Hub</button>
    </section>
    {scrollSection('Top Pick', topPicks, 'Hand-picked education to get you started.')}
    {scrollSection('Trending', trending, 'What the community is learning right now.')}
    <nav className="ec-categories" aria-label="Education categories">
      <span>Explore by topic</span>
      <div className="ec-category-filters">
        <div className="ec-filter-select-wrap">
          <select aria-label="Filter by topic" value={category} onChange={e => applyQuickFilter(e.target.value, browseType)}>
            {topics.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <span className="ec-filter-chevron"><ChevronDownIcon /></span>
        </div>
        <div className="ec-filter-select-wrap">
          <select aria-label="Filter by type" value={browseType} onChange={e => applyQuickFilter(category, e.target.value)}>
            {BROWSE_TABS.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <span className="ec-filter-chevron"><ChevronDownIcon /></span>
        </div>
        <button className="ec-filter-reset" disabled={!quickFiltersActive} onClick={resetQuickFilters}>Reset</button>
      </div>
    </nav>
    {/* Commented out for now — not needed below the topic/type filter bar.
    <section className="ec-section ec-featured"><div className="ec-section-heading"><div><span className="ec-eyebrow">EDITOR'S PICK</span><h2>Featured education</h2><p>Fresh perspectives selected for curious minds.</p></div><button onClick={openDiscovery}>Explore All Education</button></div><div className="ec-feature-grid">{items.filter(item => item.type === 'Course').slice(0, 3).map(item => <EducationCard key={item.id} item={item} onOpen={setSelected} />)}</div><div className="ec-featured-detail"><div><span>{categoryLabel(COURSES[0].category)} · {COURSES[0].difficulty} · {COURSES[0].isFree ? 'Free' : 'Paid'}</span><strong>{COURSES[0].title}</strong><small>with {COURSES[0].instructor} · {COURSES[0].duration}</small></div><button onClick={() => setSelected(items.find(item => item.id === COURSES[0].id))}>View Course</button></div></section>
    {section('Recommended for you', recommended, 'A few good places to keep exploring.')}
    {continueItems.length > 0 && <section className="ec-section"><div className="ec-section-heading"><div><h2>Continue learning</h2><p>Pick up right where you left off.</p></div></div><div className="ec-resume-grid">{continueItems.slice(0, 3).map(item => <article className="ec-resume-card" key={item.id} onClick={() => setSelected(item)}><img src={item.img} alt=""/><div><span className="ec-eyebrow">{item.module || 'Continue your course'}</span><h3>{item.title}</h3><p>Progress: {item.progress || 35}%</p><div className="ec-progress"><i style={{ width: `${item.progress || 35}%` }} /></div><button onClick={e => { e.stopPropagation(); setSelected(item); }}>Continue</button></div></article>)}</div></section>}
    {section('Popular education', popular, 'Loved by learners across the community.')}
    {section('New education', newItems, 'Recently added to the learning library.')}
    {section('Courses', courses, 'Structured paths to build practical skills.')}
    {section('Recorded classes', recorded, 'Watch a session whenever it works for you.')}
    {section('Upcoming education', upcoming, 'Join a live session or catch a fresh recording.')}
    {section('Free to explore', free, 'Start learning today, at no cost.')}
    <section className="ec-my-learning"><div><span className="ec-eyebrow">YOUR LEARNING SPACE</span><h2>My learning</h2><p>Keep your saved and joined education close at hand.</p></div><button onClick={() => setPage('learning')}>View my learning</button><div className="ec-learning-stats"><span><b>{joined.size}</b>Joined</span><span><b>{continueItems.length}</b>In progress</span><span><b>1</b>Completed</span></div></section>
    */}
    </>}
    {page === 'discovery' && <section className="ec-center" id="education-center-results"><div className="ec-center-title"><div><h2>Education Hub</h2><p>Explore courses, articles, videos and classes from KC and independent educators.</p></div></div>
      <div className="ec-browse-tabs-bar">
        <div className="ec-browse-tabs">{BROWSE_TABS.map(tab => <button className={browseType === tab ? 'active' : ''} key={tab} onClick={() => setBrowseType(tab)}>{tab}</button>)}</div>
        <button
          type="button"
          className={`ev-disc-filter-btn${activeFilterCount > 0 ? ' ev-disc-filter-btn--active' : ''}`}
          onClick={openFilter}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filters{activeFilterCount > 0 && <span className="ev-filter-badge">{activeFilterCount}</span>}
        </button>
      </div>
      <div className="ec-browse-layout">
        <div className="ec-results"><div className="ec-results-head"><span>{browseType === 'All' ? 'All education' : browseType}</span><span>{filtered.length} results</span></div>{filtered.length ? <div className="ec-grid">{filtered.map(item => <EducationCard key={item.id} item={item} onOpen={setSelected} />)}</div> : <div className="ec-empty"><b>No matches just yet</b><span>Try another topic or filter.</span><button onClick={() => { const def = { ...DEFAULT_EDU_FILTERS, categories: new Set() }; setFilters(def); setPendingF(def); setBrowseType('All'); setCategory('All topics'); setQuery(''); }}>Clear filters</button></div>}</div>
      </div></section>}
    {showFilter && (
      <>
        <div className="ev-filter-backdrop" onClick={() => setShowFilter(false)} />
        <div className="ev-filter-panel">
          <div className="ev-filter-panel-header">
            <span className="ev-filter-panel-title">Filters</span>
            <div className="ev-filter-header-actions">
              <button type="button" className="ev-filter-reset-btn" onClick={resetFilters}>Reset All</button>
              <button type="button" className="ev-filter-apply-btn" onClick={applyFilters}>Apply Filters</button>
              <button type="button" className="ev-filter-close-btn" onClick={() => setShowFilter(false)} aria-label="Close filters">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div className="ev-filter-panel-body">
            {/* Access & Price */}
            <div className="ev-filter-section">
              <h4 className="ev-filter-section-title">Access & Price</h4>
              <div className="ev-filter-type-row" style={{ flexWrap: 'wrap' }}>
                {['All', 'Free', 'Paid', 'Gold', 'Platinum'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`ev-filter-type-btn${pendingF.access === t ? ' ev-filter-type-btn--active' : ''}`}
                    onClick={() => setPendingF(p => ({ ...p, access: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="ev-filter-section">
              <h4 className="ev-filter-section-title">Difficulty Level</h4>
              <div className="ev-filter-type-row">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`ev-filter-type-btn${pendingF.level === t ? ' ev-filter-type-btn--active' : ''}`}
                    onClick={() => setPendingF(p => ({ ...p, level: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="ev-filter-section">
              <h4 className="ev-filter-section-title">Format</h4>
              <div className="ev-filter-type-row" style={{ flexWrap: 'wrap' }}>
                {['All', 'Course', 'Webinar', 'Workshop', 'Live', 'Recorded', 'Online', 'In-person'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`ev-filter-type-btn${pendingF.format === t ? ' ev-filter-type-btn--active' : ''}`}
                    onClick={() => setPendingF(p => ({ ...p, format: t }))}
                    style={{ flex: '1 1 calc(25% - 8px)', minWidth: '70px' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="ev-filter-section">
              <h4 className="ev-filter-section-title">Status</h4>
              <div className="ev-filter-type-row" style={{ flexWrap: 'wrap' }}>
                {['All', 'Upcoming', 'In Progress', 'Completed', 'Purchased'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`ev-filter-type-btn${pendingF.status === t ? ' ev-filter-type-btn--active' : ''}`}
                    onClick={() => setPendingF(p => ({ ...p, status: t }))}
                    style={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '85px' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="ev-filter-section">
              <div className="ev-filter-section-head">
                <h4 className="ev-filter-section-title">Topics & Categories</h4>
                {pendingF.categories.size > 0 && (
                  <button
                    type="button"
                    className="ev-filter-clear-link"
                    onClick={() => setPendingF(p => ({ ...p, categories: new Set() }))}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="ev-filter-cats-grid">
                {CATEGORY_OPTIONS.map(cat => (
                  <label key={cat} className="ev-filter-check-label">
                    <input
                      type="checkbox"
                      className="ev-filter-checkbox"
                      checked={pendingF.categories.has(cat)}
                      onChange={() => {
                        setPendingF(prev => {
                          const nextCats = new Set(prev.categories);
                          if (nextCats.has(cat)) nextCats.delete(cat);
                          else nextCats.add(cat);
                          return { ...prev, categories: nextCats };
                        });
                      }}
                    />
                    <span className="ev-filter-check-box" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    {selected && <div className="ec-modal-backdrop" onClick={() => setSelected(null)}><article className="ec-modal" onClick={e => e.stopPropagation()}><button className="ec-modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button><img src={selected.img} alt=""/><div className="ec-modal-body"><span className="ec-eyebrow">{selected.source} · {selected.type}</span><h2>{selected.title}</h2><p>{selected.desc || `Build practical skills with ${selected.instructor} in this ${selected.duration} learning experience.`}</p><div className="ec-modal-meta">{selected.instructor}　·　{selected.level || selected.duration || 'Self paced'}　·　{selected.isFree ? 'Free' : selected.price || 'Premium'}</div><div className="ec-modal-actions"><button className="ec-primary" onClick={() => { if (selected.status === 'Upcoming') setNotice(`You're on the list for ${selected.title}.`); else { setJoined(prev => new Set(prev).add(selected.id)); setNotice(`${selected.title} added to My learning.`); } setSelected(null); }}>{selected.status === 'Upcoming' ? 'Reserve a spot' : joined.has(selected.id) ? 'Continue learning' : selected.isFree ? 'Start Learning' : 'View Course'}</button><button className="ec-save-btn" onClick={() => setSaved(prev => { const next = new Set(prev); next.has(selected.id) ? next.delete(selected.id) : next.add(selected.id); return next; })}>{saved.has(selected.id) ? '♥ Saved' : '♡ Save'}</button></div></div></article></div>}
    {notice && <div role="status" className="ec-toast">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </main></>;
}
