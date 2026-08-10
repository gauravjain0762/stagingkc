import { useState } from 'react';
import { DEFAULT_STARTER_SECTIONS } from './sectionTemplates';
import ImageCropper from './ImageCropper';
import './CreateNewSitePage.css';

function UploadIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default function CreateNewSitePage({ onCancel, onSiteCreated }) {
  const [formData, setFormData] = useState({
    siteName: '',
    description: '',
    slug: '',
    visibility: 'public',
    coverImage: null,
    coverImagePreview: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropQueue, setCropQueue] = useState([]);
  const [cropIndex, setCropIndex] = useState(0);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Generate slug from site name
  const handleSiteNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      siteName: name,
      slug: name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-'),
    }));
    if (errors.siteName) {
      setErrors(prev => ({ ...prev, siteName: '' }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Image size must be less than 5MB',
        }));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Please upload a valid image file',
        }));
        return;
      }

      // Add file to crop queue
      setCropQueue([file]);
      setCropIndex(0);
      if (errors.coverImage) {
        setErrors(prev => ({ ...prev, coverImage: '' }));
      }
    }
  };

  const handleCropSave = (croppedFile) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        coverImage: croppedFile,
        coverImagePreview: event.target.result,
      }));
    };
    reader.readAsDataURL(croppedFile);
    setCropQueue([]);
    setCropIndex(0);
  };

  const handleCropSkip = () => {
    const original = cropQueue[cropIndex];
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        coverImage: original,
        coverImagePreview: event.target.result,
      }));
    };
    reader.readAsDataURL(original);
    setCropQueue([]);
    setCropIndex(0);
  };

  const handleCropCancel = () => {
    setCropQueue([]);
    setCropIndex(0);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.siteName.trim()) {
      newErrors.siteName = 'Site name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (formData.siteName.length > 50) {
      newErrors.siteName = 'Site name must be less than 50 characters';
    }
    if (formData.description.length > 160) {
      newErrors.description = 'Description must be less than 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Creating site with:', {
        siteName: formData.siteName,
        description: formData.description,
        slug: formData.slug,
        visibility: formData.visibility,
        coverImage: formData.coverImage?.name || 'default-cover.jpg',
      });

      // Mock site creation
      const newSite = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.siteName,
        description: formData.description,
        url: `${formData.slug}.kicksite.io`,
        slug: formData.slug,
        status: 'draft',
        visibility: formData.visibility,
        views: 0,
        lastEdited: 'just now',
        coverImage: formData.coverImagePreview || 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&fit=crop',
        sections: DEFAULT_STARTER_SECTIONS,
      };

      console.log('Navigate to: Builder page with site:', newSite);

      // Trigger callback to navigate to builder
      if (onSiteCreated) {
        onSiteCreated(newSite);
      } else {
        // Mock navigation
        window.location.hash = `#/mini-sites/builder/${newSite.id}`;
      }

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="create-site-page">
      <div className="csp-container">
        {/* Header */}
        <div className="csp-header">
          <h1 className="csp-title">Create New Site</h1>
          <p className="csp-subtitle">Build a beautiful website in minutes</p>
        </div>

        {/* Form */}
        <form className="csp-form" onSubmit={handleSubmit}>
          {/* Site Name */}
          <div className="csp-form-group">
            <label className="csp-label">Site Name *</label>
            <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleSiteNameChange}
              placeholder="Enter site name (e.g., My Portfolio)"
              className={`csp-input ${errors.siteName ? 'csp-input--error' : ''}`}
              maxLength="50"
            />
            {errors.siteName && <p className="csp-error">{errors.siteName}</p>}
            <p className="csp-helper">{formData.siteName.length}/50 characters</p>
          </div>

          {/* Description */}
          <div className="csp-form-group">
            <label className="csp-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of your site (optional)"
              className={`csp-textarea ${errors.description ? 'csp-textarea--error' : ''}`}
              rows="3"
              maxLength="160"
            />
            {errors.description && <p className="csp-error">{errors.description}</p>}
            <p className="csp-helper">{formData.description.length}/160 characters</p>
          </div>

          {/* Slug */}
          <div className="csp-form-group">
            <label className="csp-label">Site URL (Slug) *</label>
            <div className="csp-slug-input-wrapper">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="site-slug"
                className={`csp-input csp-slug-input ${errors.slug ? 'csp-input--error' : ''}`}
              />
              <span className="csp-slug-suffix">.kicksite.io</span>
            </div>
            {errors.slug && <p className="csp-error">{errors.slug}</p>}
            <p className="csp-helper">Lowercase letters, numbers, and hyphens only</p>
          </div>

          {/* Visibility */}
          <div className="csp-form-group">
            <label className="csp-label">Visibility</label>
            <div className="csp-visibility-options">
              {[
                { value: 'public', label: 'Public', icon: '🌐', description: 'Anyone can view' },
                { value: 'private', label: 'Private', icon: '🔒', description: 'Only you can view' },
                { value: 'password', label: 'Password Protected', icon: '🔐', description: 'Requires password' },
              ].map(option => (
                <label key={option.value} className="csp-visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={formData.visibility === option.value}
                    onChange={handleInputChange}
                    className="csp-radio-input"
                  />
                  <div className="csp-visibility-card">
                    <span className="csp-visibility-icon">{option.icon}</span>
                    <div className="csp-visibility-content">
                      <p className="csp-visibility-label">{option.label}</p>
                      <p className="csp-visibility-desc">{option.description}</p>
                    </div>
                    <div className={`csp-visibility-check ${formData.visibility === option.value ? 'csp-visibility-check--active' : ''}`}>
                      <CheckIcon />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="csp-form-group">
            <label className="csp-label">Cover Image</label>
            <div className="csp-image-upload">
              {formData.coverImagePreview ? (
                <div className="csp-image-preview">
                  <img src={formData.coverImagePreview} alt="Preview" className="csp-preview-img" />
                  <button
                    type="button"
                    className="csp-remove-image-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      coverImage: null,
                      coverImagePreview: null,
                    }))}
                    title="Remove image"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <label className="csp-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="csp-file-input"
                  />
                  <div className="csp-upload-content">
                    <div className="csp-upload-icon"><UploadIcon /></div>
                    <p className="csp-upload-text">Click to upload or drag and drop</p>
                    <p className="csp-upload-hint">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </label>
              )}
              {errors.coverImage && <p className="csp-error">{errors.coverImage}</p>}
              <p className="csp-helper">Recommended: 1200x600px for best results</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="csp-actions">
            <button
              type="button"
              className="csp-btn csp-btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="csp-btn csp-btn--create"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>

      {cropQueue.length > 0 && (
        <ImageCropper
          key={cropIndex}
          file={cropQueue[cropIndex]}
          index={cropIndex}
          total={cropQueue.length}
          defaultAspect="landscape"
          cropShape="rect"
          onCancel={handleCropCancel}
          onSkip={handleCropSkip}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
