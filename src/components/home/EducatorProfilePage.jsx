import { useMemo, useState } from 'react';
import './EducatorProfilePage.css';
import './EducatorProfileManagement.css';

const STORE_TYPES = ['All', 'Courses', 'Articles', 'Videos', 'Classes'];

function StoreCard({ item, onOpen }) {
  const access = item.isFree ? 'Free' : item.tier || item.price || 'Paid';
  return <button className="epf-card" onClick={() => onOpen(item)}><span className="epf-card-image"><img src={item.img} alt=""/><i>{item.type}</i></span><span className="epf-card-body"><b>{item.title}</b><small>{item.instructor} · {item.level || 'All levels'}</small><span>{access}</span></span><span className="epf-card-arrow">→</span></button>;
}

export default function EducatorProfilePage({ educatorName = 'Jane Doe', profile, items, onBack, onOpenEducation, onOpenStore, onOpenSubscription }) {
  const [view, setView] = useState('profile');
  const [storeType, setStoreType] = useState('All');
  const [following, setFollowing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const educatorItems = useMemo(() => {
    const matches = items.filter(item => item.instructor === educatorName || item.source === 'Educator');
    return matches.length ? matches : items.slice(0, 8);
  }, [items, educatorName]);
  const free = educatorItems.filter(item => item.isFree);
  const paid = educatorItems.filter(item => !item.isFree && item.type === 'Course');
  const upcoming = educatorItems.filter(item => item.status === 'Upcoming');
  const webinars = educatorItems.filter(item => item.type === 'Webinar');
  const workshops = educatorItems.filter(item => item.type === 'Workshop');
  const filtered = educatorItems.filter(item => storeType === 'All' || (storeType === 'Classes' ? ['Webinar', 'Workshop'].includes(item.type) : item.type === storeType.slice(0, -1)));
  const name = profile?.displayName || educatorName;
  const specialties = (profile?.specialties || 'Consent & Safety, Communication, Negotiation, Rope Foundations').split(',').map(value => value.trim()).filter(Boolean);
  const qualifications = (profile?.qualifications || 'Certified Relationship & Consent Educator; Advanced Facilitation Certificate').split(/[;\n]/).map(value => value.trim()).filter(Boolean);
  const areas = (profile?.areas || 'Safety & Consent, Communication').split(',').map(value => value.trim()).filter(Boolean);
  const showSection = (title, collection) => collection.length > 0 && <section className="epf-section" key={title}><div className="epf-section-head"><h2>{title}</h2><button onClick={onOpenStore}>View store →</button></div><div className="epf-card-row">{collection.slice(0, 3).map(item => <StoreCard key={item.id} item={item} onOpen={onOpenEducation}/>)}</div></section>;

  return <main className="epf-page"><button className="epf-back" onClick={onBack}>← Back to Education</button>
    {view === 'profile' ? <>
      {profile && !profile.isPublic && <div className="epf-private-note">This educator profile is currently hidden from public view.</div>}
      <section className="epf-profile-hero"><div className="epf-cover"><img src={profile?.profileImage || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=85&fit=crop'} alt=""/></div><div className="epf-profile-info"><div className="epf-avatar">{profile?.profileImage ? <img src={profile.profileImage} alt={`${name} profile`} /> : name.split(' ').map(part => part[0]).join('').slice(0,2)}</div><div><span className="epf-certified">✓ CERTIFIED EDUCATOR</span><h1>{name}</h1><p>{profile?.title || 'Educator, facilitator, and lifelong learner'}{profile?.showLocation && profile?.location ? ` · ${profile.location}` : ''}</p></div><div className="epf-profile-actions"><button className="epf-follow" onClick={() => setFollowing(value => !value)}>{following ? 'Following ✓' : 'Follow'}</button><button className="epf-subscribe" onClick={onOpenSubscription}>Subscribe</button></div></div></section>
      <div className="epf-profile-grid"><section className="epf-bio"><div className="epf-section-head"><h2>About {name.split(' ')[0]}</h2></div><p>{profile?.bio || `${name} creates thoughtful, practical education to help members build skills with confidence.`}</p><h3>Experience</h3><p>{profile?.experience || 'Experience and teaching background'}</p><h3>Qualifications</h3><ul>{qualifications.map(value => <li key={value}>{value}</li>)}</ul><h3>Areas of Education</h3><div className="epf-specialties">{areas.map(value => <span key={value}>{value}</span>)}</div><h3>Educational Specialties</h3><div className="epf-specialties">{specialties.map(value => <span key={value}>{value}</span>)}</div>{profile?.website && <p className="epf-public-link"><a href={profile.website} target="_blank" rel="noreferrer">Visit educator resource ↗</a></p>}</section><aside className="epf-profile-aside"><span className="epf-certified">EDUCATOR STORE</span><h2>Learn with {name.split(' ')[0]}</h2><p>Browse courses, webinars, and workshops created for the KC community.</p><button onClick={onOpenStore}>Visit Educator Store →</button><div><b>{educatorItems.length}</b><small>Education offerings</small></div></aside></div>
      {showSection('Free Education', free)}{showSection('Paid Courses', paid)}{showSection('Upcoming Classes', upcoming)}{showSection('Webinars', webinars)}{showSection('Workshops', workshops)}
    </> : <><header className="epf-store-heading"><span className="epf-certified">EDUCATOR STORE</span><h1>{name}'s Education</h1><p>Explore classes and learning resources from {name}.</p></header><nav className="epf-store-tabs">{STORE_TYPES.map(type => <button className={storeType === type ? 'active' : ''} key={type} onClick={() => setStoreType(type)}>{type}</button>)}</nav>{subscribed && <div className="epf-subscription-note" role="status">You're subscribed to {name}'s education. Subscription-only content is now included in your library.</div>}<div className="epf-store-list">{filtered.length ? filtered.map(item => <StoreCard key={item.id} item={item} onOpen={onOpenEducation}/>) : <div className="epf-empty">No {storeType.toLowerCase()} in this store yet.</div>}</div><button className="epf-subscribe-store" onClick={() => setSubscribed(true)}>{subscribed ? `Subscribed to ${name} ✓` : `Subscribe to ${name}'s education`}</button></>}
  </main>;
}
