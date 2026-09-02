import { useState } from 'react';
import OrganizationRegistrationForm from './OrganizationRegistrationForm';

function OrganizationRegistrationDemo() {
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = (formData) => {
    console.log('Organization Registration Data:', formData);
    alert('✅ Organization registration submitted! Check console for data.');
    setShowForm(false);
  };

  return (
    <div style={{
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ color: '#fff', fontSize: '32px', margin: '0 0 10px 0' }}>
          Mini Sites Module
        </h1>
        <p style={{ color: '#64c8ff', fontSize: '16px', margin: 0 }}>
          Organization Registration Form Demo
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #64c8ff, #4a90e2)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 20px rgba(100, 200, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        + Create New Organization
      </button>

      {showForm && (
        <OrganizationRegistrationForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Info Section */}
      <div style={{
        marginTop: '60px',
        maxWidth: '600px',
        background: 'rgba(100, 200, 255, 0.05)',
        border: '1px solid rgba(100, 200, 255, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        color: '#e0e0e0',
        lineHeight: '1.6'
      }}>
        <h3 style={{ color: '#64c8ff', marginTop: 0 }}>Form Features:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✅ 2-page registration form</li>
          <li>✅ Form validation on each page</li>
          <li>✅ Image upload with preview (Logo & Banner)</li>
          <li>✅ Responsive design</li>
          <li>✅ Error handling with user feedback</li>
          <li>✅ Progress indicator</li>
          <li>✅ Smooth animations</li>
        </ul>

        <h3 style={{ color: '#64c8ff', marginTop: '20px' }}>Next Steps:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✓ Connect to backend API for registration</li>
          <li>✓ Add email validation & duplicate checking</li>
          <li>✓ Implement image upload to server</li>
          <li>✓ Add password strength indicator</li>
        </ul>
      </div>
    </div>
  );
}

export default OrganizationRegistrationDemo;
