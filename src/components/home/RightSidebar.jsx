import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGallery, uploadPhoto } from '../../store/slices/profileSlice';
import SkeletonImg from '../SkeletonImg';
import { courseApi } from '../../services/courseApi';

function CameraIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }
function GradCapIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>; }

export default function RightSidebar({ onAddEducationClick, onGalleryClick }) {
  const dispatch = useDispatch();
  const { profile, gallery, galleryTotal } = useSelector(s => s.profile);
  const authToken = useSelector(s => s.auth?.token);
  const userId = useSelector(s => s.auth?.user?._id ?? s.auth?.user?.id);
  const photoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  // Same source as the Learning Activity page's "Ongoing Courses" — the
  // real backend enrollment list, not the localStorage-only mock.
  useEffect(() => {
    if (!authToken || !userId) return;
    let cancelled = false;
    courseApi.getUserEnrolledCourses(userId, authToken)
      .then(res => {
        if (!cancelled && res.success) setEnrolledCourses(res.courses || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authToken, userId]);

  // Shown in place of enrolled courses when the user hasn't enrolled in
  // anything yet — same "GET all courses" endpoint the Explore tab uses.
  useEffect(() => {
    let cancelled = false;
    courseApi.getAllCourses('all', null, authToken, 1, 3)
      .then(res => {
        if (!cancelled && res.success) setSuggestedCourses(res.courses || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authToken]);

  const displayedGallery = gallery.slice(0, 6);
  const extraCount = galleryTotal > 6 ? galleryTotal - 6 : 0;

  function handlePhotoChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    dispatch(uploadPhoto({ files: file }))
      .then(() => dispatch(fetchGallery()))
      .finally(() => setUploading(false));
  }

  return (
    <aside className="home-right-sidebar">

      {/* Learning */}
      <div className="right-card">
        <div className="right-section-header" style={{ padding: '12px 14px 10px' }}>
          <p className="right-section-title">{enrolledCourses.length > 0 ? 'Learning' : 'Suggested Courses'}</p>
          {(enrolledCourses.length > 0 || suggestedCourses.length > 0) && (
            <button className="section-link" style={{ marginLeft: 'auto' }} onClick={onAddEducationClick}>View all</button>
          )}
        </div>
        {enrolledCourses.length > 0 ? (
          <div className="event-list" style={{ padding: '0 14px 14px' }}>
            {enrolledCourses.slice(0, 3).map(course => (
              <div key={course.id} className="sidebar-event-item" style={{ cursor: 'pointer' }} onClick={onAddEducationClick}>
                <div className="event-thumb" style={{ overflow: 'hidden', position: 'relative' }}>
                  <SkeletonImg
                    src={course.coverImage || course.img}
                    alt={course.title}
                    fallback={
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2540', color: '#3b82f6' }}>
                        <GradCapIcon />
                      </div>
                    }
                  />
                </div>
                <div className="friend-info">
                  <p className="friend-name">{course.title}</p>
                  <p className="friend-sub">{course.progress || 0}% complete</p>
                </div>
              </div>
            ))}
          </div>
        ) : suggestedCourses.length > 0 ? (
          <div className="event-list" style={{ padding: '0 14px 14px' }}>
            {suggestedCourses.slice(0, 3).map(course => (
              <div key={course.id} className="sidebar-event-item" style={{ cursor: 'pointer' }} onClick={onAddEducationClick}>
                <div className="event-thumb" style={{ overflow: 'hidden', position: 'relative' }}>
                  <SkeletonImg
                    src={course.coverImage || course.img}
                    alt={course.title}
                    fallback={
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2540', color: '#3b82f6' }}>
                        <GradCapIcon />
                      </div>
                    }
                  />
                </div>
                <div className="friend-info">
                  <p className="friend-name">{course.title}</p>
                  <p className="friend-sub">{course.instructor ?? course.category ?? ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '0 14px 14px' }}>
            <button className="gallery-add-first-btn" onClick={onAddEducationClick}>
              <GradCapIcon /> Add your first chapter
            </button>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="right-card">
        <div className="right-section-header" style={{ padding: '12px 14px 10px' }}>
          <p className="right-section-title">Gallery</p>
          {displayedGallery.length > 0 && (
            <button className="section-link" style={{ marginLeft: 'auto' }} onClick={onGalleryClick}>View all</button>
          )}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChosen}
        />

        {displayedGallery.length === 0 ? (
          <div style={{ padding: '0 14px 14px' }}>
            <button
              className="gallery-add-first-btn"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
            >
              <CameraIcon />
              {uploading ? 'Uploading…' : 'Add your first photo'}
            </button>
          </div>
        ) : (
          <div className="gallery-grid">
            {displayedGallery.map((src, i) => (
              <div
                key={i}
                className="gallery-thumb"
                style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onClick={() => setLightboxSrc(src)}
              >
                <SkeletonImg src={src} alt="" />
                {i === 5 && extraCount > 0 && <div className="gallery-more">+{extraCount}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <div className="rs-gallery-lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="rs-gallery-lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close">✕</button>
          <img src={lightboxSrc} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}

    </aside>
  );
}
