import { useState } from 'react';
import EducationBackButton from './EducationBackButton';
import './BecomeEducatorPage.css';
import './EducatorWorkspacePage.css';

// 'Educator Dashboard' is hidden for now
const tools = [
  { id: 'Total Courses', name: 'Total Courses', isCountCard: true },
  { id: 'Plans', name: 'Plans', desc: 'Available to your educator account' },
  { id: 'Course Builder', name: 'Course Builder', desc: 'Available to your educator account' },
  { id: 'Student Management', name: 'Student Management', desc: 'Available to your educator account' },
  { id: 'Educator Store', name: 'Educator Store', desc: 'Available to your educator account' },
  { id: 'Subscription Management', name: 'Subscription Management', desc: 'Available to your educator account' },
  { id: 'Events', name: 'Events', desc: 'Available to your educator account' },
  { id: 'Analytics', name: 'Analytics', desc: 'Available to your educator account' },
  { id: 'Financials', name: 'Financials', desc: 'Available to your educator account' },
  { id: 'KC Contribution', name: 'KC Contribution', desc: 'Available to your educator account' },
];

export default function EducatorWorkspacePage({ onBack, onOpenTool, initialShowStatus = true, coursesCount = 2 }) {
  const [showStatus, setShowStatus] = useState(initialShowStatus);

  if (showStatus) {
    return (
      <main className="become-educator-page educator-status-page">
        <header className="become-educator-application-header">
          <span className="become-educator-eyebrow">EDUCATOR APPLICATION</span>
          <h1>Application Status</h1>
          <p>
            Your application has been submitted for review. You can check the next steps in your educator journey
            here.
          </p>
        </header>

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
              onClick={() => setShowStatus(false)}
              title="Close and view workspace tools"
              aria-label="Close application status"
            >
              ✕
            </button>
          </div>

          <ol className="educator-status-steps">
            <li className="complete">
              <span className="educator-status-dot">✓</span>
              <div>
                <b>Application Submitted</b>
                <small>Your application is with the KC team.</small>
              </div>
            </li>
            <li className="current">
              <span className="educator-status-dot">2</span>
              <div>
                <b>Under Review</b>
                <small>The team will review your information and follow up with next steps.</small>
              </div>
            </li>
            <li>
              <span className="educator-status-dot">3</span>
              <div>
                <b>Approved</b>
                <small>Approval decision from the KC team.</small>
              </div>
            </li>
            <li>
              <span className="educator-status-dot">4</span>
              <div>
                <b>Certified Educator Membership</b>
                <small>Membership details and contribution terms are confirmed during onboarding.</small>
              </div>
            </li>
            <li>
              <span className="educator-status-dot">5</span>
              <div>
                <b>Educator Tools Enabled</b>
                <small>Access follows approval and completion of onboarding.</small>
              </div>
            </li>
          </ol>

          {/* <p className="educator-status-note">
            Demo flow: Click the ✕ button or “View Workspace Tools” below to access educator tools directly.
          </p> */}
        </section>

        <button
          type="button"
          className="become-educator-primary educator-status-home"
          onClick={() => setShowStatus(false)}
        >
          View Workspace Tools →
        </button>
      </main>
    );
  }

  return (
    <main className="ec-page ec-educator-workspace-page">
      <EducationBackButton onClick={onBack} label="Education home" />
      <section className="ec-educator-workspace ec-educator-workspace-standalone">
        <div className="ec-educator-workspace-heading">
          <div>
            <span className="ec-eyebrow">CERTIFIED EDUCATOR</span>
            <h2>Educator Workspace</h2>
            <p>Your application has been approved and educator access is enabled in this demo.</p>
          </div>
          <div className="ec-workspace-heading-actions">
            <span className="ec-educator-enabled">
              <span className="ec-educator-active-dot" />
              Active
            </span>
          </div>
        </div>
        <div className="ec-educator-tool-grid">
          {tools.map(tool => (
            <button key={tool.id} className={`ec-tool-card ${tool.isCountCard ? 'ec-tool-card--count' : ''}`} onClick={() => onOpenTool(tool.id)}>
              <span className="ec-tool-check-badge">✓</span>
              <div className="ec-tool-card-body">
                <h3 className="ec-tool-card-title">{tool.name}</h3>
                {tool.isCountCard ? (
                  <div className="ec-tool-card-count-stat">
                    <span className="ec-tool-card-count-num">{coursesCount}</span>
                    <span className="ec-tool-card-count-text">
                      {coursesCount === 1 ? 'Course' : 'Courses'}
                    </span>
                  </div>
                ) : (
                  <p className="ec-tool-card-desc">{tool.desc}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
