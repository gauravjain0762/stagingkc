import { useState } from 'react';
import ImageCropper from './ImageCropper';
import './NavbarLogoEditor.css';

function UploadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default function NavbarLogoEditor({ logo = null, onChange }) {
  const [logoPreview, setLogoPreview] = useState(logo);
  const [cropFile, setCropFile] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be less than 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }
    setCropFile(file);
  };

  const handleCropSave = async (croppedFile) => {
    setCropFile(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoPreview(evt.target.result);
      onChange(evt.target.result);
    };
    reader.readAsDataURL(croppedFile);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    onChange(null);
  };

  return (
    <>
      <div className="navbar-logo-editor">
        <label className="nle-label">Logo</label>

        {logoPreview ? (
          <div className="nle-preview-container">
            <img src={logoPreview} alt="Logo" className="nle-logo-preview" />
            <button
              type="button"
              className="nle-remove-btn"
              onClick={removeLogo}
              title="Remove logo"
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <label className="nle-upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="nle-file-input"
            />
            <UploadIcon /> Upload Logo
          </label>
        )}
        <p className="nle-helper">Square format recommended, 200x200px</p>
      </div>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          defaultAspect="square"
          cropShape="round"
          onCancel={() => setCropFile(null)}
          onSkip={() => handleCropSave(cropFile)}
          onSave={handleCropSave}
        />
      )}
    </>
  );
}
