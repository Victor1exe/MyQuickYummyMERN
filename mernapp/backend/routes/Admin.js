const express = require('express');

const Partner = require('../models/Partner');
const Rider = require('../models/Rider');
const FoodItem = require('../models/FoodItem');
const FoodCategory = require('../models/FoodCategory');
const Policy = require('../models/Policy');
const Faq = require('../models/Faq');
const Order = require('../models/Orders');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

const fetchAdmin = require('../middleware/fetchAdmin');
const asyncHandler = require('../middleware/asyncHandler');
const buildCrudRouter = require('./adminCrud');
const { buildReceiptPdf } = require('../services/receiptPdf');
const { releaseRider } = require('../services/checkout');

const router = express.Router();

// Everything below this line requires a valid admin token.
router.use(fetchAdmin);

/** Landing-page overview: one call, every headline number. */
router.get(
    '/overview',
    asyncHandler(async (req, res) => {
        const [
            partnersByType,
            partnerTotal,
            ridersByStatus,
            riderTotal,
            itemTotal,
            itemsByCategory,
            categoryTotal,
            policyTotal,
            publishedPolicies,
            faqTotal,
            userTotal,
            orderDocs,
            topPartners,
            recentItems,
            receiptsByStatus,
            receiptRevenue,
            liveDeliveries
        ] = await Promise.all([
            Partner.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
            Partner.countDocuments({}),
            Rider.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Rider.countDocuments({}),
            FoodItem.countDocuments({}),
            FoodItem.aggregate([
                { $group: { _id: '$CategoryName', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            FoodCategory.countDocuments({}),
            Policy.countDocuments({}),
            Policy.countDocuments({ isPublished: true }),
            Faq.countDocuments({}),
            User.countDocuments({}),
            Order.find({}).select('email order_data').lean(),
            Partner.find({}).sort({ rating: -1 }).limit(5).select('name type city rating deliveryTimeMins').lean(),
            FoodItem.find({}).sort({ createdAt: -1 }).limit(5).select('name CategoryName partnerName createdAt').lean(),
            Receipt.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Receipt.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Receipt.find({ status: { $nin: ['delivered', 'cancelled'] } })
                .sort({ placedAt: -1 })
                .limit(6)
                .select('receiptNo email total etaAt status rider.name')
                .lean()
        ]);

        const orderCount = orderDocs.reduce((sum, doc) => sum + (doc.order_data || []).length, 0);

        const toMap = (rows) => rows.reduce((acc, row) => ({ ...acc, [row._id || 'unknown']: row.count }), {});
        const riderStatus = toMap(ridersByStatus);

        res.json({
            success: true,
            overview: {
                partners: {
                    total: partnerTotal,
                    byType: toMap(partnersByType),
                    active: await Partner.countDocuments({ isActive: true })
                },
                riders: {
                    total: riderTotal,
                    available: riderStatus.available || 0,
                    busy: riderStatus.busy || 0,
                    readyToGo: riderStatus.ready_to_go || 0,
                    onBreak: riderStatus.on_break || 0,
                    offline: riderStatus.offline || 0,
                    verified: await Rider.countDocuments({ isVerified: true })
                },
                catalog: {
                    items: itemTotal,
                    categories: categoryTotal,
                    byCategory: itemsByCategory.map((row) => ({ category: row._id, count: row.count })),
                    unavailable: await FoodItem.countDocuments({ isAvailable: false })
                },
                content: {
                    policies: policyTotal,
                    publishedPolicies,
                    faqs: faqTotal
                },
                commerce: {
                    customers: userTotal,
                    orders: orderCount,
                    receipts: Object.values(toMap(receiptsByStatus)).reduce((a, b) => a + b, 0),
                    revenue: receiptRevenue[0]?.total || 0,
                    byStatus: toMap(receiptsByStatus)
                },
                liveDeliveries,
                topPartners,
                recentItems
            }
        });
    })
);

/** Read-only order feed for the admin panel. */
router.get(
    '/orders',
    asyncHandler(async (req, res) => {
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const docs = await Order.find({}).limit(limit).lean();

        const orders = docs.flatMap((doc) =>
            (doc.order_data || []).map((group, index) => {
                const dateEntry = group.find((entry) => entry && entry.Order_date);
                const items = group.filter((entry) => entry && !entry.Order_date);
                return {
                    id: `${doc._id}-${index}`,
                    email: doc.email,
                    orderDate: dateEntry ? dateEntry.Order_date : null,
                    itemCount: items.length,
                    total: items.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
                    items
                };
            })
        );

        res.json({ success: true, count: orders.length, orders });
    })
);

/**
 * Receipts: the same records the customer sees, from the operator's side.
 * Filterable by status, and each one downloads the identical PDF.
 */
router.get(
    '/receipts',
    asyncHandler(async (req, res) => {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.search) {
            const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ receiptNo: rx }, { email: rx }, { 'rider.name': rx }];
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

        const [receipts, total, byStatus, revenue] = await Promise.all([
            Receipt.find(filter).sort({ placedAt: -1 }).limit(limit).lean(),
            Receipt.countDocuments(filter),
            Receipt.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Receipt.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        res.json({
            success: true,
            total,
            receipts,
            byStatus: byStatus.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {}),
            revenue: revenue[0]?.total || 0
        });
    })
);

router.get(
    '/receipts/:receiptNo/receipt.pdf',
    asyncHandler(async (req, res) => {
        const receipt = await Receipt.findOne({ receiptNo: req.params.receiptNo }).lean();
        if (!receipt) {
            return res.status(404).json({ success: false, error: 'Receipt not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${receipt.receiptNo}.pdf"`);
        return buildReceiptPdf(receipt, res);
    })
);

/**
 * Moves an order along the delivery pipeline. Reaching a terminal status frees
 * the assigned rider, which is what makes the storefront's live availability
 * board and this console agree.
 */
router.put(
    '/receipts/:receiptNo/status',
    asyncHandler(async (req, res) => {
        const { status } = req.body;

        if (!Receipt.DELIVERY_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, error: `Unknown status "${status}"` });
        }

        const receipt = await Receipt.findOne({ receiptNo: req.params.receiptNo });
        if (!receipt) {
            return res.status(404).json({ success: false, error: 'Receipt not found' });
        }

        const wasTerminal = receipt.status === 'delivered' || receipt.status === 'cancelled';
        receipt.status = status;

        if (status === 'delivered') {
            receipt.deliveredAt = receipt.deliveredAt || new Date();
        }

        await receipt.save();

        // Only release once, and only count a delivery that actually completed.
        if (!wasTerminal && (status === 'delivered' || status === 'cancelled')) {
            await releaseRider(receipt.rider?.riderId, { countDelivery: status === 'delivered' });
        }

        return res.json({ success: true, receipt });
    })
);

// --- Resource CRUD --------------------------------------------------------
// Changes made here land in the same collections the storefront reads from,
// so an edit is live on the next page load. No cache to invalidate.

router.use(
    '/partners',
    buildCrudRouter({
        model: Partner,
        searchFields: ['name', 'city', 'state', 'email'],
        filterFields: ['type', 'city', 'isActive'],
        defaultSort: { name: 1 }
    })
);

router.use(
    '/riders',
    buildCrudRouter({
        model: Rider,
        searchFields: ['name', 'city', 'phone', 'email'],
        filterFields: ['status', 'city', 'vehicle', 'isVerified', 'isActive'],
        defaultSort: { name: 1 }
    })
);

router.use(
    '/categories',
    buildCrudRouter({
        model: FoodCategory,
        searchFields: ['CategoryName'],
        filterFields: ['isActive'],
        defaultSort: { sortOrder: 1, CategoryName: 1 }
    })
);

router.use(
    '/items',
    buildCrudRouter({
        model: FoodItem,
        searchFields: ['name', 'CategoryName', 'partnerName'],
        filterFields: ['CategoryName', 'partner', 'isVeg', 'isAvailable'],
        defaultSort: { CategoryName: 1, name: 1 },
        // A dish created from the admin form stores `partner` but no
        // `partnerName`, so the list has to resolve the kitchen by reference
        // rather than rely on the denormalised copy legacy rows carry.
        populate: [['partner', 'name type']],
        // The form posts `half`/`full` prices as flat fields; the storefront
        // reads `options[0]`, so normalise before persisting.
        beforeWrite: (payload) => {
            const next = { ...payload };

            if (next.half !== undefined || next.full !== undefined) {
                next.options = [{ half: String(next.half ?? ''), full: String(next.full ?? '') }];
                delete next.half;
                delete next.full;
            }

            if (next.partner === '' || next.partner === 'null') {
                next.partner = null;
            }

            return next;
        }
    })
);

router.use(
    '/policies',
    buildCrudRouter({
        model: Policy,
        searchFields: ['title', 'slug', 'summary'],
        filterFields: ['category', 'isPublished'],
        defaultSort: { category: 1, title: 1 },
        beforeWrite: (payload) => {
            const next = { ...payload };
            const source = next.slug || next.title || '';
            next.slug = String(source)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return next;
        }
    })
);

router.use(
    '/faqs',
    buildCrudRouter({
        model: Faq,
        searchFields: ['question', 'answer'],
        filterFields: ['category', 'isPublished'],
        defaultSort: { sortOrder: 1, createdAt: 1 }
    })
);

module.exports = router;
