import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { createOrderApi, createPaymentIntentApi } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// Initialize Stripe Promise defensively
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
    'pk_test_51TbO2qLoDicbLnKcEgBcsV0q5mhYl9JJ7VChtZjCaQ8fDUtX9FpSqEMhdj4mp3cWXj1QK1YFxo63XmpSvv3i4tyL00Lgo4RjDF'
);

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

// Inner component for Stripe Credit Card checkout
const StripeCheckoutForm = ({ 
    formData, 
    cartItems, 
    clearCart, 
    total, 
    selectedCurrency, 
    shippingCostConverted, 
    selectedMethod, 
    setSuccessOrder, 
    setErrorMsg 
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handlePaySubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setErrorMsg('');

        try {
            // Confirm secure card payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            name: formData.customerName,
                            email: formData.customerEmail,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                postal_code: formData.postalCode,
                                country: formData.country === 'United Kingdom' ? 'GB' : 'US'
                            }
                        }
                    }
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMsg(error.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Prepare order payload for DB
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
                    paymentMethod: `Stripe Credit Card (${paymentIntent.payment_method_types?.[0] || 'card'}) [via ${shippingMethodLabel}]`,
                    items: orderItems,
                    totalAmount: total
                };

                const createdOrder = await createOrderApi(orderPayload);
                await clearCart();
                setProcessing(false);
                setSuccessOrder(createdOrder);
            }
        } catch (err) {
            console.error('Stripe placement error:', err);
            setErrorMsg(err.response?.data?.message || 'Error processing card authorization or updating database.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handlePaySubmit} className="stripe-payment-form">
            <div className="form-section">
                <div className="payment-header">
                    <h3>4. Secure Card Payment</h3>
                    <div className="card-icons">
                        <span>VISA</span>
                        <span>MC</span>
                        <span>AMEX</span>
                    </div>
                </div>
                <div className="stripe-element-wrapper" style={{ margin: '1.5rem 0', minHeight: '150px' }}>
                    <PaymentElement />
                </div>
            </div>

            <button type="submit" className="complete-order-btn" disabled={processing || !stripe || !elements}>
                {processing ? (
                    <span className="spinner-text">Authorizing Card...</span>
                ) : (
                    `Complete Secure Payment`
                )}
            </button>
        </form>
    );
};

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
        country: 'United Kingdom' // Default country
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [clientSecret, setClientSecret] = useState('');

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
        
        // Reset Stripe client secret if country/shipping changes to ensure updated calculations
        setClientSecret('');
    }, [formData.country]);

    // Reset Stripe client secret if selected shipping method changes (affects total)
    const handleShippingMethodChange = (method) => {
        setSelectedMethod(method);
        setClientSecret('');
    };

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
        setClientSecret(''); // Reset client secret since user updated details
    };

    // Country suggestion handlers
    const handleCountryChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, country: val }));
        setClientSecret(''); // Reset client secret
        
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
        setClientSecret(''); // Reset client secret
    };

    // Triggered when user clicks "Proceed to Payment" to initialize Stripe
    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.customerName || !formData.customerEmail || !formData.address || !formData.city || !formData.postalCode) {
            setErrorMsg('Please fill in all required shipping and contact details.');
            return;
        }

        setProcessing(true);

        try {
            const data = await createPaymentIntentApi({
                amount: total,
                currency: selectedCurrency || 'GBP'
            });

            setClientSecret(data.clientSecret);
            setProcessing(false);
        } catch (err) {
            console.error('Stripe initialization failed:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to initialize secure Stripe payment gateway.');
            setProcessing(false);
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
                        Thank you for your purchase. Your payment was authorized successfully via Stripe (Visa/Mastercard), and your items are being prepared for Royal Mail shipment.
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
        <div className="checkout-page container page-entrance">
            <div className="checkout-grid">
                {/* Left Column: Form */}
                <div className="checkout-form">
                    <h2>Checkout</h2>

                    {errorMsg && <div className="checkout-error">{errorMsg}</div>}

                    {/* Contact Info */}
                    <div className="form-section">
                        <div className="checkout-section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>1. Contact Information</h3>
                            {!user && (
                                <Link to="/login" style={{ fontSize: '0.85rem', color: '#856404', textDecoration: 'underline', fontWeight: 600 }}>
                                    Already have an account? Sign In
                                </Link>
                            )}
                        </div>

                        {!user && (
                            <div className="checkout-tip-banner" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                backgroundColor: '#e8f4fd',
                                border: '1px solid #b8daff',
                                borderRadius: '4px',
                                padding: '0.8rem 1.2rem',
                                marginBottom: '1.5rem',
                                color: '#004085',
                                fontSize: '0.85rem',
                                fontWeight: 500
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#004085', flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>
                                    <strong>Quick Tip:</strong> Log in to your account <Link to="/login" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>here</Link> to track your order status in real-time.
                                </span>
                            </div>
                        )}
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="customerName" 
                                value={formData.customerName} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!!clientSecret}
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
                                disabled={!!clientSecret}
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
                                disabled={!!clientSecret}
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
                                    disabled={!!clientSecret}
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
                                    disabled={!!clientSecret}
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
                                    if (!clientSecret) {
                                        setSuggestions(COUNTRIES);
                                        setShowSuggestions(true);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                required
                                disabled={!!clientSecret}
                                placeholder="e.g. United Kingdom, United States, Germany, Sri Lanka"
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && !clientSecret && (
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
                                                disabled={!!clientSecret}
                                                onChange={() => handleShippingMethodChange(method)} 
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

                    {/* Stripe Secure Payment Section */}
                    {clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripeCheckoutForm 
                                formData={formData}
                                cartItems={cartItems}
                                clearCart={clearCart}
                                total={total}
                                selectedCurrency={selectedCurrency}
                                shippingCostConverted={shippingCostConverted}
                                selectedMethod={selectedMethod}
                                setSuccessOrder={setSuccessOrder}
                                setErrorMsg={setErrorMsg}
                            />
                        </Elements>
                    ) : (
                        <div className="form-section">
                            <div className="payment-header">
                                <h3>4. Secure Card Payment</h3>
                                <div className="card-icons">
                                    <span>VISA</span>
                                    <span>MC</span>
                                    <span>AMEX</span>
                                </div>
                            </div>
                            <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1.8rem', lineHeight: '1.5' }}>
                                Secure payments are powered by Stripe. Please review your contact information, shipping address, and delivery choice, then click below to secure your transaction session.
                            </p>
                            <button 
                                type="button" 
                                onClick={handleProceedToPayment} 
                                className="complete-order-btn" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="spinner-text">Initializing Stripe Session...</span>
                                ) : (
                                    `Proceed to Secure Payment`
                                )}
                            </button>
                        </div>
                    )}
                </div>

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
