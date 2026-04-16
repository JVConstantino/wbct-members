'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizeClass = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null);

  // Fechar com Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Travar scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-brand-strong/60 backdrop-blur-sm animate-fade-in" />

      {/* Dialog */}
      <div
        className={`relative w-full ${sizeClass[size] ?? sizeClass.md} bg-surface-card rounded-xl shadow-modal border border-border-default animate-scale-in ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h3 id="modal-title" className="text-base font-semibold text-text-primary font-display">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="btn-ghost p-1.5 rounded-md -mr-1"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
