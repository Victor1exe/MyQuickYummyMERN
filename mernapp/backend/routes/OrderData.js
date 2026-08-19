const express = require('express');
const { body, validationResult } = require('express-validator');

const Order = require('../models/Orders');
const Receipt = require('../models/Receipt');
const fetchUser = require('../middleware/fetchUser');
const asyncHandler = require('../middleware/asyncHandler');
const { createReceipt, releaseRider } = require('../services/checkout');
const { buildReceiptPdf } = require('../services/receiptPdf');

const router = express.Router();

/**
 * Every route here is behind `fetchUser` and reads the customer email from the
 * *verified token*, never from the request body. Previously any caller could
 * post an arbitrary email and read or write another customer's order history.
 */

router.post(
    '/orderData',
    fetchUser,
    [body('order_data').isArray({ min: 1 }).withMessage('order_data must be a non-empty array')],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Prices, ETA and rider assignment all happen server side, so the
        // client cannot dictate what it pays or who delivers it.
        const receipt = await createReceipt({
            user: req.user,
            items: req.body.order_data,
            customerAddress: req.body.address
        });

        // The legacy `orders` document keeps its original nested-array shape so
        // previously placed orders still render; `receiptNo` links a row here
        // to its full record in the receipts collection.
        const order = [
            { Order_date: receipt.placedAt.toISOString(), receiptNo: receipt.receiptNo },
            ...req.body.order_data
        ];

        await Order.findOneAndUpdate(
            { email: req.user.email },
            { $push: { order_data: order } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.json({ success: true, receipt });
    })
);

const readOrders = asyncHandler(async (req, res) => {
    const [myData, receipts] = await Promise.all([
        Order.findOne({ email: req.user.email }).lean(),
        Receipt.find({ email: req.user.email }).sort({ placedAt: -1 }).lean()
    ]);

    res.json({ success: true, orderData: myData, receipts });
});

router.post('/myOrderData', fetchUser, readOrders);
// The original frontend spelled this route two different ways; keep both.
router.post('/myorderData', fetchUser, readOrders);

/** Live tracking state for one order. Polled by the delivery tracker. */
router.get(
    '/orders/:receiptNo',
    fetchUser,
    asyncHandler(async (req, res) => {
        const receipt = await Receipt.findOne({
            receiptNo: req.params.receiptNo,
            email: req.user.email
        }).lean();

        if (!receipt) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const msRemaining = new Date(receipt.etaAt).getTime() - Date.now();

        return res.json({
            success: true,
            receipt,
            tracking: {
                minutesRemaining: Math.max(0, Math.ceil(msRemaining / 60000)),
                secondsRemaining: Math.max(0, Math.ceil(msRemaining / 1000)),
                isComplete: receipt.status === 'delivered' || msRemaining <= 0
            }
        });
    })
);

/**
 * Marks a delivery finished. Called by the tracker when its countdown reaches
 * zero, and idempotent so a repeated call cannot double-count the rider's
 * delivery total.
 */
router.post(
    '/orders/:receiptNo/complete',
    fetchUser,
    asyncHandler(async (req, res) => {
        const receipt = await Receipt.findOne({
            receiptNo: req.params.receiptNo,
            email: req.user.email
        });

        if (!receipt) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (receipt.status === 'delivered') {
            return res.json({ success: true, receipt });
        }

        receipt.status = 'delivered';
        receipt.deliveredAt = new Date();
        await receipt.save();

        await releaseRider(receipt.rider?.riderId);

        return res.json({ success: true, receipt });
    })
);

/** The PDF receipt. Same generator the admin download uses. */
router.get(
    '/orders/:receiptNo/receipt.pdf',
    fetchUser,
    asyncHandler(async (req, res) => {
        const receipt = await Receipt.findOne({
            receiptNo: req.params.receiptNo,
            email: req.user.email
        }).lean();

        if (!receipt) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${receipt.receiptNo}.pdf"`);
        return buildReceiptPdf(receipt, res);
    })
);

module.exports = router;
