import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCourseById, flattenChapters, totalChapterCount, priceLabel } from './educationData';
import useEducationProgress from './useEducationProgress';
import Loader from '../Loader';
import { courseApi } from '../../services/courseApi';
import './CourseReaderPage.css';
import './CourseDetailPage.css';
// Reuses the .lap-checkout-* classes so the paid-course checkout modal here
// is visually identical to the one on the course list / explore page.
import './LearningActivityPage.css';

// Authors enter free-text durations per chapter ("15 min", "1h 30m", "45") —
// parsed leniently so the course-level total can be a real sum instead of a
// separate (often stale/zero) course.duration field from the backend.
// Backend rejects a second report from the same user — surfaced either as a
// structured flag or just in the error message, so check both rather than
// assuming one exact shape.
function isAlreadyReportedError(err) {
  if (err?.alreadyReported) return true;
  const msg = (err?.message || err?.error || '').toLowerCase();
  return msg.includes('already reported');
}

function parseDurationMinutes(str) {
  if (!str) return 0;
  const s = String(str).toLowerCase();
  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*m/);
  if (hMatch || mMatch) {
    return (hMatch ? parseFloat(hMatch[1]) * 60 : 0) + (mMatch ? parseFloat(mMatch[1]) : 0);
  }
  const bare = s.match(/(\d+(?:\.\d+)?)/);
  return bare ? parseFloat(bare[1]) : 0;
}

function formatMinutes(totalMinutes) {
  if (!totalMinutes) return null;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m} min`;
}

// Normalizes a real backend {course, chapters} pair into the same shape the
// mock educationData courses use (modules -> chapters with leftBody /
// rightSections / callout), so the reader below can stay a single code path.
function normalizeApiCourse(course, chapters) {
  // Draft chapters are visible to the author in Manage Chapters, but a
  // student reading the course should only ever see published ones.
  const sorted = (chapters || [])
    .filter(ch => ch.status !== 'draft')
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    ...course,
    isFree: course.pricingType !== 'paid',
    price: course.pricingType === 'paid' ? `$${course.price}` : null,
    modules: [
      {
        id: 'chapters',
        title: 'Chapters',
        chapters: sorted.map((ch, idx) => ({
          id: ch.id,
          label: `Chapter ${idx + 1}`,
          title: ch.title,
          description: ch.description || null,
          duration: ch.duration || null,
          videoUrl: ch.videoUrl || null,
          pdfUrl: ch.pdfUrl || null,
          externalUrl: ch.externalUrl || null,
          img: ch.img || null,
          leftBody: ch.content ? [ch.content] : [],
          // The reader's right page otherwise sits empty for real courses —
          // give it the author's learning objectives when present instead.
          rightSections: ch.learningObjectives
            ? [{ heading: "What You'll Learn", body: ch.learningObjectives }]
            : [],
          callout: null,
        })),
      },
    ],
  };
}

/* ── Icons ── */
function BackArrowIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevLeftIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function CheckIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function BulbIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>; }
function NoteIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function PlayCircleIcon() { return <svg className="cdp-chapter-video-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>; }
function DocumentIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>; }
function LinkIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function StarIcon()       { return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function ClockIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function SparkIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>; }
function FlagIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }

const CALLOUT_STYLE = {
  'PRO TIP':     { border: '#06b6d4', bg: '#06b6d408', label: '#06b6d4', Icon: BulbIcon },
  'KEY CONCEPT': { border: '#8b5cf6', bg: '#8b5cf608', label: '#8b5cf6', Icon: NoteIcon },
  'NOTE':        { border: '#f59e0b', bg: '#f59e0b08', label: '#f59e0b', Icon: NoteIcon },
};

// Pulled out of the main return below so the paid-course checkout markup
// isn't duplicated inline.
function CheckoutModal({ course, checkoutStep, onPurchase, onClose }) {
  return (
    <div className="lap-checkout-overlay" onClick={() => checkoutStep !== 'processing' && onClose()}>
      <div className="lap-checkout-modal" onClick={(e) => e.stopPropagation()}>
        {checkoutStep === 'success' ? (
          <>
            <div className="lap-checkout-success-icon"><CheckIcon /></div>
            <h3>Payment Successful</h3>
            <p className="lap-checkout-sub">You're enrolled in <strong>{course.title}</strong>.</p>
            <div className="lap-checkout-actions">
              <button className="lap-checkout-primary-btn" onClick={onClose}>Continue</button>
            </div>
          </>
        ) : (
          <>
            <h3>Checkout</h3>
            <p className="lap-checkout-sub">{course.title}</p>
            <div className="lap-checkout-price-row">
              <span>Total</span>
              <span className="lap-checkout-price">{priceLabel(course)}</span>
            </div>
            {checkoutStep === 'error' && (
              <p className="lap-checkout-error">Payment failed. Please try again.</p>
            )}
            <div className="lap-checkout-actions">
              <button
                className="lap-checkout-primary-btn"
                disabled={checkoutStep === 'processing'}
                onClick={onPurchase}
              >
                {checkoutStep === 'processing' ? 'Processing…' : `Pay ${priceLabel(course)}`}
              </button>
              <button className="lap-checkout-secondary-btn" disabled={checkoutStep === 'processing'} onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// "View Details" only — a summary of exactly what the author filled in on
// CreateCoursePage (cover image, title, description, category, level,
// price), plus just the chapter titles if any have been added yet — no
// chapter body/video/reader UI here. Chapter titles are only clickable once
// enrolled; browsing this screen without enrolling shows what's there, not
// a way into it. Enrolling itself happens from the course card, not here.
function CourseInfoView({ course, chapters, isEnrolled, onBack, onSelectChapter }) {
  const cover = course.coverImage || course.img;
  const levelLabel = course.level || course.difficulty;
  return (
    <div className="cr-page">
      <header className="cr-topbar">
        <div className="cr-topbar-left">
          <button className="cr-back-btn" onClick={onBack}>
            <BackArrowIcon />
            <span className="cr-back-label">Back</span>
          </button>
        </div>
      </header>

      <div className="cdp-info-page">
        <div className="cdp-info-card">
          {cover && (
            <div className="cdp-info-cover">
              <img src={cover} alt={course.title} />
            </div>
          )}
          <div className="cdp-info-body">
            {(course.category || levelLabel) && (
              <div className="cdp-info-badges">
                {course.category && <span className="cdp-info-badge">{course.category}</span>}
                {levelLabel && <span className="cdp-info-badge cdp-info-badge--level">{levelLabel}</span>}
              </div>
            )}
            <h1 className="cdp-info-title">{course.title}</h1>
            {course.description && <p className="cdp-info-desc">{course.description}</p>}
            <div className="cdp-info-footer">
              <span className={`cdp-price-badge cdp-info-price${course.isFree ? ' cdp-price-badge--free' : ''}`}>
                {priceLabel(course)}
              </span>
            </div>

            {chapters.length > 0 && (
              <div className="cdp-info-chapters">
                <p className="cdp-info-chapters-title">Chapters</p>
                <ul className="cdp-info-chapter-list">
                  {chapters.map((ch, i) => (
                    <li key={ch.id}>
                      {isEnrolled ? (
                        <button className="cdp-info-chapter-item" onClick={() => onSelectChapter(ch.id)}>
                          <span className="cdp-info-chapter-idx">{i + 1}</span>
                          <span className="cdp-info-chapter-name">{ch.title}</span>
                        </button>
                      ) : (
                        <div className="cdp-info-chapter-item cdp-info-chapter-item--static">
                          <span className="cdp-info-chapter-idx">{i + 1}</span>
                          <span className="cdp-info-chapter-name">{ch.title}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage({ courseId, authToken, onBack, initialMode = 'reader' }) {
  const [mode, setMode] = useState(initialMode);
  const progress = useEducationProgress();
  const userId = useSelector(s => s.auth?.user?._id ?? s.auth?.user?.id);

  // 'loading' while a real fetch is in flight, 'api' once it succeeds,
  // 'mock' once it fails (or there's no token) so old callers of this page
  // that only know mock course ids keep working unchanged.
  const [source, setSource] = useState(authToken ? 'loading' : 'mock');
  const [apiCourse, setApiCourse] = useState(null);
  // Chapter-level progress from the real backend — completedChapters is a
  // Set of chapter ids, percentComplete is server-computed, not guessed
  // client-side. Falls back to the local useEducationProgress hook when
  // this is null (no token, or /progress isn't live yet).
  const [apiProgress, setApiProgress] = useState(null);
  // Real enrollment, confirmed against the backend's enrolled-courses list —
  // reaching this reader (e.g. via "View Details") does NOT imply enrollment,
  // so this must never be assumed true just because the course loaded.
  const [apiEnrolled, setApiEnrolled] = useState(false);
  // apiEnrolled defaults to false, which is indistinguishable from "checked
  // and genuinely not enrolled" — without this flag, an already-enrolled
  // user briefly sees the "Enroll this course" CTA flash on screen while
  // the real check is still in flight, then watches it disappear once the
  // response lands. This gates that CTA until the check has actually run.
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  // Paid-course checkout — mirrors the same mock-payment flow used on the
  // course list page, so a paid course can't be "enrolled" into for free.
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('idle'); // idle | processing | success | error

  // Rating the user has just submitted this session — overrides whatever
  // came back from the API until the next full fetch.
  const [myRating, setMyRating] = useState(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  // Keyed by chapter id — a chapter's video URL can 404/CORS-fail without
  // throwing, so the <video> tag alone gives no visible signal that it did.
  const [videoErrorChapterId, setVideoErrorChapterId] = useState(null);

  // Shown once the last chapter is marked complete — otherwise clicking
  // "Complete Chapter" on the final chapter did nothing visible at all.
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState(null);
  // Set the moment a report succeeds (or the backend says it's a dup) so the
  // flag button updates immediately, without waiting on a refetch of course.reportedByMe.
  const [myReported, setMyReported] = useState(false);

  useEffect(() => {
    if (!authToken) return;
    let cancelled = false;
    (async () => {
      try {
        const [courseRes, chaptersRes] = await Promise.all([
          courseApi.getCourseDetails(courseId, authToken),
          courseApi.getChapters(courseId, authToken),
        ]);
        if (cancelled) return;
        if (courseRes.success && courseRes.course) {
          setApiCourse(normalizeApiCourse(courseRes.course, chaptersRes.chapters));
          setSource('api');
          try {
            const progressRes = await courseApi.getChapterProgress(courseId, authToken);
            if (!cancelled && progressRes.success) {
              setApiProgress({
                completedChapters: new Set(progressRes.completedChapters ?? []),
                percentComplete: progressRes.percentComplete ?? 0,
                lastViewedChapterId: progressRes.lastViewedChapterId ?? null,
              });
            }
          } catch {
            // /progress isn't live yet — apiProgress stays null, UI falls
            // back to local completion tracking below.
          }
          if (userId) {
            try {
              const enrolledRes = await courseApi.getUserEnrolledCourses(userId, authToken);
              if (!cancelled && enrolledRes.success) {
                setApiEnrolled((enrolledRes.courses || []).some(c => c.id === courseId));
              }
            } catch {
              // Enrollment check failed — leave apiEnrolled false, the safe default.
            } finally {
              if (!cancelled) setEnrollmentChecked(true);
            }
          } else if (!cancelled) {
            setEnrollmentChecked(true);
          }
        } else {
          setSource('mock');
        }
      } catch {
        if (!cancelled) setSource('mock');
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, authToken, userId]);

  // No token means we never fetch, so never sit in 'loading' waiting on a
  // request that isn't happening.
  const resolvedSource = authToken ? source : 'mock';
  const course = resolvedSource === 'api' ? apiCourse : resolvedSource === 'mock' ? getCourseById(courseId) : null;
  // Needed both by the main reader below and by the "View Details" info
  // view (chapters there are locked behind enrollment), so it's computed
  // once up here rather than lower down where only the reader could see it.
  const isEnrolled = resolvedSource === 'api' ? apiEnrolled : progress.isEnrolled(courseId);
  // Only 'api' courses have an async enrollment check to wait on — mock
  // courses resolve isEnrolled synchronously, so there's nothing to pend.
  const enrollmentPending = resolvedSource === 'api' && !enrollmentChecked;
  const chapters = course ? flattenChapters(course) : [];
  const hasChapters = chapters.length > 0;
  const total = course ? totalChapterCount(course) : 0;
  // Real courses: sum the author-entered per-chapter durations instead of
  // trusting a separate course.duration field. Falls back to that field
  // (mock courses, or a real course with no durations entered yet).
  const summedMinutes = chapters.reduce((sum, ch) => sum + parseDurationMinutes(ch.duration), 0);
  const displayDuration = formatMinutes(summedMinutes) ?? course?.duration;

  const [selectedChapterId, setSelectedChapterId] = useState(
    () => progress.lastViewedChapter[courseId] ?? chapters[0]?.id
  );
  const [rightIdx, setRightIdx] = useState(0);
  const [rightIdxChapterId, setRightIdxChapterId] = useState(selectedChapterId);

  // Chapters can arrive after mount (real API path), by which point
  // selectedChapterId's initializer already ran against an empty list —
  // derive a valid selection instead of round-tripping through an effect.
  const effectiveChapterId = chapters.some(ch => ch.id === selectedChapterId)
    ? selectedChapterId
    : (apiProgress?.lastViewedChapterId ?? progress.lastViewedChapter[courseId] ?? chapters[0]?.id);

  const chapterIdx = chapters.findIndex(ch => ch.id === effectiveChapterId);
  const chapter = chapters[chapterIdx];
  const calloutStyle = chapter?.callout ? (CALLOUT_STYLE[chapter.callout.type] ?? CALLOUT_STYLE['PRO TIP']) : null;
  const pct = apiProgress ? apiProgress.percentComplete : progress.getCourseProgressPct(courseId, course);
  const isChapterDone = (chId) => (apiProgress ? apiProgress.completedChapters.has(chId) : progress.isChapterComplete(courseId, chId));

  if (chapter && chapter.id !== rightIdxChapterId) {
    setRightIdxChapterId(chapter.id);
    setRightIdx(0);
  }

  useEffect(() => {
    if (!course || !chapter) return;
    progress.setLastViewedChapter(courseId, chapter.id);
    progress.logCourseView(courseId, chapter.id, course);
  }, [courseId, chapter?.id]);

  if (resolvedSource === 'loading') {
    return (
      <div className="cr-page">
        <header className="cr-topbar">
          <button className="cr-back-btn" onClick={onBack}><BackArrowIcon /><span className="cr-back-label">Back</span></button>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader inline />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cr-page">
        <header className="cr-topbar">
          <button className="cr-back-btn" onClick={onBack}><BackArrowIcon /><span className="cr-back-label">Back</span></button>
        </header>
        <div style={{ padding: 40, color: '#94a3b8' }}>Course not found.</div>
      </div>
    );
  }

  if (mode === 'info') {
    return (
      <CourseInfoView
        course={course}
        chapters={chapters}
        isEnrolled={isEnrolled}
        onBack={onBack}
        onSelectChapter={(chapterId) => {
          setSelectedChapterId(chapterId);
          setMode('reader');
        }}
      />
    );
  }

  // course.reportedByMe is the backend's source of truth (survives a page
  // reload); myReported is the optimistic flag set right after a successful
  // submit in this session, before any refetch would pick that field up.
  const alreadyReported = myReported || !!course.reportedByMe;

  function selectChapter(id) {
    setSelectedChapterId(id);
  }

  function prevChapter() {
    const prev = chapters[chapterIdx - 1];
    if (prev) setSelectedChapterId(prev.id);
  }

  async function markComplete(chapterId) {
    if (resolvedSource === 'api') {
      // Not enrolled — the backend rejects /complete with 403, so don't even try.
      if (!apiEnrolled) return false;
      try {
        const res = await courseApi.completeChapter(courseId, chapterId, authToken);
        if (res.success) {
          setApiProgress(prev => ({
            completedChapters: new Set(res.completedChapters ?? [...(prev?.completedChapters ?? []), chapterId]),
            percentComplete: res.percentComplete ?? prev?.percentComplete ?? 0,
            lastViewedChapterId: chapterId,
          }));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    progress.markChapterComplete(courseId, chapterId);
    return true;
  }

  // Enrolls against the real backend for API courses (progress.enrollCourse
  // only ever touched local storage, which let the reader think a user was
  // enrolled when the backend had no record of it at all). Paid courses open
  // the same checkout modal as the course list instead of enrolling for free.
  function handleEnroll() {
    if (resolvedSource === 'api') {
      if (!course.isFree) {
        setCheckoutStep('idle');
        setShowCheckout(true);
        return;
      }
      performFreeEnroll();
    } else {
      progress.enrollCourse(courseId);
    }
  }

  async function performFreeEnroll() {
    try {
      const res = await courseApi.enrollCourse(courseId, authToken);
      if (res.success !== false) setApiEnrolled(true);
    } catch {
      // leave apiEnrolled false — enroll CTA stays visible so the user can retry
    }
  }

  // No real payment gateway yet — hits the same mock /purchase endpoint the
  // course list checkout uses, which validates + records a transaction and
  // enrolls in one step.
  async function handlePurchase() {
    setCheckoutStep('processing');
    try {
      const res = await courseApi.purchaseCourse(courseId, authToken);
      if (res.success) {
        setApiEnrolled(true);
        setCheckoutStep('success');
      } else {
        setCheckoutStep('error');
      }
    } catch {
      setCheckoutStep('error');
    }
  }

  function closeCheckout() {
    setShowCheckout(false);
    setCheckoutStep('idle');
  }

  async function submitRating(value) {
    if (!authToken || resolvedSource !== 'api' || ratingSubmitting) return;
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      const res = await courseApi.rateCourse(courseId, value, undefined, authToken);
      if (res.success) {
        setMyRating(value);
        setApiCourse(prev => prev ? { ...prev, rating: res.rating ?? prev.rating, ratingCount: res.ratingCount ?? prev.ratingCount } : prev);
      } else {
        setRatingError(res.error || 'Failed to submit rating');
      }
    } catch (err) {
      setRatingError(err?.message || err?.error || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  }

  function closeReportModal() {
    setReportOpen(false);
    setReportReason('');
    setReportDone(false);
    setReportError(null);
  }

  async function submitReportCourse() {
    if (!reportReason.trim() || !authToken || reportSubmitting) return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      const res = await courseApi.reportCourse(courseId, reportReason.trim(), authToken);
      if (res.success) {
        setReportDone(true);
        setMyReported(true);
      } else {
        setReportError(res.error || 'Failed to submit report.');
      }
    } catch (err) {
      // The backend rejects a second report from the same user (409/duplicate) —
      // treat that as "already reported" rather than a generic failure, since
      // functionally the desired state (a report is on file) is already true.
      if (isAlreadyReportedError(err)) {
        setMyReported(true);
        setReportDone(true);
      } else {
        setReportError(err?.message || err?.error || 'Failed to submit report.');
      }
    } finally {
      setReportSubmitting(false);
    }
  }

  async function completeAndAdvance() {
    const ok = await markComplete(chapter.id);
    if (!ok) return;
    const next = chapters[chapterIdx + 1];
    if (next) {
      setSelectedChapterId(next.id);
    } else {
      setShowCompletionModal(true);
    }
  }

  const isLastChapter = chapterIdx >= chapters.length - 1;

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
          {!enrollmentPending && !isEnrolled && (
            <button className="cdp-enroll-cta" onClick={handleEnroll}>
              <SparkIcon />
              Enroll this course
              <span className="cdp-enroll-cta-price">{priceLabel(course)}</span>
            </button>
          )}
        </div>

        <div className="cr-topbar-right">
          {course.rating ? (
            <span className="cdp-meta-item cdp-meta-item--rating">
              <StarIcon /> {Number(course.rating).toFixed(1)}
              {!!course.ratingCount && <span className="cdp-meta-rating-count"> ({course.ratingCount})</span>}
            </span>
          ) : null}
          <span className="cdp-meta-item"><ClockIcon /> {displayDuration}</span>
          <span className="cr-chapter-pill">{course.instructor}</span>
          {!enrollmentPending && (isEnrolled ? (
            <span className="cdp-price-badge cdp-price-badge--enrolled">
              <CheckIcon /> Enrolled
            </span>
          ) : (
            <span className={`cdp-price-badge cdp-price-badge--highlight${course.isFree ? ' cdp-price-badge--free' : ''}`}>
              <SparkIcon /> Enroll this course <span className="cdp-enroll-cta-price">{priceLabel(course)}</span>
            </span>
          ))}
          {authToken && (
            <button
              className={`cdp-report-btn${alreadyReported ? ' cdp-report-btn--done' : ''}`}
              onClick={() => !alreadyReported && setReportOpen(true)}
              disabled={alreadyReported}
              aria-label={alreadyReported ? 'You already reported this course' : 'Report this course'}
              title={alreadyReported ? 'You already reported this course' : 'Report this course'}
            >
              <FlagIcon />
            </button>
          )}
        </div>
      </header>

      <div className="cdp-body">

        {/* ── Sidebar: modules / chapters ── */}
        <aside className="cdp-sidebar">
          {course.modules.map(mod => (
            <div key={mod.id} className="cdp-module-group">
              <p className="cdp-module-title">{mod.title}</p>
              {mod.chapters.map(ch => {
                const done = isChapterDone(ch.id);
                return (
                  <button
                    key={ch.id}
                    className={`cdp-chapter-row${ch.id === selectedChapterId ? ' cdp-chapter-row--active' : ''}${done ? ' cdp-chapter-row--complete' : ''}`}
                    onClick={() => selectChapter(ch.id)}
                  >
                    <span className={`cdp-chapter-check${done ? ' cdp-chapter-check--done' : ''}`}>
                      {done && <CheckIcon />}
                    </span>
                    <span className="cdp-chapter-row-title">{ch.title}</span>
                    {ch.videoUrl && <PlayCircleIcon />}
                  </button>
                );
              })}
            </div>
          ))}

          {isEnrolled && resolvedSource === 'api' && (
            <div className="cdp-rate-box">
              <p className="cdp-rate-label">{(myRating ?? course.userRating) ? 'Your rating' : 'Rate this course'}</p>
              <div className="cdp-rate-stars" onMouseLeave={() => setRatingHover(0)}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`cdp-rate-star${(ratingHover || myRating || course.userRating || 0) >= n ? ' cdp-rate-star--filled' : ''}`}
                    disabled={ratingSubmitting}
                    onMouseEnter={() => setRatingHover(n)}
                    onClick={() => submitRating(n)}
                    aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                  >
                    <StarIcon />
                  </button>
                ))}
              </div>
              {ratingError && <p className="cdp-rate-error">{ratingError}</p>}
            </div>
          )}
        </aside>

        {/* ── Reader Content ── */}
        <div className="cr-reader cdp-reader">
          <div className="cr-spread">

            <div className="cr-page-left">
              {chapter ? (
                <>
                  <p className="cr-chapter-label">{chapter.label}</p>
                  <h1 className="cr-chapter-title">{chapter.title}</h1>
                  {chapter.description && <p className="cdp-chapter-desc">{chapter.description}</p>}
                  {chapter.videoUrl ? (
                    <div className="cdp-video-wrap">
                      <video
                        key={chapter.id}
                        className="cdp-video"
                        src={chapter.videoUrl}
                        poster={chapter.img}
                        controls
                        onEnded={() => markComplete(chapter.id)}
                        onError={() => setVideoErrorChapterId(chapter.id)}
                        onLoadedData={() => setVideoErrorChapterId(prev => (prev === chapter.id ? null : prev))}
                      />
                      {videoErrorChapterId === chapter.id && (
                        <p className="cdp-video-error">
                          This video couldn&apos;t be loaded. <a href={chapter.videoUrl} target="_blank" rel="noreferrer">Open it directly</a> to check the link.
                        </p>
                      )}
                    </div>
                  ) : chapter.img && (
                    <div className="cr-figure">
                      <img src={chapter.img} alt={chapter.title} className="cr-figure-img" />
                      {chapter.figureCaption && <p className="cr-figure-caption">{chapter.figureCaption}</p>}
                    </div>
                  )}
                  {chapter.rightSections.length > 1 && (
                    <div className="cdp-right-nav">
                      <button
                        className="cdp-right-nav-btn"
                        onClick={() => setRightIdx(i => Math.max(0, i - 1))}
                        disabled={rightIdx <= 0}
                        aria-label="Previous section"
                      >
                        <ChevLeftIcon />
                      </button>
                      <span className="cdp-right-nav-count">{rightIdx + 1} / {chapter.rightSections.length}</span>
                      <button
                        className="cdp-right-nav-btn"
                        onClick={() => setRightIdx(i => Math.min(chapter.rightSections.length - 1, i + 1))}
                        disabled={rightIdx >= chapter.rightSections.length - 1}
                        aria-label="Next section"
                      >
                        <ChevRightIcon />
                      </button>
                    </div>
                  )}

                  {chapter.rightSections.length > 0 && (
                    <div className="cr-right-section">
                      <h2 className="cr-section-heading">{chapter.rightSections[rightIdx].heading}</h2>
                      <p className="cr-body-text">{chapter.rightSections[rightIdx].body}</p>
                    </div>
                  )}

                  {chapter.callout && (
                    <div className="cr-callout" style={{ borderLeftColor: calloutStyle.border, background: calloutStyle.bg }}>
                      <div className="cr-callout-label" style={{ color: calloutStyle.border }}>
                        <calloutStyle.Icon />
                        {chapter.callout.type}
                      </div>
                      <p className="cr-callout-text">{chapter.callout.text}</p>
                    </div>
                  )}
                </>
              ) : !hasChapters ? (
                <div className="cdp-empty-chapters">
                  <NoteIcon />
                  <p className="cdp-empty-chapters-title">No chapters yet</p>
                  <p className="cdp-empty-chapters-sub">The instructor hasn&apos;t added any chapters to this course yet. Check back soon.</p>
                </div>
              ) : null}
            </div>

            <div className="cr-spine" />

            <div className="cr-page-right">
              {chapter && (
                <>
                  <div className="cr-left-body">
                    {chapter.leftBody.map((para, i) => (
                      <p key={i} className="cr-body-text">{para}</p>
                    ))}
                  </div>
                  {(chapter.pdfUrl || chapter.externalUrl) && (
                    <div className="cdp-chapter-resources">
                      {chapter.pdfUrl && (
                        <a className="cdp-resource-link" href={chapter.pdfUrl} target="_blank" rel="noreferrer"><DocumentIcon /> Download PDF</a>
                      )}
                      {chapter.externalUrl && (
                        <a className="cdp-resource-link" href={chapter.externalUrl} target="_blank" rel="noreferrer"><LinkIcon /> Open Link</a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Bar — nothing to navigate/complete in a chapter-less course ── */}
      {hasChapters && (
        <footer className="cr-footer">
          <button
            className="cr-nav-btn cr-nav-btn--prev"
            onClick={prevChapter}
            disabled={chapterIdx <= 0}
          >
            <ChevLeftIcon /> Previous Chapter
          </button>

          <div className="cr-progress-area">
            {!enrollmentPending && isEnrolled && (
              <div className="cr-progress-track">
                <div className="cr-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
            <span className="cr-page-label">Chapter {chapterIdx + 1} of {total}</span>
          </div>

          {!enrollmentPending && (isEnrolled ? (
            <button
              className="cr-nav-btn cr-nav-btn--next"
              onClick={completeAndAdvance}
            >
              {isLastChapter ? 'Complete Chapter' : 'Next Chapter'} <ChevRightIcon />
            </button>
          ) : (
            <button
              className="cr-nav-btn cr-nav-btn--next"
              onClick={handleEnroll}
            >
              Enroll to Continue <ChevRightIcon />
            </button>
          ))}
        </footer>
      )}

      {showCompletionModal && (
        <div className="cdp-complete-overlay" onClick={() => setShowCompletionModal(false)}>
          <div className="cdp-complete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cdp-complete-icon"><SparkIcon /></div>
            <h3>Course Completed!</h3>
            <p className="cdp-complete-sub">You've finished every chapter in <strong>{course.title}</strong>. Nice work.</p>
            <div className="cdp-complete-actions">
              <button className="cdp-complete-primary-btn" onClick={onBack}>Back to My Courses</button>
              <button className="cdp-complete-secondary-btn" onClick={() => setShowCompletionModal(false)}>Keep Reviewing</button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal course={course} checkoutStep={checkoutStep} onPurchase={handlePurchase} onClose={closeCheckout} />
      )}

      {reportOpen && (
        <div className="cdp-report-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReportModal(); }}>
          <div className="cdp-report-modal">
            <div className="cdp-report-modal-header">
              <h2 className="cdp-report-modal-title">Report Course</h2>
              <button className="cdp-report-close-btn" onClick={closeReportModal} aria-label="Close">✕</button>
            </div>
            {reportDone ? (
              <div className="cdp-report-success">
                <div className="cdp-report-success-icon">✓</div>
                <p>Thank you for your report. We&apos;ll review it and take action if it violates our community guidelines.</p>
                <button className="cdp-report-success-close" onClick={closeReportModal}>Done</button>
              </div>
            ) : (
              <>
                <div className="cdp-report-modal-body">
                  <h3 className="cdp-report-question">What&apos;s going on?</h3>
                  <p className="cdp-report-subtitle">Tell us why you&apos;re reporting this course, so we can look into it.</p>
                  <textarea
                    className="cdp-report-textarea"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    maxLength={500}
                    autoFocus
                  />
                  <p className="cdp-report-hint">{reportReason.length}/500</p>
                  {reportError && <p className="cdp-report-error">{reportError}</p>}
                </div>
                <div className="cdp-report-modal-footer">
                  <button className="cdp-report-submit-btn" onClick={submitReportCourse} disabled={!reportReason.trim() || reportSubmitting}>
                    {reportSubmitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
