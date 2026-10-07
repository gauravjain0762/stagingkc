import EducationBackButton from './EducationBackButton';
import './EducationStorefrontPage.css';
import './EducatorProfileManagement.css';

function StoreItem({ item, onOpen }) {
  const access = item.isFree ? 'Free' : item.tier || item.price || 'Paid';
  return <button className="es-item" onClick={() => onOpen(item)}><img src={item.img} alt=""/><span><i>{item.type} · {item.level || 'All levels'}</i><b>{item.title}</b><small>{item.desc}</small><em>{access}</em></span><strong>View</strong></button>;
}

export default function EducationStorefrontPage({ educatorName = 'Jane Doe', profile, items, subscribed, onBack, onOpenEducation, onOpenSubscription }) {
  const name = profile?.displayName || educatorName;
  const offerings = items.filter(item => item.instructor === educatorName || item.source === 'Educator');
  const free = offerings.filter(item => item.isFree);
  const paid = offerings.filter(item => !item.isFree && item.type === 'Course');
  const upcoming = offerings.filter(item => item.status === 'Upcoming');
  const webinars = offerings.filter(item => item.type === 'Webinar');
  const workshops = offerings.filter(item => item.type === 'Workshop');
  const section = (title, collection, id) => <section className="es-section" id={id} key={title}><div className="es-section-heading"><div><span>{name.toUpperCase()}'S EDUCATION</span><h2>{title}</h2></div><small>{collection.length} offerings</small></div>{collection.length ? <div className="es-item-list">{collection.map(item => <StoreItem key={item.id} item={item} onOpen={onOpenEducation}/>)}</div> : <div className="es-empty">New {title.toLowerCase()} will be announced here.</div>}</section>;

  return <main className="es-page"><EducationBackButton onClick={onBack} label={`${name}'s educator profile`} /><header className="es-header"><div className="es-banner"><img src={profile?.profileImage || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&fit=crop'} alt=""/><div className="es-banner-shade"/><span className="es-educator-avatar">{profile?.profileImage ? <img src={profile.profileImage} alt={`${name} profile`} /> : name.split(' ').map(part => part[0]).join('').slice(0,2)}</span></div><div className="es-heading"><div><span className="es-eyebrow">CERTIFIED EDUCATOR · {name.toUpperCase()}</span><h1>{name}'s Education Store</h1><p>{profile?.bio || `Courses, classes, and resources created by ${name} for the KC community.`}</p>{profile?.showLocation && profile?.location && <small className="es-profile-location">{profile.location}</small>}</div><div className="es-plan"><span>EDUCATOR SUBSCRIPTION</span><b>$19<small>/month</small></b><p>Access {name}'s subscription education and new monthly releases.</p><button onClick={onOpenSubscription}>{subscribed ? 'Manage Subscription' : 'View Subscription'}</button></div></div></header>{subscribed && <div className="es-subscribed" role="status">✓ You are subscribed to {name}'s education.</div>}
    <nav className="es-store-nav"><a href="#es-featured">Featured</a><a href="#es-free">Free education</a><a href="#es-paid">Paid courses</a><a href="#es-upcoming">Upcoming classes</a><a href="#es-webinars">Webinars</a><a href="#es-workshops">Workshops</a></nav>
    <section className="es-section" id="es-featured"><div className="es-section-heading"><div><span>CURATED BY {name.toUpperCase()}</span><h2>Featured Courses</h2></div><small>Handpicked learning</small></div>{offerings.filter(item => item.type === 'Course').length ? <div className="es-feature-grid">{offerings.filter(item => item.type === 'Course').slice(0, 3).map(item => <StoreItem key={item.id} item={item} onOpen={onOpenEducation}/>)}</div> : <div className="es-empty">Featured education will appear here.</div>}</section>
    {section('Free Education', free, 'es-free')}{section('Paid Courses', paid, 'es-paid')}{section('Upcoming Classes', upcoming, 'es-upcoming')}{section('Webinars', webinars, 'es-webinars')}{section('Workshops', workshops, 'es-workshops')}
  </main>;
}
