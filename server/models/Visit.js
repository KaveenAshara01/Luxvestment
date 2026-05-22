const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    ip: { type: String },
    country: { type: String, default: 'Unknown' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    path: { type: String, required: true },
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
