const express = require('express');

const Faq = require('../models/Faq');
const Policy = require('../models/Policy');
const Rider = require('../models/Rider');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/** Published FAQs, grouped client-side by `category`. */
router.get(
    '/faqs',
    asyncHandler(async (req, res) => {
        const filter = { isPublished: true };
        if (req.query.category) filter.category = req.query.category;

        const faqs = await Faq.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();
        res.json({ success: true, count: faqs.length, faqs });
    })
);

/** Published policies only. Internal SOPs stay admin-only unless published. */
router.get(
    '/policies',
    asyncHandler(async (req, res) => {
        const filter = { isPublished: true };
        if (req.query.category) filter.category = req.query.category;

        const policies = await Policy.find(filter)
            .select('title slug category summary version updatedAt')
            .sort({ category: 1, title: 1 })
            .lean();

        res.json({ success: true, count: policies.length, policies });
    })
);

router.get(
    '/policies/:slug',
    asyncHandler(async (req, res) => {
        const policy = await Policy.findOne({ slug: req.params.slug.toLowerCase(), isPublished: true }).lean();
        if (!policy) {
            return res.status(404).json({ success: false, error: 'Policy not found' });
        }
        return res.json({ success: true, policy });
    })
);

/**
 * Fleet availability shown in the "Delivery Heroes" section: how many riders we
 * are in touch with and how many are available / busy / ready to go right now.
 */
router.get(
    '/riders/stats',
    asyncHandler(async (req, res) => {
        const [byStatus, totals] = await Promise.all([
            Rider.aggregate([
                { $match: { isActive: { $ne: false } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Rider.aggregate([
                { $match: { isActive: { $ne: false } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
                        deliveries: { $sum: '$totalDeliveries' },
                        avgRating: { $avg: '$rating' }
                    }
                }
            ])
        ]);

        const statusCounts = byStatus.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
        const summary = totals[0] || { total: 0, verified: 0, deliveries: 0, avgRating: 0 };

        const cities = await Rider.distinct('city', { isActive: { $ne: false }, city: { $ne: '' } });

        res.json({
            success: true,
            stats: {
                total: summary.total,
                verified: summary.verified,
                totalDeliveries: summary.deliveries,
                avgRating: Number((summary.avgRating || 0).toFixed(2)),
                cities: cities.length,
                available: statusCounts.available || 0,
                busy: statusCounts.busy || 0,
                readyToGo: statusCounts.ready_to_go || 0,
                onBreak: statusCounts.on_break || 0,
                offline: statusCounts.offline || 0
            }
        });
    })
);

/** A small public roster for the riders section — no contact details exposed. */
router.get(
    '/riders',
    asyncHandler(async (req, res) => {
        const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);

        const riders = await Rider.find({ isActive: { $ne: false } })
            .select('name city state vehicle status rating totalDeliveries isVerified joinedAt')
            .sort({ rating: -1, totalDeliveries: -1 })
            .limit(limit)
            .lean();

        res.json({ success: true, count: riders.length, riders });
    })
);

module.exports = router;
