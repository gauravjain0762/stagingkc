import { useState } from 'react';
import './BecomeEducatorPage.css';

const topics = [
  { number: '01', title: 'What is a Certified Educator?', text: 'A Certified Educator is a member recognized by KinkCatalyst to share structured, responsible education with the community through courses, articles, videos, classes, workshops, and webinars.' },
  { number: '02', title: 'Benefits', text: 'Build a trusted educator profile, reach interested learners, publish education in your own storefront, host live sessions, and grow a subscriber community.' },
  { number: '03', title: 'Requirements', text: 'Applicants should have relevant knowledge or experience, a clear learning topic, a commitment to inclusive and evidence-informed teaching, and the ability to provide supporting qualifications or work samples.' },
  { number: '04', title: 'Responsibilities', text: 'Create accurate, respectful learning materials; represent your qualifications honestly; protect learner privacy; keep content current; and follow KC community, safety, and education standards.' },
  { number: '05', title: 'How approval works', text: 'Submit an application with your specialties and experience. The KC team reviews your fit and materials, may contact you for clarification, and shares the decision and onboarding steps with you.' },
];

export default function BecomeEducatorPage({ onBack, onToolsEnabled }) {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const returnHomeAfterDemoApproval = () => {
    onToolsEnabled?.();
    onBack();
  };

  if (submitted) return <main className="become-educator-page educator-status-page">
    <button className="become-educator-back" onClick={returnHomeAfterDemoApproval}>← Back to Education</button>
    <header className="become-educator-application-header"><span className="become-educator-eyebrow">EDUCATOR APPLICATION</span><h1>Application Status</h1><p>Your application has been submitted for review. You can check the next steps in your educator journey here.</p></header>
    <section className="educator-status-card" aria-label="Educator application progress">
      <div className="educator-status-summary"><span className="educator-status-indicator" /><div><span className="become-educator-eyebrow">CURRENT STATUS</span><h2>Under Review</h2><p>Application submitted · Awaiting the KC team’s review</p></div></div>
      <ol className="educator-status-steps">
        <li className="complete"><span className="educator-status-dot">✓</span><div><b>Application Submitted</b><small>Your application is with the KC team.</small></div></li>
        <li className="current"><span className="educator-status-dot">2</span><div><b>Under Review</b><small>The team will review your information and follow up with next steps.</small></div></li>
        <li><span className="educator-status-dot">3</span><div><b>Approved</b><small>Approval decision from the KC team.</small></div></li>
        <li><span className="educator-status-dot">4</span><div><b>Certified Educator Membership</b><small>Membership details and contribution terms are confirmed during onboarding.</small></div></li>
        <li><span className="educator-status-dot">5</span><div><b>Educator Tools Enabled</b><small>Access follows approval and completion of onboarding.</small></div></li>
      </ol>
      <p className="educator-status-note">Demo flow: selecting “Back to Education Home” simulates admin approval, educator membership activation, and tool enablement. No real application review is connected.</p>
    </section>
    <button className="become-educator-primary educator-status-home" onClick={returnHomeAfterDemoApproval}>Back to Education Home</button>
  </main>;

  if (applicationOpen) return <main className="become-educator-page educator-application-page">
    <button className="become-educator-back" onClick={() => { setApplicationOpen(false); setSubmitted(false); }}>← Back to educator information</button>
    <header className="become-educator-application-header"><span className="become-educator-eyebrow">KINKCATALYST EDUCATION</span><h1>Educator Application</h1><p>Tell us about your experience and the education you hope to share. The KC team will review your application and follow up about next steps.</p></header>
    <form className="educator-application-form" onSubmit={event => { event.preventDefault(); setSubmitted(true); }}>
      <section className="educator-application-section"><div><h2>Basic information</h2><p>How should we identify and contact you?</p></div><div className="educator-application-fields">
        <label>Name<input required name="name" autoComplete="name" placeholder="Your full name" /></label>
        <label>Email<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
        <label>Location<input name="location" placeholder="City, region, or country" /></label>
        <label>Profile link<input name="profile" type="url" placeholder="https://" /></label>
        <label className="educator-application-wide">Bio<textarea required name="bio" rows="3" placeholder="Introduce yourself and your perspective." /></label>
      </div></section>
      <section className="educator-application-section"><div><h2>Qualifications</h2><p>Share relevant background and specialties.</p></div><div className="educator-application-fields">
        <label>Experience and qualifications<textarea required name="qualifications" rows="4" placeholder="Relevant experience, training, or qualifications" /></label>
        <label>Areas of education / specialties<input required name="specialties" placeholder="Topics or areas you know well" /></label>
      </div></section>
      <section className="educator-application-section"><div><h2>Teaching information</h2><p>What would you like to offer members?</p></div><div className="educator-application-fields">
        <label>Topics you plan to teach<input required name="topics" placeholder="Add your teaching topics" /></label>
        <label>Education or teaching experience<textarea name="teachingExperience" rows="3" placeholder="Teaching, facilitation, mentoring, or content experience" /></label>
        <fieldset className="educator-application-wide"><legend>Formats you may provide</legend><div className="educator-format-options">{['Courses', 'Articles', 'Videos', 'Webinars', 'Workshops', 'Live classes'].map(format => <label key={format}><input type="checkbox" name="formats" value={format} />{format}</label>)}</div></fieldset>
      </div></section>
      <section className="educator-application-section"><div><h2>Supporting information</h2><p>Optional materials can help us understand your work.</p></div><div className="educator-application-fields">
        <label>Documents or certifications<input name="documents" type="file" accept=".pdf,.png,.jpg,.jpeg" /></label>
        <label>Links or resources<input name="resources" type="url" placeholder="Portfolio, resource, or qualification link" /></label>
      </div></section>
      <section className="educator-application-section educator-agreement-section"><div><h2>Agreement</h2><p>Please confirm these expectations before submitting.</p></div><div className="educator-agreements">
        <label><input required type="checkbox" /> I agree to follow the educator terms and platform rules.</label>
        <label><input required type="checkbox" /> I will provide accurate, respectful content that meets KC content requirements.</label>
        <label><input required type="checkbox" /> I understand educator approval and onboarding are subject to KC review.</label>
        <label><input required type="checkbox" /> I understand a KC monthly contribution is required, with amount and terms confirmed before onboarding.</label>
      </div></section>
      <div className="educator-application-submit"><small>Demo only: this form will not upload files or send your application to a server.</small><button className="become-educator-primary" type="submit">Submit Application</button></div>
    </form>
  </main>;

  return <main className="become-educator-page">
    <button className="become-educator-back" onClick={onBack}>← Back to Education</button>
    <header className="become-educator-hero">
      <span className="become-educator-eyebrow">TEACH · CONNECT · GROW</span>
      <h1>Become a Certified Educator</h1>
      <p>Share your knowledge and build your educational presence within KinkCatalyst.</p>
      <button className="become-educator-primary" onClick={() => setApplicationOpen(true)}>Apply to Become an Educator</button>
      <div className="become-educator-hero-note">A member-facing overview of the educator journey</div>
    </header>

    <section className="become-educator-intro">
      <div><span className="become-educator-eyebrow">A PLACE FOR YOUR EXPERTISE</span><h2>Teach what you know. Help the community learn.</h2></div>
      <p>Certified Educators bring thoughtful, useful learning to members. Share your expertise in the format that suits it, while building a recognizable presence alongside KinkCatalyst education.</p>
    </section>

    <section className="become-educator-grid" aria-label="Educator overview">
      {topics.map(item => <article className="become-educator-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
    </section>

    <section className="become-educator-business">
      <div><span className="become-educator-eyebrow">MEMBERSHIP & BUSINESS MODEL</span><h2>Clear terms before you publish</h2><p>Educators can shape their own offerings and pricing across free and paid courses, subscriptions, and live education. Applicable platform fees, revenue share, payment timing, and other business terms will be disclosed and agreed during onboarding.</p></div>
      <div className="become-educator-terms">
        <article><b>Educator membership</b><p>Educator access and any membership plan details are provided as part of approval and onboarding.</p></article>
        <article><b>KC monthly contribution</b><p>A recurring KC contribution is required for educators. The current amount and billing terms will be confirmed before you accept educator onboarding.</p></article>
        <article><b>Your education business</b><p>Choose suitable formats and prices for your audience. Your final revenue and platform terms are confirmed in writing before your offerings go live.</p></article>
      </div>
    </section>

  </main>;
}
