import React, { useEffect } from 'react';
import ReactDom from 'react-dom';

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  backgroundColor: 'var(--bg-color, #ffffff)',
  transform: 'translate(-50%, -50%)',
  zIndex: 1001,
  height: '90%',
  width: '90%',
  borderRadius: '16px',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)'
};

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, .7)',
  zIndex: 1000
};

export default function Modal({ children, onClose }) {
  // Escape closes the modal, and the page behind it stops scrolling while it
  // is open. Neither was handled before.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const portalRoot = document.getElementById('cart-root');
  if (!portalRoot) return null;

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} role="presentation" />
      <div style={MODAL_STYLES} role="dialog" aria-modal="true" aria-label="Cart">
        <button
          type="button"
          className="btn bg-danger fs-4 text-white"
          style={{ position: 'sticky', top: '10px', float: 'right', marginRight: '10px', zIndex: 2 }}
          onClick={onClose}
          aria-label="Close cart"
        >
          ×
        </button>
        {children}
      </div>
    </>,
    portalRoot
  );
}
