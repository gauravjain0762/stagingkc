import { useState } from 'react';
import { useSelector } from 'react-redux';
import EducationBackButton from './EducationBackButton';
import './EducatorDashboardPage.css';
import './EducatorProfileManagement.css';
import EducatorEducationManagement from './EducatorEducationManagement';

function HomeIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function BookIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>; }
function UsersIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function RefreshIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>; }
function CalendarIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ChartIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function DollarIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function DiamondIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>; }
function UserIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SearchIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function PlusIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }

const navigation = ['Overview', 'Education', 'Students', 'Subscriptions', 'Events', 'Analytics', 'Financial', 'KC Contribution', 'Profile'];
const navIcons = [HomeIcon, BookIcon, UsersIcon, RefreshIcon, CalendarIcon, ChartIcon, DollarIcon, DiamondIcon, UserIcon];
const initialCourses = [
  { id: 'sample-consent-course', title: 'Consent Foundations', category: 'Safety & Consent', status: 'Published', learners: 128, updated: 'Updated recently', level: 'Beginner', modules: [] },
  { id: 'sample-communication-course', title: 'Communication & Connection', category: 'Communication', status: 'Draft', learners: 0, updated: 'Draft · not published', level: 'Intermediate', modules: [] },
];

function Metric({ label, value, note }) {
  return <article className="ed-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export default function EducatorDashboardPage({
  initialSection = 'Overview',
  hideSidebar: hideSidebarProp,
  profile,
  onProfileChange,
  courses: propCourses,
  onCoursesChange,
  onBack,
  onOpenProfile,
  onOpenStore
}) {
  const [section, setSection] = useState(initialSection);
  const [localCourses, setLocalCourses] = useState(initialCourses);
  const courses = propCourses ?? localCourses;
  const setCourses = onCoursesChange ?? setLocalCourses;
  const [notice, setNotice] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [startNewTrigger, setStartNewTrigger] = useState(0);

  const { user: authUser } = useSelector(state => state.auth || {});
  const { profile: reduxProfile } = useSelector(state => state.profile || {});
  const rawUsername = reduxProfile?.username || authUser?.username || reduxProfile?.fullName || authUser?.fullName || authUser?.name || 'Tom';
  const username = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername;

  const isCreateCourse = section === 'Education';
  const hideSidebar = hideSidebarProp ?? isCreateCourse;

  const content = {
    Overview: <>
      <div className="ed-metrics"><Metric label="Published education" value={courses.filter(course => course.status === 'Published').length} note="Courses and learning"/><Metric label="Learners" value="128" note="Across your education"/><Metric label="Subscribers" value="34" note="Active subscriptions"/><Metric label="Upcoming events" value="2" note="Classes and webinars"/></div>
      <div className="ed-overview-grid"><section className="ed-panel"><div className="ed-panel-head"><div><h3>Recent education</h3><p>Your latest courses and content</p></div><button onClick={() => setSection('Education')}>Manage education</button></div>{courses.slice(0,3).map(course => <div className="ed-list-row" key={course.title}><span className="ed-row-icon"><BookIcon /></span><div><b>{course.title}</b><small>{course.category} · {course.updated}</small></div><i className={`ed-state ed-state-${course.status.toLowerCase()}`}>{course.status}</i></div>)}</section><section className="ed-panel"><div className="ed-panel-head"><div><h3>Next up</h3><p>Upcoming educator sessions</p></div><button onClick={() => setSection('Events')}>View events</button></div><div className="ed-event-mini"><span>OCT<br/><b>20</b></span><div><b>Rope Workshop</b><small>7:00 PM · Online</small></div><i>Upcoming</i></div><div className="ed-event-mini"><span>OCT<br/><b>28</b></span><div><b>Negotiation: Live Q&amp;A</b><small>6:30 PM · Online</small></div><i>Upcoming</i></div></section></div>
      <section className="ed-panel ed-quick-actions"><div className="ed-panel-head"><div><h3>Quick actions</h3><p>Keep your educator work moving</p></div></div><div><button onClick={() => setSection('Education')}><PlusIcon /> Create course</button><button onClick={() => setSection('Events')}><PlusIcon /> Plan an event</button><button onClick={onOpenStore}>Open educator store</button></div></section>
    </>,
    Education: (
      <EducatorEducationManagement
        courses={courses}
        onCoursesChange={setCourses}
        builderOpen={builderOpen}
        onBuilderOpenChange={setBuilderOpen}
        startNewTrigger={startNewTrigger}
      />
    ),
    Students: <section className="ed-panel"><div className="ed-panel-head"><div><h3>Students</h3><p>People learning from your published education.</p></div><label className="ed-search"><SearchIcon /><input placeholder="Search students" /></label></div><div className="ed-table"><div className="ed-table-row ed-table-header"><span>Member</span><span>Learning</span><span>Progress</span><span>Last active</span></div>{[['Alex Morgan','Consent Foundations','72%','Today'],['Sam Rivera','Consent Foundations','45%','Yesterday'],['Jordan Lee','Consent Foundations','100%','Sep 28']].map(row => <div className="ed-table-row" key={row[0]}>{row.map((cell, i) => <span key={i}>{cell}</span>)}</div>)}</div></section>,
    Subscriptions: <><div className="ed-metrics"><Metric label="Active subscribers" value="34" note="Across your plans"/><Metric label="Monthly plan" value="$19" note="Jane's Studio"/><Metric label="Annual plan" value="$190" note="Billed yearly"/><Metric label="Renewals soon" value="6" note="Next 30 days"/></div><section className="ed-panel"><div className="ed-panel-head"><div><h3>Subscription management</h3><p>Review your plans and member access.</p></div><button onClick={onOpenStore}>View subscriber storefront</button></div><div className="ed-plan-row"><div><b>Jane's Studio</b><small>Subscriber-only courses · Monthly webinar · Live class discounts</small></div><span className="ed-state ed-state-published">Active</span><button onClick={() => setNotice('Plan settings are available in this demo.')}>Manage plan</button></div></section></>,
    Events: <section className="ed-panel"><div className="ed-panel-head"><div><h3>Events</h3><p>Manage upcoming classes, webinars, and workshops.</p></div><button className="ed-primary" onClick={() => setNotice('Event creation is available in this demo.')}><PlusIcon /> Create Event</button></div>{[['Rope Workshop','Oct 20 · 7:00 PM · Online','$25'],['Negotiation: Live Q&A','Oct 28 · 6:30 PM · Online','Free']].map(event => <div className="ed-plan-row" key={event[0]}><div><b>{event[0]}</b><small>{event[1]}</small></div><span>{event[2]}</span><button onClick={() => setNotice(`${event[0]} event details opened in demo.`)}>Manage</button></div>)}</section>,
    Analytics: <><div className="ed-metrics"><Metric label="Education views" value="2,840" note="This month"/><Metric label="Learner enrollment" value="128" note="All time"/><Metric label="Completion rate" value="76%" note="Across courses"/><Metric label="Store visits" value="612" note="This month"/></div><section className="ed-panel"><div className="ed-panel-head"><div><h3>Learning engagement</h3><p>Demo overview of learner activity.</p></div><span className="ed-period">Last 30 days</span></div><div className="ed-chart" aria-label="Engagement trend"><i style={{height:'34%'}}/><i style={{height:'52%'}}/><i style={{height:'43%'}}/><i style={{height:'70%'}}/><i style={{height:'57%'}}/><i style={{height:'82%'}}/><i style={{height:'66%'}}/><i style={{height:'94%'}}/><i style={{height:'74%'}}/><i style={{height:'100%'}}/><i style={{height:'80%'}}/><i style={{height:'88%'}}/></div><div className="ed-chart-labels"><span>Sep 07</span><span>Sep 21</span><span>Oct 06</span></div></section></>,
    Financial: <><div className="ed-metrics"><Metric label="Gross sales" value="$2,460" note="Demo total"/><Metric label="Available balance" value="$1,840" note="Before applicable fees"/><Metric label="Pending" value="$620" note="Estimated payouts"/><Metric label="Next payout" value="Oct 15" note="Schedule example"/></div><section className="ed-panel"><div className="ed-panel-head"><div><h3>Financial activity</h3><p>Demo figures only. Final fees and payout terms are confirmed during onboarding.</p></div><button onClick={() => setNotice('Financial report downloaded in this demo.')}>Download report</button></div><div className="ed-plan-row"><div><b>Course and subscription earnings</b><small>Recent activity · Demo data</small></div><strong>$2,460</strong><button onClick={() => setNotice('Transaction details opened in demo.')}>View details</button></div></section></>,
    'KC Contribution': <section className="ed-panel"><div className="ed-panel-head"><div><h3>KC Contribution</h3><p>Review the educator contribution requirement and its status.</p></div><span className="ed-state ed-state-published">Active</span></div><div className="ed-contribution"><b>Monthly educator contribution</b><strong>Confirmed during onboarding</strong><p>Your contribution amount, due date, and payment terms will be shown here after confirmation. No amount is assumed in this demo.</p><button onClick={() => setNotice('Contribution details are shown as a demo placeholder.')}>View contribution details</button></div></section>,
    Profile: <section className="ed-profile-management">
      <div className="ed-profile-toolbar"><div><span className="ed-kicker">PUBLIC EDUCATOR PRESENCE</span><h3>Profile Management</h3><p>Keep your educator profile and storefront information up to date.</p></div><div className="ed-profile-actions"><button onClick={onOpenProfile}>Preview public profile</button><button onClick={onOpenStore}>Preview educator store</button></div></div>
      <form className="ed-panel ed-profile-edit-form" onSubmit={event => { event.preventDefault(); setNotice('Educator profile saved in this demo.'); window.setTimeout(() => setNotice(''), 3500); }}>
        <div className="ed-profile-image-field"><div className="ed-profile-avatar">{profile?.profileImage ? <img src={profile.profileImage} alt="Profile preview" /> : <span>{(profile?.displayName || 'Jane Doe').split(' ').map(part => part[0]).join('').slice(0,2)}</span>}</div><label>Profile image<input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => onProfileChange?.({ profileImage: String(reader.result) }); reader.readAsDataURL(file); }} /><small>Choose an image for your public educator profile.</small></label></div>
        <div className="ed-profile-form"><label>Display name<input value={profile?.displayName || ''} onChange={event => onProfileChange?.({ displayName: event.target.value })} required /></label><label>Professional title<input value={profile?.title || ''} onChange={event => onProfileChange?.({ title: event.target.value })} /></label><label>Location<input value={profile?.location || ''} onChange={event => onProfileChange?.({ location: event.target.value })} placeholder="City, region, or country" /></label><label>Public website or resource link<input value={profile?.website || ''} onChange={event => onProfileChange?.({ website: event.target.value })} placeholder="https://" /></label>
          <label className="ed-profile-wide">Bio<textarea value={profile?.bio || ''} onChange={event => onProfileChange?.({ bio: event.target.value })} rows="4" placeholder="Introduce yourself to learners." /></label>
          <label>Experience<textarea value={profile?.experience || ''} onChange={event => onProfileChange?.({ experience: event.target.value })} rows="3" placeholder="Relevant teaching and professional experience" /></label>
          <label>Qualifications<textarea value={profile?.qualifications || ''} onChange={event => onProfileChange?.({ qualifications: event.target.value })} rows="3" placeholder="Qualifications, certifications, and training" /></label>
          <label>Areas of education<input value={profile?.areas || ''} onChange={event => onProfileChange?.({ areas: event.target.value })} placeholder="e.g. Safety & Consent, Communication" /></label>
          <label>Educational specialties<input value={profile?.specialties || ''} onChange={event => onProfileChange?.({ specialties: event.target.value })} placeholder="Add specialties separated by commas" /></label>
        </div>
        <fieldset className="ed-profile-visibility"><legend>Public information</legend><label><input type="checkbox" checked={Boolean(profile?.isPublic)} onChange={event => onProfileChange?.({ isPublic: event.target.checked })} /> Show my educator profile publicly</label><label><input type="checkbox" checked={Boolean(profile?.showLocation)} onChange={event => onProfileChange?.({ showLocation: event.target.checked })} /> Show my location on my profile</label></fieldset>
        <div className="ed-profile-save-row"><small>Changes are saved locally for this demo. No API is connected.</small><button className="ed-primary" type="submit">Save Profile</button></div>
      </form>
    </section>,
  };

  return <main className="ed-dashboard-page">
    <EducationBackButton onClick={onBack} label={hideSidebar ? 'Educator Workspace' : 'Education Home'} />
    <header className="ed-dashboard-header">
      <div>
        <span className="ed-kicker">welcome {username}</span>
        <h1>{hideSidebar ? 'Total Courses' : 'Educator Dashboard'}</h1>
        <p>{hideSidebar ? 'Build, manage, and publish your courses as a Certified Educator.' : 'Manage your education, students, and educator business from one place.'}</p>
      </div>
      <div className="ed-header-right">
        {section === 'Education' && !builderOpen && (
          <button
            type="button"
            className="ed-primary ed-create-course-header-btn"
            onClick={() => setStartNewTrigger(c => c + 1)}
          >
            ＋ Create Course
          </button>
        )}
        <span className="ec-educator-enabled">
          <span className="ec-educator-active-dot" />
          Active
        </span>
      </div>
    </header>
    <div className={`ed-dashboard-layout${hideSidebar ? ' ed-dashboard-layout--full' : ''}`}>
      {!hideSidebar && (
        <aside className="ed-sidebar" aria-label="Educator dashboard sections">
          {navigation.map((item, index) => {
            const Icon = navIcons[index];
            return <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}><span><Icon /></span>{item}</button>;
          })}
        </aside>
      )}
      <section className="ed-main">
        {!hideSidebar && (
          <div className="ed-content-title">
            <div>
              <h2>{section}</h2>
              <p>{section === 'Overview' ? 'A snapshot of your educator activity.' : `Manage your ${section.toLowerCase()} as a Certified Educator.`}</p>
            </div>
            <span className="ed-demo-badge">DEMO DATA</span>
          </div>
        )}
        {content[section]}
      </section>
    </div>
    {notice && <div className="ed-toast" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
  </main>;
}
