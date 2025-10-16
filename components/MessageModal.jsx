import React from 'react';

/**
 * Reusable modal component for displaying success or error messages.
 * Uses existing CSS classes defined in styles.css for styling (e.g., .modal-overlay, .modal-card).
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isVisible - Whether the modal should be displayed.
 * @param {string} props.title - The title of the modal (e.g., "Success!", "Error").
 * @param {string} props.content - The main message content.
 * @param {boolean} props.isError - If true, applies error styling; otherwise, applies success styling.
 * @param {function} props.onClose - Function to call when the modal is closed (e.g., clicking outside or the button).
 */
export default function MessageModal({ isVisible, title, content, isError, onClose }) {
  // Return null if the modal should not be visible
  if (!isVisible) {
    return null;
  }

  // Determine the CSS class based on the message type
  const modalClass = isError ? 'error-modal' : 'success-modal';

  // Determine button styles based on the message type
  const buttonStyle = {
    backgroundColor: isError ? 'var(--warning-color)' : 'var(--action-color-blue)',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  };

  // Stop propagation to prevent closing the modal when clicking inside the content box
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Modal Overlay: Clicks on the overlay trigger the onClose function
    <div className="modal-overlay" aria-modal="true" role="dialog" onClick={onClose}>
      {/* Modal Card: Applies the specific success or error border style */}
      <div className={`modal-card ${modalClass}`} onClick={handleCardClick}>
        <h2 className="modal-title">{title}</h2>
        <p style={{ margin: '15px 0', fontSize: '1rem', color: '#333' }}>{content}</p>
        <button
          className="modal-button"
          onClick={onClose}
          style={buttonStyle}
        >
          {/* Button text adapts based on success/error state */}
          {isError ? 'Close / Try Again' : 'Done'}
        </button>
      </div>
    </div>
  );
}
