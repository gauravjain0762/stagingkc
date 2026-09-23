import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { publicSiteUrl, displayUrl } from './miniSiteUtils';
import ImageCropper from './ImageCropper';
import { createMiniSite } from '../../services/miniSiteApi';
import { createStarterSections } from './sectionTemplates';
import { showToast } from '../../store/slices/toastSlice';
import './CreateNewSitePage.css';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function GlobeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function LockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
}
function KeyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L18 10"/></svg>;
}

function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CreateNewSitePage({ onCancel, onSiteCreated, initialName = '', templateName = '', organizationId = '' }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    siteName: initialName,
    description: '',
    slug: initialName ? slugify(initialName) : '',
    visibility: 'public',
    joinPolicy: 'anyone',
    memberListVisibility: 'everyone',
    logo: null,
    logoPreview: null,
    coverImages: [],
    coverImagePreviews: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropFile, setCropFile] = useState(null); // raw File pending crop for cover images
  const [cropLogoFile, setCropLogoFile] = useState(null); // raw File pending crop for logo
  const [activeTooltip, setActiveTooltip] = useState(null); // track which tooltip is visible

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
      slug: slugify(name),
    }));
    if (errors.siteName) {
      setErrors(prev => ({ ...prev, siteName: '' }));
    }
  };

  // Handle image upload — validate, then hand off to the cropper before
  // it ever lands in formData (same crop-first flow as ProfilePage/OnboardingForm).
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImages: 'Image size must be less than 5MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverImages: 'Please upload a valid image file' }));
      return;
    }
    if (errors.coverImages) setErrors(prev => ({ ...prev, coverImages: '' }));
    setCropFile(file);
  };


  const applyCroppedCover = async (croppedFile) => {
    setCropFile(null);
    const dataUrl = await fileToDataUrl(croppedFile);
    setFormData(prev => ({
      ...prev,
      coverImages: [croppedFile],
      coverImagePreviews: [dataUrl],
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      coverImages: prev.coverImages.filter((_, i) => i !== index),
      coverImagePreviews: prev.coverImagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'Logo size must be less than 2MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Please upload a valid image file' }));
      return;
    }
    if (errors.logo) setErrors(prev => ({ ...prev, logo: '' }));
    setCropLogoFile(file);
  };

  const applyLogoFromCropper = async (croppedFile) => {
    setCropLogoFile(null);
    const dataUrl = await fileToDataUrl(croppedFile);
    setFormData(prev => ({
      ...prev,
      logo: croppedFile,
      logoPreview: dataUrl,
    }));
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null,
      logoPreview: null,
    }));
  };



  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.siteName.trim()) {
      newErrors.siteName = 'Site name is required';
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

  // Helper function to convert File/Blob to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission — call API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!organizationId) {
      dispatch(showToast({
        message: 'Organization ID is required',
        type: 'error',
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Create starter sections with customized navbar and hero
      const starterSections = createStarterSections();

      // Convert logo to base64 if it exists
      let logoBase64 = null;
      if (formData.logo) {
        logoBase64 = await fileToBase64(formData.logo);
      }

      starterSections.forEach(section => {
        if (section.type === 'navbar') {
          section.content.logoText = formData.siteName;
          if (logoBase64) {
            section.content.logo = logoBase64;
          }
          // Pass orgId as query parameter to the mini site URL (will be set after site creation)
          section.content.secondaryCtaLink = `?showOrgModal=true&orgId=${organizationId}`;
        } else if (section.type === 'hero') {
          section.content.headline = 'Welcome to ' + formData.siteName;
          section.content.subheadline = formData.description || 'Your awesome website';
        }
      });

      // Remove IDs from sections — backend generates them
      const sectionsForApi = starterSections.map(({ id, ...section }) => section);

      // Convert cover image to base64 (use first image if multiple)
      let coverImageBase64 = null;
      if (formData.coverImages.length > 0) {
        const firstCoverImage = formData.coverImages[0];
        if (firstCoverImage instanceof File || firstCoverImage instanceof Blob) {
          coverImageBase64 = await fileToBase64(firstCoverImage);
        } else if (typeof firstCoverImage === 'string') {
          // Already a URL string, keep as is
          coverImageBase64 = firstCoverImage;
        }
      }

      const apiPayload = {
        name: formData.siteName,
        slug: formData.slug,
        type: 'website',
        description: formData.description,
        visibility: formData.visibility,
        sections: sectionsForApi,
      };

      // Add cover image if provided (singular, matching organization format)
      if (coverImageBase64) {
        apiPayload.coverImage = coverImageBase64;
      }

      // Add logo if provided
      if (logoBase64) {
        apiPayload.logo = logoBase64;
      }

      const response = await createMiniSite(organizationId, apiPayload);

      if (response?.data?.id) {
        dispatch(showToast({
          message: 'Mini site created successfully!',
          type: 'success',
        }));

        onSiteCreated?.(response.data);
      }
    } catch (err) {
      console.error('Mini site creation failed:', err);

      let errorMessage = 'Failed to create mini site. Please try again.';

      // Handle different error types
      if (err.status === 400) {
        errorMessage = err.data?.errors?.name || err.data?.message || err.message || 'Invalid site data';
      } else if (err.status === 409) {
        errorMessage = err.data?.message || err.message || 'Site name already exists. Please choose a different name.';
      } else if (err.status === 401) {
        errorMessage = 'You must be logged in to create a mini site.';
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to create a mini site for this organization.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      dispatch(showToast({
        message: '❌ ' + errorMessage,
        type: 'error',
      }));
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="create-site-page">
      <div className="csp-container">
        {/* Header */}
        <div className="csp-header">
          <button
            type="button"
            className="csp-close-btn"
            onClick={onCancel}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <h1 className="csp-title">Create New Site</h1>
          <p className="csp-subtitle">Build a beautiful website in minutes</p>
          {templateName && (
            <div className="csp-template-badge">Using the "{templateName}" template — you'll land in the editor with it pre-built, ready to customize.</div>
          )}
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
              maxLength="30"
            />
            {errors.siteName && <p className="csp-error">{errors.siteName}</p>}
            <p className="csp-helper">{formData.siteName.length}/30 characters</p>
          </div>

          {/* Site URL (Slug preview - auto-generated) */}
          <div className="csp-form-group">
            <label className="csp-label">Site URL</label>
            <div className="csp-url-display">
              <div className="csp-url-icon">🌐</div>
              <input
                type="text"
                value={displayUrl(publicSiteUrl(formData.slug || 'your-site-name'))}
                readOnly
                className="csp-url-input"
              />
            </div>
            <p className="csp-helper">Generated automatically from the site name.</p>
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

          {/* Settings Info Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative' }}>
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip('settings')}
              onMouseLeave={() => setActiveTooltip(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                position: 'relative'
              }}
            >
              <InfoIcon style={{ width: '20px', height: '20px' }} />
            </button>
            {activeTooltip === 'settings' && (
              <div className="csp-settings-tooltip">
                <div className="csp-tooltip-section">
                  <p className="csp-tooltip-title">Who can see this Mini-Site?</p>
                  <p><strong>Public</strong></p>
                  <p>Anyone can see</p>
                </div>
                <div className="csp-tooltip-divider"></div>
                <div className="csp-tooltip-section">
                  <p className="csp-tooltip-title">Who can join?</p>
                  <p><strong>Anyone can join</strong></p>
                  <p>No approval needed</p>
                </div>
                <div className="csp-tooltip-divider"></div>
                <div className="csp-tooltip-section">
                  <p className="csp-tooltip-title">Member List Visibility</p>
                  <p><strong>Everyone</strong></p>
                  <p>All members visible to all</p>
                </div>
              </div>
            )}
          </div>

          {/* Logo and Cover Images Row */}
          <div className="csp-logo-cover-row">
            {/* Logo Upload */}
            <div className="csp-form-group">
              <label className="csp-label">Logo (Optional)</label>
              <div className="csp-logo-upload">
                {formData.logoPreview ? (
                  <div className="csp-logo-preview">
                    <img src={formData.logoPreview} alt="Logo" className="csp-logo-img" />
                    <button
                      type="button"
                      className="csp-remove-logo-btn"
                      onClick={removeLogo}
                      title="Remove logo"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <label className="csp-logo-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="csp-file-input"
                    />
                    <div className="csp-upload-content">
                      <div className="csp-upload-icon"><UploadIcon /></div>
                      <p className="csp-upload-text">Upload Logo</p>
                      <p className="csp-upload-hint">PNG, JPG up to 2MB</p>
                    </div>
                  </label>
                )}
                {errors.logo && <p className="csp-error">{errors.logo}</p>}
                <p className="csp-helper">Use this logo for branding. Recommended: 200x200px.</p>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="csp-form-group">
              <label className="csp-label">Cover Image (Optional)</label>
            <div className="csp-image-upload">
              {/* Single Image Preview */}
              {formData.coverImagePreviews.length > 0 && (
                <div className="csp-image-preview">
                  <img src={formData.coverImagePreviews[0]} alt="Cover" className="csp-preview-img" />
                  <button
                    type="button"
                    className="csp-remove-image-btn"
                    onClick={() => removeImage(0)}
                    title="Remove image"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {/* Upload Area - Show only when no image */}
              {formData.coverImagePreviews.length === 0 && (
                <>
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
                </>
              )}
              {errors.coverImages && <p className="csp-error">{errors.coverImages}</p>}
              <p className="csp-helper">Recommended: 1200x600px for best results.</p>
            </div>
            </div>
          </div>

          {errors.submit && <p className="csp-error" style={{ textAlign: 'center' }}>{errors.submit}</p>}

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
    </div>

    {cropFile && (
      <ImageCropper
        file={cropFile}
        defaultAspect="cover"
        cropShape="rect"
        onCancel={() => setCropFile(null)}
        onSkip={() => applyCroppedCover(cropFile)}
        onSave={applyCroppedCover}
      />
    )}

    {cropLogoFile && (
      <ImageCropper
        file={cropLogoFile}
        defaultAspect="square"
        cropShape="round"
        onCancel={() => setCropLogoFile(null)}
        onSkip={() => applyLogoFromCropper(cropLogoFile)}
        onSave={applyLogoFromCropper}
      />
    )}
    </>
  );
}
