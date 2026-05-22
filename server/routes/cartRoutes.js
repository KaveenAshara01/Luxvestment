const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Get user cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [] });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add or update item in cart
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // Check product and stock
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
        if (itemIndex > -1) {
            const newQty = cart.items[itemIndex].quantity + quantity;
            if (newQty > product.stock) {
                return res.status(400).json({ message: `Cannot add more. Only ${product.stock} available.` });
            }
            cart.items[itemIndex].quantity = newQty;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Sync localStorage items to user cart on login
router.post('/sync', protect, async (req, res) => {
    try {
        const { items } = req.body; // [{ product: id, quantity: n }]
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const product = await Product.findById(item.product);
                if (product && product.stock >= item.quantity) {
                    const itemIndex = cart.items.findIndex(p => p.product.toString() === item.product);
                    if (itemIndex > -1) {
                        const newQty = Math.min(product.stock, cart.items[itemIndex].quantity + item.quantity);
                        cart.items[itemIndex].quantity = newQty;
                    } else {
                        cart.items.push({ product: item.product, quantity: item.quantity });
                    }
                }
            }
            await cart.save();
        }

        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update item quantity directly
router.put('/:productId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const productId = req.params.productId;
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Only ${product.stock} items left in stock.` });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
        }

        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove item from cart
router.delete('/:productId', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = cart.items.filter(p => p.product.toString() !== req.params.productId);
            await cart.save();
        }
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clear cart
router.delete('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared', items: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
