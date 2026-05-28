const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all products
router.get('/', async (req, res) => {
    console.log('--- HIT GET /api/products ---');
    try {
        const products = await Product.find().populate('collectionId').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('collectionId');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE product
router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, stock, collectionId } = req.body;
        
        const images = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        const product = new Product({
            name, description, price, stock, collectionId: collectionId || null, images
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE product
router.put('/:id', protect, adminOnly, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, stock, collectionId } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // If new images uploaded, add them or replace them
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));
            product.images = [...product.images, ...newImages];
        }

        product.name = name || product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price || product.price;
        product.stock = stock !== undefined ? stock : product.stock;
        if (collectionId !== undefined) product.collectionId = collectionId || null;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE product
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Delete images from Cloudinary
        for (const img of product.images) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
