import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ImageCropper from './ImageCropper';
import { PhoneInput } from './CountryPicker';
import { createOrganization } from '../../services/organizationApi';
import { showToast } from '../../store/slices/toastSlice';
import './OrganizationRegistrationForm.css';

function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

function OrganizationRegistrationForm({ onClose, onSubmit }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Organization Information
    orgName: '',
    orgType: '',
    shortDesc: '',
    fullDesc: '',
    logo: null,
    coverImage: null,
    website: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    // Admin Information
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Crop queue states
  const [logoCropQueue, setLogoCropQueue] = useState([]);
  const [logoCropIdx, setLogoCropIdx] = useState(0);
  const [coverCropQueue, setCoverCropQueue] = useState([]);
  const [coverCropIdx, setCoverCropIdx] = useState(0);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === 'logo') {
        setLogoCropQueue([file]);
        setLogoCropIdx(0);
      } else if (fieldName === 'coverImage') {
        setCoverCropQueue([file]);
        setCoverCropIdx(0);
      }
    }
  };

  const handleLogoCropComplete = (croppedBlob) => {
    // Create preview from cropped blob
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setFormData(prev => ({
        ...prev,
        logo: croppedBlob
      }));
    };
    reader.readAsDataURL(croppedBlob);
    setLogoCropQueue([]);
  };

  const handleLogoCropSkip = () => {
    // Skip crop - use original file
    if (logoCropQueue[logoCropIdx]) {
      const file = logoCropQueue[logoCropIdx];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          logo: file
        }));
      };
      reader.readAsDataURL(file);
    }
    setLogoCropQueue([]);
  };

  const handleCoverCropComplete = (croppedBlob) => {
    // Create preview from cropped blob
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
      setFormData(prev => ({
        ...prev,
        coverImage: croppedBlob
      }));
    };
    reader.readAsDataURL(croppedBlob);
    setCoverCropQueue([]);
  };

  const handleCoverCropSkip = () => {
    // Skip crop - use original file
    if (coverCropQueue[coverCropIdx]) {
      const file = coverCropQueue[coverCropIdx];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          coverImage: file
        }));
      };
      reader.readAsDataURL(file);
    }
    setCoverCropQueue([]);
  };

  const validatePage1 = () => {
    const newErrors = {};

    if (!formData.orgName.trim()) newErrors.orgName = 'Organization name is required';
    if (!formData.orgType) newErrors.orgType = 'Organization type is required';
    if (!formData.shortDesc.trim()) newErrors.shortDesc = 'Short description is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePage2 = () => {
    const newErrors = {};

    if (!formData.adminFirstName.trim()) newErrors.adminFirstName = 'First name is required';
    if (!formData.adminLastName.trim()) newErrors.adminLastName = 'Last name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
    if (!formData.adminPhone.trim()) newErrors.adminPhone = 'Admin phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage1()) {
      setPage(2);
    }
  };

  const handleBack = () => {
    setPage(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validatePage2()) return;

    setLoading(true);
    try {
      // Convert File to base64
      const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

      // Prepare organization data as JSON with base64 images
      const orgPayload = {
        name: formData.orgName,
        type: formData.orgType,
        shortDescription: formData.shortDesc,
        fullDescription: formData.fullDesc,
      };

      // Add images as base64 if they exist
      if (formData.logo) {
        orgPayload.logo = await fileToBase64(formData.logo);
      }
      if (formData.coverImage) {
        orgPayload.coverImage = await fileToBase64(formData.coverImage);
      }

      // Call API to create organization
      const response = await createOrganization(orgPayload);

      if (response?.data?.id) {
        const orgData = {
          id: response.data.id,
          name: response.data.name,
          type: response.data.type,
          slug: response.data.slug,
          status: response.data.status,
          createdAt: response.data.createdAt,
        };

        // Check if status is pending (needs admin approval)
        if (response.data.status === 'pending') {
          dispatch(showToast({
            message: '✋ Organization submitted! Waiting for admin approval. We\'ll notify you once it\'s approved.',
            type: 'info',
          }));
        } else if (response.data.status === 'approved') {
          // Save to localStorage only if approved
          localStorage.setItem('userOrganization', JSON.stringify(orgData));

          dispatch(showToast({
            message: '✅ Organization approved and ready to use!',
            type: 'success',
          }));
        }

        if (onSubmit) {
          onSubmit(response.data);
        }

        // Close form after short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Organization creation failed:', error);

      let errorMessage = 'Failed to create organization. Please try again.';

      // Handle different error types
      if (error.status === 400) {
        errorMessage = error.data?.errors?.name || error.message || 'Invalid organization data';
      } else if (error.status === 409) {
        errorMessage = 'Organization name already exists. Please choose a different name.';
      } else if (error.status === 401) {
        errorMessage = 'You must be logged in to create an organization.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(showToast({
        message: '❌ ' + errorMessage,
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="org-registration-overlay">
      <div className="org-registration-modal">
        {/* Header */}
        <div className="org-reg-header">
          <h1>Register Your Organization</h1>
          <p>Step {page} of 2</p>
          <button className="org-reg-close" onClick={onClose}>×</button>
        </div>

        {/* Progress Bar */}
        <div className="org-reg-progress">
          <div className={`org-reg-progress-bar ${page >= 1 ? 'active' : ''}`}></div>
          <div className={`org-reg-progress-bar ${page >= 2 ? 'active' : ''}`}></div>
        </div>

        {/* Form Content */}
        <div className="org-reg-content">
          {page === 1 ? (
            <>
              {/* Page 1: Organization Information */}
              <div className="org-reg-section">
                <h2>A. Organization Information</h2>

                {/* Organization Name */}
                <div className="org-reg-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    name="orgName"
                    placeholder="Enter organization name"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    className={errors.orgName ? 'error' : ''}
                  />
                  {errors.orgName && <span className="org-reg-error">{errors.orgName}</span>}
                </div>

                {/* Organization Type */}
                <div className="org-reg-group">
                  <label>Organization Type *</label>
                  <select
                    name="orgType"
                    value={formData.orgType}
                    onChange={handleInputChange}
                    className={errors.orgType ? 'error' : ''}
                  >
                    <option value="">Select an option</option>
                    <option value="club">Club</option>
                    <option value="organization">Organization</option>
                    <option value="community">Community</option>
                    <option value="business">Business</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.orgType && <span className="org-reg-error">{errors.orgType}</span>}
                </div>

                {/* Descriptions */}
                <div className="org-reg-group">
                  <label>Short Description *</label>
                  <textarea
                    name="shortDesc"
                    placeholder="Brief description (max 100 characters)"
                    maxLength="100"
                    value={formData.shortDesc}
                    onChange={handleInputChange}
                    className={errors.shortDesc ? 'error' : ''}
                    rows="2"
                  />
                  <span className="org-reg-char-count">{formData.shortDesc.length}/100</span>
                  {errors.shortDesc && <span className="org-reg-error">{errors.shortDesc}</span>}
                </div>

                <div className="org-reg-group">
                  <label>Full Description (optional)</label>
                  <textarea
                    name="fullDesc"
                    placeholder="Detailed description of your organization"
                    value={formData.fullDesc}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>

                {/* File Uploads */}
                <div className="org-reg-row">
                  <div className="org-reg-group org-reg-file-group">
                    <label>Organization Logo (optional)</label>
                    <div className="org-reg-file-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        id="logo-input"
                      />
                      <label htmlFor="logo-input" className="org-reg-file-label">
                        <span>📷 Choose Logo</span>
                      </label>
                    </div>
                    {logoPreview && (
                      <div className="org-reg-preview">
                        <img src={logoPreview} alt="Logo preview" />
                      </div>
                    )}
                  </div>

                  <div className="org-reg-group org-reg-file-group">
                    <label>Cover/Banner Image (optional)</label>
                    <div className="org-reg-file-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverImage')}
                        id="cover-input"
                      />
                      <label htmlFor="cover-input" className="org-reg-file-label">
                        <span>🖼️ Choose Banner</span>
                      </label>
                    </div>
                    {coverPreview && (
                      <div className="org-reg-preview org-reg-preview-banner">
                        <img src={coverPreview} alt="Banner preview" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="org-reg-group">
                  <label>Website URL (optional)</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Contact Information */}
                <div className="org-reg-row">
                  <div className="org-reg-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="contact@organization.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="org-reg-error">{errors.email}</span>}
                  </div>

                  <div className="org-reg-group">
                    <label>Phone Number *</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(val) => {
                        setFormData(prev => ({ ...prev, phone: val }));
                        if (errors.phone) {
                          setErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="(555) 000-0000"
                      hasError={!!errors.phone}
                    />
                    {errors.phone && <span className="org-reg-error">{errors.phone}</span>}
                  </div>
                </div>

                {/* Location */}
                <div className="org-reg-row">
                  <div className="org-reg-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="e.g., United States, India, Canada"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={errors.country ? 'error' : ''}
                    />
                    {errors.country && <span className="org-reg-error">{errors.country}</span>}
                  </div>

                  <div className="org-reg-group">
                    <label>State/Province *</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State or province"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="org-reg-error">{errors.state}</span>}
                  </div>
                </div>

                <div className="org-reg-row">
                  <div className="org-reg-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="org-reg-error">{errors.city}</span>}
                  </div>

                  <div className="org-reg-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="org-reg-error">{errors.address}</span>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Page 2: Admin Information */}
              <div className="org-reg-section">
                <h2>B. Organization Contact / Admin</h2>

                <div className="org-reg-row">
                  <div className="org-reg-group">
                    <label>Admin First Name *</label>
                    <input
                      type="text"
                      name="adminFirstName"
                      placeholder="First name"
                      value={formData.adminFirstName}
                      onChange={handleInputChange}
                      className={errors.adminFirstName ? 'error' : ''}
                    />
                    {errors.adminFirstName && <span className="org-reg-error">{errors.adminFirstName}</span>}
                  </div>

                  <div className="org-reg-group">
                    <label>Admin Last Name *</label>
                    <input
                      type="text"
                      name="adminLastName"
                      placeholder="Last name"
                      value={formData.adminLastName}
                      onChange={handleInputChange}
                      className={errors.adminLastName ? 'error' : ''}
                    />
                    {errors.adminLastName && <span className="org-reg-error">{errors.adminLastName}</span>}
                  </div>
                </div>

                <div className="org-reg-group">
                  <label>Admin Email *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    placeholder="admin@organization.com"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className={errors.adminEmail ? 'error' : ''}
                  />
                  {errors.adminEmail && <span className="org-reg-error">{errors.adminEmail}</span>}
                </div>

                <div className="org-reg-group">
                  <label>Admin Phone *</label>
                  <PhoneInput
                    value={formData.adminPhone}
                    onChange={(val) => {
                      setFormData(prev => ({ ...prev, adminPhone: val }));
                      if (errors.adminPhone) {
                        setErrors(prev => ({ ...prev, adminPhone: '' }));
                      }
                    }}
                    placeholder="(555) 000-0000"
                    hasError={!!errors.adminPhone}
                  />
                  {errors.adminPhone && <span className="org-reg-error">{errors.adminPhone}</span>}
                </div>

                <div className="org-reg-row">
                  <div className="org-reg-group">
                    <label>Password *</label>
                    <div className="org-reg-password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="org-reg-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.password && <span className="org-reg-error">{errors.password}</span>}
                  </div>

                  <div className="org-reg-group">
                    <label>Confirm Password *</label>
                    <div className="org-reg-password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="org-reg-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="org-reg-error">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Buttons */}
        <div className="org-reg-footer">
          {page === 2 && (
            <button className="org-reg-btn org-reg-btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          )}
          {page === 1 && (
            <button className="org-reg-btn org-reg-btn-primary" onClick={handleNext}>
              Next →
            </button>
          )}
          {page === 2 && (
            <button
              className="org-reg-btn org-reg-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </button>
          )}
        </div>
      </div>

      {/* Logo Image Cropper */}
      {logoCropQueue.length > 0 && (
        <ImageCropper
          key={`logo-${logoCropIdx}`}
          file={logoCropQueue[logoCropIdx]}
          onSave={handleLogoCropComplete}
          onSkip={handleLogoCropSkip}
          onCancel={() => { setLogoCropQueue([]); setLogoCropIdx(0); }}
          defaultAspect="square"
          cropShape="round"
        />
      )}

      {/* Cover Image Cropper */}
      {coverCropQueue.length > 0 && (
        <ImageCropper
          key={`cover-${coverCropIdx}`}
          file={coverCropQueue[coverCropIdx]}
          onSave={handleCoverCropComplete}
          onSkip={handleCoverCropSkip}
          onCancel={() => { setCoverCropQueue([]); setCoverCropIdx(0); }}
          defaultAspect="landscape"
          cropShape="rect"
        />
      )}
    </div>
  );
}

export default OrganizationRegistrationForm;
