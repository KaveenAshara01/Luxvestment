const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all collections
router.get('/', async (req, res) => {
    try {
        const collections = await Collection.find().sort({ createdAt: -1 });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE collection
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description } = req.body;
        const collection = new Collection({ name, description });
        const newCollection = await collection.save();
        res.status(201).json(newCollection);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE collection
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, description } = req.body;
        const collection = await Collection.findById(req.params.id);
        if (!collection) return res.status(404).json({ message: 'Collection not found' });

        collection.name = name || collection.name;
        collection.description = description !== undefined ? description : collection.description;
        
        const updatedCollection = await collection.save();
        res.json(updatedCollection);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE collection
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        if (!collection) return res.status(404).json({ message: 'Collection not found' });

        await collection.deleteOne();
        res.json({ message: 'Collection deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
