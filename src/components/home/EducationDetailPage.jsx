import { useState } from 'react';
import { categoryLabel, categoryColor } from './educationData';
import CourseReaderPage from './CourseReaderPage';
import EducationQuizPage from './EducationQuizPage';
import EducationBackButton from './EducationBackButton';
import './EducationDetailPage.css';

const ACCESS_STATES = ['Free', 'Paid', 'Gold member', 'Locked', 'Educator subscription', 'Prerequisite'];

function getCurriculum(item) {
  if (item.curriculum?.length) return item.curriculum;
  if (item.modules?.length) return item.modules.map((module, moduleIndex) => ({
    id: module.id || `module-${moduleIndex}`,
    title: module.title,
    lessons: [...(module.chapters || []).map((chapter, chapterIndex) => ({
      id: chapter.id || `${module.id}-${chapterIndex}`,
      title: chapter.title,
      type: chapter.videoUrl ? 'Video lesson' : 'Reading',
      duration: chapter.duration || '10 min',
      content: chapter.leftBody?.join('\n\n') || `Study the key ideas in ${chapter.title} and apply them to your learning.`,
    })), { id: `${module.id}-quiz`, title: `${module.title} Quiz`, type: 'Quiz', duration: '5 questions', content: `Review the key ideas from ${module.title}.` }],
  }));
  return [{ id: 'module-1', title: 'Module 1 — Getting Started', lessons: [
    { id: 'lesson-1', title: 'Lesson 1 — Introduction', type: 'Video lesson', duration: '8 min', completed: true, content: `Welcome to ${item.title}. This lesson introduces the course and how to get the most from it.` },
    { id: 'lesson-2', title: 'Lesson 2 — Core Concepts', type: 'Reading', duration: '12 min', content: `Learn the core concepts behind ${item.title}.` },
    { id: 'quiz-1', title: 'Module 1 Quiz', type: 'Quiz', duration: '5 questions', content: 'Check what you have learned in this module.' },
  ] }, { id: 'module-2', title: 'Module 2 — Putting It Into Practice', lessons: [
    { id: 'lesson-3', title: 'Lesson 1 — Practical Application', type: 'Demonstration', duration: '15 min', content: 'Apply the course concepts with a guided practical example.' },
    { id: 'assessment-1', title: 'Module 2 Assessment', type: 'Assessment', duration: '10 min', content: 'Complete the assessment to finish this module.' },
  ] }];
}

export default function EducationDetailPage({ item, isJoined, isSaved, onToggleSaved, onOpenEducator, onBack, onStart, onAccessGranted }) {
  const curriculum = getCurriculum(item);
  const [openModule, setOpenModule] = useState(curriculum[0]?.id);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(() => new Set(curriculum.flatMap(module => module.lessons.filter(lesson => lesson.completed).map(lesson => lesson.id))));
  const defaultAccess = item.accessType || (item.isFree ? 'free' : item.tier === 'Gold' ? 'gold' : item.tier === 'Platinum' ? 'locked' : 'paid');
  const [accessState, setAccessState] = useState(defaultAccess);
  const [message, setMessage] = useState('');
  const [purchased, setPurchased] = useState(false);
  const type = accessState.toLowerCase();
  const price = item.price?.startsWith('$') ? item.price : '$49';
  const totalLessons = curriculum.reduce((total, module) => total + module.lessons.length, 0);
  const completionPercent = totalLessons ? Math.round(completedLessons.size / totalLessons * 100) : 0;
  const initialCompletedCount = curriculum.flatMap(module => module.lessons).filter(lesson => lesson.completed).length;
  const readerProgress = Math.min(100, Math.round((item.progress || 0) + Math.max(0, completedLessons.size - initialCompletedCount) * (100 / Math.max(totalLessons, 1))));
  const isLessonLocked = lesson => lesson.locked && !(lesson.id === 'advanced-safety' && completedLessons.has('foundations-quiz'));
  const flatLessons = curriculum.flatMap(module => module.lessons.map((lesson, index) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title, moduleLessonNumber: index + 1 })));
  const activeLessonIndex = activeLesson ? flatLessons.findIndex(lesson => lesson.id === activeLesson.id) : -1;
  const previousLesson = activeLessonIndex > 0 ? flatLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 ? flatLessons.slice(activeLessonIndex + 1).find(lesson => !isLessonLocked(lesson)) : null;
  const previousAvailable = previousLesson && !isLessonLocked(previousLesson);
  const completeLesson = lesson => setCompletedLessons(prev => new Set(prev).add(lesson.id));
  const access = {
    free: { title: 'Free education', description: 'This education is open to everyone.', action: 'Start Learning', actionType: 'start' },
    paid: { title: price, description: 'Purchase this education to unlock all lessons and resources.', action: 'Purchase', actionType: 'purchase' },
    gold: { title: 'Included with Gold', description: 'Your Gold membership includes this education.', action: 'Start Learning', actionType: 'start' },
    locked: { title: `Available with ${item.requiredMembership || item.tier || 'Gold'} membership`, description: 'Upgrade your membership to unlock this education.', action: `Upgrade to ${item.requiredMembership || item.tier || 'Gold'}`, actionType: 'upgrade' },
    subscription: { title: `Included with ${item.instructor || 'the educator'}'s subscription`, description: `Subscribe to ${item.subscriptionName || `${item.instructor}'s education`} to access this content.`, action: 'Subscribe', actionType: 'subscribe' },
    prerequisite: { title: 'Prerequisite required', description: `Complete ${item.prerequisite || 'the introductory course'} before starting this education.`, action: 'View prerequisite', actionType: 'prerequisite' },
  }[type] || { title: item.isFree ? 'Free education' : price, description: 'Access this education and continue learning.', action: 'Start Learning', actionType: 'start' };
  const activate = () => {
    if (access.actionType === 'start') onStart?.();
    else if (access.actionType === 'purchase') { setPurchased(true); onAccessGranted?.(); setMessage(`${price} demo purchase complete. Education added to My Learning.`); }
    else if (access.actionType === 'subscribe') { setPurchased(true); onAccessGranted?.(); setMessage(`Subscription demo activated. ${item.title} is now available.`); }
    else if (access.actionType === 'upgrade') setMessage(`Demo upgrade selected. ${item.title} will be available with ${item.requiredMembership || 'Gold'}.`);
    else setMessage(`Complete ${item.prerequisite || 'the introductory course'} to unlock this education.`);
  };
  return <main className="ed-page">
    <EducationBackButton onClick={onBack} label="Back to education" />
    <section className="ed-hero"><div className="ed-cover"><img src={item.img} alt=""/><span className="ed-format">{item.type || 'Course'}</span><span className="ed-source">{item.source || 'KC Education'}</span></div><div className="ed-hero-info"><span className="ed-eyebrow">{item.source || 'KC Education'} EDUCATION</span><h1>{item.title}</h1><p className="ed-summary">{item.desc || `Build new skills with ${item.instructor} through guided lessons and practical activities.`}</p><button className="ed-instructor" onClick={onOpenEducator}><span className="ed-avatar">{(item.instructor || 'E').split(' ').map(part => part[0]).slice(0, 2).join('')}</span><span><small>Instructor · View educator profile</small><b>{item.instructor || 'KC Educator'}</b></span></button><div className="ed-highlights"><span><b>★ {item.rating || '4.8'}</b><small>Rating</small></span><span><b>{item.level || 'Beginner'}</b><small>Level</small></span><span><b>{item.points || 120} Points</b><small>Completion reward</small></span></div><div className="ed-badges"><span style={{ color: categoryColor(item.category) }}>{categoryLabel(item.category)}</span><span>{item.isFree ? 'Free' : item.tier || item.price || 'Paid'}</span><span>{item.duration || 'Self paced'}</span></div></div></section>
    <div className="ed-main-grid"><div className="ed-content"><section className="ed-panel"><h2>About this education</h2><p>{item.desc || `Explore ${item.title} with ${item.instructor}. This learning experience combines clear instruction with useful ideas you can put into practice.`}</p></section><section className="ed-panel"><h2>What you'll learn</h2><ul>{(item.whatYouLearn || [`Build a confident foundation in ${item.title}`, 'Apply practical techniques through guided examples', 'Identify next steps for continued learning']).map(point => <li key={point}>{point}</li>)}</ul></section><section className="ed-panel"><h2>Who this is for</h2><p>{item.whoFor || `Learners interested in ${categoryLabel(item.category).toLowerCase()} at a ${item.level || 'beginner'} level.`}</p></section><section className="ed-panel ed-details"><h2>Education details</h2><dl><div><dt>Duration</dt><dd>{item.duration || 'Self paced'}</dd></div><div><dt>Level</dt><dd>{item.level || 'All levels'}</dd></div><div><dt>Category</dt><dd>{categoryLabel(item.category)}</dd></div><div><dt>Format</dt><dd>{item.format || item.type || 'Online course'}</dd></div></dl><div className="ed-tags">{(item.tags || [categoryLabel(item.category), item.level || 'Learning', item.source || 'KC']).map(tag => <span key={tag}>{tag}</span>)}</div></section>
      <section className="ed-panel ed-curriculum"><div className="ed-curriculum-heading"><div><h2>Course Content</h2><p>{curriculum.length} modules · {totalLessons} lessons · {completionPercent}% complete</p></div><span>{completionPercent}%</span></div><div className="ed-curriculum-progress"><i style={{ width: `${completionPercent}%` }} /></div>{curriculum.map((module, index) => <section className="ed-module" key={module.id}><button className="ed-module-toggle" onClick={() => setOpenModule(openModule === module.id ? null : module.id)} aria-expanded={openModule === module.id}><span><b>Module {index + 1}</b><strong>{module.title.replace(/^Module\s*\d+\s*[—–-]\s*/, '')}</strong><small>{module.lessons.length} lessons</small></span><i>{openModule === module.id ? '−' : '+'}</i></button>{openModule === module.id && <div className="ed-lessons">{module.lessons.map(lesson => { const locked = isLessonLocked(lesson); const done = completedLessons.has(lesson.id); const indicator = lesson.type === 'Quiz' || lesson.type === 'Assessment'; return <button key={lesson.id} className={`ed-lesson${locked ? ' is-locked' : ''}${done ? ' is-complete' : ''}${activeLesson?.id === lesson.id ? ' is-selected' : ''}`} disabled={locked} onClick={() => setActiveLesson(lesson)}><span className="ed-lesson-state">{locked ? '🔒' : done ? '✓' : indicator ? '◇' : '▶'}</span><span className="ed-lesson-info"><b>{lesson.title}</b><small>{lesson.type}{indicator ? ' · Exercise' : ''} · {lesson.duration}</small></span><span className="ed-lesson-status">{locked ? 'Locked' : done ? 'Complete' : indicator ? lesson.type : 'Lesson'}</span></button>;})}</div>}</section>)}</section>
      {activeLesson && (activeLesson.type?.toLowerCase().includes('quiz') || activeLesson.type?.toLowerCase().includes('assessment') ? <EducationQuizPage course={item} lesson={activeLesson} onBack={() => setActiveLesson(null)} onComplete={() => { completeLesson(activeLesson); setActiveLesson(null); }} /> : <CourseReaderPage course={{ title: item.title }} lesson={activeLesson} moduleTitle={activeLesson.moduleTitle} lessonPosition={activeLesson.moduleLessonNumber} lessonCount={curriculum.find(module => module.id === activeLesson.moduleId)?.lessons.length || flatLessons.length} progress={readerProgress} completed={completedLessons.has(activeLesson.id)} onBack={() => setActiveLesson(null)} onComplete={() => completeLesson(activeLesson)} hasPrevious={!!previousAvailable} onPrevious={() => { if (previousAvailable) { setOpenModule(previousAvailable.moduleId); setActiveLesson(previousAvailable); } }} hasNext={!!nextLesson} onNext={() => { if (nextLesson) { setOpenModule(nextLesson.moduleId); setActiveLesson(nextLesson); } }} />)}
      </div>
      <aside className="ed-access"><span className="ed-eyebrow">ACCESS</span><h2>{access.title}</h2><p>{access.description}</p>{(isJoined || purchased) && <p className="ed-enrolled">✓ Added to My Learning</p>}<button className="ed-action" onClick={activate}>{(isJoined || purchased) && access.actionType === 'start' ? 'Continue Learning' : access.action}</button><button className="ed-save-toggle" onClick={onToggleSaved}>{isSaved ? '♥ Saved · Remove bookmark' : '♡ Save education'}</button>{item.prerequisite && <p className="ed-prerequisite">Prerequisite: {item.prerequisite}</p>}<div className="ed-state-preview"><label htmlFor="ed-access-state">Demo access state</label><select id="ed-access-state" value={({ free: 'Free', paid: 'Paid', gold: 'Gold member', locked: 'Locked', subscription: 'Educator subscription', prerequisite: 'Prerequisite' })[type] || 'Paid'} onChange={event => setAccessState(({ Free: 'free', Paid: 'paid', 'Gold member': 'gold', Locked: 'locked', 'Educator subscription': 'subscription', Prerequisite: 'prerequisite' })[event.target.value])}>{ACCESS_STATES.map(state => <option key={state}>{state}</option>)}</select></div>{message && <p className="ed-access-message" role="status">{message}</p>}<div className="ed-access-note">Access is shown for this education item. KC membership and educator subscriptions can have different rules.</div></aside>
    </div>
  </main>;
}
