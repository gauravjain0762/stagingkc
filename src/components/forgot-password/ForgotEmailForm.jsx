import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetOtp, clearForgotState } from '../../store/slices/forgotPasswordSlice';
import { showLogin } from '../../store/slices/uiSlice';

function Spinner() { return <span className="spinner" aria-hidden="true" />; }

export default function ForgotEmailForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.forgotPassword);
  const [email, setEmail] = useState('');

  useEffect(() => () => { dispatch(clearForgotState()); }, [dispatch]);

  function handleChange(e) {
    setEmail(e.target.value);
    if (error) dispatch(clearForgotState());
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) dispatch(sendResetOtp(email.trim()));
  }

  return (
    <div className="signup-left-panel">
      <div className="signup-logo">Kink Catalyst</div>

      <div className="signup-form-wrapper">
        <div className="signup-card fp-card">
          <button
            type="button"
            className="back-btn"
            onClick={() => dispatch(showLogin())}
            disabled={loading}
          >
            ← Back
          </button>

          <div className="signup-card-header">
            <h1 className="signup-title">Forgot password?</h1>
            <p className="signup-subtitle fp-subtitle">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            <div className="form-group">
              <label htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <p className="form-message form-message--error" role="alert">{error}</p>
            )}

            <button type="submit" className="submit-btn" disabled={loading || !email.trim()}>
              {loading ? <><Spinner /> Sending…</> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


