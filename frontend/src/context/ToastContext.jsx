import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

let _id = 0;

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: '#E6F4EE', border: '#14805D', color: '#14805D' },
  error:   { bg: '#FDECEC', border: '#DC3545', color: '#DC3545' },
  warning: { bg: '#FDF6E3', border: '#D4A017', color: '#B8860B' },
  info:    { bg: '#E8F2ED', border: '#0D6E4F', color: '#0D6E4F' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          const c = colors[toast.type] || colors.info;
          const Icon = icons[toast.type] || icons.info;
          return (
            <div
              key={toast.id}
              className="toast-item"
              onClick={() => dismiss(toast.id)}
              style={{ background: c.bg, borderColor: c.border, borderLeftColor: c.color }}
            >
              <Icon size={20} color={c.color} />
              <span className="toast-message">{toast.message}</span>
              <span className="toast-close">×</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 99999;
          pointer-events: none;
        }
        .toast-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          min-width: 280px;
          max-width: 400px;
          border: 1px solid;
          border-left-width: 4px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          pointer-events: all;
          cursor: pointer;
          animation: toastSlideIn 0.25s ease;
        }
        .toast-message {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }
        .toast-close {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
