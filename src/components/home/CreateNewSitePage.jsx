import { useState } from 'react';
import { useSelector } from 'react-redux';
import { apiRequest } from '../../services/api';
import { normalizeSite, publicSiteUrl, displayUrl } from './miniSiteUtils';
import ImageCropper from './ImageCropper';
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

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CreateNewSitePage({ onCancel, onSiteCreated, initialName = '', templateName = '' }) {
  const authToken = useSelector(s => s.auth?.token);
  const [formData, setFormData] = useState({
    siteName: initialName,
    description: '',
    slug: initialName ? slugify(initialName) : '',
    visibility: 'public',
    password: '',
    logo: null,
    logoPreview: null,
    coverImages: [],
    coverImagePreviews: [],
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      businessHours: '',
      mapUrl: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropFile, setCropFile] = useState(null); // raw File pending crop for cover images
  const [cropLogoFile, setCropLogoFile] = useState(null); // raw File pending crop for logo

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
      coverImages: [...prev.coverImages, croppedFile],
      coverImagePreviews: [...prev.coverImagePreviews, dataUrl],
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

  const handleContactInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
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
    if (formData.visibility === 'password' && !formData.password.trim()) {
      newErrors.password = 'Password is required for a password-protected site';
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
    try {
      const res = await apiRequest('/api/mini-sites', {
        method: 'POST',
        token: authToken,
        body: {
          name: formData.siteName,
          description: formData.description,
          visibility: formData.visibility,
          password: formData.visibility === 'password' ? formData.password : null,
          logo: formData.logoPreview || undefined,
          coverImages: formData.coverImagePreviews.length > 0 ? formData.coverImagePreviews : undefined,
          contactInfo: Object.values(formData.contactInfo).some(v => v) ? formData.contactInfo : undefined,
        },
      });
      const newSite = normalizeSite(res?.data);
      onSiteCreated?.(newSite);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to create site' }));
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

          {/* Slug preview (auto-generated by the server from the site name) */}
          <div className="csp-form-group">
            <label className="csp-label">Site URL</label>
            <div className="csp-slug-input-wrapper">
              <input
                type="text"
                value={displayUrl(publicSiteUrl(formData.slug || 'your-site-name'))}
                readOnly
                className="csp-input csp-slug-input"
              />
            </div>
            <p className="csp-helper">Generated automatically from the site name.</p>
          </div>

          {/* Visibility */}
          <div className="csp-form-group">
            <label className="csp-label">Visibility</label>
            <div className="csp-visibility-options">
              {[
                { value: 'public', label: 'Public', Icon: GlobeIcon, description: 'Anyone can view' },
                { value: 'private', label: 'Private', Icon: LockIcon, description: 'Only you can view' },
                { value: 'password', label: 'Password Protected', Icon: KeyIcon, description: 'Requires password' },
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
                    <span className="csp-visibility-icon"><option.Icon /></span>
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
            {formData.visibility === 'password' && (
              <div className="csp-form-group" style={{ marginTop: 12 }}>
                <label className="csp-label">Site Password *</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter a password visitors will need"
                  className={`csp-input ${errors.password ? 'csp-input--error' : ''}`}
                />
                {errors.password && <p className="csp-error">{errors.password}</p>}
              </div>
            )}
          </div>

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

          {/* Cover Images Upload */}
          <div className="csp-form-group">
            <label className="csp-label">Cover Images</label>
            <div className="csp-image-upload">
              {/* Image Grid - Show all uploaded images */}
              {formData.coverImagePreviews.length > 0 && (
                <div className="csp-images-grid">
                  {formData.coverImagePreviews.map((preview, index) => (
                    <div key={index} className="csp-image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} className="csp-preview-img" />
                      <button
                        type="button"
                        className="csp-remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="Remove image"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area - Always visible */}
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
                <div className="csp-cover-url-fallback">
                  <span className="csp-cover-url-divider">or paste an image URL</span>
                  <input
                    type="text"
                    className="csp-input"
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      const url = e.target.value.trim();
                      if (url) {
                        setFormData(prev => ({
                          ...prev,
                          coverImages: [...prev.coverImages, url],
                          coverImagePreviews: [...prev.coverImagePreviews, url]
                        }));
                        e.target.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url) {
                        setFormData(prev => ({
                          ...prev,
                          coverImages: [...prev.coverImages, url],
                          coverImagePreviews: [...prev.coverImagePreviews, url]
                        }));
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </>
              {errors.coverImages && <p className="csp-error">{errors.coverImages}</p>}
              <p className="csp-helper">Upload multiple images. Recommended: 1200x600px for best results. Uploading a file currently fails on the server (known backend bug) — pasting a direct image URL works reliably in the meantime.</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="csp-form-group">
            <label className="csp-label">Contact Information (Optional)</label>
            <div className="csp-contact-grid">
              <div>
                <label className="csp-label csp-label--small">Email</label>
                <input
                  type="email"
                  className="csp-input"
                  placeholder="contact@example.com"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="csp-label csp-label--small">Phone</label>
                <input
                  type="tel"
                  className="csp-input"
                  placeholder="+1-234-567-8900"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="csp-label csp-label--small">Address</label>
                <input
                  type="text"
                  className="csp-input"
                  placeholder="123 Main St, New York, NY 10001"
                  value={formData.contactInfo.address}
                  onChange={(e) => handleContactInfoChange('address', e.target.value)}
                />
              </div>
              <div>
                <label className="csp-label csp-label--small">Business Hours</label>
                <input
                  type="text"
                  className="csp-input"
                  placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                  value={formData.contactInfo.businessHours}
                  onChange={(e) => handleContactInfoChange('businessHours', e.target.value)}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="csp-label csp-label--small">Google Maps URL</label>
                <input
                  type="url"
                  className="csp-input"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.contactInfo.mapUrl}
                  onChange={(e) => handleContactInfoChange('mapUrl', e.target.value)}
                />
              </div>
            </div>
            <p className="csp-helper">Fill in your contact details. Contact forms will send emails to the address above.</p>
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
