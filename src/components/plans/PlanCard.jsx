import { useDispatch, useSelector } from 'react-redux';
import { selectPlan } from '../../store/slices/plansSlice';
import { useEffect, useState, useMemo } from 'react';

// "Most Popular" is no longer decided here — it comes from the backend's
// per-plan `isPopular` flag (admin-configurable), not the tier name.
const TIER_META = {
  free:     { label: 'STARTER',      button: 'Join for Free', variant: 'outline' },
  gold:     { label: 'INFLUENCER',   button: 'Get Gold',      variant: 'wave'    },
  platinum: { label: 'PROFESSIONAL', button: 'Go Platinum',   variant: 'outline' },
};

const COUNTER_DELAYS = [500, 680, 860];
const CARD_DELAYS    = ['0.1s', '0.28s', '0.46s'];

const AURORA_COLORS = ['#5534f0', '#00e5c0', '#ff6ef7', '#ff9900', '#60a5fa'];

const TIER_SELECTED_COLOR = {
  free:     '#3b82f6',
  gold:     '#a855f7',
  platinum: '#a78bfa',
};

function rand(min, max) { return min + Math.random() * (max - min); }

function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="rgba(37,99,235,0.15)" />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="btn-spinner" aria-hidden="true" />;
}

// `mode="manage"` is used by PlanManagementPage (an existing member browsing
// plans to switch, not a brand-new signup) — same card, but the button
// reflects "already on this plan" / "switch to this plan" and calls
// `onUpgrade` instead of dispatching the onboarding-only selectPlan thunk.
export default function PlanCard({ plan, index = 0, isSelected = false, onCardClick, mode = 'onboarding', isCurrent = false, onUpgrade, isUpgrading = false, billingCycle = 'monthly', originalPrice }) {
  const dispatch   = useDispatch();
  const { selecting } = useSelector((state) => state.plans);
  const [displayPrice, setDisplayPrice] = useState(0);

  const meta        = TIER_META[plan.tier] ?? { label: plan.tier.toUpperCase(), button: 'Select Plan', variant: 'outline' };
  const isPopular   = plan.isPopular ?? false;
  const tierName    = plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1) + ' Tier';
  const isGold      = plan.tier === 'gold';
  const isPlatinum  = plan.tier === 'platinum';
  const featureList = plan.features.flatMap((f) => f.split('\n')).filter(Boolean);
  const isManage    = mode === 'manage';
  const isSelecting = isManage ? isUpgrading : selecting === plan._id;
  const isDisabled  = isManage ? (isCurrent || isUpgrading) : !!selecting;
  const buttonLabel = isManage ? (isCurrent ? 'Current Plan' : 'Upgrade') : meta.button;
  // Free isn't something you "upgrade" to, so it gets no action button in
  // manage mode unless it's the plan you're already on.
  const hideManageButton = isManage && !isCurrent && plan.tier === 'free';
  // On the Annual toggle, `plan.price` already carries the discounted
  // per-month rate — show the full year's total as the headline number, with
  // the original (pre-discount) monthly rate struck through for comparison.
  // Free has nothing to discount, so it keeps the plain monthly display.
  const isAnnualPricing = isManage && billingCycle === 'annual' && plan.tier !== 'free';

  /* ── Price counter ── */
  useEffect(() => {
    const monthly = Number(plan.price) || 0;
    const target  = isAnnualPricing ? monthly * 12 : monthly;
    const delay  = COUNTER_DELAYS[index] ?? 500;
    const t = setTimeout(() => {
      if (!target) { setDisplayPrice(0); return; }
      const steps = 32;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        setDisplayPrice(Math.round((target / steps) * step));
        if (step >= steps) { setDisplayPrice(target); clearInterval(iv); }
      }, 22);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [plan.price, index, isAnnualPricing]);

  /* ── Particles (gold only) ── */
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size:     rand(2, 5),
      left:     rand(5, 90),
      delay:    rand(0, 3),
      duration: rand(2.5, 4.5),
      dx:       rand(-20, 20),
      color:    AURORA_COLORS[Math.floor(Math.random() * AURORA_COLORS.length)],
    }))
  , []);

  /* ── Ripple ── */
  function handleRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'btn-ripple';
    span.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
  }

  function handleSelect(e) {
    handleRipple(e);
    if (isManage) onUpgrade?.(plan._id);
    else dispatch(selectPlan(plan._id));
  }

  const cardDelay = CARD_DELAYS[index] ?? '0.1s';

  const tierColor = TIER_SELECTED_COLOR[plan.tier] ?? '#3b82f6';

  const cardEl = (
    <div
      className={`plan-card plan-card--${plan.tier}${isPopular ? ' plan-card--popular' : ''}${isSelected ? ' plan-card--selected' : ''}${isCurrent ? ' plan-card--current' : ''}`}
      style={{ '--card-delay': isGold ? undefined : cardDelay, '--tier-color': tierColor }}
      onClick={onCardClick}
    >
      {isPopular && !isCurrent && <div className="popular-badge">Most Popular</div>}
      {isCurrent && <div className="popular-badge popular-badge--current">Current Plan</div>}

      <p className="plan-label">{meta.label}</p>
      <h3 className="plan-name">{tierName}</h3>

      {isAnnualPricing && originalPrice > 0 && (
        <p className="price-strike">${originalPrice}/mo <span>billed monthly</span></p>
      )}
      <div className="plan-price">
        <span className="price-dollar">$</span>
        <span className={`price-amount${isPlatinum ? ' price-amount--plat' : ''}`}>
          {displayPrice}
        </span>
        <span className="price-period">{isAnnualPricing && originalPrice > 0 ? '/yr' : '/mo'}</span>
      </div>

      <ul className="plan-features">
        {featureList.map((feature, i) => (
          <li key={i} className="plan-feature-item" style={{ '--fi': i }}>
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!hideManageButton && (
        <button
          type="button"
          className={`plan-btn plan-btn--${meta.variant}${isManage && isCurrent ? ' plan-btn--current' : ''}`}
          onClick={handleSelect}
          disabled={isDisabled}
        >
          {isSelecting ? <><Spinner /> Switching…</> : buttonLabel}
        </button>
      )}

      {isGold && (
        <div className="gold-particles" aria-hidden="true">
          {particles.map(p => (
            <span
              key={p.id}
              className="gold-particle"
              style={{
                width:             `${p.size}px`,
                height:            `${p.size}px`,
                left:              `${p.left}%`,
                bottom:            '-8px',
                background:        p.color,
                animationDelay:    `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                '--dx':            `${p.dx}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isGold) {
    return (
      <div
        className={`gold-aurora-wrap${isSelected ? ' gold-aurora-wrap--selected' : ''}`}
        style={{ '--card-delay': cardDelay }}
      >
        {cardEl}
      </div>
    );
  }

  return cardEl;
}
