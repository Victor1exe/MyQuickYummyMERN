const mongoose = require('mongoose');

const { Schema } = mongoose;

const FAQ_CATEGORIES = [
    'Ordering',
    'Payments',
    'Delivery',
    'Account',
    'Partners',
    'Riders'
];

const FaqSchema = new Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true },
        category: { type: String, enum: FAQ_CATEGORIES, default: 'Ordering' },
        sortOrder: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: true }
    },
    { timestamps: true, collection: 'faqs' }
);

module.exports = mongoose.model('faq', FaqSchema);
module.exports.FAQ_CATEGORIES = FAQ_CATEGORIES;
