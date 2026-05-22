const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Track a page visit or product view
// @route   POST /api/system/log
// @access  Public
router.post('/log', async (req, res) => {
    try {
        const { path, productId, country } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'];

        // Extract Cloudflare/Render country code if present, otherwise use request country
        const detectedCountry = req.headers['cf-ipcountry'] || country || 'Unknown';

        const visit = new Visit({
            ip: typeof ip === 'string' ? ip.split(',')[0].trim() : ip,
            country: detectedCountry,
            productId: productId || null,
            path,
            userAgent
        });

        await visit.save();
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Analytics tracking error:', err);
        res.status(500).json({ error: 'Failed to record analytics' });
    }
});

// @desc    Get aggregate BI statistics
// @route   GET /api/analytics/stats
// @access  Admin Only
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        // 1. Visit Counts & Unique Visitors
        const totalVisits = await Visit.countDocuments();
        const uniqueVisitsResult = await Visit.distinct('ip');
        const uniqueVisitors = uniqueVisitsResult.length;

        // 2. Country Breakdown
        const countryBreakdown = await Visit.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 3. Most Looked Product Ranking (views)
        const mostViewed = await Visit.aggregate([
            { $match: { productId: { $ne: null } } },
            { $group: { _id: '$productId', views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ]);

        // 4. Most Ordered Products Ranking
        const mostOrdered = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$products' },
            { $group: { _id: '$products.product', count: { $sum: '$products.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ]);

        // 5. Most Ordering Day of Week
        const dayStats = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: '$createdAt' } // 1 (Sunday) to 7 (Saturday)
                }
            },
            { $group: { _id: '$dayOfWeek', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Map day number array [1..7] to complete week object with defaults
        const daysMap = {
            1: 'Sunday',
            2: 'Monday',
            3: 'Tuesday',
            4: 'Wednesday',
            5: 'Thursday',
            6: 'Friday',
            7: 'Saturday'
        };
        const orderTrendsByDay = Object.keys(daysMap).map(dayNum => {
            const num = parseInt(dayNum);
            const record = dayStats.find(d => d._id === num);
            return {
                day: daysMap[num],
                orders: record ? record.count : 0
            };
        });

        // 6. Popular BI Metrics (Revenue, AOV, Conversion Rate)
        const orderMetrics = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = orderMetrics[0]?.totalRevenue || 0;
        const totalOrders = orderMetrics[0]?.totalOrders || 0;
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
        const conversionRate = uniqueVisitors > 0 ? ((totalOrders / uniqueVisitors) * 100) : 0;

        res.status(200).json({
            totalVisits,
            uniqueVisitors,
            countryBreakdown,
            mostViewed,
            mostOrdered,
            orderTrendsByDay,
            totalRevenue,
            totalOrders,
            averageOrderValue,
            conversionRate
        });
    } catch (err) {
        console.error('Analytics aggregation error:', err);
        res.status(500).json({ error: 'Failed to retrieve analytics metrics' });
    }
});

module.exports = router;
