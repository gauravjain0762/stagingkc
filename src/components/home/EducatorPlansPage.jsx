import { useState } from 'react';
import EducationBackButton from './EducationBackButton';
import './EducatorPlansPage.css';

const PLANS_DATA = [
  {
    id: 'monthly',
    name: 'Standard Educator Plan',
    badge: 'Flexible',
    price: '$19',
    period: '/ month',
    billingCycle: 'Monthly (Billed once every month)',
    billingNote: 'Renews automatically each month. Pause or cancel anytime.',
    description: 'Ideal for independent educators getting started, sharing essential courses, and hosting monthly community workshops.',
    benefits: [
      'Publish unlimited free and paid courses',
      'Host up to 4 monthly live webinars & classes',
      'Standard educator profile & storefront badge',
      'Learner enrollment and progress tracking',
      'Community discussion forums & learner comments',
      'Direct messaging with enrolled students',
      'Standard payout processing schedule',
    ],
    cancellationPolicy: {
      headline: 'Cancel anytime with zero fees',
      details: [
        'Cancel your plan at any time with one click from your educator workspace settings.',
        'No cancellation fees, cancellation penalties, or hidden charges ever.',
        'You retain full educator access and publishing tools until the end of your current monthly billing period.',
        'All student enrollments and published content remain intact and accessible.',
      ],
    },
    popular: false,
    ctaText: 'Select Monthly Plan',
  },
  {
    id: 'annual',
    name: 'Pro Educator Plan',
    badge: 'Most Popular · Save 17%',
    price: '$189',
    period: '/ year',
    equivalent: 'Equivalent to $15.75 / month',
    billingCycle: 'Annual (Billed once per year)',
    billingNote: 'Billed once annually at $189. Save $39 compared to monthly billing.',
    description: 'Comprehensive tier for established educators and organizations seeking maximum reach, advanced tools, and priority visibility.',
    benefits: [
      'Everything included in the Standard Plan',
      'Unlimited live webinars, workshops & masterclasses',
      'Priority featured placement in Education Hub & Discovery',
      'Advanced analytics, completion metrics & sales reports',
      'Custom storefront branding & custom promotional banners',
      'Lower transaction fees on paid course enrollments',
      'Priority educator support and dedicated onboarding',
      'Verified KC Educator credential badge',
    ],
    cancellationPolicy: {
      headline: 'Annual cancellation & renewal protection',
      details: [
        'Cancel recurring renewal anytime before your next annual billing date.',
        'Full 14-day money-back satisfaction guarantee on initial annual plan purchase.',
        'You retain full Pro educator access and perks through the end of the 12-month paid term.',
        'Automatic email reminder sent 14 days before your annual renewal date.',
      ],
    },
    popular: true,
    ctaText: 'Select Annual Plan',
  },
];

export default function EducatorPlansPage({ onBack }) {
  const [selectedPlanId, setSelectedPlanId] = useState('annual');
  const [notice, setNotice] = useState('');

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    setNotice(`${plan.name} selected successfully.`);
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <main className="educator-plans-page">
      <div className="educator-plans-topbar">
        <EducationBackButton onClick={onBack} label="Back to Educator Workspace" />
      </div>

      <header className="educator-plans-hero">
        <span className="educator-plans-eyebrow">EDUCATOR MEMBERSHIP</span>
        <h1>Choose Your Educator Plan</h1>
        <p>
          Select the plan that fits your teaching goals. Both plans include verified educator publishing access,
          transparent pricing, full learner management, and flexible cancellation policies.
        </p>
      </header>

      {notice && (
        <div className="educator-plans-notice" role="status">
          <span className="educator-plans-notice-icon">✓</span>
          <span>{notice}</span>
        </div>
      )}

      <div className="educator-plans-grid" role="region" aria-label="Educator membership plans">
        {PLANS_DATA.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <article
              key={plan.id}
              className={`educator-plan-card ${plan.popular ? 'educator-plan-card--popular' : ''} ${
                isSelected ? 'educator-plan-card--selected' : ''
              }`}
            >
              {plan.badge && (
                <div className="educator-plan-badge-wrap">
                  <span className={`educator-plan-badge ${plan.popular ? 'educator-plan-badge--popular' : ''}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header: Plan Name */}
              <div className="educator-plan-header">
                <h2 className="educator-plan-name">{plan.name}</h2>
                <p className="educator-plan-description">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="educator-plan-price-block">
                <div className="educator-plan-price-row">
                  <span className="educator-plan-price">{plan.price}</span>
                  <span className="educator-plan-period">{plan.period}</span>
                </div>
                {plan.equivalent && (
                  <span className="educator-plan-equivalent">{plan.equivalent}</span>
                )}
              </div>

              {/* Billing Cycle */}
              <div className="educator-plan-cycle-block">
                <div className="educator-plan-cycle-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <strong>Billing Cycle</strong>
                </div>
                <div className="educator-plan-cycle-val">{plan.billingCycle}</div>
                <small className="educator-plan-cycle-note">{plan.billingNote}</small>
              </div>

              <div className="educator-plan-divider" />

              {/* Benefits */}
              <div className="educator-plan-benefits-section">
                <h3 className="educator-plan-section-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Included Benefits
                </h3>
                <ul className="educator-plan-benefits-list">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="educator-plan-benefit-item">
                      <span className="educator-plan-check-icon">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="educator-plan-divider" />

              {/* Cancellation Policy */}
              <div className="educator-plan-cancellation-section">
                <h3 className="educator-plan-section-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Cancellation Policy
                </h3>
                <div className="educator-plan-cancellation-box">
                  <span className="educator-plan-cancellation-headline">
                    {plan.cancellationPolicy.headline}
                  </span>
                  <ul className="educator-plan-cancellation-list">
                    {plan.cancellationPolicy.details.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="educator-plan-action">
                <button
                  type="button"
                  className={`educator-plan-btn ${isSelected ? 'educator-plan-btn--selected' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isSelected ? 'Current Selection ✓' : plan.ctaText}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="educator-plans-footer">
        <div className="educator-plans-guarantee">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <strong>Transparent Educator Terms</strong>
            <p>
              Educator subscriptions support platform hosting, security, and member trust features. All plan
              changes take effect immediately. Payout details, tax documentation, and revenue sharing terms are
              managed directly inside your Financials dashboard.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

