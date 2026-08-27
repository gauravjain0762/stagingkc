import { useState } from 'react';
import './SiteSettingsPanel.css';

function UploadIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default function SiteSettingsPanel({ site = {}, onUpdate }) {
  const [settings, setSettings] = useState({
    logo: site.logo || '',
    logoPreview: site.logo || '',
    contactInfo: site.contactInfo || {
      email: '',
      phone: '',
      address: '',
      businessHours: '',
      mapUrl: '',
    },
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSettings(prev => ({
        ...prev,
        logo: evt.target.result,
        logoPreview: evt.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo: '',
      logoPreview: '',
    }));
  };

  const handleContactInfoChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onUpdate({
      logo: settings.logo || undefined,
      contactInfo: Object.values(settings.contactInfo).some(v => v) ? settings.contactInfo : undefined,
    });
  };

  return (
    <div className="site-settings-panel">
      <h2 className="ssp-title">Site Settings</h2>

      {/* Logo Section */}
      <div className="ssp-section">
        <h3 className="ssp-section-title">Logo</h3>
        <div className="ssp-logo-container">
          {settings.logoPreview ? (
            <div className="ssp-logo-preview">
              <img src={settings.logoPreview} alt="Logo" className="ssp-logo-img" />
              <button
                type="button"
                className="ssp-remove-btn"
                onClick={removeLogo}
                title="Remove logo"
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <label className="ssp-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="ssp-file-input"
              />
              <div className="ssp-upload-content">
                <UploadIcon />
                <p>Upload Logo</p>
                <span>PNG, JPG up to 2MB</span>
              </div>
            </label>
          )}
        </div>
        <p className="ssp-helper">Recommended: 200x200px square</p>
      </div>

      {/* Contact Info Section */}
      <div className="ssp-section">
        <h3 className="ssp-section-title">Contact Information</h3>
        <div className="ssp-contact-grid">
          <div className="ssp-field">
            <label className="ssp-label">Email</label>
            <input
              type="email"
              className="ssp-input"
              placeholder="contact@example.com"
              value={settings.contactInfo.email}
              onChange={(e) => handleContactInfoChange('email', e.target.value)}
            />
          </div>
          <div className="ssp-field">
            <label className="ssp-label">Phone</label>
            <input
              type="tel"
              className="ssp-input"
              placeholder="+1-234-567-8900"
              value={settings.contactInfo.phone}
              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
            />
          </div>
          <div className="ssp-field ssp-full-width">
            <label className="ssp-label">Address</label>
            <input
              type="text"
              className="ssp-input"
              placeholder="123 Main St, New York, NY 10001"
              value={settings.contactInfo.address}
              onChange={(e) => handleContactInfoChange('address', e.target.value)}
            />
          </div>
          <div className="ssp-field ssp-full-width">
            <label className="ssp-label">Business Hours</label>
            <input
              type="text"
              className="ssp-input"
              placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
              value={settings.contactInfo.businessHours}
              onChange={(e) => handleContactInfoChange('businessHours', e.target.value)}
            />
          </div>
          <div className="ssp-field ssp-full-width">
            <label className="ssp-label">Google Maps URL</label>
            <input
              type="url"
              className="ssp-input"
              placeholder="https://maps.google.com/?q=..."
              value={settings.contactInfo.mapUrl}
              onChange={(e) => handleContactInfoChange('mapUrl', e.target.value)}
            />
          </div>
        </div>
        <p className="ssp-helper">Contact forms will send emails to the address above</p>
      </div>

      {/* Save Button */}
      <button className="ssp-save-btn" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
