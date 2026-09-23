import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportReasons, reportPost, reportUser, reportComment, reportReply } from '../../store/slices/postsSlice';
import { apiRequest } from '../../services/api';

// commentId + replyId both set → reporting a reply (commentId is its parent).
// commentId set, replyId not → reporting a top-level comment.
// Neither set → reporting the post itself (falls back to reportPost/reportUser).
// siteId set → use mini-site API instead of general posts API.
// groupId set (with siteId) → the post lives inside a mini-site Group, not
// the mini-site's main Feed, so it hits the groups/:groupId/posts endpoint.
export default function ReportModal({ postId, userId, commentId, replyId, siteId, groupId, onClose }) {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  const { reportReasons, reasonsLoading, reportSubmitting } = useSelector(s => s.posts);
  const [selected, setSelected] = useState('');
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reportReasons.length === 0) dispatch(fetchReportReasons());
  }, [dispatch, reportReasons.length]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (!selected || reportSubmitting || isSubmitting) return;

    if (siteId) {
      // Mini-site report
      setIsSubmitting(true);
      const endpoint = replyId
        ? `/${postId}/comments/${commentId}/replies/${replyId}/report`
        : commentId
          ? `/${postId}/comments/${commentId}/report`
          : `/${postId}/report`;
      const basePath = groupId
        ? `/api/mini-sites/${siteId}/groups/${groupId}/posts${endpoint}`
        : `/api/mini-sites/${siteId}/feed${endpoint}`;

      try {
        await apiRequest(basePath, {
          method: 'POST',
          token,
          body: { reason: selected }
        });
        setDone(true);
      } catch (err) {
        console.error('Failed to submit report:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // General post report via Redux
      const action = userId
        ? reportUser({ userId, reason: selected })
        : replyId
          ? reportReply({ postId, commentId, replyId, reason: selected })
          : commentId
            ? reportComment({ postId, commentId, reason: selected })
            : reportPost({ postId, reason: selected });
      const result = await dispatch(action);
      if (!result.error) setDone(true);
    }
  }

  function handleOverlay(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="report-overlay" onClick={handleOverlay}>
      <div className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div className="report-modal-header">
          <h2 className="report-modal-title" id="report-title">
            {userId ? 'Report User' : replyId ? 'Report Reply' : commentId ? 'Report Comment' : 'Report'}
          </h2>
          <button className="report-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {done ? (
          <div className="report-success">
            <div className="report-success-icon">✓</div>
            <p>Thank you for your report. We'll review it and take action if it violates our community guidelines.</p>
            <button className="report-success-close" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="report-modal-body">
              <h3 className="report-question">What's going on?</h3>
              <p className="report-subtitle">
                We'll check for all community guidelines, so don't worry about making the perfect choice.
              </p>

              {reasonsLoading ? (
                <p style={{ color: '#5c6a8c', fontSize: '13px', padding: '8px 0' }}>Loading…</p>
              ) : (
                <ul className="report-reasons">
                  {reportReasons.map(reason => (
                    <li key={reason} className="report-reason-item">
                      <label className="report-reason-label">
                        <span className={`report-radio${selected === reason ? ' report-radio--checked' : ''}`} />
                        <input
                          type="radio"
                          name="report-reason"
                          value={reason}
                          checked={selected === reason}
                          onChange={() => setSelected(reason)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                        <span className="report-reason-text">{reason}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="report-modal-footer">
              <button
                className="report-submit-btn"
                onClick={handleSubmit}
                disabled={!selected || reportSubmitting}
              >
                {reportSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
