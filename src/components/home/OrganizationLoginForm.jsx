import { useState } from 'react';
import './OrganizationLoginForm.css';

function OrganizationLoginForm({ onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Get organization from localStorage
    const savedOrg = localStorage.getItem('userOrganization');
    if (!savedOrg) {
      setError('Organization not found. Please create an organization first.');
      setLoading(false);
      return;
    }

    try {
      const org = JSON.parse(savedOrg);

      // Check if email matches organization email
      if (email.toLowerCase() !== org.email.toLowerCase()) {
        setError('Email does not match organization email');
        setLoading(false);
        return;
      }

      // TODO: Call backend API to verify password
      // For now, mock verification
      if (password.length < 6) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      // Save login session to localStorage
      const loginData = {
        orgId: org.id,
        email: email,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('orgLoginSession', JSON.stringify(loginData));

      if (onLogin) {
        onLogin(loginData);
      }

      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function EyeIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  }

  function EyeOffIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  }

  return (
    <div className="org-login-overlay">
      <div className="org-login-modal">
        {/* Header */}
        <div className="org-login-header">
          <h1>Organization Login</h1>
          <button className="org-login-close" onClick={onClose}>×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="org-login-form">
          {/* Email */}
          <div className="org-login-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@organization.com"
              required
            />
          </div>

          {/* Password */}
          <div className="org-login-group">
            <label>Password</label>
            <div className="org-login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="org-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="org-login-error">{error}</div>}

          {/* Login Button */}
          <button type="submit" className="org-login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Organization'}
          </button>

          {/* Info */}
          <p className="org-login-info">
            ℹ️ Use the email and password you provided when creating the organization. Your admin must approve the organization first.
          </p>
        </form>
      </div>
    </div>
  );
}

export default OrganizationLoginForm;
