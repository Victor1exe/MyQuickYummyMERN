const crypto = require('crypto');
const mongoose = require('mongoose');

const Rider = require('../models/Rider');
const Receipt = require('../models/Receipt');
const FoodItem = require('../models/FoodItem');

// Charges applied on top of the cart. Kept here so the receipt PDF, the
// storefront summary and the admin console can never disagree about a total.
const FREE_DELIVERY_ABOVE = 499;
const DELIVERY_FEE = 39;
const PACKAGING_FEE = 15;
const GST_RATE = 0.05;

const ETA_MIN_MINUTES = 35;
const ETA_MAX_MINUTES = 75;

/** MQY-YYYYMMDD-XXXXXX — sortable by day, unguessable within it. */
const generateReceiptNo = () => {
    const now = new Date();
    const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('');

    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `MQY-${datePart}-${randomPart}`;
};

const randomEtaMinutes = () =>
    ETA_MIN_MINUTES + crypto.randomInt(0, ETA_MAX_MINUTES - ETA_MIN_MINUTES + 1);

const priceOrder = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const packagingFee = items.length > 0 ? PACKAGING_FEE : 0;
    const gst = Math.round(subtotal * GST_RATE);

    return {
        subtotal,
        deliveryFee,
        packagingFee,
        gst,
        total: subtotal + deliveryFee + packagingFee + gst
    };
};

/**
 * Claims the best-rated rider who is free right now and flips them to `busy`.
 *
 * `findOneAndUpdate` matches and writes in one operation, so two simultaneous
 * checkouts cannot both be handed the same rider.
 *
 * @returns {Promise<object|null>} the claimed rider, or null if the fleet is
 *   fully committed — in which case the order is still placed and dispatch is
 *   left to the operations desk.
 */
const assignRider = async () => {
    const rider = await Rider.findOneAndUpdate(
        { status: { $in: ['available', 'ready_to_go'] }, isActive: { $ne: false } },
        { $set: { status: 'busy' } },
        { sort: { rating: -1, totalDeliveries: -1 }, new: true }
    );

    return rider;
};

/** Releases a rider once their delivery finishes or is cancelled. */
const releaseRider = async (riderId, { countDelivery = true } = {}) => {
    if (!riderId) return;

    const update = { $set: { status: 'available' } };
    if (countDelivery) {
        update.$inc = { totalDeliveries: 1 };
    }

    await Rider.findByIdAndUpdate(riderId, update);
};

const MAX_QTY_PER_LINE = 50;
const MAX_LINES_PER_ORDER = 50;

/**
 * Unit price for one dish at one portion size, taken from the catalogue.
 *
 * The stored shape is `options: [{ half: "180", full: "320" }]` with STRING
 * values — see models/FoodItem.js — hence the Number().
 */
const unitPriceOf = (doc, size) => {
    const table = Array.isArray(doc.options) ? doc.options[0] : null;
    if (!table || typeof table !== 'object') return null;

    const raw = table[size];
    if (raw === undefined || raw === null || raw === '') return null;

    const price = Number(raw);
    return Number.isFinite(price) && price > 0 ? price : null;
};

const reject = (message) => {
    const error = new Error(message);
    error.status = 400;
    throw error;
};

/**
 * Turns the client's cart into priced line items using ONLY the catalogue.
 *
 * The cart posts a `price` per line, and this used to sum it — so any
 * authenticated caller could POST whatever total it wanted and be billed it.
 * The client's price, name and kitchen are now ignored entirely: `id`, `size`
 * and `qty` are the only fields taken from the request, and each is validated.
 *
 * A line that cannot be priced from the catalogue FAILS the checkout. Falling
 * back to the client's figure is precisely the hole being closed here, and an
 * item that no longer exists has no price to charge.
 *
 * Exported so the arithmetic can be tested without a database.
 */
const buildPricedItems = (items, catalogueById) => {
    if (!Array.isArray(items) || items.length === 0) {
        reject('Your cart is empty');
    }
    if (items.length > MAX_LINES_PER_ORDER) {
        reject(`An order cannot hold more than ${MAX_LINES_PER_ORDER} lines`);
    }

    return items.map((item) => {
        const id = String(item.id || '');
        const doc = catalogueById[id];
        if (!doc) {
            reject(`"${item.name || id}" is no longer on the menu`);
        }

        const qty = Number(item.qty);
        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
            reject(`Quantity for "${doc.name}" must be a whole number from 1 to ${MAX_QTY_PER_LINE}`);
        }

        const size = String(item.size || '');
        const unitPrice = unitPriceOf(doc, size);
        if (unitPrice === null) {
            reject(`"${doc.name}" is not available in the selected portion`);
        }

        return {
            itemId: id,
            name: doc.name,
            size,
            qty,
            unitPrice,
            price: unitPrice * qty,
            kitchen: doc.partner?.name || doc.partnerName || ''
        };
    });
};

/**
 * Turns a cart into a persisted receipt: prices it, picks a rider, sets an ETA
 * and stores the record the tracker, the PDF and the admin console read from.
 */
const createReceipt = async ({ user, items, customerAddress }) => {
    // The cart carries id/name/size/qty/price, but only id, size and qty are
    // trusted. Name, price and kitchen are all resolved from the catalogue, so
    // the client cannot dictate what it is charged or what the receipt claims.
    const validIds = items
        .map((item) => item.id)
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const catalogue = validIds.length
        ? await FoodItem.find({ _id: { $in: validIds } })
              .populate('partner', 'name')
              .select('name options partner partnerName')
              .lean()
        : [];

    const catalogueById = catalogue.reduce((acc, doc) => ({ ...acc, [String(doc._id)]: doc }), {});

    const normalisedItems = buildPricedItems(items, catalogueById);

    const totals = priceOrder(normalisedItems);
    const etaMinutes = randomEtaMinutes();
    const placedAt = new Date();
    const etaAt = new Date(placedAt.getTime() + etaMinutes * 60 * 1000);

    const rider = await assignRider();

    const receipt = await Receipt.create({
        receiptNo: generateReceiptNo(),
        email: user.email,
        customerName: user.name || '',
        customerAddress: customerAddress || user.location || '',
        items: normalisedItems,
        kitchens: [...new Set(normalisedItems.map((item) => item.kitchen).filter(Boolean))],
        ...totals,
        placedAt,
        etaMinutes,
        etaAt,
        rider: rider
            ? {
                  riderId: rider._id,
                  name: rider.name,
                  phone: rider.phone,
                  vehicle: rider.vehicle,
                  city: rider.city,
                  rating: rider.rating
              }
            : {},
        status: 'placed'
    });

    return receipt;
};

module.exports = {
    createReceipt,
    buildPricedItems,
    unitPriceOf,
    releaseRider,
    priceOrder,
    generateReceiptNo,
    randomEtaMinutes,
    ETA_MIN_MINUTES,
    ETA_MAX_MINUTES
};
