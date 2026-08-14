import { useEffect, useState } from 'react';
import { totalChapterCount } from './educationData';

/*
 * Persists education progress (chapter completion, enrollment, saved
 * resources, view history) to a single localStorage key.
 *
 * Plain useState + localStorage is sufficient here (no Context, no
 * storage-event listener): CoursesPage / ExplorePage / LearningActivityPage /
 * CourseDetailPage are never mounted simultaneously — they're swapped in via
 * local `if (x) return <Y/>` state, and HomePage only renders one `section`
 * at a time — so two live instances of this hook never coexist. Multi-tab
 * sync is out of scope.
 */

const STORAGE_KEY = 'kick-education-progress-v1';

const DEFAULT_STATE = {
  completedChapters: {
    'advanced-ui-design-systems': ['ch-1'],
    'product-management-fundamentals': ['ch-1'],
  },
  lastViewedChapter: {
    'advanced-ui-design-systems': 'ch-2',
    'product-management-fundamentals': 'ch-2',
    'react-performance-patterns': 'ch-1',
  },
  enrolledCourseIds: ['advanced-ui-design-systems', 'product-management-fundamentals', 'react-performance-patterns'],
  savedResourceIds: [],
  wishlistCourseIds: [],
  history: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function useEducationProgress() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const enrolledCourseIds = new Set(state.enrolledCourseIds);
  const savedResourceIds = new Set(state.savedResourceIds);
  const wishlistCourseIds = new Set(state.wishlistCourseIds ?? []);

  function isChapterComplete(courseId, chapterId) {
    return (state.completedChapters[courseId] ?? []).includes(chapterId);
  }

  function getCourseProgressPct(courseId, course) {
    const total = totalChapterCount(course);
    if (!total) return 0;
    const done = (state.completedChapters[courseId] ?? []).length;
    return Math.round((done / total) * 100);
  }

  function isEnrolled(courseId) {
    return enrolledCourseIds.has(courseId);
  }

  function isSaved(resourceId) {
    return savedResourceIds.has(resourceId);
  }

  function markChapterComplete(courseId, chapterId) {
    setState(prev => {
      const existing = prev.completedChapters[courseId] ?? [];
      if (existing.includes(chapterId)) return prev;
      return { ...prev, completedChapters: { ...prev.completedChapters, [courseId]: [...existing, chapterId] } };
    });
  }

  function markChapterIncomplete(courseId, chapterId) {
    setState(prev => {
      const existing = prev.completedChapters[courseId] ?? [];
      return { ...prev, completedChapters: { ...prev.completedChapters, [courseId]: existing.filter(id => id !== chapterId) } };
    });
  }

  function setLastViewedChapter(courseId, chapterId) {
    setState(prev => ({ ...prev, lastViewedChapter: { ...prev.lastViewedChapter, [courseId]: chapterId } }));
  }

  function enrollCourse(courseId) {
    setState(prev => prev.enrolledCourseIds.includes(courseId)
      ? prev
      : { ...prev, enrolledCourseIds: [...prev.enrolledCourseIds, courseId] });
  }

  function unenrollCourse(courseId) {
    setState(prev => ({ ...prev, enrolledCourseIds: prev.enrolledCourseIds.filter(id => id !== courseId) }));
  }

  function isWishlisted(courseId) {
    return wishlistCourseIds.has(courseId);
  }

  function toggleWishlistCourse(courseId) {
    setState(prev => {
      const existing = prev.wishlistCourseIds ?? [];
      const has = existing.includes(courseId);
      return {
        ...prev,
        wishlistCourseIds: has ? existing.filter(id => id !== courseId) : [...existing, courseId],
      };
    });
  }

  function toggleSaveResource(resourceId) {
    setState(prev => {
      const has = prev.savedResourceIds.includes(resourceId);
      return {
        ...prev,
        savedResourceIds: has
          ? prev.savedResourceIds.filter(id => id !== resourceId)
          : [...prev.savedResourceIds, resourceId],
      };
    });
  }

  function pushHistory(entry) {
    setState(prev => {
      const key = entry.type === 'course' ? `course:${entry.courseId}` : `resource:${entry.resourceId}`;
      const deduped = prev.history.filter(h => {
        const hKey = h.type === 'course' ? `course:${h.courseId}` : `resource:${h.resourceId}`;
        return hKey !== key;
      });
      return { ...prev, history: [{ ...entry, viewedAt: new Date().toISOString() }, ...deduped].slice(0, 30) };
    });
  }

  function clearHistory() {
    setState(prev => ({ ...prev, history: [] }));
  }

  function logCourseView(courseId, chapterId, course) {
    if (!course) return;
    pushHistory({ type: 'course', courseId, chapterId, title: course.title, img: course.img });
  }

  function logResourceView(resourceId, resource) {
    if (!resource) return;
    pushHistory({ type: 'resource', resourceId, title: resource.title, img: resource.img });
  }

  return {
    completedChapters: state.completedChapters,
    lastViewedChapter: state.lastViewedChapter,
    enrolledCourseIds,
    savedResourceIds,
    wishlistCourseIds,
    history: state.history,

    isChapterComplete,
    getCourseProgressPct,
    isEnrolled,
    isSaved,
    isWishlisted,

    markChapterComplete,
    markChapterIncomplete,
    setLastViewedChapter,
    enrollCourse,
    unenrollCourse,
    toggleSaveResource,
    toggleWishlistCourse,
    logCourseView,
    logResourceView,
    clearHistory,
  };
}
