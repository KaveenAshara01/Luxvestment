require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (adminExists) {
            console.log('Admin already exists');
        } else {
            const admin = await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: '123456',
                role: 'admin'
            });
            console.log('Admin created successfully:', admin.email);
        }
        
        mongoose.disconnect();
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
