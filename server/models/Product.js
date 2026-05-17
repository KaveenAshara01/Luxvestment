const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    stock: { type: Number, default: 1 },
    images: [{ 
        url: String, 
        public_id: String 
    }],
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
