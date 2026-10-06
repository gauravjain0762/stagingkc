import { useState } from 'react';
import { categoryLabel, categoryColor } from './educationData';
import './EducationMyLearningPage.css';

const TABS = ['Overview', 'In Progress', 'Completed', 'Purchased', 'Saved', 'Subscriptions', 'Learning Paths'];
const PATHS = [
  { id: 'consent', title: 'Consent Foundations', courses: 4, image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&fit=crop', steps: ['Consent Basics', 'Negotiation', 'Scene Construction', 'Aftercare'], initialCompleted: [0, 1] },
  { id: 'rope', title: 'Rope Safety', courses: 3, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&fit=crop', steps: ['Rope Safety Basics', 'Equipment & Preparation', 'Confident Practice'], initialCompleted: [0] },
  { id: 'communication', title: 'Communication Foundations', courses: 5, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&fit=crop', steps: ['Active Listening', 'Clear Requests', 'Negotiation', 'Check-ins', 'Reflection'], initialCompleted: [] },
];

function LearningCard({ item, onOpen, onRemove, state }) {
  const progress = item.progress || 0;
  const access = item.isFree ? 'Free' : item.tier || item.price || 'Paid';
  return <article className="ml-card"><button className="ml-card-open" onClick={() => onOpen(item)}><img src={item.img} alt=""/><span className="ml-card-content"><span className="ml-card-kicker" style={{ color: categoryColor(item.category) }}>{item.type || 'Course'} · {categoryLabel(item.category)}</span><b>{item.title}</b><small>{item.instructor}</small>{state === 'saved' && <small className="ml-saved-details">{item.level || item.difficulty || 'All levels'} · {access}</small>}{state === 'progress' && <span className="ml-progress-line"><i><b style={{ width: `${progress}%` }}/></i><em>{progress}%</em></span>}{state === 'completed' && <small className="ml-completion">✓ {item.duration || 'Completed'} · +{item.points || 20} Points</small>}{state === 'purchased' && <small className="ml-completion">{progress ? `In progress · ${progress}%` : 'Purchased · Not started'}</small>}</span><span className="ml-card-arrow">→</span></button>{state === 'progress' && <button className="ml-continue" onClick={() => onOpen(item)}>Continue Learning</button>}{state === 'purchased' && !progress && <button className="ml-continue" onClick={() => onOpen(item)}>Start Learning</button>}{state === 'saved' && <button className="ml-remove-saved" onClick={() => onRemove?.(item.id)}>Remove bookmark</button>}</article>;
}

export default function EducationMyLearningPage({ items, joined, purchased, saved, onBack, onOpen, onProgress, onRemoveSaved }) {
  const [tab, setTab] = useState('Overview');
  const [savedType, setSavedType] = useState('All');
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [activePathStep, setActivePathStep] = useState(null);
  const [pathProgress, setPathProgress] = useState(() => Object.fromEntries(PATHS.map(path => [path.id, path.initialCompleted])));
  const inProgress = items.filter(item => item.status === 'In Progress' || (joined.has(item.id) && item.status !== 'Completed'));
  const completed = items.filter(item => item.status === 'Completed');
  const purchasedItems = items.filter(item => purchased.has(item.id));
  const savedItems = items.filter(item => saved.has(item.id));
  const filteredSavedItems = savedItems.filter(item => savedType === 'All' || (savedType === 'Classes' ? ['Webinar', 'Workshop'].includes(item.type) : item.type === savedType.slice(0, -1)));
  const subscriptions = items.filter(item => item.accessType === 'subscription');
  const activePath = PATHS.find(path => path.id === selectedPathId);
  const completedForPath = activePath ? pathProgress[activePath.id] : [];
  const nextPathStep = activePath ? activePath.steps.findIndex((_, index) => !completedForPath.includes(index)) : -1;
  const pathPercent = activePath ? Math.round(completedForPath.length / activePath.courses * 100) : 0;
  const list = tab === 'In Progress' ? inProgress.map(item => ({ item, state: 'progress' }))
    : tab === 'Completed' ? completed.map(item => ({ item, state: 'completed' }))
      : tab === 'Purchased' ? purchasedItems.map(item => ({ item, state: 'purchased' }))
          : tab === 'Saved' ? filteredSavedItems.map(item => ({ item, state: 'saved' }))
          : tab === 'Subscriptions' ? subscriptions.map(item => ({ item, state: 'subscription' })) : [];
  const overview = tab === 'Overview';
  const currentItems = overview ? inProgress : list.map(entry => entry.item);
  const currentState = overview ? 'progress' : list[0]?.state;
  const title = overview ? 'Continue Learning' : tab === 'Completed' ? 'Completed Education' : tab;
  return <main className="ml-page"><button className="ml-back" onClick={onBack}>← Education Home</button><header className="ml-header"><div><span className="ml-eyebrow">YOUR PERSONAL LEARNING SPACE</span><h1>My Learning</h1><p>Pick up where you left off and keep track of your progress.</p></div><button className="ml-points" onClick={onProgress} aria-label="View education points"><span>✦</span><div><b>485</b><small>Education Points · View ledger</small></div><i>→</i></button></header>
    <nav className="ml-tabs" aria-label="My learning sections">{TABS.map(name => <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name}{name === 'Saved' && <small>{savedItems.length}</small>}</button>)}</nav>
    {overview && <div className="ml-overview-stats"><div><span>◷</span><small>In Progress</small><b>{inProgress.length}</b></div><div><span>✓</span><small>Completed</small><b>{completed.length}</b></div><div><span>▣</span><small>Purchased</small><b>{purchasedItems.length}</b></div><div><span>♡</span><small>Saved</small><b>{savedItems.length}</b></div></div>}
    {tab === 'Learning Paths' ? selectedPathId && activePath ? <section className="ml-section ml-path-detail"><button className="ml-path-back" onClick={() => { setSelectedPathId(null); setActivePathStep(null); }}>← All Learning Paths</button><div className="ml-path-detail-head"><div><span className="ml-eyebrow">ORDERED LEARNING PATH</span><h2>{activePath.title}</h2><p>Complete each course in order to unlock the next step.</p></div><div className="ml-path-progress-summary"><b>{completedForPath.length} / {activePath.courses}</b><span>Completed</span></div></div><span className="ml-progress-line ml-path-progress"><i><b style={{ width: `${pathPercent}%` }}/></i><em>{pathPercent}%</em></span><div className="ml-path-steps">{activePath.steps.map((step, index) => { const done = completedForPath.includes(index); const locked = index > nextPathStep && !done; const available = index === nextPathStep; return <button key={step} className={`ml-path-step${done ? ' done' : ''}${locked ? ' locked' : ''}${available ? ' available' : ''}`} disabled={locked} onClick={() => setActivePathStep(index)}><span className="ml-path-step-num">{locked ? '🔒' : done ? '✓' : index + 1}</span><span><b>{step}</b><small>{done ? 'Completed' : locked ? `Complete “${activePath.steps[nextPathStep]}” first` : available ? 'Ready to start' : 'Course'}</small></span><i>{done ? '✓' : locked ? '🔒' : '→'}</i></button>;})}</div>{activePathStep !== null && <div className="ml-path-step-preview"><span className="ml-eyebrow">COURSE {activePathStep + 1} OF {activePath.courses}</span><h3>{activePath.steps[activePathStep]}</h3><p>This course is part of the {activePath.title} learning path. Complete it to continue along the ordered journey.</p>{completedForPath.includes(activePathStep) ? <span className="ml-path-complete-label">✓ Completed</span> : <button onClick={() => { setPathProgress(previous => ({ ...previous, [activePath.id]: [...new Set([...previous[activePath.id], activePathStep])].sort((a, b) => a - b) })); setActivePathStep(null); }}>Mark Course Complete →</button>}</div>}</section>
      : <section className="ml-section"><div className="ml-section-head"><div><h2>Learning Paths</h2><p>Ordered journeys with prerequisites between courses.</p></div></div><div className="ml-path-grid">{PATHS.map(path => { const progress = pathProgress[path.id]; const pct = Math.round(progress.length / path.courses * 100); return <article className="ml-path" key={path.id}><img src={path.image} alt=""/><div><span className="ml-eyebrow">LEARNING PATH · {path.courses} Courses</span><h3>{path.title}</h3><span className="ml-progress-line"><i><b style={{ width: `${pct}%` }}/></i><em>{pct ? `Progress ${pct}%` : 'Not Started'}</em></span><button onClick={() => { setSelectedPathId(path.id); setActivePathStep(null); }}>View Learning Path →</button></div></article>;})}</div></section>
      : <section className="ml-section"><div className="ml-section-head"><div><h2>{tab === 'Saved' ? 'Saved Education' : title}</h2><p>{overview ? 'Your active courses, ready when you are.' : tab === 'Purchased' ? 'Education you have purchased, including anything not started yet.' : tab === 'Completed' ? 'Your completed courses, classes, and earned points.' : tab === 'Subscriptions' ? 'Education available through educator subscriptions.' : tab === 'Saved' ? 'Your bookmarked courses and learning resources.' : 'Resume an education item and keep making progress.'}</p></div>{overview && <button onClick={() => setTab('In Progress')}>See all →</button>}</div>
        {tab === 'Saved' && <nav className="ml-saved-types" aria-label="Filter saved education">{['All', 'Courses', 'Articles', 'Videos', 'Classes'].map(type => <button className={savedType === type ? 'active' : ''} key={type} onClick={() => setSavedType(type)}>{type}</button>)}</nav>}
        {currentItems.length ? <div className="ml-list">{currentItems.map(item => <LearningCard key={item.id} item={item} state={overview ? currentState : list.find(entry => entry.item.id === item.id)?.state || 'saved'} onOpen={onOpen} onRemove={onRemoveSaved}/>)}</div> : <div className="ml-empty"><span>✦</span><b>{tab === 'Saved' ? 'No saved education in this view' : `No ${tab.toLowerCase()} education yet`}</b><p>Explore the Education Center to find your next learning experience.</p><button onClick={onBack}>Explore Education</button></div>}
      </section>}
    {overview && completed.length > 0 && <section className="ml-section ml-completed-preview"><div className="ml-section-head"><div><h2>Recently Completed</h2><p>Celebrate the progress you have made.</p></div><button onClick={() => setTab('Completed')}>View completed →</button></div><div className="ml-list">{completed.slice(0, 2).map(item => <LearningCard key={item.id} item={item} state="completed" onOpen={onOpen}/>)}</div></section>}
  </main>;
}
