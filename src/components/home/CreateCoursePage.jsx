import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ImageCropper from './ImageCropper';
import { courseApi } from '../../services/courseApi';
import './CreateCoursePage.css';

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function UploadIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}

export default function CreateCoursePage({ onBack, onMessagesClick, onEventsClick, onGroupsClick, onCalendarClick, onLibraryClick, onMinisitesClick }) {
  const authToken = useSelector(s => s.auth?.token);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'development',
    level: 'beginner',
    price: '0',
    pricingType: 'free',
    status: 'draft',
    coverImage: null,
  });
  const [customCategory, setCustomCategory] = useState('');
  const [cropperFile, setCropperFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);

  const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

  // A File/Blob can't be used directly as an <img src> — it needs a blob
  // URL. Derived once per file (not inline in JSX, which created — and
  // leaked — a new one on every render) and revoked when it's replaced.
  const coverPreviewUrl = useMemo(() => {
    const coverImage = courseData.coverImage;
    if (coverImage instanceof Blob || coverImage instanceof File) {
      return URL.createObjectURL(coverImage);
    }
    return coverImage || null;
  }, [courseData.coverImage]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImageError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Unsupported file format. Please upload a PNG, JPG, GIF, or WEBP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Please upload a file under 10MB.');
      return;
    }
    setCropperFile(file);
  };

  const handleCropSave = (croppedFile) => {
    setCourseData(prev => ({
      ...prev,
      coverImage: croppedFile,
    }));
    setCropperFile(null);
  };

  const handleCropSkip = () => {
    if (cropperFile) {
      setCourseData(prev => ({
        ...prev,
        coverImage: cropperFile,
      }));
      setCropperFile(null);
    }
  };

  const handleCropCancel = () => {
    setCropperFile(null);
  };

  const handleCreateCourse = async (publishNow) => {
    if (!authToken) {
      setError('User not authenticated. Please login first.');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Get the actual file from the blob if coverImage is a data URL
      let fileToUpload = null;
      if (courseData.coverImage) {
        // If it's already stored as a blob/file, use it directly
        // Otherwise, it's a data URL and we need to convert it
        if (courseData.coverImage instanceof File || courseData.coverImage instanceof Blob) {
          fileToUpload = courseData.coverImage;
        }
      }

      const response = await courseApi.createCourse({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category === 'other' ? customCategory : courseData.category,
        level: courseData.level,
        status: 'draft',
        price: courseData.pricingType === 'free' ? 0 : parseFloat(courseData.price),
        coverImage: fileToUpload,
      }, authToken);

      if (!response.success) {
        setError(response.error || 'Failed to create course');
        return;
      }

      // Courses are always created as a draft first (that's the endpoint
      // contract); publishing immediately just chains the publish call so
      // the user only has to make one choice up front instead of two trips.
      if (publishNow) {
        const newCourseId = response.course?.id ?? response.course?._id;
        if (newCourseId) {
          try {
            await courseApi.publishCourse(newCourseId, authToken);
          } catch (publishErr) {
            console.error('Course created but publish failed:', publishErr);
            setError('Course saved as draft, but publishing failed. You can publish it from My Courses.');
            setTimeout(() => onBack?.(), 2500);
            return;
          }
        }
      }

      setTimeout(() => {
        onBack?.();
      }, 1500);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err?.message || err?.error || 'Failed to create course');
    } finally {
      setIsCreating(false);
    }
  };

  const handleNav = (id) => {
    if (id === 'home') onBack?.();
    if (id === 'library') onLibraryClick?.();
    if (id === 'messages') onMessagesClick?.();
    if (id === 'events') onEventsClick?.();
    if (id === 'friends') onGroupsClick?.();
    if (id === 'calendar') onCalendarClick?.();
    if (id === 'minisites') onMinisitesClick?.();
  };

  const isFormValid = courseData.title.trim() && courseData.description.trim() && courseData.coverImage;

  return (
    <div className="ccp-page">
      <div className="ccp-container">
        {/* Header */}
        <div className="ccp-header">
          <h1 className="ccp-title">Create New Course</h1>
        </div>

        {/* Single Page Form */}
        <div className="ccp-form">
          {/* Course Info Section */}
          <div className="ccp-section">
            <h2 className="ccp-section-title">Course Information</h2>

            <div className="ccp-form-group">
              <label className="ccp-label">Course Title *</label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                placeholder="e.g., Advanced React Patterns"
                className="ccp-input"
                maxLength={100}
              />
              <p className="ccp-hint">{courseData.title.length}/100 characters</p>
            </div>

            <div className="ccp-form-group">
              <label className="ccp-label">Description *</label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                placeholder="What will students learn? Include key topics, prerequisites, and outcomes."
                className="ccp-textarea"
                rows={4}
                maxLength={500}
              />
              <p className="ccp-hint">{courseData.description.length}/500 characters</p>
            </div>

            <div className="ccp-row">
              <div className="ccp-form-group">
                <label className="ccp-label">Category *</label>
                <select name="category" value={courseData.category} onChange={handleInputChange} className="ccp-select">
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
                {courseData.category === 'other' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter your category"
                    className="ccp-input ccp-custom-input"
                    maxLength={50}
                  />
                )}
              </div>

              <div className="ccp-form-group">
                <label className="ccp-label">Level *</label>
                <select name="level" value={courseData.level} onChange={handleInputChange} className="ccp-select">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="ccp-row">
              <div className="ccp-form-group">
                <label className="ccp-label">Pricing Type *</label>
                <select name="pricingType" value={courseData.pricingType} onChange={handleInputChange} className="ccp-select">
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="ccp-form-group">
                <label className="ccp-label">Price (USD) {courseData.pricingType === 'paid' && '*'}</label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  placeholder={courseData.pricingType === 'paid' ? 'e.g., 49.99' : 'Not required for free courses'}
                  className="ccp-input"
                  min="0"
                  step="0.01"
                  disabled={courseData.pricingType === 'free'}
                />
              </div>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="ccp-section">
            <h2 className="ccp-section-title">Course Cover Image</h2>
            <p className="ccp-section-desc">Upload a professional cover image (recommended: 1200x600px)</p>

            <div className="ccp-image-upload">
              {coverPreviewUrl ? (
                <div className="ccp-image-preview">
                  <img src={coverPreviewUrl} alt="Cover" className="ccp-preview-img" />
                  <button
                    type="button"
                    className="ccp-change-btn"
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="ccp-upload-area" onClick={() => document.getElementById('imageInput').click()}>
                  <UploadIcon />
                  <p className="ccp-upload-text">Click to upload or drag and drop</p>
                  <p className="ccp-upload-hint">PNG, JPG, GIF up to 10MB</p>
                </label>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            {imageError && <p className="ccp-image-error">{imageError}</p>}

            {/* Course Preview — only once there's a real cover image to show;
                no stock-photo stand-in for a course that has none yet. */}
            {coverPreviewUrl && (
              <div className="ccp-preview-card">
                <div className="ccp-preview-wrapper">
                  <img
                    src={coverPreviewUrl}
                    alt="Preview"
                    className="ccp-preview-cover"
                  />
                  <div className="ccp-preview-overlay">
                    <h3 className="ccp-preview-title">{courseData.title || 'Course Title'}</h3>
                    <p className="ccp-preview-category">{courseData.category === 'other' ? customCategory : courseData.category} • {courseData.level}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

        {/* Action Buttons */}
        <div className="ccp-actions">
          <button className="ccp-btn ccp-btn--secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            className="ccp-btn ccp-btn--draft"
            onClick={() => handleCreateCourse(false)}
            disabled={!isFormValid || isCreating}
          >
            <CheckIcon /> Draft
          </button>
          <button
            className="ccp-btn ccp-btn--publish"
            onClick={() => handleCreateCourse(true)}
            disabled={!isFormValid || isCreating}
          >
            <PlusIcon /> Publish
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperFile && (
        <ImageCropper
          file={cropperFile}
          defaultAspect="cover"
          cropShape="rect"
          onSave={handleCropSave}
          onSkip={handleCropSkip}
          onCancel={handleCropCancel}
        />
      )}

      {/* Creating Course Loader */}
      {isCreating && (
        <div className="ccp-loader-container">
          <div className="ccp-loader-content">
            <div className="ccp-loader-spinner">
              <div className="ccp-spinner"></div>
            </div>
            <h1 className="ccp-loader-title">Kink Catalyst</h1>
            <p className="ccp-loader-subtitle">Creating course...</p>
          </div>
        </div>
      )}
    </div>
  );
}
