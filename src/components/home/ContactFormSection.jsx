import { useState } from 'react';
import { apiRequest } from '../../services/api';
import './ContactFormSection.css';

export default function ContactFormSection({ siteId, contactEmail }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Debug logging
  console.log('ContactFormSection props:', { siteId, contactEmail });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submit clicked with data:', formData);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      console.log('Validation failed - empty fields');
      setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (!contactEmail) {
      console.log('Validation failed - no contactEmail');
      setSubmitStatus({ type: 'error', message: 'Site owner email not configured' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending to:', `/api/mini-sites/${siteId}/contact`);
      const response = await apiRequest(`/api/mini-sites/${siteId}/contact`, {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          recipientEmail: contactEmail,
        },
      });
      console.log('API Response:', response);
      setSubmitStatus({ type: 'success', message: 'Message sent successfully!' });
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      console.error('API Error:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Failed to send message' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-section">
      <h2 className="cfs-title">Contact</h2>
      <p className="cfs-subtitle">Send us a message and we'll get back to you.</p>

      <form className="cfs-form" onSubmit={handleSubmit}>
        <div className="cfs-group">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="cfs-input"
          />
        </div>

        <div className="cfs-group">
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="cfs-input"
          />
        </div>

        <div className="cfs-group">
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="cfs-textarea"
            rows="5"
          />
        </div>

        {submitStatus && (
          <div className={`cfs-status cfs-status--${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}

        <button
          type="submit"
          className="cfs-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
