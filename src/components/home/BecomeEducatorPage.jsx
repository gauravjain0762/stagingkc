import { useState, useRef } from 'react';
import EducationBackButton from './EducationBackButton';
import ImageCropper from './ImageCropper';
import './BecomeEducatorPage.css';

const topics = [
  { number: '01', title: 'What is a Certified Educator?', text: 'A Certified Educator is a member recognized by KinkCatalyst to share structured, responsible education with the community through courses, articles, videos, classes, workshops, and webinars.' },
  { number: '02', title: 'Benefits', text: 'Build a trusted educator profile, reach interested learners, publish education in your own storefront, host live sessions, and grow a subscriber community.' },
  { number: '03', title: 'Requirements', text: 'Applicants should have relevant knowledge or experience, a clear learning topic, a commitment to inclusive and evidence-informed teaching, and the ability to provide supporting qualifications or work samples.' },
  { number: '04', title: 'Responsibilities', text: 'Create accurate, respectful learning materials; represent your qualifications honestly; protect learner privacy; keep content current; and follow KC community, safety, and education standards.' },
  { number: '05', title: 'How approval works', text: 'Submit an application with your specialties and experience. The KC team reviews your fit and materials, may contact you for clarification, and shares the decision and onboarding steps with you.' },
];

const CloseXIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function BecomeEducatorPage({ onBack, onToolsEnabled }) {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expYears, setExpYears] = useState('3 years');
  const [expMonths, setExpMonths] = useState('0 months');
  const [specialties, setSpecialties] = useState(['Consent & Negotiation', 'Safety Protocols']);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverCropQueue, setCoverCropQueue] = useState([]);
  const coverInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverCropQueue([file]);
    e.target.value = '';
  };

  const handleCoverCropComplete = (croppedBlob) => {
    const reader = new FileReader();
    reader.onloadend = () => setCoverPhoto(reader.result);
    reader.readAsDataURL(croppedBlob);
    setCoverCropQueue([]);
  };

  const handleCoverCropSkip = () => {
    if (coverCropQueue[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPhoto(reader.result);
      reader.readAsDataURL(coverCropQueue[0]);
    }
    setCoverCropQueue([]);
  };

  const handleCoverCropCancel = () => {
    setCoverCropQueue([]);
  };

  const handleAddSpecialty = () => {
    const trimmed = specialtyInput.trim();
    if (!trimmed) return;
    if (!specialties.includes(trimmed)) {
      setSpecialties(prev => [...prev, trimmed]);
    }
    setSpecialtyInput('');
  };

  const handleRemoveSpecialty = indexToRemove => {
    setSpecialties(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const returnHomeAfterDemoApproval = () => {
    onToolsEnabled?.();
    onBack();
  };

  if (submitted) return <main className="become-educator-page educator-status-page">
    <div className="educator-status-topbar">
      <EducationBackButton onClick={returnHomeAfterDemoApproval} label="Back to Education" />
      <button
        type="button"
        className="educator-status-page-close-btn"
        onClick={returnHomeAfterDemoApproval}
        title="Close application status"
        aria-label="Close application status"
      >
        <span className="educator-close-label">Close</span>
        <span className="educator-close-x">✕</span>
      </button>
    </div>
    <header className="become-educator-application-header"><span className="become-educator-eyebrow">EDUCATOR APPLICATION</span><h1>Application Status</h1><p>Your application has been submitted for review. You can check the next steps in your educator journey here.</p></header>
    <section className="educator-status-card" aria-label="Educator application progress">
      <div className="educator-status-summary-row">
        <div className="educator-status-summary">
          <span className="educator-status-indicator" />
          <div>
            <span className="become-educator-eyebrow">CURRENT STATUS</span>
            <h2>Under Review</h2>
            <p>Application submitted · Awaiting the KC team’s review</p>
          </div>
        </div>
        <button
          type="button"
          className="educator-status-card-close-btn"
          onClick={returnHomeAfterDemoApproval}
          title="Close application status"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <ol className="educator-status-steps">
        <li className="complete"><span className="educator-status-dot">✓</span><div><b>Application Submitted</b><small>Your application is with the KC team.</small></div></li>
        <li className="current"><span className="educator-status-dot">2</span><div><b>Under Review</b><small>The team will review your information and follow up with next steps.</small></div></li>
        <li><span className="educator-status-dot">3</span><div><b>Approved</b><small>Approval decision from the KC team.</small></div></li>
        <li><span className="educator-status-dot">4</span><div><b>Certified Educator Membership</b><small>Membership details and contribution terms are confirmed during onboarding.</small></div></li>
        <li><span className="educator-status-dot">5</span><div><b>Educator Tools Enabled</b><small>Access follows approval and completion of onboarding.</small></div></li>
      </ol>
      <p className="educator-status-note">Demo flow: selecting “Back to Education Home” or clicking the ✕ button simulates admin approval, educator membership activation, and tool enablement.</p>
    </section>
    <button className="become-educator-primary educator-status-home" onClick={returnHomeAfterDemoApproval}>Back to Education Home</button>
  </main>;

  if (applicationOpen) return <main className="become-educator-page educator-application-page">
    <EducationBackButton onClick={() => { setApplicationOpen(false); setSubmitted(false); }} label="Back to educator information" />
    <header className="become-educator-application-header"><span className="become-educator-eyebrow">KINKCATALYST EDUCATION</span><h1>Educator Application</h1><p>Tell us about your experience and the education you hope to share. The KC team will review your application and follow up about next steps.</p></header>
    <form className="educator-application-form" onSubmit={event => { event.preventDefault(); setSubmitted(true); }}>
      <section className="educator-application-section"><div><h2>Basic information</h2><p>How should we identify and contact you?</p></div><div className="educator-application-fields">
        <label>Name<input required name="name" autoComplete="name" placeholder="Your full name" /></label>
        <label>Email<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
        <label>Location<input name="location" placeholder="City, region, or country" /></label>
        <label>Profile link<input name="profile" type="url" placeholder="https://" /></label>
        <label className="educator-bio-field">
          Bio
          <textarea required name="bio" rows="3" placeholder="Introduce yourself and your perspective." />
        </label>
        <div className="educator-cover-field">
          <span className="educator-cover-label">Cover photo</span>
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCoverChange}
            name="coverPhoto"
          />
          {coverPhoto ? (
            <div className="educator-cover-preview">
              <img src={coverPhoto} alt="Cover preview" />
              <div className="educator-cover-preview-actions">
                <button
                  type="button"
                  className="educator-cover-change-btn"
                  onClick={() => coverInputRef.current?.click()}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="educator-cover-remove-btn"
                  onClick={() => setCoverPhoto(null)}
                  title="Remove cover photo"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div
              className="educator-cover-dropzone"
              onClick={() => coverInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') coverInputRef.current?.click(); }}
            >
              <div className="educator-cover-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="educator-cover-text">
                <strong>Upload cover photo</strong>
                <small>PNG, JPG up to 10MB</small>
              </div>
            </div>
          )}
        </div>
      </div></section>
      <section className="educator-application-section">
        <div>
          <h2>Qualifications | areas of education</h2>
          <p>Share your background, years of practice, credentials, and specialties.</p>
        </div>
        <div className="educator-application-fields">
          {/* Box 1: Experience with Months & Years selector */}
          <div className="educator-application-wide educator-box-card">
            <span className="educator-box-title">Experience</span>
            <div className="educator-experience-duration-row">
              <label>
                Years of experience
                <select value={expYears} onChange={e => setExpYears(e.target.value)} name="experienceYears">
                  {['0 years', '1 year', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', '8 years', '9 years', '10+ years', '15+ years', '20+ years'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label>
                Months
                <select value={expMonths} onChange={e => setExpMonths(e.target.value)} name="experienceMonths">
                  {Array.from({ length: 12 }, (_, i) => `${i} ${i === 1 ? 'month' : 'months'}`).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="educator-inner-label">
              Experience overview
              <textarea
                name="experienceDetails"
                rows="3"
                placeholder="Describe your practical teaching, community involvement, or hands-on practice..."
              />
            </label>
          </div>

          {/* Box 2: Qualifications */}
          <div className="educator-application-wide educator-box-card">
            <span className="educator-box-title">Qualifications</span>
            <label className="educator-inner-label">
              Certifications, training, or degrees
              <textarea
                name="qualifications"
                rows="3"
                placeholder="List any formal certifications, licenses, mentorships, workshop completions, or academic credentials..."
              />
            </label>
          </div>

          {/* Box 3: Areas of education */}
          <div className="educator-box-card">
            <span className="educator-box-title">Areas of education</span>
            <label className="educator-inner-label">
              Core educational domains
              <input
                name="areasOfEducation"
                placeholder="e.g. Safety & Risk Mitigation, Communication & Consent, Rope Craft, Psychology of Power Exchange"
              />
            </label>
          </div>

          {/* Box 4: Work Sample Links */}
          <div className="educator-box-card">
            <span className="educator-box-title">Work Sample Links</span>
            <label className="educator-inner-label">
              Portfolio or published work
              <input
                name="resources"
                type="url"
                placeholder="https://portfolio, video link, or published work"
              />
            </label>
          </div>

          {/* Box 5: Specialties (Multiple Pill Style) */}
          <div className="educator-application-wide educator-box-card">
            <span className="educator-box-title">Specialties</span>
            <p className="educator-box-subtext">Add specific subjects or skills you specialize in.</p>
            <div className="educator-specialty-add-row">
              <input
                value={specialtyInput}
                onChange={e => setSpecialtyInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialty();
                  }
                }}
                placeholder="Type a specialty (e.g. Floor Work, Single Column Tie, Negotiation...)"
              />
              <button type="button" className="educator-pill-add-btn" onClick={handleAddSpecialty}>
                Add
              </button>
            </div>

            {specialties.length > 0 ? (
              <div className="educator-specialties-pills">
                {specialties.map((spec, index) => (
                  <span key={index} className="educator-specialty-pill">
                    {spec}
                    <button
                      type="button"
                      className="educator-pill-remove-btn"
                      onClick={() => handleRemoveSpecialty(index)}
                      aria-label={`Remove ${spec}`}
                      title={`Remove ${spec}`}
                    >
                      <CloseXIcon />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <small className="educator-empty-pills-hint">
                No specialties added yet. Type a specialty above and click <b>Add</b>.
              </small>
            )}
          </div>
        </div>
      </section>

      <section className="educator-application-section">
        <div>
          <h2>Supporting information</h2>
          <p>Provide verification details and supporting documents to support your application.</p>
        </div>
        <div className="educator-application-fields">
          <label>
            Upload ID (Document or Photo)
            <input name="verificationIdFile" type="file" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
          <label>
            Documents or certifications
            <input name="documents" type="file" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
        </div>
      </section>

      <section className="educator-application-section educator-agreement-section">
        <div>
          <h2>Agreement</h2>
          {/* <p>Please confirm before submitting.</p> */}
        </div>
        <div className="educator-agreements">
          <label>
            <input required type="checkbox" /> I agree to KC educator guidelines & safety standards
          </label>
        </div>
      </section>
      {/* <div className="educator-application-submit"><small>Demo only: this form will not upload files or send your application to a server.</small><button className="become-educator-primary" type="submit">Submit Application</button></div> */}
    </form>
    {coverCropQueue.length > 0 && (
      <ImageCropper
        file={coverCropQueue[0]}
        defaultAspect="landscape"
        cropShape="rect"
        onSave={handleCoverCropComplete}
        onSkip={handleCoverCropSkip}
        onCancel={handleCoverCropCancel}
      />
    )}
  </main>;

  return <main className="become-educator-page">
    <EducationBackButton onClick={onBack} label="Back to Education" />
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
