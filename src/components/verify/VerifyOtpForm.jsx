import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, resendOtp, clearAuthState, resetToSignup } from '../../store/slices/authSlice';
import OtpInput from './OtpInput';

function LoadingContent() {
  return (
    <>
      <span className="btn-dots" aria-hidden="true">
        <span className="btn-dot" />
        <span className="btn-dot" />
        <span className="btn-dot" />
      </span>
      Verifying…
    </>
  );
}

function SuccessContent() {
  return (
    <>
      <span className="btn-status-circle btn-status-circle--success" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            className="check-path"
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="btn-state-text">Verified!</span>
    </>
  );
}

function ErrorContent() {
  return (
    <>
      <span className="btn-status-circle btn-status-circle--error" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="2" y1="2" x2="8" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="2" x2="2" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="btn-state-text">Invalid code</span>
    </>
  );
}

export default function VerifyOtpForm() {
  const dispatch = useDispatch();
  const { resendLoading, error, successMessage, registrationData } = useSelector(
    (state) => state.auth
  );

  const [otp, setOtp] = useState('');
  const [btnState, setBtnState] = useState('idle'); // 'idle'|'loading'|'success'|'error'

  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      dispatch(clearAuthState());
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [dispatch]);

  function handleOtpChange(val) {
    setOtp(val);
    if (error || successMessage) dispatch(clearAuthState());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length < 6) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);

    setBtnState('loading');
    const result = await dispatch(verifyOtp(otp));
    const next = verifyOtp.rejected.match(result) ? 'error' : 'success';
    setBtnState(next);

    resetTimer.current = setTimeout(() => setBtnState('idle'), 2200);
  }

  function handleResend() {
    dispatch(resendOtp());
    setOtp('');
  }

  function handleBack() {
    dispatch(resetToSignup());
  }

  const isIdle = btnState === 'idle';

  return (
    <div className="signup-left-panel">
      <div className="signup-logo">Kink Catalyst</div>

      <div className="signup-form-wrapper">
        <div className="signup-card verify-card">
          <button
            type="button"
            className="back-btn"
            onClick={handleBack}
            disabled={!isIdle}
          >
            ← Back to login
          </button>

          <div className="signup-card-header verify-header">
            <h1 className="signup-title">Verification</h1>
            <p className="signup-subtitle">
              We&apos;ve sent a code to{' '}
              <span className="email-highlight">{registrationData?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              disabled={!isIdle}
            />

            {error && (
              <p className="form-message form-message--error" role="alert">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="form-message form-message--success" role="status">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              className={`submit-btn submit-btn--${btnState}`}
              disabled={btnState !== 'idle' || otp.length < 6}
            >
              {btnState === 'idle'    && 'Verify'}
              {btnState === 'loading' && <LoadingContent />}
              {btnState === 'success' && <SuccessContent />}
              {btnState === 'error'   && <ErrorContent />}
            </button>
          </form>

          <p className="signin-text">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resendLoading || !isIdle}
            >
              {resendLoading ? 'Sending…' : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


