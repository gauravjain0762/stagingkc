import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import Feed from './Feed';
import RightSidebar from './RightSidebar';
import EventsPage from './EventsPage';
import MessagesPage from './MessagesPage';
import GroupsPage from './GroupsPage';
import CalendarPage from './CalendarPage';
import EducationHubPage from './EducationHubPage';
import LibraryPage from './LibraryPage';
import ProfilePage from './ProfilePage';
import UserProfilePage from './UserProfilePage';
import MiniSitesPage from './MiniSitesPage';
import PlanManagementPage from '../plans/PlanManagementPage';
import PostDetailModal from './PostDetailModal';
import { initSocket } from '../../services/socket';
import store from '../../store';
import { fetchMe } from '../../store/slices/authSlice';
import { consumeJustSelectedPlan } from '../../store/slices/plansSlice';
import { clearPendingNavigation } from '../../store/slices/uiSlice';
import { readSharedPostId, syncSharedPostId } from '../../utils/permalink';
import { readInitialSection, readInitialViewId, readInitialTab, readInitialDate, readInitialCreate, syncPageUrl } from '../../utils/pageUrl';
import './HomePage.css';

export default function HomePage() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(s => s.auth);
  const { justSelectedPlan } = useSelector(s => s.plans);
  const { pendingNavigation } = useSelector(s => s.ui);

  /* Init socket + resync counts on app load */
  useEffect(() => {
    if (token) {
      initSocket(token, store);
      dispatch(fetchMe());
    }
  }, [token]);

  // Seeded from /?section=&id=&tab=&date=&create= so a refresh lands back
  // where you were, instead of always resetting to the feed.
  const [section,         setSection]         = useState(readInitialSection);
  // Seeded from /?post=<id> so a shared permalink opens straight into the post.
  const [detailPostId,    setDetailPostId]    = useState(readSharedPostId); // post-detail modal
  const [eventsCreate,    setEventsCreate]    = useState(() => readInitialSection() === 'events' && readInitialCreate());
  const [groupsCreate,    setGroupsCreate]    = useState(() => readInitialSection() === 'groups' && readInitialCreate());
  const [profileInitTab,  setProfileInitTab]  = useState(() => readInitialSection() === 'profile' ? readInitialTab() : null);
  const [profileAutoEdit, setProfileAutoEdit] = useState(false);
  const [profileInitFollowPanel, setProfileInitFollowPanel] = useState(null); // 'following' | 'followers' | null
  const [viewedUserId,    setViewedUserId]    = useState(() => readInitialSection() === 'userProfile' ? readInitialViewId() : null);
  const [viewedGroupId,   setViewedGroupId]   = useState(() => readInitialSection() === 'groups' ? readInitialViewId() : null);
  const [viewedEventId,   setViewedEventId]   = useState(() => readInitialSection() === 'events' ? readInitialViewId() : null);
  // One-shot: which tab the deep-linked event should open on (about/discussion).
  const [initialEventTab] = useState(() => readInitialSection() === 'events' ? readInitialTab() : null);
  // One-shot: which conversation (by id, covers DMs and groups) to reopen —
  // distinct from viewedUserId, which starts/opens a DM by *user* id (the
  // "Chat" button elsewhere in the app).
  const [restoredConvId,  setRestoredConvId]  = useState(() => readInitialSection() === 'messages' ? readInitialViewId() : null);
  const [calInitialView]  = useState(() => readInitialSection() === 'calendar' ? readInitialTab() : null);
  const [calInitialDate]  = useState(() => readInitialSection() === 'calendar' ? readInitialDate() : null);
  const [profileReturnSection, setProfileReturnSection] = useState('feed');

  // The id above came from the URL; strip the param once it's in state, so a
  // refresh (or sharing the address bar) doesn't reopen a post that was
  // already closed. Kept live afterwards by the sync effect below.
  useEffect(() => { syncSharedPostId(detailPostId); }, [detailPostId]);

  // Each page reports its own current sub-view (which specific event/group/
  // conversation is open, which tab, which date, whether its "create" flow
  // is open) up here via onViewStateChange, independently of the one-shot
  // deep-link ids above — this is what lets the URL (and a refresh) track
  // the exact spot you're on indefinitely, not just for one refresh.
  const [liveEventView, setLiveEventView] = useState({ id: null, tab: null, create: false });
  const [liveGroupView, setLiveGroupView] = useState({ id: null, create: false });
  const [liveConvId,     setLiveConvId]    = useState(null);
  const [liveProfileTab, setLiveProfileTab] = useState(null);
  const [liveCalView,    setLiveCalView]   = useState({ view: null, date: null });

  function onEventsViewChange({ eventId, tab, createOpen }) {
    setLiveEventView({ id: eventId, tab, create: createOpen });
    if (!createOpen) setEventsCreate(false);
  }
  function onGroupsViewChange({ groupId, createOpen }) {
    setLiveGroupView({ id: groupId, create: createOpen });
    if (!createOpen) setGroupsCreate(false);
  }
  function onMessagesViewChange({ convId }) { setLiveConvId(convId); }
  function onProfileViewChange({ tab }) { setLiveProfileTab(tab); }
  function onCalendarViewChange({ view, date }) { setLiveCalView({ view, date }); }

  // Masked by `section` rather than reset on section change — each page's
  // live state above just keeps existing quietly in the background once you
  // navigate away, and gets masked out here rather than cleared, which
  // avoids a race with the newly-mounted page's own first report.
  const currentView =
    section === 'events'      ? { id: liveEventView.id, tab: liveEventView.tab, create: liveEventView.create } :
    section === 'groups'      ? { id: liveGroupView.id, create: liveGroupView.create } :
    section === 'messages'    ? { id: liveConvId } :
    section === 'profile'     ? { tab: liveProfileTab } :
    section === 'calendar'    ? { tab: liveCalView.view, date: liveCalView.date } :
    section === 'userProfile' ? { id: viewedUserId } :
    {};

  // Mirror section + whatever the active page reports back into the URL, so
  // the next refresh restores this same view.
  useEffect(() => {
    syncPageUrl(section, currentView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, currentView.id, currentView.tab, currentView.date, currentView.create]);

  // Cross-app navigation request (e.g. clicking a new-message toast fired
  // from socket.js, which has no way to reach this component's own state) —
  // reuses the same one-shot restore plumbing as the ?section=&id= deep link.
  useEffect(() => {
    if (!pendingNavigation) return;
    setSection(pendingNavigation.section);
    if (pendingNavigation.section === 'messages' && pendingNavigation.convId) {
      setRestoredConvId(pendingNavigation.convId);
    }
    dispatch(clearPendingNavigation());
  }, [pendingNavigation, dispatch]);

  // Just came from signup → plan selection: land on Profile → About with
  // Personal Information edit mode already open so the user can fill it in.
  useEffect(() => {
    if (!justSelectedPlan) return;
    setProfileInitTab('About');
    setProfileAutoEdit(true);
    setSection('profile');
    dispatch(consumeJustSelectedPlan());
  }, [justSelectedPlan]);

  function goToEventsCreate() { setEventsCreate(true); setSection('events'); }
  function goToGroupsCreate() { setGroupsCreate(true); setSection('groups'); }
  function goToProfileTab(tab) { setProfileInitTab(tab); setSection('profile'); }
  function goToProfileFollowPanel(panel) { setProfileInitFollowPanel(panel); setSection('profile'); }

  // Open someone's profile. If it's the logged-in user, send them to their
  // own editable ProfilePage instead of the read-only UserProfilePage.
  function goToUserProfile(userId) {
    if (!userId) return;
    if (userId === user?._id) {
      setSection('profile');
      return;
    }
    setViewedUserId(userId);
    setProfileReturnSection(section);
    setSection('userProfile');
  }

  function goToGroup(groupId) {
    if (!groupId) return;
    setViewedGroupId(groupId);
    setSection('groups');
  }

  function goToEvent(eventId) {
    if (!eventId) return;
    setViewedEventId(eventId);
    setSection('events');
  }

  // Notification click (mention/comment/like) → open the post in a detail
  // modal. Uses GET /api/posts/:id, so it works for any post even when the
  // feed only has the first page loaded.
  function goToPost(postId) {
    if (!postId) return;
    setDetailPostId(postId);
  }

  // Jump into Messages with a specific person pre-selected (used by the
  // "Message" button on UserProfilePage).
  function goToMessagesWithUser(userId) {
    setViewedUserId(userId);
    setSection('messages');
  }

  return (
    <div className={`home-page${section === 'messages' ? ' home-page--chat' : ''}`}>
      <Navbar
        onMessagesClick={() => setSection('messages')}
        onProfileClick={() => setSection('profile')}
        onConnectionsClick={() => goToProfileTab('Connections')}
        onPostsClick={() => goToProfileTab('Feed')}
        onPostClick={goToPost}
        onUserClick={goToUserProfile}
        onNavigateToConnections={(tab) => {
          setSection('profile');
          setProfileInitTab('Connections');
          // TODO: Pass the tab type (sent-requests) if needed in future
        }}
        onPlansClick={() => setSection('plans')}
      />
      <div className="home-body">
        {section === 'minisites' ? (
          <MiniSitesPage
            onBack={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onMessagesClick={() => setSection('messages')}
            onCalendarClick={() => setSection('calendar')}
            onMinisitesClick={() => setSection('minisites')}
          />
        ) : section === 'plans' ? (
          <PlanManagementPage
            onBack={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onMessagesClick={() => setSection('messages')}
            onCalendarClick={() => setSection('calendar')}
            onMinisitesClick={() => setSection('minisites')}
          />
        ) : section === 'profile' ? (
          <ProfilePage
            onBack={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onEventsCreateClick={goToEventsCreate}
            onGroupsClick={() => setSection('groups')}
            onMessagesClick={() => setSection('messages')}
            onCalendarClick={() => setSection('calendar')}
            onMinisitesClick={() => setSection('minisites')}
            initialTab={profileInitTab}
            onInitTabConsumed={() => setProfileInitTab(null)}
            autoEditPersonal={profileAutoEdit}
            onAutoEditConsumed={() => setProfileAutoEdit(false)}
            initFollowPanel={profileInitFollowPanel}
            onInitFollowPanelConsumed={() => setProfileInitFollowPanel(null)}
            onUserClick={goToUserProfile}
            onEventClick={goToEvent}
            onMessageUser={goToMessagesWithUser}
            onViewStateChange={onProfileViewChange}
          />
        ) : section === 'userProfile' ? (
          <UserProfilePage
            userId={viewedUserId}
            onBack={() => setSection(profileReturnSection)}
            onMessageUser={goToMessagesWithUser}
            onEventsClick={() => setSection('events')}
            onEventsCreateClick={goToEventsCreate}
            onGroupsClick={() => setSection('groups')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onMinisitesClick={() => setSection('minisites')}
            onUserClick={goToUserProfile}
            onEventClick={goToEvent}
          />
        ) : section === 'library' ? (
          <LibraryPage
            onBack={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onCalendarClick={() => setSection('calendar')}
            onMessagesClick={() => setSection('messages')}
            onMinisitesClick={() => setSection('minisites')}
          />
        ) : section === 'courses' ? (
          <EducationHubPage
            onBack={() => setSection('feed')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onCalendarClick={() => setSection('calendar')}
            onMessagesClick={() => setSection('messages')}
            onMinisitesClick={() => setSection('minisites')}
          />
        ) : section === 'events' ? (
          <EventsPage
            onBack={() => { setEventsCreate(false); setSection('feed'); }}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onCalendarClick={() => setSection('calendar')}
            onMessagesClick={() => setSection('messages')}
            onMinisitesClick={() => setSection('minisites')}
            startCreate={eventsCreate}
            initialEventId={viewedEventId}
            initialDetailTab={initialEventTab}
            onInitEventConsumed={() => setViewedEventId(null)}
            onUserClick={goToUserProfile}
            onViewStateChange={onEventsViewChange}
          />
        ) : section === 'messages' ? (
          <MessagesPage
            onBack={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onGroupsClick={() => setSection('groups')}
            onCalendarClick={() => setSection('calendar')}
            onMinisitesClick={() => setSection('minisites')}
            onUserClick={goToUserProfile}
            initialUserId={viewedUserId}
            onInitUserConsumed={() => setViewedUserId(null)}
            initialConvId={restoredConvId}
            onInitConvConsumed={() => setRestoredConvId(null)}
            onViewStateChange={onMessagesViewChange}
          />
        ) : section === 'groups' ? (
          <GroupsPage
            onBack={() => { setGroupsCreate(false); setSection('feed'); }}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onCalendarClick={() => setSection('calendar')}
            onMessagesClick={() => setSection('messages')}
            onMinisitesClick={() => setSection('minisites')}
            initialGroupId={viewedGroupId}
            onInitGroupConsumed={() => setViewedGroupId(null)}
            startCreate={groupsCreate}
            onViewStateChange={onGroupsViewChange}
          />
        ) : section === 'calendar' ? (
          <CalendarPage
            onFeedClick={() => setSection('feed')}
            onCoursesClick={() => setSection('courses')}
            onLibraryClick={() => setSection('library')}
            onEventsClick={() => setSection('events')}
            onEventsCreateClick={goToEventsCreate}
            onEventClick={goToEvent}
            onGroupsClick={() => setSection('groups')}
            onMessagesClick={() => setSection('messages')}
            onMinisitesClick={() => setSection('minisites')}
            initialView={calInitialView}
            initialDate={calInitialDate}
            onViewStateChange={onCalendarViewChange}
          />
        ) : (
          <>
            <LeftSidebar
              onCoursesClick={() => setSection('courses')}
              onLibraryClick={() => setSection('library')}
              onEventsClick={() => setSection('events')}
              onMessagesClick={() => setSection('messages')}
              onGroupsClick={() => setSection('groups')}
              onCalendarClick={() => setSection('calendar')}
              onProfileClick={() => setSection('profile')}
              onFollowingClick={() => goToProfileFollowPanel('following')}
              onFollowersClick={() => goToProfileFollowPanel('followers')}
              onMinisitesClick={() => setSection('minisites')}
              onGroupClick={goToGroup}
              onEventClick={goToEvent}
              onUserClick={goToUserProfile}
              onCreateGroup={goToGroupsCreate}
              onCreateEvent={goToEventsCreate}
            />
            <Feed
              onEventsClick={() => setSection('events')}
              onProfileClick={() => setSection('profile')}
              onCreateEvent={goToEventsCreate}
              onUserClick={goToUserProfile}
              onEventClick={goToEvent}
              onGroupClick={goToGroup}
              onGroupsClick={() => setSection('groups')}
            />
            <RightSidebar onAddEducationClick={() => setSection('courses')} onGalleryClick={() => goToProfileTab('Photos')} />
          </>
        )}
      </div>

      {detailPostId && (
        <PostDetailModal
          postId={detailPostId}
          onClose={() => setDetailPostId(null)}
          onUserClick={(uid) => { setDetailPostId(null); goToUserProfile(uid); }}
        />
      )}
    </div>
  );
}