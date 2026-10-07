import './EducatorWorkspacePage.css';

const tools = ['Educator Dashboard', 'Create Course', 'Course Builder', 'Student Management', 'Educator Store', 'Subscription Management', 'Events', 'Analytics', 'Financials', 'KC Contribution'];

export default function EducatorWorkspacePage({ onBack, onOpenTool }) {
  return <main className="ec-page ec-educator-workspace-page">
    <button className="ec-back-home" onClick={onBack}>← Education home</button>
    <section className="ec-educator-workspace ec-educator-workspace-standalone">
      <div className="ec-educator-workspace-heading"><div><span className="ec-eyebrow">CERTIFIED EDUCATOR</span><h2>Educator Workspace</h2><p>Your application has been approved and educator access is enabled in this demo.</p></div><span className="ec-educator-enabled">✓ Access enabled</span></div>
      <div className="ec-educator-tool-grid">{tools.map(tool => <button key={tool} onClick={() => onOpenTool(tool)}><span className="ec-tool-icon">✓</span><span><b>{tool}</b><small>Available to your educator account</small></span></button>)}</div>
    </section>
  </main>;
}
