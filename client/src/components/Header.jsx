import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { selectedCurrency, changeCurrency, supportedCurrencies } = useCurrency();
    const { cartItems, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const totalItems = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <div className="top-bar">
                <div className="top-bar-left">
                    <i className="instagram-icon"></i>
                </div>
                <div className="top-bar-center">
                    <span>WORLDWIDE SHIPPING!</span>
                </div>
                <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Currency:</span>
                        <select 
                            value={selectedCurrency} 
                            onChange={(e) => changeCurrency(e.target.value)}
                            className="currency-select"
                        >
                        {supportedCurrencies && supportedCurrencies.map(currency => (
                            <option key={currency} value={currency} style={{color: 'black'}}>{currency}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    <div className="header-left">
                        <button className={`burger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    
                    <div className="logo-container">
                        <Link to="/" onClick={closeMenu}>
                            <img src="/logo.jpg" alt="Luxvestment" className="logo" />
                        </Link>
                    </div>

                    <div className="header-right">
                        <div className="header-icons">
                            <button className="icon-btn search-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                            
                            {user ? (
                                <div className="user-nav">
                                    <Link to="/profile" className="user-name">{user.name}</Link>
                                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                                </div>
                            ) : (
                                <Link to="/login" className="icon-btn account-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </Link>
                            )}

                            <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                {totalItems > 0 && (
                                    <span className="cart-badge">{totalItems}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Side Navigation Menu */}
            <div className={`side-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="side-menu-overlay" onClick={closeMenu}></div>
                <div className="side-menu-content">
                    <nav className="side-nav">
                        <ul>
                            <li><Link to="/shop" onClick={closeMenu}>Shop All</Link></li>
                            <li><Link to="/about" onClick={closeMenu}>Who are we?</Link></li>
                            <li><Link to="/sourcing" onClick={closeMenu}>Sourcing</Link></li>
                            <li><Link to="/authenticity" onClick={closeMenu}>Authenticity</Link></li>
                            <li><Link to="/policies" onClick={closeMenu}>Policies</Link></li>
                            {user && user.role === 'admin' && (
                                <li><Link to="/admin" onClick={closeMenu} className="admin-link">Admin Dashboard</Link></li>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Header;
