const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

// GET all orders (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().populate('products.product').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET current user's orders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('products.product').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new order (Checkout)
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { customerName, customerEmail, shippingAddress, paymentMethod, items, totalAmount } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Verify stock for all items first
        for (const item of items) {
            const product = await Product.findById(item.product._id || item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name || item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Product "${product.name}" has only ${product.stock} items available. Requested: ${item.quantity}.` 
                });
            }
        }

        // Stock verified. Deduct stock.
        const orderProducts = [];
        for (const item of items) {
            const product = await Product.findById(item.product._id || item.product);
            product.stock -= item.quantity;
            await product.save();

            orderProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: item.price || product.price
            });
        }

        const userId = req.user ? req.user.id : null;

        const order = await Order.create({
            userId,
            customerName,
            customerEmail,
            shippingAddress,
            paymentMethod: paymentMethod || 'Credit/Debit Card',
            products: orderProducts,
            totalAmount,
            status: 'Processing'
        });

        // If user logged in, clear their DB cart
        if (userId) {
            await Cart.findOneAndUpdate({ userId }, { items: [] });
        }

        const populatedOrder = await Order.findById(order._id).populate('products.product');
        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error('Order Create Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE order status (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
