import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../services/api';
import { showToast } from '../../store/slices/toastSlice';
import { setPage } from '../../store/slices/uiSlice';
import './InviteJoinPage.css';

function CloseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function GlobeIcon() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function LoadingIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
}

export default function InviteJoinPage({ token, onClose }) {
  const dispatch = useDispatch();
  const { token: authToken, user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState(null);

  const handleClose = () => {
    localStorage.removeItem('pendingInviteToken');
    onClose?.();
  };

  // Fetch organization details from token metadata
  useEffect(() => {
    if (!token) {
      setError('No invite token provided');
      setLoading(false);
      return;
    }

    // Try to get org details (this would be returned from a token-info endpoint)
    // For now, we'll fetch it when user attempts to join
    setLoading(false);
  }, [token]);

  const handleJoinViaInvite = async () => {
    if (!authToken || !user) {
      // Save invite token to localStorage for after login
      localStorage.setItem('pendingInviteToken', token);

      dispatch(showToast({
        message: 'ℹ️ Please login first to join this organization',
        type: 'info'
      }));

      // Redirect to login
      dispatch(setPage('login'));
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const data = await apiRequest('/api/organizations/join-by-invite', {
        method: 'POST',
        token: authToken,
        body: { token }
      });

      if (data.success || data.data) {
        const orgName = data?.data?.organizationName || 'Organization';
        dispatch(showToast({
          message: `✅ Successfully joined ${orgName}!`,
          type: 'success'
        }));

        // Clear pending invite token
        localStorage.removeItem('pendingInviteToken');

        // Redirect to mini sites page after 1.5 seconds
        setTimeout(() => {
          onClose?.();
          window.location.href = '/minisites';
        }, 1500);
      } else {
        const errorMsg = data?.message || 'Failed to join organization';
        setError(errorMsg);
        dispatch(showToast({
          message: `❌ ${errorMsg}`,
          type: 'error'
        }));
      }
    } catch (err) {
      console.error('Join via invite error:', err);

      let errorMsg = 'Failed to join organization';

      if (err.status === 404) {
        errorMsg = '🔗 This invite link is invalid or has expired';
      } else if (err.status === 409) {
        errorMsg = '✓ You are already a member of this organization';
      } else if (err.status === 410) {
        errorMsg = '⏰ This invite link has expired (7-day limit)';
      } else if (err.message?.includes('already used')) {
        errorMsg = '✓ This invite link has already been used';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      dispatch(showToast({
        message: `❌ ${errorMsg}`,
        type: 'error'
      }));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="invite-join-overlay" onClick={onClose}>
      <div className="invite-join-modal" onClick={(e) => e.stopPropagation()}>
        <button className="invite-join-close" onClick={handleClose}>
          <CloseIcon />
        </button>

        <div className="invite-join-header">
          <div className="invite-join-icon">
            <GlobeIcon />
          </div>
          <h2 className="invite-join-title">You've Been Invited!</h2>
          <p className="invite-join-subtitle">Join this organization using your invite link</p>
        </div>

        <div className="invite-join-body">
          {error && (
            <div className="invite-join-error">
              <p>{error}</p>
            </div>
          )}

          <div className="invite-join-info">
            <p className="invite-join-text">
              You have a special invite link to join this organization.
              Click the button below to join instantly!
            </p>
          </div>

          {!authToken && (
            <div className="invite-join-warning">
              <p>💡 You need to be logged in to join. Click the button to login first.</p>
            </div>
          )}

          <button
            className="invite-join-btn"
            onClick={handleJoinViaInvite}
            disabled={joining || loading}
          >
            {joining ? (
              <>
                <LoadingIcon />
                Joining...
              </>
            ) : authToken ? (
              'Join via Invite'
            ) : (
              'Login & Join'
            )}
          </button>

          <p className="invite-join-note">
            ℹ️ This link is one-time use and expires in 7 days
          </p>
        </div>
      </div>
    </div>
  );
}
