import { useMemo, useState } from 'react';
import './UpcomingEducationPage.css';

const TYPES = ['All Upcoming', 'Live Classes', 'Webinars', 'Workshops'];

function EventCard({ event, onDetails }) {
  return <article className="ue-card"><img src={event.img} alt=""/><div className="ue-card-body"><span className="ue-event-type">{event.type} · {event.eventMode || event.format || 'Online'}</span><h2>{event.title}</h2><button className="ue-educator-link" onClick={() => onDetails(event, true)}>{event.instructor}</button><div className="ue-card-meta"><span>▦ {event.eventDate || event.duration?.replace('Live · ', '') || 'Upcoming'}</span><span>◷ {event.eventTime || '7:00 PM'}</span></div><div className="ue-card-footer"><b>{event.isFree ? 'Free' : event.price || 'Paid'}</b><button onClick={() => onDetails(event)}>View Details →</button></div></div></article>;
}

export default function UpcomingEducationPage({ items, onBack, onOpenEducator, onBrowseAll }) {
  const [type, setType] = useState('All Upcoming');
  const [category, setCategory] = useState('All topics');
  const [selected, setSelected] = useState(null);
  const [registered, setRegistered] = useState(new Set());
  const [calendarAdded, setCalendarAdded] = useState(new Set());
  const [profileFirst, setProfileFirst] = useState(false);
  const categories = ['All topics', ...new Set(items.map(item => item.category).filter(Boolean))];
  const visible = useMemo(() => items.filter(item => {
    const typeMatch = type === 'All Upcoming' || (type === 'Live Classes' ? ['Class', 'Workshop'].includes(item.type) : type === 'Webinars' ? item.type === 'Webinar' : item.type === 'Workshop');
    return typeMatch && (category === 'All topics' || item.category === category);
  }), [items, type, category]);
  const openDetails = (event, educatorOnly = false) => {
    if (educatorOnly) { onOpenEducator(event.instructor); return; }
    setSelected(event);
  };
  return <main className="ue-page"><div className="ue-topline"><button onClick={onBack}>← Education Home</button><button className="ue-browse-all" onClick={onBrowseAll}>Browse all education →</button></div>
    {!selected ? <><header className="ue-heading"><div><span className="ue-eyebrow">MEET, LEARN, PRACTICE</span><h1>Upcoming Education</h1><p>Live classes, webinars, and workshops from KC and independent educators.</p></div><span className="ue-total">{visible.length} upcoming</span></header><section className="ue-filter-bar"><div className="ue-type-tabs">{TYPES.map(option => <button className={type === option ? 'active' : ''} key={option} onClick={() => setType(option)}>{option}</button>)}</div><label className="ue-category-filter">Category<select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value} value={value}>{value === 'All topics' ? value : value.replaceAll('-', ' ')}</option>)}</select></label></section>{visible.length ? <div className="ue-grid">{visible.map(event => <EventCard key={event.id} event={event} onDetails={openDetails}/>)}</div> : <div className="ue-empty"><b>No upcoming education in this filter</b><span>Try another event type or category.</span><button onClick={() => { setType('All Upcoming'); setCategory('All topics'); }}>Clear filters</button></div>}</>
      : <><button className="ue-detail-back" onClick={() => setSelected(null)}>← Upcoming Education</button><header className="ue-detail-hero"><img src={selected.img} alt=""/><div className="ue-detail-shade"/><div className="ue-detail-head"><span className="ue-event-type">{selected.type} · {selected.eventMode || selected.format || 'Online'}</span><h1>{selected.title}</h1><button onClick={() => { setSelected(null); onOpenEducator(selected.instructor); }}>{selected.instructor} · View educator profile →</button></div></header><div className="ue-detail-grid"><div className="ue-detail-content"><section><h2>Event details</h2><div className="ue-detail-facts"><span><small>Date</small><b>{selected.eventDate || selected.duration?.replace('Live · ', '') || 'Upcoming'}</b></span><span><small>Time</small><b>{selected.eventTime || '7:00 PM'}</b></span><span><small>Location</small><b>{selected.eventMode || selected.format || 'Online'}</b></span><span><small>Instructor</small><b>{selected.instructor}</b></span></div></section><section><h2>About</h2><p>{selected.desc || `Join ${selected.instructor} for an engaging ${selected.type.toLowerCase()} designed to support practical learning and community connection.`}</p></section><section><h2>What You'll Learn</h2><ul>{(selected.whatYouLearn || ['Explore practical ideas with an experienced educator', 'Ask questions and learn alongside the community', 'Leave with clear next steps for continued learning']).map(item => <li key={item}>{item}</li>)}</ul></section></div><aside className="ue-register-card"><span className="ue-eyebrow">RESERVE YOUR PLACE</span><h2>{selected.isFree ? 'Free' : selected.price || 'Paid'}</h2><p>{selected.eventDate || selected.duration?.replace('Live · ', '') || 'Upcoming'} · {selected.eventTime || '7:00 PM'}</p><button className="ue-register" onClick={() => setRegistered(previous => new Set(previous).add(selected.id))}>{registered.has(selected.id) ? 'Registered ✓' : 'Register'}</button>{registered.has(selected.id) && <div className="ue-success" role="status">Your place is reserved in this demo.</div>}<button className="ue-calendar" onClick={() => setCalendarAdded(previous => new Set(previous).add(selected.id))}>{calendarAdded.has(selected.id) ? 'Added to My Calendar ✓' : '＋ Add to My Calendar'}</button><small>Calendar and event registration are demo interactions for now.</small></aside></div></>}
  </main>;
}
