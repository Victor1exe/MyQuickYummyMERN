const express = require('express');

const FoodItem = require('../models/FoodItem');
const FoodCategory = require('../models/FoodCategory');
const Partner = require('../models/Partner');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * Reads live from MongoDB rather than the boot-time `global.food_items` cache
 * the old implementation used, so anything the admin panel changes is visible
 * on the next storefront request.
 */
const loadCatalog = async () => {
    const [items, categories] = await Promise.all([
        FoodItem.find({ isAvailable: { $ne: false } })
            .populate('partner', 'name type city rating deliveryTimeMins img')
            .lean(),
        FoodCategory.find({ isActive: { $ne: false } })
            .sort({ sortOrder: 1, CategoryName: 1 })
            .lean()
    ]);

    return [items, categories];
};

// Legacy contract: `[foodItems, foodCategories]`. POST is kept because the
// original frontend called it that way; GET is the correct verb for a read.
router.post('/foodData', asyncHandler(async (req, res) => res.json(await loadCatalog())));
router.get('/foodData', asyncHandler(async (req, res) => res.json(await loadCatalog())));

/** All partners, optionally filtered — powers the "Our Kitchens" section. */
router.get(
    '/partners',
    asyncHandler(async (req, res) => {
        const filter = { isActive: { $ne: false } };
        if (req.query.type) filter.type = req.query.type;
        if (req.query.city) filter.city = new RegExp(`^${escapeRegex(req.query.city)}$`, 'i');

        const partners = await Partner.find(filter).sort({ rating: -1, name: 1 }).lean();
        res.json({ success: true, count: partners.length, partners });
    })
);

/** One partner plus its full menu — powers the food item detail view. */
router.get(
    '/partners/:id',
    asyncHandler(async (req, res) => {
        const partner = await Partner.findById(req.params.id).lean();
        if (!partner) {
            return res.status(404).json({ success: false, error: 'Partner not found' });
        }

        const menu = await FoodItem.find({ partner: partner._id, isAvailable: { $ne: false } }).lean();
        return res.json({ success: true, partner, menu });
    })
);

/**
 * Everything needed by the food detail view: the dish, its kitchen, the rest of
 * that kitchen's menu and similar dishes from the same category elsewhere.
 */
router.get(
    '/foodItems/:id',
    asyncHandler(async (req, res) => {
        const item = await FoodItem.findById(req.params.id)
            .populate('partner', 'name type city state rating ratingCount deliveryTimeMins img description cuisines avgCostForTwo')
            .lean();

        if (!item) {
            return res.status(404).json({ success: false, error: 'Food item not found' });
        }

        const partnerId = item.partner && item.partner._id;

        const [sameKitchen, similar] = await Promise.all([
            partnerId
                ? FoodItem.find({
                      partner: partnerId,
                      _id: { $ne: item._id },
                      isAvailable: { $ne: false }
                  }).lean()
                : Promise.resolve([]),
            FoodItem.find({
                CategoryName: item.CategoryName,
                _id: { $ne: item._id },
                isAvailable: { $ne: false }
            })
                .populate('partner', 'name type city rating')
                .limit(8)
                .lean()
        ]);

        return res.json({ success: true, item, sameKitchen, similar });
    })
);

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
