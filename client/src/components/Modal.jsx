import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose} aria-hidden="true">
      <div 
        className="modal" 
        style={{ maxWidth: wide ? 680 : 520 }} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose} 
            aria-label="Close dialog"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
