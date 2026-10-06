import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ALEX_AVATAR } from './mockData';
import './CourseReaderPage.css';

/* ── Icons ── */
function BackArrowIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function BookmarkIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>; }
function SettingsIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function ShareIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }
function ChevLeftIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevRightIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function BulbIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>; }
function NoteIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }

/* ── Content database ── */
const READER_CONTENT = {
  'Advanced UI Design Systems': {
    totalPages: 32,
    spreads: [
      {
        pages: [12, 13],
        chapter: 'CHAPTER 6',
        chapterTitle: 'Typography Systems',
        img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 6.1: TYPE SCALE DIAGRAM',
        leftBody: [
          'Typography is more than the selection of a typeface — it is the architecture of communication itself. A robust typographic system defines harmony, hierarchy, and rhythm across an entire product.',
          'The foundation of any type system begins with scale. A modular scale, derived from a single ratio, ensures that every font size relates meaningfully to every other, creating visual cohesion without explicit coordination.',
          'Consistent line-height, letter-spacing, and weight pairings complete the system, allowing designers and engineers to communicate fluidly across disciplines.',
        ],
        rightSections: [
          { heading: 'Establishing a Type Scale', body: 'A type scale defines the set of font sizes available within a system. Rather than choosing sizes arbitrarily, a modular scale — such as the Major Third (1.25) or Perfect Fourth (1.333) — ensures each step in the scale bears a harmonic relationship to the next.' },
          { heading: 'Weight & Hierarchy', body: 'Font weight is one of the most powerful tools for establishing visual hierarchy. A system that uses weight strategically can guide the reader\'s eye through a layout, surfacing the most important information first and allowing supporting content to recede.' },
        ],
        callout: { type: 'KEY CONCEPT', text: '"A type system is not a set of rules — it is a vocabulary. The richer the vocabulary, the more precisely you can express design intent."' },
      },
      {
        pages: [14, 15],
        chapter: 'CHAPTER 7',
        chapterTitle: 'Component Architecture',
        img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 7.1: ATOMIC MAPPING',
        leftBody: [
          'Component architecture is the bedrock of any scalable design system. It dictates how individual elements interact, inherit properties, and maintain consistency across vast digital landscapes.',
          'As systems grow in complexity, the need for a rigid yet flexible structure becomes paramount. This chapter explores the methodologies behind creating high performance components that serve both designers and developers with equal efficiency.',
          'By defining clear hierarchies — from the smallest atoms to complex organisms — we create a shared language that accelerates production while reducing technical and design debt.',
        ],
        rightSections: [
          { heading: 'Design Tokens & Atomic Elements', body: 'At the most granular level, we find design tokens — the sub-atomic particles of our UI. These are the values for colors, spacing, and typography that ensure every component speaks the same visual language. By abstracting these values, we create a single source of truth that simplifies maintenance and enables multi-platform theming with ease.' },
          { heading: 'Atomic Components', body: 'Atomic components are the smallest functional units of our interface, such as buttons, inputs, and icons. They are designed to be context-agnostic, meaning they can function reliably regardless of where they are placed. This modularity is what allows for the rapid assembly of complex views while maintaining a high degree of UI integrity.' },
        ],
        callout: { type: 'PRO TIP', text: '"Always document the \'Why\' behind a component, not just the \'What\'. Usage guidelines are as critical as the code itself."' },
      },
      {
        pages: [16, 17],
        chapter: 'CHAPTER 7',
        chapterTitle: 'Component Architecture',
        img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 7.2: MOLECULE COMPOSITION',
        leftBody: [
          'Molecules emerge when atomic components combine to form distinct functional units. A search field — composed of an input atom, a button atom, and an icon atom — is a molecule. Each molecule fulfills one well-defined purpose.',
          'The power of molecules lies in their reusability. Once defined, a search molecule can appear in navbars, modals, and sidebars without duplication of logic or style. This is the foundation of scalable front-end engineering.',
          'Defining molecule boundaries requires deliberate choices. The guiding question is always: does this grouping represent a singular responsibility, or is it attempting to fulfill multiple unrelated roles?',
        ],
        rightSections: [
          { heading: 'Organism Composition', body: 'Organisms are complex UI components assembled from groups of molecules and atoms. A navigation bar, a product card, or a data table are organisms. They represent distinct sections of an interface that can be placed into page templates.' },
          { heading: 'Template & Page Patterns', body: 'Templates place organisms into a layout, defining the skeletal structure of a page. Pages are specific instances of templates, populated with real representative content. The transition from template to page is where the quality of the design system is fully tested.' },
        ],
        callout: { type: 'NOTE', text: '"In practice, the atomic hierarchy is a mental model, not a strict taxonomy. What matters most is that your team shares a consistent vocabulary for describing complexity."' },
      },
    ],
  },
  'Product Management Fundamentals': {
    totalPages: 24,
    spreads: [
      {
        pages: [6, 7],
        chapter: 'CHAPTER 3',
        chapterTitle: 'Stakeholder Mapping',
        img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 3.1: STAKEHOLDER INFLUENCE MATRIX',
        leftBody: [
          'Understanding who holds power and interest in your product is fundamental to successful product management. Stakeholder mapping transforms a vague network of relationships into a clear, actionable model.',
          'The influence-interest matrix categorizes stakeholders across two axes: the degree of influence they hold over decisions, and the degree of interest they hold in the product outcomes.',
          'This model prevents common PM failures — over-indexing on vocal but low-influence voices, or neglecting quiet but high-impact decision makers.',
        ],
        rightSections: [
          { heading: 'Managing High-Influence Stakeholders', body: 'Stakeholders with high influence and high interest — your core partners — require proactive, frequent communication. They should be involved in major decisions, previewed on roadmap changes, and engaged in discovery when possible.' },
          { heading: 'Communicating with Executives', body: 'Executives typically fall in the high-influence, lower-day-to-day-interest quadrant. Your communication with this group should be concise, outcome-focused, and tied to business metrics. Lead with impact, not activity.' },
        ],
        callout: { type: 'PRO TIP', text: '"Never let your stakeholder map become static. Influence and interest shift as organizations evolve. Revisit it quarterly."' },
      },
      {
        pages: [8, 9],
        chapter: 'CHAPTER 4',
        chapterTitle: 'User Research Ethics',
        img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 4.1: RESEARCH ETHICS FRAMEWORK',
        leftBody: [
          'User research is not merely a methodological discipline — it is an ethical practice. Every participant who shares their time, behaviors, and experiences trusts that their contribution will be handled with respect and integrity.',
          'Ethical research begins before the first participant is recruited. It starts in the framing of the research question, the design of consent processes, and the planning of data handling and storage.',
          'The product manager\'s role in research ethics is to ensure the entire team — researchers, designers, and engineers alike — understands and upholds these responsibilities.',
        ],
        rightSections: [
          { heading: 'Informed Consent', body: 'Participants must clearly understand what they are agreeing to before a session begins. This means plain-language explanations of how data will be used, who will see it, how long it will be retained, and the participant\'s right to withdraw at any time without consequence.' },
          { heading: 'Handling Sensitive Data', body: 'When research surfaces sensitive information — financial stress, health concerns, workplace conflict — the researcher has a heightened duty of care. Data should be anonymized as soon as practically possible, stored securely, and shared only on a strict need-to-know basis.' },
        ],
        callout: { type: 'KEY CONCEPT', text: '"The goal of ethical research is not just to protect the organization from liability — it is to honor the humanity of every participant who trusted you."' },
      },
    ],
  },
  'React Performance Patterns': {
    totalPages: 28,
    spreads: [
      {
        pages: [4, 5],
        chapter: 'CHAPTER 2',
        chapterTitle: 'React DevTools',
        img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=700&q=80&fit=crop',
        figureCaption: 'FIGURE 2.1: REACT PROFILER FLAMEGRAPH',
        leftBody: [
          'React DevTools is the primary instrument for diagnosing performance issues in React applications. Mastery of this tool transforms performance optimization from guesswork into a data-driven discipline.',
          'The Profiler tab records component render timings across an interaction. Each recorded session produces a flamegraph — a visual representation of which components rendered, in what order, and for how long.',
          'The commitment phase, the stage at which React applies changes to the DOM, is often where performance budgets are exceeded. The DevTools profiler isolates exactly which renders contributed to a slow commit.',
        ],
        rightSections: [
          { heading: 'Reading the Flamegraph', body: 'Each bar in the flamegraph represents a component that rendered during the recorded interaction. Width corresponds to render time. A wide bar is not inherently problematic — it may simply be a complex component that renders quickly. The colors indicate relative render time within the commit: gray means the component did not render in that commit.' },
          { heading: 'Why Did This Render?', body: 'The "Why did this render?" feature, available when the "Record why each component rendered while profiling" setting is enabled, is one of the most valuable tools in the performance engineer\'s arsenal. It surfaces the exact prop or state change that triggered a render, eliminating hours of manual debugging.' },
        ],
        callout: { type: 'PRO TIP', text: '"Always profile in production mode. React development mode intentionally adds overhead that can misrepresent real-world performance characteristics."' },
      },
    ],
  },
};

function getSpread(courseTitle, page) {
  const course = READER_CONTENT[courseTitle];
  if (!course) return null;
  const spread = course.spreads.find(s => s.pages.includes(page));
  if (spread) return spread;
  return course.spreads[course.spreads.length - 1];
}

function getTotalPages(courseTitle) {
  return READER_CONTENT[courseTitle]?.totalPages ?? 32;
}

const CALLOUT_STYLE = {
  'PRO TIP':     { border: '#06b6d4', bg: '#06b6d408', label: '#06b6d4', Icon: BulbIcon },
  'KEY CONCEPT': { border: '#8b5cf6', bg: '#8b5cf608', label: '#8b5cf6', Icon: NoteIcon },
  'NOTE':        { border: '#f59e0b', bg: '#f59e0b08', label: '#f59e0b', Icon: NoteIcon },
};

function LessonReaderView({ course, lesson, moduleTitle, lessonPosition, lessonCount, progress, completed, onBack, onComplete, onPrevious, onNext, hasPrevious, hasNext, avatarUrl }) {
  const [videoFinished, setVideoFinished] = useState(false);
  const type = (lesson.type || 'Text').toLowerCase();
  const video = type.includes('video');
  const audio = type.includes('audio');
  const image = type.includes('image');
  const pdf = type.includes('pdf');
  const download = type.includes('download');
  const external = type.includes('external');
  const url = lesson.url || lesson.videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const content = video ? <video className="cr-lesson-video" controls onEnded={() => { setVideoFinished(true); onComplete?.(); }} src={url}>Your browser does not support video playback.</video>
    : audio ? <div className="cr-lesson-audio"><div className="cr-lesson-media-icon">♫</div><audio controls src={lesson.url} /></div>
      : image ? <img className="cr-lesson-image" src={lesson.url || lesson.img} alt={lesson.title} />
        : pdf ? <iframe className="cr-lesson-pdf" title={lesson.title} src={lesson.url || '/sample.pdf'} />
          : download ? <a className="cr-lesson-download" href={lesson.url || '#'} download>↓ Download lesson file</a>
            : external ? <a className="cr-lesson-external" href={lesson.url || '#'} target="_blank" rel="noreferrer">Open learning resource ↗</a>
              : <div className={`cr-lesson-reading${type.includes('quiz') || type.includes('assessment') ? ' cr-lesson-exercise' : ''}`}><span>{type.includes('quiz') || type.includes('assessment') ? 'EXERCISE' : 'LESSON NOTES'}</span><p>{lesson.content || `Welcome to ${lesson.title}. Work through this lesson at your own pace, then mark it complete to continue.`}</p>{(type.includes('quiz') || type.includes('assessment')) && <button onClick={onComplete}>Submit demo assessment</button>}</div>;
  const isComplete = completed || videoFinished;
  return <div className="cr-page cr-lesson-page">
    <header className="cr-topbar cr-lesson-topbar"><div className="cr-topbar-left"><button className="cr-back-btn" onClick={onBack}><BackArrowIcon /><span className="cr-back-label">Back to Course</span></button></div><div className="cr-lesson-titlebar"><b>{course.title}</b><span>{moduleTitle} <i>•</i> Lesson {lessonPosition} of {lessonCount}</span></div><div className="cr-topbar-right"><img src={avatarUrl} alt="avatar" className="cr-avatar" /></div></header>
    <div className="cr-lesson-progress"><span style={{ width: `${progress}%` }} /></div>
    <main className="cr-reader cr-lesson-reader"><div className="cr-lesson-reader-heading"><div><span>{lesson.type || 'Lesson'} {lesson.duration ? `· ${lesson.duration}` : ''}</span><h1>{lesson.title}</h1></div><b>{progress}% Complete</b></div><section className="cr-lesson-content">{content}</section>{isComplete && <div className="cr-lesson-finished">Lesson Completed ✓</div>}</main>
    <footer className="cr-lesson-bottom"><button className="cr-lesson-nav" onClick={onPrevious} disabled={!hasPrevious}><ChevLeftIcon /> Previous</button><span>Lesson {lessonPosition} of {lessonCount}</span>{isComplete ? <button className="cr-lesson-next" onClick={onNext} disabled={!hasNext}>Next Lesson <ChevRightIcon /></button> : <div className="cr-lesson-actions"><button className="cr-lesson-complete" onClick={onComplete}>Mark Complete</button><button className="cr-lesson-next" onClick={onNext} disabled={!hasNext}>Next <ChevRightIcon /></button></div>}</footer>
  </div>;
}

export default function CourseReaderPage({ course, onBack, lesson, moduleTitle, lessonPosition, lessonCount, progress, completed, onComplete, onPrevious, onNext, hasPrevious, hasNext }) {
  const { profile } = useSelector(s => s.profile);
  const avatarUrl   = profile?.avatar ?? ALEX_AVATAR;

  const startPage   = parseInt((course.chapter || '').match(/\d+/)?.[0] ?? '1') + 12;
  const totalPages  = getTotalPages(course.title);
  const [page, setPage]         = useState(Math.min(startPage, totalPages - 1));
  const [bookmarked, setBookmarked] = useState(false);
  const [animDir, setAnimDir]   = useState('');

  const spread = getSpread(course.title, page);
  const calloutStyle = spread ? (CALLOUT_STYLE[spread.callout?.type] ?? CALLOUT_STYLE['PRO TIP']) : CALLOUT_STYLE['PRO TIP'];

  if (lesson) return <LessonReaderView course={course} lesson={lesson} moduleTitle={moduleTitle} lessonPosition={lessonPosition} lessonCount={lessonCount} progress={progress} completed={completed} onBack={onBack} onComplete={onComplete} onPrevious={onPrevious} onNext={onNext} hasPrevious={hasPrevious} hasNext={hasNext} avatarUrl={avatarUrl} />;

  function goNext() {
    if (page >= totalPages) return;
    setAnimDir('next');
    setTimeout(() => setAnimDir(''), 300);
    setPage(p => Math.min(p + 2, totalPages));
  }
  function goPrev() {
    if (page <= 1) return;
    setAnimDir('prev');
    setTimeout(() => setAnimDir(''), 300);
    setPage(p => Math.max(p - 2, 1));
  }

  const progressPct = Math.round((page / totalPages) * 100);

  return (
    <div className="cr-page">

      {/* ── Top Bar ── */}
      <header className="cr-topbar">
        <div className="cr-topbar-left">
          <button className="cr-back-btn" onClick={onBack}>
            <BackArrowIcon />
            <span className="cr-back-label">{course.title}</span>
          </button>
        </div>

        <div className="cr-topbar-center">
          <span className="cr-chapter-pill">{course.module || 'Advanced UI Design Systems'}</span>
        </div>

        <div className="cr-topbar-right">
          <button
            className={`cr-icon-btn${bookmarked ? ' cr-icon-btn--active' : ''}`}
            onClick={() => setBookmarked(b => !b)}
            aria-label="Bookmark"
          >
            <BookmarkIcon />
          </button>
          <button className="cr-icon-btn" aria-label="Settings"><SettingsIcon /></button>
          <button className="cr-icon-btn" aria-label="Share"><ShareIcon /></button>
          <img src={avatarUrl} alt="avatar" className="cr-avatar" />
        </div>
      </header>

      {/* ── Reader Content ── */}
      <div className="cr-reader">
        <div className={`cr-spread${animDir ? ` cr-spread--${animDir}` : ''}`}>

          {/* Left page */}
          <div className="cr-page-left">
            {spread && (
              <>
                <p className="cr-chapter-label">{spread.chapter}</p>
                <h1 className="cr-chapter-title">{spread.chapterTitle}</h1>
                <div className="cr-figure">
                  <img src={spread.img} alt={spread.chapterTitle} className="cr-figure-img" />
                  <p className="cr-figure-caption">{spread.figureCaption}</p>
                </div>
                <div className="cr-left-body">
                  {spread.leftBody.map((para, i) => (
                    <p key={i} className="cr-body-text">{para}</p>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="cr-spine" />

          {/* Right page */}
          <div className="cr-page-right">
            {spread && (
              <>
                {spread.rightSections.map((sec, i) => (
                  <div key={i} className="cr-right-section">
                    <h2 className="cr-section-heading">{sec.heading}</h2>
                    <p className="cr-body-text">{sec.body}</p>
                  </div>
                ))}

                {spread.callout && (
                  <div
                    className="cr-callout"
                    style={{ borderLeftColor: calloutStyle.border, background: calloutStyle.bg }}
                  >
                    <div className="cr-callout-label" style={{ color: calloutStyle.border }}>
                      <calloutStyle.Icon />
                      {spread.callout.type}
                    </div>
                    <p className="cr-callout-text">{spread.callout.text}</p>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <footer className="cr-footer">
        <button
          className="cr-nav-btn cr-nav-btn--prev"
          onClick={goPrev}
          disabled={page <= 1}
        >
          <ChevLeftIcon /> Previous Page
        </button>

        <div className="cr-progress-area">
          <div className="cr-progress-track">
            <div className="cr-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="cr-page-label">Page {page} of {totalPages}</span>
        </div>

        <button
          className="cr-nav-btn cr-nav-btn--next"
          onClick={goNext}
          disabled={page >= totalPages}
        >
          Next Page <ChevRightIcon />
        </button>
      </footer>

    </div>
  );
}
