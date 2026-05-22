import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { createOrderApi } from '../utils/api';
import './Checkout.css';

// Popular international countries mapping to various Royal Mail zones
const COUNTRIES = [
    'United Kingdom',
    'United States',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Ireland',
    'Netherlands',
    'Sri Lanka',
    'Australia',
    'Canada',
    'India',
    'Singapore',
    'Japan',
    'New Zealand',
    'South Africa',
    'United Arab Emirates',
    'Switzerland',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Belgium',
    'Austria',
    'Portugal'
];

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { convertPrice, selectedCurrency } = useCurrency();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'United Kingdom', // Default country
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: ''
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: user.name || '',
                customerEmail: user.email || ''
            }));
        }
    }, [user]);

    // Dynamic Royal Mail Worldwide shipping calculator
    useEffect(() => {
        const getRoyalMailRates = (countryName) => {
            const c = (countryName || '').trim().toLowerCase();
            if (!c) return [];

            const isUK = c === 'uk' || c === 'united kingdom' || c === 'england' || c === 'scotland' || c === 'wales' || c === 'ireland' || c === 'gb' || c === 'great britain';
            const isEurope = ['france', 'germany', 'italy', 'spain', 'netherlands', 'belgium', 'switzerland', 'austria', 'portugal', 'sweden', 'norway', 'denmark', 'finland', 'greece', 'ireland'].includes(c);
            const isUSA = c === 'usa' || c === 'united states' || c === 'united states of america' || c === 'us';

            if (isUK) {
                return [
                    { id: 'rm_48', name: 'Royal Mail Tracked 48 (2-3 Days)', gbpPrice: 3.95 },
                    { id: 'rm_24', name: 'Royal Mail Tracked 24 (1-2 Days)', gbpPrice: 5.95 },
                    { id: 'rm_sd', name: 'Royal Mail Special Delivery (Guaranteed 1pm)', gbpPrice: 9.95 }
                ];
            } else if (isEurope) {
                return [
                    { id: 'rm_int_std_eu', name: 'Royal Mail International Standard', gbpPrice: 9.95 },
                    { id: 'rm_int_tr_eu', name: 'Royal Mail International Tracked', gbpPrice: 12.95 }
                ];
            } else if (isUSA) {
                return [
                    { id: 'rm_int_tr_us', name: 'Royal Mail International Tracked', gbpPrice: 22.95 }
                ];
            } else {
                // Asia, South America, Australia, Sri Lanka etc.
                return [
                    { id: 'rm_int_econ', name: 'Royal Mail International Economy (Insured)', gbpPrice: 14.95 },
                    { id: 'rm_int_tr_row', name: 'Royal Mail International Tracked', gbpPrice: 19.95 }
                ];
            }
        };

        const methods = getRoyalMailRates(formData.country);
        setShippingMethods(methods);
        if (methods.length > 0) {
            setSelectedMethod(methods[0]);
        } else {
            setSelectedMethod(null);
        }
    }, [formData.country]);

    if (cartItems.length === 0 && !successOrder) {
        return (
            <div className="checkout-page container empty-checkout">
                <h2>Your Cart is Empty</h2>
                <p>You cannot checkout with an empty cart.</p>
                <Link to="/shop" className="pill-btn">Return to Shop</Link>
            </div>
        );
    }

    const subtotal = getCartTotal(convertPrice, selectedCurrency);
    
    // Dynamic Shipping Rate Conversion
    const getShippingCost = (method) => {
        if (!method) return 0;
        return convertPrice(method.gbpPrice, 'GBP');
    };

    const shippingCostConverted = getShippingCost(selectedMethod);
    const total = subtotal + shippingCostConverted;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Country suggestion handlers
    const handleCountryChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, country: val }));
        
        if (val.trim()) {
            const filtered = COUNTRIES.filter(c => 
                c.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions(COUNTRIES);
            setShowSuggestions(true);
        }
    };

    const selectCountry = (country) => {
        setFormData(prev => ({ ...prev, country }));
        setShowSuggestions(false);
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.customerName || !formData.customerEmail || !formData.address || !formData.cardNumber) {
            setErrorMsg('Please fill in all required shipping and payment details.');
            return;
        }

        setProcessing(true);

        try {
            // Prepare order data
            const orderItems = cartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            }));

            const shippingMethodLabel = selectedMethod 
                ? `${selectedMethod.name} (${selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}${shippingCostConverted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`
                : 'Free Standard Shipping';

            const orderPayload = {
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                paymentMethod: `Credit Card (${formData.cardNumber.slice(-4)}) [via ${shippingMethodLabel}]`,
                items: orderItems,
                totalAmount: total
            };

            const createdOrder = await createOrderApi(orderPayload);
            await clearCart();
            setProcessing(false);
            setSuccessOrder(createdOrder);
        } catch (err) {
            setProcessing(false);
            setErrorMsg(err.response?.data?.message || 'Error processing your payment or verifying stock.');
        }
    };

    if (successOrder) {
        return (
            <div className="checkout-success-container container">
                <div className="success-card">
                    <div className="success-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1>Payment Successful!</h1>
                    <p className="order-num">Order #{successOrder._id.substring(successOrder._id.length - 8)}</p>
                    <p className="success-note">
                        Thank you for your purchase. Your payment was authorized successfully via credit/debit card, and your items are being prepared for Royal Mail shipment.
                    </p>
                    <div className="success-actions">
                        {user ? (
                            <Link to="/profile" className="pill-btn">View My Orders</Link>
                        ) : (
                            <Link to="/shop" className="pill-btn">Continue Shopping</Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page container">
            <div className="checkout-grid">
                {/* Left Column: Form */}
                <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
                    <h2>Checkout</h2>

                    {errorMsg && <div className="checkout-error">{errorMsg}</div>}

                    {/* Contact Info */}
                    <div className="form-section">
                        <h3>1. Contact Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="customerName" 
                                value={formData.customerName} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="customerEmail" 
                                value={formData.customerEmail} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="jane@example.com"
                            />
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="form-section">
                        <h3>2. Shipping Address</h3>
                        <div className="form-group">
                            <label>Street Address</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="123 Luxury Ave, Apt 4"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group col-6">
                                <label>City</label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="London"
                                />
                            </div>
                            <div className="form-group col-6">
                                <label>Postal Code</label>
                                <input 
                                    type="text" 
                                    name="postalCode" 
                                    value={formData.postalCode} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="SW1A 1AA"
                                />
                            </div>
                        </div>
                        <div className="form-group country-input-container">
                            <label>Country (Triggers Royal Mail Worldwide Rates)</label>
                            <input 
                                type="text" 
                                name="country" 
                                value={formData.country} 
                                onChange={handleCountryChange}
                                onFocus={() => {
                                    setSuggestions(COUNTRIES);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                required
                                placeholder="e.g. United Kingdom, United States, Germany, Sri Lanka"
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="country-suggestions-list">
                                    {suggestions.map((c, i) => (
                                        <li 
                                            key={i} 
                                            className="country-suggestion-item"
                                            onMouseDown={() => selectCountry(c)}
                                        >
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Royal Mail Shipping Methods */}
                    <div className="form-section">
                        <h3>3. Royal Mail Shipping Options</h3>
                        {shippingMethods.length > 0 ? (
                            <div className="shipping-methods-list">
                                {shippingMethods.map((method) => {
                                    const cost = getShippingCost(method);
                                    const isSelected = selectedMethod?.id === method.id;
                                    return (
                                        <label key={method.id} className={`shipping-method-card ${isSelected ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="shippingMethod" 
                                                checked={isSelected}
                                                onChange={() => setSelectedMethod(method)} 
                                            />
                                            <div className="shipping-method-info">
                                                <span className="shipping-method-name">{method.name}</span>
                                                <span className="shipping-carrier">Royal Mail Official Partner</span>
                                            </div>
                                            <span className="shipping-method-price">
                                                {selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}
                                                {cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-shipping-msg">Please enter a valid shipping country to calculate Royal Mail rates.</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="form-section">
                        <div className="payment-header">
                            <h3>4. Secure Card Payment</h3>
                            <div className="card-icons">
                                <span>VISA</span>
                                <span>MC</span>
                                <span>AMEX</span>
                            </div>
                        </div>
                        <div className="card-form">
                            <div className="form-group">
                                <label>Card Number</label>
                                <input 
                                    type="text" 
                                    name="cardNumber" 
                                    value={formData.cardNumber} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="•••• •••• •••• ••••"
                                    maxLength="19"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group col-6">
                                    <label>Expiry Date</label>
                                    <input 
                                        type="text" 
                                        name="cardExpiry" 
                                        value={formData.cardExpiry} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="MM / YY"
                                        maxLength="7"
                                    />
                                </div>
                                <div className="form-group col-6">
                                    <label>CVC / CVV</label>
                                    <input 
                                        type="password" 
                                        name="cardCvc" 
                                        value={formData.cardCvc} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="•••"
                                        maxLength="4"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cardholder Name</label>
                                <input 
                                    type="text" 
                                    name="cardName" 
                                    value={formData.cardName} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="JANE DOE"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="complete-order-btn" disabled={processing}>
                        {processing ? (
                            <span className="spinner-text">Processing Payment...</span>
                        ) : (
                            `Pay ${selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${selectedCurrency}`
                        )}
                    </button>
                </form>

                {/* Right Column: Order Summary */}
                <div className="checkout-summary">
                    <h3>Order Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h3>
                    <div className="summary-item-list">
                        {cartItems.map(item => {
                            const prod = item.product;
                            const itemP = convertPrice(prod.price, prod.currency || 'LKR');
                            return (
                                <div key={prod._id} className="summary-item">
                                    <div className="summary-item-img">
                                        <img src={prod.images?.[0]?.url} alt={prod.name} />
                                        <span className="summary-qty-badge">{item.quantity}</span>
                                    </div>
                                    <div className="summary-item-info">
                                        <h4>{prod.name}</h4>
                                        <span>{prod.brand || 'COACH'}</span>
                                    </div>
                                    <div className="summary-item-price">
                                        {selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}
                                        {(itemP * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="summary-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>{selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="total-row">
                            <span>Royal Mail Shipping</span>
                            <span>
                                {selectedMethod ? (
                                    `${selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}${shippingCostConverted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                ) : (
                                    'Free'
                                )}
                            </span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total</span>
                            <span>{selectedCurrency === 'LKR' ? 'Rs ' : selectedCurrency + ' '}{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {selectedCurrency}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
