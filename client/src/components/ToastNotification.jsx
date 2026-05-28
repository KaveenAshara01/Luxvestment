import React from 'react';
import { useCart } from '../context/CartContext';
import './ToastNotification.css';

const ToastNotification = () => {
    const { cartNotification, setCartNotification, isCartOpen } = useCart();

    // Do not show the floating toast if cart drawer is open (rendered inline inside drawer instead)
    if (!cartNotification || isCartOpen) return null;

    return (
        <div className="toast-wrapper">
            <div className={`toast-card ${cartNotification.type}`}>
                <div className="toast-body">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="toast-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span className="toast-message">{cartNotification.message}</span>
                </div>
                <button className="toast-close-btn" onClick={() => setCartNotification(null)}>×</button>
            </div>
        </div>
    );
};

export default ToastNotification;
