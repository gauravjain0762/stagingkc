import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, createComment, deleteComment, likeComment, unlikeComment } from '../../store/slices/commentsSlice';
import { showToast } from '../../store/slices/toastSlice';
import './CommentSection.css';

function HeartIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
}

function CommentSection({ groupId, postId, onCommentCountChange }) {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((s) => s.auth);
  const { commentsByPost, commentLikes, creatingCommentPostIds, deletingCommentIds, commentsLoading } = useSelector((s) => s.comments);

  const comments = commentsByPost[postId] ?? [];
  const isCreating = creatingCommentPostIds.includes(postId);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments && comments.length === 0 && !commentsLoading) {
      dispatch(fetchComments({ groupId, postId, page: 1, limit: 50 }));
    }
  }, [showComments, dispatch, groupId, postId, comments.length, commentsLoading]);

  function handleAddComment() {
    if (!commentText.trim()) return;
    if (commentText.length > 500) {
      dispatch(showToast({ message: 'Comment must be 500 characters or less', type: 'error' }));
      return;
    }

    dispatch(createComment({ groupId, postId, text: commentText.trim() })).then((action) => {
      if (createComment.fulfilled.match(action)) {
        setCommentText('');
        dispatch(showToast({ message: 'Comment added', type: 'success' }));
        if (onCommentCountChange) onCommentCountChange(comments.length + 1);
      } else {
        dispatch(showToast({ message: 'Failed to add comment', type: 'error' }));
      }
    });
  }

  function handleDeleteComment(commentId) {
    if (!confirm('Delete this comment?')) return;
    dispatch(deleteComment({ groupId, postId, commentId })).then((action) => {
      if (deleteComment.fulfilled.match(action)) {
        dispatch(showToast({ message: 'Comment deleted', type: 'success' }));
        if (onCommentCountChange) onCommentCountChange(comments.length - 1);
      }
    });
  }

  function handleToggleLike(commentId, isCurrentlyLiked) {
    if (isCurrentlyLiked) {
      dispatch(unlikeComment({ groupId, postId, commentId }));
    } else {
      dispatch(likeComment({ groupId, postId, commentId }));
    }
  }

  return (
    <div className="comment-section">
      {/* Compose */}
      <div className="comment-compose">
        <div className="comment-compose-input-wrap">
          <input
            type="text"
            className="comment-compose-input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button
            className="comment-compose-btn"
            onClick={handleAddComment}
            disabled={!commentText.trim() || isCreating}
          >
            {isCreating ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Toggle Comments */}
      {comments.length > 0 && (
        <button className="comment-toggle" onClick={() => setShowComments(!showComments)}>
          {showComments ? '✕ Hide' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {/* Comments List */}
      {showComments && (
        <div className="comment-list">
          {commentsLoading && comments.length === 0 ? (
            <p className="comment-loading">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="comment-empty">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => {
              const cid = comment._id ?? comment.id;
              const isOwn = (authUser?._id ?? authUser?.id) === (comment.author?._id ?? comment.author?.id);
              const likeState = commentLikes[cid];
              const isLiked = likeState?.liked ?? false;
              const likeCount = likeState?.count ?? comment.likes ?? 0;
              const isDeletingComment = deletingCommentIds.includes(cid);

              // Use local user data as fallback when backend doesn't provide complete author info
              const authorName = comment.author?.name || (isOwn ? authUser?.fullName ?? authUser?.name : 'Unknown');
              const authorAvatar = comment.author?.avatar || (isOwn ? authUser?.avatar : null);
              const authorInitial = (authorName ?? 'U')[0].toUpperCase();

              return (
                <div key={cid} className="comment-item">
                  <div className="comment-avatar">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} />
                    ) : (
                      <div className="comment-avatar-placeholder">{authorInitial}</div>
                    )}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <p className="comment-author">{authorName}</p>
                      <p className="comment-time">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'now'}
                      </p>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-actions">
                      <button
                        className={`comment-like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={() => handleToggleLike(cid, isLiked)}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <HeartIcon /> {likeCount > 0 && <span>{likeCount}</span>}
                      </button>
                      {isOwn && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => handleDeleteComment(cid)}
                          disabled={isDeletingComment}
                          title="Delete comment"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
