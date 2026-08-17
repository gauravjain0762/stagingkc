import { useState } from 'react';
import AnimatedNav from './AnimatedNav';
import LearningActivityPage from './LearningActivityPage';
import CreateCoursePage from './CreateCoursePage';
import QuizzesPage from './QuizzesPage';
import AssignmentsPage from './AssignmentsPage';
import ProgressAnalyticsPage from './ProgressAnalyticsPage';
import CertificatesPage from './CertificatesPage';
import DiscussionPage from './DiscussionPage';
import { ALEX_AVATAR } from './mockData';
import './EducationHubPage.css';

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function BookOpenIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

function QuizIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

function ChecklistIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M20 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>;
}

function TrendIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="2v20"/><polyline points="19 7 12 14 5 7"/></svg>;
}

function AwardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8 14 3 14 5 20 19 20 21 14 16 14"/></svg>;
}

function ChatIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

export default function EducationHubPage({ onBack, onMessagesClick, onEventsClick, onGroupsClick, onCalendarClick, onLibraryClick, onMinisitesClick }) {
  const avatarUrl = ALEX_AVATAR;
  const [currentView, setCurrentView] = useState('dashboard');
  // Set when returning from "Create Course" so the dashboard opens on "My
  // Created" instead of always defaulting back to "All" — consumed once by
  // LearningActivityPage the same way other one-shot initial values in this
  // app are (see onInitEventConsumed / onInitUserConsumed in HomePage.jsx).
  const [pendingTab, setPendingTab] = useState(null);

  const handleNav = (id) => {
    if (id === 'home') onBack?.();
    if (id === 'library') onLibraryClick?.();
    if (id === 'messages') onMessagesClick?.();
    if (id === 'events') onEventsClick?.();
    if (id === 'friends') onGroupsClick?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpenIcon },
    { id: 'create', label: 'Create Course', icon: PlusIcon },
    { id: 'quizzes', label: 'Quizzes', icon: QuizIcon },
    { id: 'assignments', label: 'Assignments', icon: ChecklistIcon },
    { id: 'progress', label: 'Progress', icon: TrendIcon },
    { id: 'certificates', label: 'Certificates', icon: AwardIcon },
    { id: 'discussion', label: 'Discussions', icon: ChatIcon },
  ];

  // Handle view changes
  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
  };

  // Render the appropriate page
  const renderPage = () => {
    switch(currentView) {
      case 'create':
        return (
          <CreateCoursePage
            onBack={(nextTab) => { setCurrentView('dashboard'); if (nextTab) setPendingTab(nextTab); }}
            onMessagesClick={onMessagesClick}
            onEventsClick={onEventsClick}
            onGroupsClick={onGroupsClick}
            onCalendarClick={onCalendarClick}
            onLibraryClick={onLibraryClick}
            onMinisitesClick={onMinisitesClick}
          />
        );
      case 'quizzes':
        return <QuizzesPage onBack={() => setCurrentView('dashboard')} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} />;
      case 'assignments':
        return <AssignmentsPage onBack={() => setCurrentView('dashboard')} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} />;
      case 'progress':
        return <ProgressAnalyticsPage onBack={() => setCurrentView('dashboard')} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} />;
      case 'certificates':
        return <CertificatesPage onBack={() => setCurrentView('dashboard')} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} />;
      case 'discussion':
        return <DiscussionPage onBack={() => setCurrentView('dashboard')} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} />;
      default:
        return <LearningActivityPage onBack={onBack} onMessagesClick={onMessagesClick} onEventsClick={onEventsClick} onGroupsClick={onGroupsClick} onCalendarClick={onCalendarClick} onLibraryClick={onLibraryClick} onMinisitesClick={onMinisitesClick} onNavigateEducation={handleViewChange} />;
    }
  };

  // Show the selected page, or navigation if on dashboard
  if (currentView !== 'dashboard') {
    return renderPage();
  }

  return (
    <div className="ehp-page">
      <LearningActivityPage
        onBack={onBack}
        onMessagesClick={onMessagesClick}
        onEventsClick={onEventsClick}
        onGroupsClick={onGroupsClick}
        onCalendarClick={onCalendarClick}
        onLibraryClick={onLibraryClick}
        onMinisitesClick={onMinisitesClick}
        onNavigateEducation={handleViewChange}
        initialTab={pendingTab}
        onInitialTabConsumed={() => setPendingTab(null)}
      />
    </div>
  );
}
