import { useSelector } from 'react-redux';
import Toast from './components/Toast';
import SignupPage from './components/signup/SignupPage';
import LoginPage from './components/login/LoginPage';
import ForgotPasswordPage from './components/forgot-password/ForgotPasswordPage';
import VerifyOtpPage from './components/verify/VerifyOtpPage';
import PlansPage from './components/plans/PlansPage';
import HomePage from './components/home/HomePage';
import OnboardingForm from './components/home/OnboardingForm';
import PublicSitePage from './components/home/PublicSitePage';

// A Mini Site's public link (?site=<slug>) must be viewable by anyone,
// logged in or not, so it's checked before every auth-gated branch below.
function readPublicSiteSlug() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('site');
}

export default function App() {
  const { otpPending, isAuthenticated, requiresPlanSelection, user } = useSelector((state) => state.auth);
  const { planSelectionComplete, justSelectedPlan } = useSelector((state) => state.plans);
  const { page } = useSelector((state) => state.ui);

  const publicSiteSlug = readPublicSiteSlug();
  if (publicSiteSlug) return <><Toast /><PublicSitePage slug={publicSiteSlug} /></>;

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
