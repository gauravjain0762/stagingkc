import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, goToStep, clearForgotState } from '../../store/slices/forgotPasswordSlice';
import { showLogin } from '../../store/slices/uiSlice';

function Spinner() { return <span className="spinner" aria-hidden="true" />; }

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function RequirementDot({ met }) {
  return (
    <span className={`req-dot${met ? ' req-dot--met' : ''}`} aria-hidden="true" />
  );
}

export default function ResetPasswordForm() {
  const dispatch = useDispatch();
  const { loading, error, step } = useSelector((s) => s.forgotPassword);

  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [mismatch, setMismatch]             = useState(false);

  useEffect(() => () => { dispatch(clearForgotState()); }, [dispatch]);

  const hasLength  = newPassword.length >= 8;
  const hasSymbol  = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setMismatch(true); return; }
    setMismatch(false);
    dispatch(resetPassword(newPassword));
  }

  // After success, redirect to login
  if (step === 'done') {
    return (
      <div className="signup-left-panel">
        <div className="signup-logo">Kink Catalyst</div>
        <div className="signup-form-wrapper">
          <div className="signup-card fp-card">
            <div className="fp-success-icon" aria-hidden="true">✓</div>
            <h1 className="signup-title" style={{ textAlign: 'center', marginTop: 12 }}>
              Password reset!
            </h1>
            <p className="signup-subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
              Your password has been reset successfully.
            </p>
            <button
              type="button"
              className="submit-btn"
              onClick={() => dispatch(showLogin())}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-left-panel">
      <div className="signup-logo">Kink Catalyst</div>

      <div className="signup-form-wrapper">
        <div className="signup-card fp-card">
          <button
            type="button"
            className="back-btn"
            onClick={() => dispatch(goToStep('otp'))}
            disabled={loading}
          >
            ← Back
          </button>

          <div className="signup-card-header">
            <h1 className="signup-title">Reset password?</h1>
            <p className="signup-subtitle">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="rp-new">New Password</label>
              <div className="password-input-wrap">
                <input
                  id="rp-new"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setMismatch(false); if (error) dispatch(clearForgotState()); }}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>

            {/* Requirements */}
            <ul className="req-list">
              <li className="req-item">
                <RequirementDot met={hasLength} />
                <span className={hasLength ? 'req-text req-text--met' : 'req-text'}>
                  At least 8 characters
                </span>
              </li>
              <li className="req-item">
                <RequirementDot met={hasSymbol} />
                <span className={hasSymbol ? 'req-text req-text--met' : 'req-text'}>
                  Contains a number or symbol
                </span>
              </li>
            </ul>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="rp-confirm">Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  id="rp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setMismatch(false); }}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {mismatch && (
              <p className="form-message form-message--error" role="alert">
                Passwords do not match.
              </p>
            )}

            {error && (
              <p className="form-message form-message--error" role="alert">{error}</p>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !hasLength || !hasSymbol || !confirmPassword}
            >
              {loading ? <><Spinner /> Resetting…</> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


