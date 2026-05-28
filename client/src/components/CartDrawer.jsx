import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import './CartDrawer.css';

const CartDrawer = () => {
    const { 
        cartItems, 
        isCartOpen, 
        setIsCartOpen, 
        updateQuantity, 
        removeFromCart, 
        getCartTotal,
        cartNotification,
        setCartNotification
    } = useCart();
    const { convertPrice, selectedCurrency } = useCurrency();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const total = getCartTotal(convertPrice, selectedCurrency);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h2>
                    <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {cartNotification && (
                    <div className={`cart-inline-alert ${cartNotification.type}`}>
                        <div className="alert-message-content">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>{cartNotification.message}</span>
                        </div>
                        <button className="clear-alert-btn" onClick={() => setCartNotification(null)}>×</button>
                    </div>
                )}

                <div className="cart-content">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is currently empty.</p>
                            <button className="pill-btn continue-shopping" onClick={() => setIsCartOpen(false)}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="cart-item-list">
                            {cartItems.map((item) => {
                                const prod = item.product;
                                const itemPrice = convertPrice(prod.price, prod.currency || 'LKR');
                                return (
                                    <div key={prod._id} className="cart-item">
                                        <div className="cart-item-img">
                                            <img src={prod.images?.[0]?.url} alt={prod.name} />
                                        </div>
                                        <div className="cart-item-info">
                                            <div className="cart-item-top">
                                                <h4>{prod.name}</h4>
                                                <button className="remove-item-btn" onClick={() => removeFromCart(prod._id)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            <span className="cart-item-brand">{prod.brand || 'COACH'}</span>
                                            
                                            <div className="cart-item-bottom">
                                                <div className="cart-qty-controls">
                                                    <button onClick={() => updateQuantity(prod._id, item.quantity - 1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(prod._id, item.quantity + 1)}>+</button>
                                                </div>
                                                <span className="cart-item-price">
                                                    {selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}
                                                    {(itemPrice * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {selectedCurrency}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        {!user && (
                            <div className="cart-login-reminder" onClick={() => {
                                setIsCartOpen(false);
                                navigate('/login');
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10 17 15 12 10 7"></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                <span>Log in to keep your cart items permanent.</span>
                            </div>
                        )}
                        <div className="cart-subtotal">
                            <span>Subtotal</span>
                            <span className="subtotal-amount">
                                {selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}
                                {total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {selectedCurrency}
                            </span>
                        </div>
                        <p className="taxes-note">Taxes included. Shipping calculated at checkout.</p>
                        <button className="checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
