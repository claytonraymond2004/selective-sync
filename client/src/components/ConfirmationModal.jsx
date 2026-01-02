
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDestructive = false, isWarning = false }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getBorderColor = () => {
        if (isDestructive) return '1px solid var(--error)';
        if (isWarning) return '1px solid var(--warning)';
        return 'none';
    };

    const getTitleColor = () => {
        if (isDestructive) return 'var(--error)';
        if (isWarning) return 'var(--warning)';
        return 'var(--text-main)';
    };

    const getBtnClass = () => {
        if (isDestructive) return 'btn-danger';
        if (isWarning) return 'btn-warning';
        return 'btn-primary';
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
            }}
        >
            <div className="card animate-enter" style={{ width: 400, maxWidth: '90%', border: getBorderColor() }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: getTitleColor() }}>
                        {(isDestructive || isWarning) && <AlertTriangle size={20} />}
                        {title}
                    </h3>
                    <button onClick={onClose}><X size={20} color="white" /></button>
                </div>

                <p style={{ marginBottom: 24, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`btn ${getBtnClass()} `}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
