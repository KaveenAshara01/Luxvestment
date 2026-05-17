const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    console.log('--- REGISTER START ---');
    try {
        const { name, email, password } = req.body;
        console.log(`Body: ${name}, ${email}`);
        
        let role = 'user';

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating user...');
        const user = await User.create({ name, email, password, role });
        console.log('User created');
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('--- LOGIN START ---');
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
