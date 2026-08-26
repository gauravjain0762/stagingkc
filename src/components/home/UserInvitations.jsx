import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../../services/socket';
import { fetchUserInvitations, acceptInvitation, rejectInvitation } from '../../store/slices/invitationsSlice';
import './UserInvitations.css';

function UserInvitations() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector(s => s.auth);
  const {
    userInvitations,
    userInvitationsLoading,
    userInvitationsTotal,
    acceptingIds,
    rejectingIds,
  } = useSelector((s) => s.invitations);

  useEffect(() => {
    dispatch(fetchUserInvitations());

    // Socket.io listener for real-time invitations
    const socket = getSocket();
    if (!socket) return;
    const userId = authUser?._id || authUser?.id;

    if (userId) {
      // Join user room for personal notifications
      socket.emit('join:user', { userId });

      // Listen for new group invitations (real-time)
      socket.on('notification:new-invite', (data) => {
        console.log('📬 New group invite received:', data);
        // Refresh invitations list
        dispatch(fetchUserInvitations());
      });

      return () => {
        socket.emit('leave:user', { userId });
        socket.off('notification:new-invite');
      };
    }
  }, [dispatch, authUser]);

  if (userInvitationsLoading && userInvitations.length === 0) {
    return (
      <div className="user-invitations">
        <div className="user-invitations-loading">Loading invitations...</div>
      </div>
    );
  }

  if (userInvitations.length === 0) {
    return null;
  }

  return (
    <div className="user-invitations">
      <div className="user-invitations-header">
        <h3>Pending Invitations</h3>
        <span className="user-invitations-badge">{userInvitationsTotal}</span>
      </div>
      <div className="user-invitations-list">
        {userInvitations.map((inv) => {
          const invId = inv._id ?? inv.id;
          const isAccepting = acceptingIds.includes(invId);
          const isRejecting = rejectingIds.includes(invId);
          return (
            <div key={invId} className="user-invitations-item">
              <div className="user-invitations-group-info">
                <div className="user-invitations-avatar">
                  {inv.group?.coverImage ? (
                    <img src={inv.group.coverImage} alt={inv.group.name} />
                  ) : (
                    <div className="user-invitations-avatar-placeholder">
                      {(inv.group?.name ?? 'G')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-invitations-details">
                  <p className="user-invitations-group-name">{inv.group?.name}</p>
                  <p className="user-invitations-invited-by">
                    Invited by {inv.invitedBy?.name ?? 'Someone'}
                  </p>
                </div>
              </div>
              <div className="user-invitations-actions">
                <button
                  className="user-invitations-accept-btn"
                  onClick={() => dispatch(acceptInvitation(invId))}
                  disabled={isAccepting || isRejecting}
                >
                  {isAccepting ? '...' : 'Accept'}
                </button>
                <button
                  className="user-invitations-reject-btn"
                  onClick={() => dispatch(rejectInvitation(invId))}
                  disabled={isAccepting || isRejecting}
                >
                  {isRejecting ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserInvitations;
