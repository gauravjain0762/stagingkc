import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AnimatedNav from '../home/AnimatedNav';
import PlanCard from './PlanCard';
import { fetchPlans } from '../../store/slices/plansSlice';
import { showToast } from '../../store/slices/toastSlice';
import { apiRequest } from '../../services/api';
import '../home/MiniSitesPage.css';
import './PlansPage.css';
import './PlanManagementPage.css';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TIER_ORDER = ['free', 'gold', 'platinum'];

// Same "MMM D, YYYY" convention as CustomDatePicker's display value, kept
// consistent across the app rather than falling back to the browser's
// locale-dependent date formatting.
function formatDisplayDate(input) {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d)) return '—';
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatAmount(amount, currency = 'USD') {
  const n = Number(amount);
  if (isNaN(n)) return '—';
  const symbol = currency === 'USD' || !currency ? '$' : currency + ' ';
  return `${symbol}${n.toFixed(2)}`;
}

// Plan/billing history has no backend endpoint yet — this is placeholder
// content so the UI reads as a finished page rather than an empty shell.
// Swap for a real fetch once those endpoints exist (see plansSlice's
// fetchPlanHistory/fetchBillingHistory, already written and ready to wire
// back in).
const STATIC_PLAN_HISTORY = [
  { id: 'ph1', date: '2026-07-14', description: 'Upgraded to Gold', status: 'Completed' },
  { id: 'ph2', date: '2026-03-14', description: 'Started on Free', status: 'Completed' },
];

const STATIC_BILLING_HISTORY = [
  { id: 'bh1', invoiceNumber: 'INV-2026-0814', date: '2026-08-14', period: 'Aug 14 – Sep 13, 2026', description: 'Usage-based subscription', amount: 20, status: 'Paid', paymentMethod: 'Visa •••• 4242' },
  { id: 'bh2', invoiceNumber: 'INV-2026-0714', date: '2026-07-14', period: 'Jul 14 – Aug 13, 2026', description: 'Usage-based subscription', amount: 20, status: 'Paid', paymentMethod: 'Visa •••• 4242' },
  { id: 'bh3', invoiceNumber: 'INV-2026-0614', date: '2026-06-14', period: 'Jun 14 – Jul 13, 2026', description: 'Usage-based subscription', amount: 20, status: 'Paid', paymentMethod: 'Visa •••• 4242' },
  { id: 'bh4', invoiceNumber: 'INV-2026-0514', date: '2026-05-14', period: 'May 14 – Jun 13, 2026', description: 'Usage-based subscription', amount: 20, status: 'Paid', paymentMethod: 'Visa •••• 4242' },
];

// "Load more" reveals these — same static-data approach, just paginated for
// the UI to demonstrate the pattern rather than actually fetching page 2.
const STATIC_BILLING_HISTORY_MORE = [
  { id: 'bh5', invoiceNumber: 'INV-2026-0414', date: '2026-04-14', period: 'Apr 14 – May 13, 2026', description: 'Usage-based subscription', amount: 20, status: 'Paid', paymentMethod: 'Visa •••• 4242' },
  { id: 'bh6', invoiceNumber: 'INV-2026-0314', date: '2026-03-14', period: 'Mar 14 – Apr 13, 2026', description: 'Usage-based subscription', amount: 0,  status: 'Paid', paymentMethod: 'Visa •••• 4242' },
];

const ANNUAL_DISCOUNT = 0.17; // "Save 17%" — matches the reference's framing

// The current plan's own subscribed-since date has no backend field yet
// (see the "UI only for now" note above) — this anchors it to the same
// "Upgraded to Gold" entry already shown in the static Plan History table,
// so the two stay consistent with each other.
const CURRENT_PLAN_START_DATE = '2026-07-14';

// Walks the subscription anniversary forward from its start date to the
// next one still in the future, so "Renews on" always reads as an upcoming
// date no matter when this page happens to be viewed.
function nextRenewalDate(startDateStr, cycle) {
  const start = new Date(startDateStr + 'T00:00:00');
  const now = new Date();
  const next = new Date(start);
  const step = () => cycle === 'annual' ? next.setFullYear(next.getFullYear() + 1) : next.setMonth(next.getMonth() + 1);
  while (next <= now) step();
  return next;
}

function CreditCardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function ClockHistoryIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function ArrowLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function InfoIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8.01"/><line x1="12" y1="11" x2="12" y2="16"/></svg>;
}

const TABS = [
  { id: 'plans',   label: 'Plans' },
  { id: 'billing', label: 'Billing' },
];

export default function PlanManagementPage({ onBack, onCoursesClick, onLibraryClick, onEventsClick, onGroupsClick, onMessagesClick, onCalendarClick, onMinisitesClick }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector(s => s.auth);
  const { plans, loading } = useSelector(s => s.plans);

  const [activeTab, setActiveTab] = useState('plans');
  const [viewingBill, setViewingBill] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showMoreBilling, setShowMoreBilling] = useState(false);

  // API data states
  const [planData, setPlanData] = useState(null);
  const [loadingPlanData, setLoadingPlanData] = useState(false);
  const [planDataError, setPlanDataError] = useState('');

  // Fetch user's plan data from API
  useEffect(() => {
    async function fetchPlanData() {
      setLoadingPlanData(true);
      setPlanDataError('');
      try {
        const res = await apiRequest('/api/users/me/plan', { token });
        setPlanData(res?.data);
        // Set billing cycle from API if available
        if (res?.data?.subscription?.billingCycle) {
          setBillingCycle(res.data.subscription.billingCycle);
        }
      } catch (err) {
        setPlanDataError(err.message || 'Failed to load plan data');
      } finally {
        setLoadingPlanData(false);
      }
    }

    if (token) {
      fetchPlanData();
    }
  }, [token]);

  // Fetch plans catalog
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Use API data if available, fallback to user state
  const currentTier = planData?.currentMembership?.tier || (typeof user?.membership === 'string' ? user.membership : user?.membership?.tier);
  const sortedPlans = [...plans].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  const currentPlan = sortedPlans.find(p => p.tier === currentTier) ?? null;

  const isFreeTier = !currentTier || currentTier === 'free';
  const currentTierIndex = TIER_ORDER.indexOf(currentTier ?? 'free');

  // Calculate displayed plans with pricing
  const annualDiscount = planData?.pricingOptions?.annualSavingsPercentage ? (planData.pricingOptions.annualSavingsPercentage / 100) : ANNUAL_DISCOUNT;
  const displayedPlans = sortedPlans
    .filter(p => TIER_ORDER.indexOf(p.tier) >= currentTierIndex)
    .map(p => {
      // Get pricing from API data if available
      const apiPlan = planData?.allPlans?.find(ap => ap.tier === p.tier);
      const monthlyPrice = apiPlan?.monthlyPrice ?? p.price;
      const annualPrice = apiPlan?.annualPrice ?? (monthlyPrice * 12);

      return {
        ...p,
        price: billingCycle === 'annual' ? Math.round(annualPrice / 12) : monthlyPrice,
        originalPrice: monthlyPrice,
        monthlyPrice,
        annualPrice,
      };
    });

  const renewalDate = planData?.subscription?.renewalDate ? new Date(planData.subscription.renewalDate) : (currentPlan && !isFreeTier ? nextRenewalDate(CURRENT_PLAN_START_DATE, billingCycle) : null);

  function handleNav(id) {
    if (id === 'home')      onBack?.();
    if (id === 'courses')   onCoursesClick?.();
    if (id === 'library')   onLibraryClick?.();
    if (id === 'events')    onEventsClick?.();
    if (id === 'friends')   onGroupsClick?.();
    if (id === 'messages')  onMessagesClick?.();
    if (id === 'calendar')  onCalendarClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  }

  // UI-only for now — no change-plan endpoint exists yet, so this doesn't
  // pretend to actually switch the account's plan (that would mean faking
  // auth state). It just confirms the click landed.
  function handleUpgrade(planId) {
    const plan = sortedPlans.find(p => p._id === planId);
    const tierLabel = plan ? plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1) : 'this plan';
    dispatch(showToast({ message: `Upgrade to ${tierLabel} requested — billing isn't connected yet.`, type: 'info' }));
  }

  return (
    <div className="ms-page">
      <AnimatedNav activeId={null} onNavigate={handleNav} />

      <div className="ms-main">
        {/* Header */}
        <div className="ms-header">
          <div>
            <h1 className="ms-title">Plans &amp; Subscriptions</h1>
            <p className="ms-subtitle">Manage your membership and view your billing history</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="ms-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`ms-tab${activeTab === t.id ? ' ms-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'plans' && (
          <>
            {/* Current plan hero */}
            {loadingPlanData ? (
              <div className="plans-loading"><span className="spinner spinner--lg" aria-label="Loading plan data" /></div>
            ) : planDataError ? (
              <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#fecaca', marginBottom: '20px' }}>
                {planDataError}
              </div>
            ) : (
              <div className="pm-hero">
                <div className="pm-hero-left">
                  <div className="pm-hero-icon"><CreditCardIcon /></div>
                  <div>
                    <p className="pm-hero-eyebrow">Current Plan</p>
                    <h2 className="pm-hero-title">
                      {planData?.currentMembership?.displayName || (currentPlan ? `You're on the ${currentPlan.tier.charAt(0).toUpperCase() + currentPlan.tier.slice(1)} Plan` : "You're on the Free Plan")}
                    </h2>
                    {planData?.currentMembership && (
                      <p className="pm-hero-price">
                        {formatAmount(billingCycle === 'annual' && !isFreeTier ? planData.currentMembership.annualPrice : planData.currentMembership.monthlyPrice)}
                        <span>{billingCycle === 'annual' && !isFreeTier ? '/yr' : '/mo'}</span>
                      </p>
                    )}
                  </div>
                </div>

                {!isFreeTier && (planData?.subscription || renewalDate) && (
                  <div className="pm-hero-dates">
                    <div>
                      <p className="pm-hero-date-label">Subscribed</p>
                      <p className="pm-hero-date-value">{formatDisplayDate(planData?.subscription?.startDate || CURRENT_PLAN_START_DATE)}</p>
                    </div>
                    <div>
                      <p className="pm-hero-date-label">Renews on</p>
                      <p className="pm-hero-date-value">{formatDisplayDate(planData?.subscription?.renewalDate || renewalDate)}</p>
                    </div>
                  </div>
                )}

                {!isFreeTier && (
                  <div className="pm-hero-cycle">
                    <div className="pm-cycle-toggle">
                      <button
                        type="button"
                        className={`pm-cycle-btn${billingCycle === 'monthly' ? ' pm-cycle-btn--active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                      >Monthly</button>
                      <button
                        type="button"
                        className={`pm-cycle-btn${billingCycle === 'annual' ? ' pm-cycle-btn--active' : ''}`}
                        onClick={() => setBillingCycle('annual')}
                      >Annual <span className="pm-cycle-save">Save {Math.round(annualDiscount * 100)}%</span></button>
                    </div>
                    <p className={`pm-hero-cycle-note${billingCycle === 'annual' ? ' pm-hero-cycle-note--positive' : ''}`}>
                      <InfoIcon />
                      {billingCycle === 'monthly' ? (
                        <span>Monthly plan. <button type="button" onClick={() => setBillingCycle('annual')}>Switch to annual, save {Math.round(annualDiscount * 100)}%.</button></span>
                      ) : (
                        <span>Saving {Math.round(annualDiscount * 100)}% on annual billing.</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* All plans */}
            <h3 className="pm-section-title">All Plans</h3>
            {loading || loadingPlanData ? (
              <div className="plans-loading"><span className="spinner spinner--lg" aria-label="Loading plans" /></div>
            ) : (
              <div className="plans-grid pm-plans-grid">
                {planData?.allPlans && planData.allPlans.length > 0 ? (
                  // Use API plans if available
                  planData.allPlans.map((apiPlan, i) => {
                    const catalogPlan = displayedPlans.find(p => p.tier === apiPlan.tier);
                    return (
                      <PlanCard
                        key={apiPlan.id}
                        plan={{
                          ...catalogPlan,
                          ...apiPlan,
                          _id: apiPlan.id,
                          tier: apiPlan.tier,
                          category: apiPlan.category,
                          price: billingCycle === 'annual' ? Math.round(apiPlan.annualPrice / 12) : apiPlan.monthlyPrice,
                          originalPrice: apiPlan.monthlyPrice,
                        }}
                        index={i}
                        mode="manage"
                        isCurrent={apiPlan.isCurrentPlan}
                        onUpgrade={handleUpgrade}
                        billingCycle={billingCycle}
                        originalPrice={apiPlan.monthlyPrice}
                      />
                    );
                  })
                ) : (
                  // Fallback to catalog plans
                  displayedPlans.map((plan, i) => (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      index={i}
                      mode="manage"
                      isCurrent={plan.tier === currentTier}
                      onUpgrade={handleUpgrade}
                      billingCycle={billingCycle}
                      originalPrice={plan.originalPrice}
                    />
                  ))
                )}
              </div>
            )}

            {/* Plan history */}
            <h3 className="pm-section-title"><ClockHistoryIcon /> Plan History</h3>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr><th>Date</th><th>Change</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {STATIC_PLAN_HISTORY.map(h => (
                    <tr key={h.id}>
                      <td>{formatDisplayDate(h.date)}</td>
                      <td>{h.description}</td>
                      <td><span className="pm-status-pill">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'billing' && (
          <>
            <h3 className="pm-section-title">Billing History</h3>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Amount</th><th /></tr>
                </thead>
                <tbody>
                  {[...STATIC_BILLING_HISTORY, ...(showMoreBilling ? STATIC_BILLING_HISTORY_MORE : [])].map(b => (
                    <tr key={b.id}>
                      <td>{formatDisplayDate(b.date)}</td>
                      <td>{b.description}</td>
                      <td>{formatAmount(b.amount)}</td>
                      <td>
                        <button type="button" className="pm-view-btn" onClick={() => setViewingBill(b)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!showMoreBilling && (
                <div className="pm-load-more-row">
                  <button type="button" className="pm-load-more-btn" onClick={() => setShowMoreBilling(true)}>Load more</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {viewingBill && (
        <div className="pm-invoice-overlay">
          <div className="pm-invoice-toolbar">
            <button type="button" className="pm-invoice-back-btn" onClick={() => setViewingBill(null)}>
              <ArrowLeftIcon /> Back to Billing
            </button>
            <div className="pm-invoice-toolbar-actions">
              <button type="button" className="pm-invoice-download-btn" onClick={() => window.print()}>
                <DownloadIcon /> Download PDF
              </button>
              <button type="button" className="pm-modal-close" onClick={() => setViewingBill(null)}><CloseIcon /></button>
            </div>
          </div>

          <div className="pm-invoice-sheet" id="pm-invoice-print-area">
            <div className="pm-invoice-head">
              <div>
                <p className="pm-invoice-brand">Kink Catalyst</p>
                <p className="pm-invoice-brand-sub">billing@kinkcatalyst.com</p>
              </div>
              <div className="pm-invoice-head-right">
                <p className="pm-invoice-doc-title">Invoice</p>
                <span className="pm-status-pill">{viewingBill.status}</span>
              </div>
            </div>

            <div className="pm-invoice-meta-grid">
              <div>
                <p className="pm-invoice-label">Invoice Number</p>
                <p className="pm-invoice-value">{viewingBill.invoiceNumber}</p>
              </div>
              <div>
                <p className="pm-invoice-label">Date Issued</p>
                <p className="pm-invoice-value">{formatDisplayDate(viewingBill.date)}</p>
              </div>
              <div>
                <p className="pm-invoice-label">Billing Period</p>
                <p className="pm-invoice-value">{viewingBill.period}</p>
              </div>
              <div>
                <p className="pm-invoice-label">Payment Method</p>
                <p className="pm-invoice-value">{viewingBill.paymentMethod}</p>
              </div>
            </div>

            <div className="pm-invoice-parties">
              <div>
                <p className="pm-invoice-label">Billed To</p>
                <p className="pm-invoice-value">{user?.fullName || user?.name || 'Member'}</p>
                <p className="pm-invoice-value pm-invoice-value--muted">{user?.email ?? ''}</p>
              </div>
              <div>
                <p className="pm-invoice-label">From</p>
                <p className="pm-invoice-value">Kink Catalyst Inc.</p>
                <p className="pm-invoice-value pm-invoice-value--muted">billing@kinkcatalyst.com</p>
              </div>
            </div>

            <table className="pm-invoice-items">
              <thead>
                <tr><th>Description</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {viewingBill.description}
                    <span className="pm-invoice-item-sub">{viewingBill.period}</span>
                  </td>
                  <td>{formatAmount(viewingBill.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr><td>Subtotal</td><td>{formatAmount(viewingBill.amount)}</td></tr>
                <tr><td>Tax</td><td>{formatAmount(0)}</td></tr>
                <tr className="pm-invoice-total-row"><td>Total</td><td>{formatAmount(viewingBill.amount)}</td></tr>
              </tfoot>
            </table>

            <p className="pm-invoice-footnote">
              This is a preview invoice — billing isn't connected to a live payment processor yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
