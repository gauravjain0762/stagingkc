import { useState, useEffect } from 'react';
import './MiniSiteCard.css';

function ChevronLeftIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}

function ChevronRightIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

export function ImageCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!autoRotate || !hasMultipleImages) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(timer);
  }, [autoRotate, hasMultipleImages, images.length]);

  const handlePrevImage = () => {
    setAutoRotate(false);
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setAutoRotate(false);
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="image-carousel">
        <div className="image-carousel-placeholder">
          <div className="placeholder-text">Social Platform</div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-carousel" onMouseEnter={() => setAutoRotate(false)} onMouseLeave={() => setAutoRotate(true)}>
      <div className="image-carousel-container">
        <img
          src={images[currentIndex]}
          alt={`Site image ${currentIndex + 1}`}
          className="image-carousel-img"
        />
      </div>

      {hasMultipleImages && (
        <>
          {/* Navigation Buttons */}
          <button
            className="image-carousel-btn image-carousel-btn--prev"
            onClick={handlePrevImage}
            title="Previous image"
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="image-carousel-btn image-carousel-btn--next"
            onClick={handleNextImage}
            title="Next image"
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </button>

          {/* Indicators */}
          <div className="image-carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`image-carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setAutoRotate(false);
                  setCurrentIndex(index);
                }}
                title={`Go to image ${index + 1}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MiniSiteCard({ site, onEdit, onDelete, onView }) {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(site);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Delete this site?')) {
      onDelete?.(site._id);
    }
  };

  const handleView = () => {
    onView?.(site);
  };

  return (
    <div className="mini-site-card">
      {/* Image Carousel */}
      <div className="msc-image-section" onClick={handleView}>
        <ImageCarousel images={site.coverImages} />
      </div>

      {/* Content */}
      <div className="msc-content">
        <h3 className="msc-title">{site.name}</h3>
        <p className="msc-description">{site.description || 'No description'}</p>

        {/* Metadata */}
        <div className="msc-metadata">
          <span className="msc-visibility">{site.visibility === 'password' ? '🔒 Password' : site.visibility === 'private' ? '🔒 Private' : '🌐 Public'}</span>
          <span className="msc-url">{site.slug}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="msc-actions">
        <button className="msc-action-btn msc-action-view" onClick={handleView} title="View site">
          View
        </button>
        <button className="msc-action-btn msc-action-edit" onClick={handleEdit} title="Edit site">
          Edit
        </button>
        <button className="msc-action-btn msc-action-delete" onClick={handleDelete} title="Delete site">
          Delete
        </button>
      </div>
    </div>
  );
}
