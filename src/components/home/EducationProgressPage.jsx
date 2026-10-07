import EducationBackButton from './EducationBackButton';
import './EducationProgressPage.css';

const CATEGORIES = [
  { name: 'Safety & Consent', points: 320, color: '#46a3ff' },
  { name: 'Power Exchange', points: 410, color: '#b681ff' },
  { name: 'Rope', points: 275, color: '#e29a54' },
  { name: 'Sensation', points: 280, color: '#ec6c9e' },
  { name: 'Communication', points: 200, color: '#4bc5a0' },
];
const HISTORY = [
  { points: 20, title: 'Rope Safety', category: 'Rope', date: 'Completed Aug 10' },
  { points: 50, title: 'Negotiation Course', category: 'Communication', date: 'Completed Aug 14' },
  { points: 25, title: 'Consent & Communication Webinar', category: 'Safety & Consent', date: 'Completed Aug 21' },
];

export default function EducationProgressPage({ onBack }) {
  return <main className="ep-page"><EducationBackButton onClick={onBack} label="My Learning" /><header className="ep-heading"><span className="ep-eyebrow">YOUR EDUCATION RECORD</span><h1>Education Progress</h1><p>Your learning milestones, category points, and earned rewards.</p></header><section className="ep-total"><div className="ep-total-icon">✦</div><div><span>Total Education Points</span><b>1,485</b><small>Points earned across your education</small></div><div className="ep-total-decoration">✧</div></section><div className="ep-grid"><section className="ep-panel ep-category-panel"><div className="ep-panel-heading"><div><h2>Points by Category</h2><p>See where your learning points come from.</p></div><span>5 categories</span></div><div className="ep-category-list">{CATEGORIES.map(category => <div className="ep-category-row" key={category.name}><div className="ep-category-meta"><span><i style={{ background: category.color }} />{category.name}</span><b>{category.points.toLocaleString()}</b></div><div className="ep-bar"><i style={{ width: `${category.points / 410 * 100}%`, background: category.color }} /></div></div>)}</div></section><section className="ep-panel ep-history-panel"><div className="ep-panel-heading"><div><h2>Point History</h2><p>Recent points added to your ledger.</p></div><span>Latest activity</span></div><div className="ep-history-list">{HISTORY.map((entry, index) => <article className="ep-history-row" key={`${entry.title}-${entry.date}`}><span className="ep-history-plus">+</span><span className="ep-history-points">{entry.points}</span><div><b>{entry.title}</b><small>{entry.date}</small><em>{entry.category}</em></div><span className="ep-history-index">{String(index + 1).padStart(2, '0')}</span></article>)}</div></section></div><footer className="ep-note">Education points recognize completed learning. Category totals and ledger activity are shown here as demo data.</footer></main>;
}
