const mongoose = require('mongoose');

const { Schema } = mongoose;

const DELIVERY_STATUSES = [
    'placed',
    'preparing',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'cancelled'
];

const ReceiptItemSchema = new Schema(
    {
        itemId: { type: String, default: '' },
        name: { type: String, required: true },
        size: { type: String, default: '' },
        qty: { type: Number, default: 1 },
        // What the server charged per unit, and qty x that. Recording both makes
        // a receipt self-checkable; older receipts predate unitPrice and hold 0.
        unitPrice: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        kitchen: { type: String, default: '' }
    },
    { _id: false }
);

/**
 * The billing and delivery record for one checkout.
 *
 * The legacy `orders` document keeps its original nested-array shape so old
 * orders still render; this collection is what the PDF receipt, the live
 * delivery tracker and the admin console all read from. `receiptNo` is the
 * shared handle between them.
 */
const ReceiptSchema = new Schema(
    {
        receiptNo: { type: String, required: true, unique: true, index: true },

        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        customerName: { type: String, default: '' },
        customerAddress: { type: String, default: '' },

        items: { type: [ReceiptItemSchema], default: [] },
        kitchens: { type: [String], default: [] },

        subtotal: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        packagingFee: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, default: 0 },

        placedAt: { type: Date, default: Date.now },
        etaMinutes: { type: Number, default: 45 },
        etaAt: { type: Date, required: true },
        deliveredAt: { type: Date, default: null },

        // Snapshot of the assigned rider. Denormalised on purpose: a receipt is
        // a record of what happened, so it must not change when the rider's
        // profile later does.
        rider: {
            riderId: { type: Schema.Types.ObjectId, ref: 'rider', default: null },
            name: { type: String, default: '' },
            phone: { type: String, default: '' },
            vehicle: { type: String, default: '' },
            city: { type: String, default: '' },
            rating: { type: Number, default: 0 }
        },

        status: { type: String, enum: DELIVERY_STATUSES, default: 'placed', index: true }
    },
    { timestamps: true, collection: 'receipts' }
);

module.exports = mongoose.model('receipt', ReceiptSchema);
module.exports.DELIVERY_STATUSES = DELIVERY_STATUSES;
