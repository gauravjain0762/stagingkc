import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import Toast from './components/Toast';
import SignupPage from './components/signup/SignupPage';
import LoginPage from './components/login/LoginPage';
import ForgotPasswordPage from './components/forgot-password/ForgotPasswordPage';
import VerifyOtpPage from './components/verify/VerifyOtpPage';
import PlansPage from './components/plans/PlansPage';
import HomePage from './components/home/HomePage';
import OnboardingForm from './components/home/OnboardingForm';
import PublicSitePage from './components/home/PublicSitePage';
import InviteJoinPage from './components/home/InviteJoinPage';
import { logout } from './store/slices/authSlice';
import { showToast } from './store/slices/toastSlice';

// A Mini Site's public link (?site=<slug>) must be viewable by anyone,
// logged in or not, so it's checked before every auth-gated branch below.
function readPublicSiteSlug() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('site');
}

// Read invite token from URL
function readInviteToken() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('invite');
}

export default function App() {
  const dispatch = useDispatch();
  const { otpPending, isAuthenticated, requiresPlanSelection, user, token } = useSelector((state) => state.auth);
  const { planSelectionComplete, justSelectedPlan } = useSelector((state) => state.plans);
  const { page } = useSelector((state) => state.ui);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const inviteToken = readInviteToken();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const expiresAt = Number(localStorage.getItem('auth_session_expires_at'));
    const checkExpiry = () => {
      if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
        dispatch(logout());
      }
    };

    checkExpiry();
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return;

    const expiryTimer = window.setTimeout(() => dispatch(logout()), expiresAt - Date.now());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkExpiry();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearTimeout(expiryTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, isAuthenticated, token]);

  // Show invite modal if token is present (from URL or localStorage)
  useEffect(() => {
    if (inviteToken) {
      setShowInviteModal(true);
    } else if (isAuthenticated) {
      // Check if user just logged in with a pending invite
      const pendingToken = localStorage.getItem('pendingInviteToken');
      if (pendingToken) {
        setShowInviteModal(true);
        // Update URL to include the token
        window.history.replaceState({}, document.title, `${window.location.pathname}?invite=${pendingToken}`);
      }
    }
  }, [inviteToken, isAuthenticated]);

  const publicSiteSlug = readPublicSiteSlug();
  if (publicSiteSlug) return <><Toast /><PublicSitePage slug={publicSiteSlug} /></>;

  // Show invite join modal if token is present
  if (inviteToken && showInviteModal) {
    return (
      <>
        <Toast />
        {isAuthenticated ? (
          <HomePage />
        ) : (
          <SignupPage />
        )}
        <InviteJoinPage
          token={inviteToken}
          onClose={() => {
            // Clear token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setShowInviteModal(false);
          }}
        />
      </>
    );
  }

  if (otpPending) return <><Toast /><VerifyOtpPage /></>;

  // Logged-in user who hasn't selected a plan yet (login → plan-setup flow)
  if (requiresPlanSelection) return <><Toast /><PlansPage /></>;

  if (isAuthenticated) {
    const hasPlan = planSelectionComplete || !!user?.membership;
    if (!hasPlan) return <><Toast /><PlansPage /></>;
    // Brand-new user who just picked a plan → complete-profile onboarding form
    // before landing in the app. Consuming justSelectedPlan (on Save) drops
    // them into the feed.
    if (justSelectedPlan) return <><Toast /><OnboardingForm /></>;
    return <><Toast /><HomePage /></>;
  }

  if (page === 'login')           return <><Toast /><LoginPage /></>;
  if (page === 'forgot-password') return <><Toast /><ForgotPasswordPage /></>;
  return <><Toast /><SignupPage /></>;
}
// Updated deployment trigger
