import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AnimatedNav from './AnimatedNav';
import CourseDetailPage from './CourseDetailPage';
import ManageChaptersPage from './ManageChaptersPage';
import { ALEX_AVATAR } from './mockData';
import { courseApi } from '../../services/courseApi';
import useEducationProgress from './useEducationProgress';
import './LearningActivityPage.css';

const HEART_BURST_PATHS = [
  { dx: -36, dy: -52, rot: -30 },
  { dx: -16, dy: -62, rot:  15 },
  { dx:   6, dy: -66, rot: -10 },
  { dx:  28, dy: -52, rot:  25 },
  { dx:  40, dy: -32, rot: -20 },
  { dx: -44, dy: -28, rot:  30 },
  { dx:  -8, dy: -58, rot: -18 },
];

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function PlayIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}

function BookIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

function CheckCircleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function PersonIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function StarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function HeartIcon({ filled }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

// Only renders once the backend has a real average — no more showing a
// fake/static star value for courses nobody has rated. ratingCount is shown
// alongside it when the endpoint provides one, but isn't required to render.
function RatingBadge({ course }) {
  if (!course.rating) return null;
  return (
    <span className="lap-rating">
      <StarIcon /> {Number(course.rating).toFixed(1)}
      {!!course.ratingCount && <span className="lap-rating-count"> ({course.ratingCount})</span>}
    </span>
  );
}

export default function LearningActivityPage({ onBack, onMessagesClick, onEventsClick, onGroupsClick, onCalendarClick, onLibraryClick, onMinisitesClick, onNavigateEducation, initialTab, onInitialTabConsumed }) {
  const { profile } = useSelector(s => s.profile);
  const authToken = useSelector(s => s.auth?.token);
  const userId = useSelector(s => s.auth?.user?._id ?? s.auth?.user?.id);
  const avatarUrl = profile?.avatar ?? ALEX_AVATAR;

  const [activeCourseId, setActiveCourseId] = useState(null);
  // "View Details" opens the course-info summary first instead of jumping
  // straight into the chapter reader; every other entry point (thumbnail,
  // title, Resume/Continue) still opens directly into the reader as before.
  const [courseViewMode, setCourseViewMode] = useState('reader');
  const openCourseDetails = (courseId) => {
    setCourseViewMode('info');
    setActiveCourseId(courseId);
  };
  const openCourseReader = (courseId) => {
    setCourseViewMode('reader');
    setActiveCourseId(courseId);
  };
  const [managingCourse, setManagingCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  // Opens on "created" when arriving fresh from creating a course, otherwise
  // the usual default — a one-shot initial value, reported back as consumed
  // immediately so returning to this page later doesn't keep forcing it.
  const [activeTab, setActiveTab] = useState(() => initialTab || 'all');
  useEffect(() => {
    if (initialTab) onInitialTabConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [filterType, setFilterType] = useState('all');

  // Wishlist is purely client-side (no backend endpoint for it) — persisted
  // the same way enrollment/progress already are, via useEducationProgress.
  const wishlist = useEducationProgress();
  const [heartingIds, setHeartingIds] = useState(new Set());
  const [heartParticles, setHeartParticles] = useState({});

  function toggleWishlist(id) {
    const adding = !wishlist.isWishlisted(id);
    wishlist.toggleWishlistCourse(id);
    if (adding) {
      setHeartingIds(h => new Set(h).add(id));
      setHeartParticles(prev => ({ ...prev, [id]: HEART_BURST_PATHS.map((bp, i) => ({ id: Date.now() + i, ...bp })) }));
      setTimeout(() => {
        setHeartingIds(h => { const nh = new Set(h); nh.delete(id); return nh; });
        setHeartParticles(prev => { const next = { ...prev }; delete next[id]; return next; });
      }, 700);
    }
  }

  // API Data
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [exploreCourses, setExploreCourses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ coursesEnrolled: 0, completed: 0, hoursSpent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('idle'); // idle | processing | success | error

  // Fetch data on component mount
  useEffect(() => {
    if (!authToken || !userId) return;
    fetchData();
  }, [authToken, userId, activeTab, filterType, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsRes = await courseApi.getDashboardStats(userId, authToken);
      if (statsRes.success) {
        setDashboardStats(statsRes);
      }

      // Fetch enrolled courses
      const enrolledRes = await courseApi.getUserEnrolledCourses(userId, authToken);
      if (enrolledRes.success) {
        setEnrolledCourses(enrolledRes.courses || []);
      }

      // Fetch created courses
      const createdRes = await courseApi.getUserCreatedCourses(userId, authToken);
      if (createdRes.success) {
        setCreatedCourses(createdRes.courses || []);
      }

      // Fetch explore courses with filters
      // "Favorites" is a purely client-side wishlist, not a backend filter —
      // fetch the normal "all" list and filter it down to wishlisted ids below.
      const exploreRes = await courseApi.getAllCourses(filterType === 'favorites' ? 'all' : filterType, selectedCategory, authToken);
      if (exploreRes.success) {
        setExploreCourses(exploreRes.courses || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err?.message || err?.error || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Only the course's author (this list is always "my" created courses) can publish/unpublish.
  const handleTogglePublish = async (course) => {
    if (!authToken || publishingId) return;
    const isPublished = course.status === 'published';
    try {
      setPublishingId(course.id);
      setError(null);

      const res = isPublished
        ? await courseApi.unpublishCourse(course.id, authToken)
        : await courseApi.publishCourse(course.id, authToken);
      if (res.success) {
        const nextStatus = res.course?.status ?? (isPublished ? 'draft' : 'published');
        setCreatedCourses(prev => prev.map(c => (c.id === course.id ? { ...c, status: nextStatus } : c)));
      }
    } catch (err) {
      console.error('Error toggling publish state:', err);
      setError(err?.message || err?.error || 'Failed to update course status');
    } finally {
      setPublishingId(null);
    }
  };

  const myCreatedCourseIds = new Set(createdCourses.map(c => c.id));
  const otherAuthorsCourses = exploreCourses.filter(course => !myCreatedCourseIds.has(course.id));
  const visibleCourses = filterType === 'favorites'
    ? otherAuthorsCourses.filter(course => wishlist.isWishlisted(course.id))
    : otherAuthorsCourses;
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  const isPaidCourse = (course) => course.pricingType === 'paid' || Number(course.price) > 0;

  // Registers the enrollment against the real backend. Used for both the
  // free path (called directly) and the paid path (called after the mock
  // payment "succeeds"), since the enroll endpoint itself is payment-agnostic.
  const performEnroll = async (course) => {
    setEnrollingId(course.id);
    try {
      const res = await courseApi.enrollCourse(course.id, authToken);
      if (res.success !== false) {
        setEnrolledCourses(prev => (prev.some(c => c.id === course.id) ? prev : [...prev, course]));
      }
      return true;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err?.message || err?.error || 'Failed to enroll in course');
      return false;
    } finally {
      setEnrollingId(null);
    }
  };

  const handleEnrollClick = (course) => {
    if (!authToken || enrolledCourseIds.has(course.id) || enrollingId) return;
    if (isPaidCourse(course)) {
      setCheckoutCourse(course);
      setCheckoutStep('idle');
    } else {
      performEnroll(course);
    }
  };

  // No real payment gateway yet — this hits the mock /purchase endpoint,
  // which validates + records a transaction and enrolls in one step.
  const handlePurchase = async () => {
    if (!checkoutCourse) return;
    setCheckoutStep('processing');
    try {
      const res = await courseApi.purchaseCourse(checkoutCourse.id, authToken);
      if (res.success) {
        setEnrolledCourses(prev => (prev.some(c => c.id === checkoutCourse.id) ? prev : [...prev, checkoutCourse]));
        setCheckoutStep('success');
      } else {
        setCheckoutStep('error');
      }
    } catch (err) {
      console.error('Error purchasing course:', err);
      setCheckoutStep('error');
    }
  };

  const closeCheckout = () => {
    setCheckoutCourse(null);
    setCheckoutStep('idle');
  };

  if (managingCourse) {
    return (
      <ManageChaptersPage
        course={managingCourse}
        authToken={authToken}
        onBack={() => setManagingCourse(null)}
        onCourseUpdated={(updated) => setCreatedCourses(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)))}
      />
    );
  }

  if (activeCourseId) {
    return (
      <CourseDetailPage
        key={`${activeCourseId}-${courseViewMode}`}
        courseId={activeCourseId}
        initialMode={courseViewMode}
        authToken={authToken}
        onBack={() => setActiveCourseId(null)}
      />
    );
  }

  const handleNav = (id) => {
    if (id === 'home') onBack?.();
    if (id === 'library') onLibraryClick?.();
    if (id === 'messages') onMessagesClick?.();
    if (id === 'events') onEventsClick?.();
    if (id === 'friends') onGroupsClick?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  };

  const ongoingCourses = enrolledCourses.slice(0, 3);
  const categories = ['All Topics', 'Design', 'Development', 'Business', 'Technology', 'Marketing', 'Finance', 'Soft Skills'];

  return (
    <div className="lap-page">
      <AnimatedNav activeId="courses" avatarUrl={avatarUrl} onNavigate={handleNav} />

      <div className="lap-main">
        {/* Tab Navigation */}
        <div className="lap-tabs">
          <button
            className={`lap-tab ${activeTab === 'all' ? 'lap-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`lap-tab ${activeTab === 'ongoing' ? 'lap-tab--active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing Courses
          </button>
          <button
            className={`lap-tab ${activeTab === 'created' ? 'lap-tab--active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            My Created
          </button>
        </div>

        {/* Header with Stats */}
        <div className="lap-header-section">
          <div className="lap-stats-container">
            <div className="lap-stat">
              <div className="lap-stat-icon"><BookIcon /></div>
              <div className="lap-stat-info">
                <p className="lap-stat-label">COURSES ENROLLED</p>
                <p className="lap-stat-value">{dashboardStats.coursesEnrolled || 0}</p>
              </div>
            </div>
            <div className="lap-stat">
              <div className="lap-stat-icon"><CheckCircleIcon /></div>
              <div className="lap-stat-info">
                <p className="lap-stat-label">COMPLETED</p>
                <p className="lap-stat-value">{dashboardStats.completed || 0}</p>
              </div>
            </div>
            <div className="lap-stat">
              <div className="lap-stat-icon"><ClockIcon /></div>
              <div className="lap-stat-info">
                <p className="lap-stat-label">HOURS SPENT</p>
                <p className="lap-stat-value">{dashboardStats.hoursSpent || '0h'}</p>
              </div>
            </div>
          </div>
          <button className="lap-create-course-btn" onClick={() => onNavigateEducation?.('create')}>
            <PlusIcon /> Create Course
          </button>
        </div>

        {/* Ongoing Courses - Show only in Ongoing tab */}
        {activeTab === 'ongoing' && (
          <div className="lap-section">
            <div className="lap-section-header">
              <h2>Ongoing Courses</h2>
              <a href="#" className="lap-see-all">See All</a>
            </div>
            {ongoingCourses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8b95a5' }}>No ongoing courses</p>
            ) : (
              <div className="lap-courses-grid">
                {ongoingCourses.map((course) => (
                  <div key={course.id} className="lap-course-card">
                    <div className="lap-course-img-wrapper">
                      <img src={course.img} alt={course.title} className="lap-course-img" />
                      <span className="lap-ongoing-badge">ONGOING</span>
                    </div>
                    <div className="lap-course-content">
                      <h3 className="lap-course-title">{course.title}</h3>
                      <div className="lap-card-meta">
                        <p className="lap-course-price">{course.price || 'Free'}</p>
                        <RatingBadge course={course} />
                      </div>
                      <div className="lap-progress-section">
                        <span className="lap-progress-label">Progress</span>
                        <span className="lap-progress-pct">{course.progress || 0}%</span>
                      </div>
                      <div className="lap-progress-bar">
                        <div className="lap-progress-fill" style={{ width: `${course.progress || 0}%` }} />
                      </div>
                      <button className="lap-resume-btn" onClick={() => openCourseReader(course.id)}>
                        <PlayIcon /> Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Explore Categories - Show only in All tab */}
        {activeTab === 'all' && (
        <div className="lap-section">
          <div className="lap-section-header">
            <h2>Explore Categories</h2>
          </div>
          <div className="lap-filter-buttons">
            <button
              className={`lap-filter-btn ${filterType === 'all' ? 'lap-filter-btn--active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Courses
            </button>
            <button
              className={`lap-filter-btn ${filterType === 'recommended' ? 'lap-filter-btn--active' : ''}`}
              onClick={() => setFilterType('recommended')}
            >
              Recommended
            </button>
            <button
              className={`lap-filter-btn ${filterType === 'popular' ? 'lap-filter-btn--active' : ''}`}
              onClick={() => setFilterType('popular')}
            >
              Popular
            </button>
            <button
              className={`lap-filter-btn ${filterType === 'favorites' ? 'lap-filter-btn--active' : ''}`}
              onClick={() => setFilterType('favorites')}
            >
              <HeartIcon filled={filterType === 'favorites'} /> Favorites
              {wishlist.wishlistCourseIds.size > 0 && <span className="lap-fav-count">{wishlist.wishlistCourseIds.size}</span>}
            </button>
          </div>
          {filterType === 'all' && (
            <div className="lap-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`lap-category-btn ${selectedCategory === cat ? 'lap-category-btn--active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="lap-courses-grid">
            {loading ? (
              <div className="lap-loading" style={{ gridColumn: '1 / -1' }}>
                <div className="lap-loading-spinner" />
                <p>Loading courses...</p>
              </div>
            ) : error ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ef4444' }}>{error}</p>
            ) : visibleCourses.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8b95a5' }}>
                {filterType === 'favorites' ? 'No favorites yet — tap the heart on a course to save it here.' : 'No courses found'}
              </p>
            ) : (
              visibleCourses.map(course => {
                const enrolled = enrolledCourseIds.has(course.id);
                const busy = enrollingId === course.id;
                const paid = isPaidCourse(course);
                const wishlisted = wishlist.isWishlisted(course.id);
                return (
                  <div key={course.id} className="lap-explore-card">
                    <div className="lap-card-img-wrapper" onClick={() => (enrolled ? openCourseReader(course.id) : openCourseDetails(course.id))} style={{ cursor: 'pointer' }}>
                      <img src={course.img} alt={course.title} className="lap-card-img" />
                      <div className="lap-heart-burst-wrap">
                        <button
                          type="button"
                          className={`lap-heart-btn${wishlisted ? ' lap-heart-btn--active' : ''}${heartingIds.has(course.id) ? ' lap-heart-btn--spring' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(course.id); }}
                          aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <HeartIcon filled={wishlisted} />
                        </button>
                        {(heartParticles[course.id] || []).map(p => (
                          <span key={p.id} className="lap-heart-particle" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}>❤️</span>
                        ))}
                      </div>
                    </div>
                    <div className="lap-card-content">
                      <h3 className="lap-card-title" onClick={() => (enrolled ? openCourseReader(course.id) : openCourseDetails(course.id))} style={{ cursor: 'pointer' }}>{course.title}</h3>
                      <div className="lap-card-meta">
                        <span className="lap-instructor"><PersonIcon /> {course.instructor}</span>
                        <RatingBadge course={course} />
                      </div>
                      {enrolled ? (
                        <button className="lap-enroll-btn lap-enroll-btn--enrolled" onClick={() => openCourseReader(course.id)}>
                          Continue Learning
                        </button>
                      ) : (
                        <div className="lap-card-actions">
                          <button className="lap-details-btn" onClick={() => openCourseDetails(course.id)}>
                            View Details
                          </button>
                          <button
                            className="lap-enroll-btn"
                            disabled={busy}
                            onClick={() => handleEnrollClick(course)}
                          >
                            {busy ? 'Enrolling...' : paid ? `Buy · $${course.price}` : 'Enroll · Free'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* My Created Courses - Show only in Created tab */}
        {activeTab === 'created' && (
        <div className="lap-section">
          <div className="lap-section-header">
            <h2>My Courses</h2>
            <button className="lap-create-new-btn" onClick={() => onNavigateEducation?.('create')}>
              + Create New
            </button>
          </div>
          {error && <p className="lap-publish-error">{error}</p>}
          {createdCourses.length === 0 ? (
            <div className="lap-empty-state">
              <p className="lap-empty-icon"><BookIcon /></p>
              <p className="lap-empty-text">You haven't created any courses yet</p>
              <button className="lap-create-course-link" onClick={() => onNavigateEducation?.('create')}>
                Create your first course
              </button>
            </div>
          ) : (
            <div className="lap-courses-grid">
              {createdCourses.map(course => {
                const isPublished = course.status === 'published';
                const isBusy = publishingId === course.id;
                return (
                  <div key={course.id} className="lap-my-course-card">
                    <div className="lap-card-img-wrapper">
                      <img src={course.img} alt={course.title} className="lap-card-img" />
                      <span className={`lap-status-badge ${isPublished ? 'lap-status-badge--published' : 'lap-status-badge--draft'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="lap-card-content">
                      <h3 className="lap-card-title">{course.title}</h3>
                      <div className="lap-card-meta">
                        <span className="lap-instructor"><PersonIcon /> You</span>
                        <RatingBadge course={course} />
                      </div>
                      <div className="lap-course-stats">
                        <span className="lap-students">{course.students} {course.students === 1 ? 'student' : 'students'}</span>
                        <span className="lap-price">{course.price}</span>
                      </div>
                      <div className="lap-course-actions">
                        <button className="lap-edit-btn" onClick={() => setManagingCourse(course)}>Add Chapter</button>
                        <button
                          className={`lap-publish-btn ${isPublished ? 'lap-publish-btn--unpublish' : 'lap-publish-btn--publish'}`}
                          disabled={isBusy}
                          onClick={() => handleTogglePublish(course)}
                        >
                          {isBusy ? '...' : isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

      </div>

      {checkoutCourse && (
        <div className="lap-checkout-overlay" onClick={() => checkoutStep !== 'processing' && closeCheckout()}>
          <div className="lap-checkout-modal" onClick={(e) => e.stopPropagation()}>
            {checkoutStep === 'success' ? (
              <>
                <div className="lap-checkout-success-icon"><CheckIcon /></div>
                <h3>Payment Successful</h3>
                <p className="lap-checkout-sub">You're enrolled in <strong>{checkoutCourse.title}</strong>.</p>
                <div className="lap-checkout-actions">
                  <button className="lap-checkout-primary-btn" onClick={() => { openCourseReader(checkoutCourse.id); closeCheckout(); }}>
                    Start Course
                  </button>
                  <button className="lap-checkout-secondary-btn" onClick={closeCheckout}>Close</button>
                </div>
              </>
            ) : (
              <>
                <h3>Checkout</h3>
                <p className="lap-checkout-sub">{checkoutCourse.title}</p>
                <div className="lap-checkout-price-row">
                  <span>Total</span>
                  <span className="lap-checkout-price">${checkoutCourse.price}</span>
                </div>
                {checkoutStep === 'error' && (
                  <p className="lap-checkout-error">Payment failed. Please try again.</p>
                )}
                <div className="lap-checkout-actions">
                  <button
                    className="lap-checkout-primary-btn"
                    disabled={checkoutStep === 'processing'}
                    onClick={handlePurchase}
                  >
                    {checkoutStep === 'processing' ? 'Processing…' : `Pay $${checkoutCourse.price}`}
                  </button>
                  <button className="lap-checkout-secondary-btn" disabled={checkoutStep === 'processing'} onClick={closeCheckout}>
                    Cancel
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
