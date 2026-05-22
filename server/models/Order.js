const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String
    },
    paymentMethod: { type: String, default: 'Credit/Debit Card' },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
