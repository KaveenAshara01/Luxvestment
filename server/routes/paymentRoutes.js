const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');

// Zero-decimal currencies list
const ZERO_DECIMAL_CURRENCIES = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
    'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
];

// POST create payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        const currencyCode = (currency || 'gbp').toLowerCase();

        // Convert amount to smallest currency unit (e.g. cents/pence)
        let stripeAmount;
        if (ZERO_DECIMAL_CURRENCIES.includes(currencyCode)) {
            stripeAmount = Math.round(amount);
        } else {
            stripeAmount = Math.round(amount * 100);
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount,
            currency: currencyCode,
            automatic_payment_methods: {
                enabled: true, // Automatically enables Card (Visa/Mastercard), Apple Pay, Google Pay, etc.
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (err) {
        console.error('Stripe Payment Intent Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
