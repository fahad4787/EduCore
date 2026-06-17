import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FormModal = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  submitText = 'Save',
  children,
  size = 'lg',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`form-modal form-modal--${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="form-modal__header">
          <h3>{title}</h3>
          <button type="button" className="form-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-modal__body">{children}</div>
          <div className="form-modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loader-spinner sm" /> : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FormModal;
