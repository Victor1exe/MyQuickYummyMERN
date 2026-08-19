const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * A "partner" is any kitchen that sells through My Quick Yummy: a restaurant,
 * a hotel, a cloud kitchen, a food stall, a bakery or a cafe.
 */
const PARTNER_TYPES = [
    'Restaurant',
    'Hotel',
    'Cloud Kitchen',
    'Food Stall',
    'Bakery',
    'Cafe'
];

const PartnerSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: PARTNER_TYPES, default: 'Restaurant' },
        description: { type: String, default: '' },
        img: { type: String, default: '' },

        cuisines: { type: [String], default: [] },

        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '', lowercase: true, trim: true },

        rating: { type: Number, min: 0, max: 5, default: 4.2 },
        ratingCount: { type: Number, default: 0 },
        avgCostForTwo: { type: Number, default: 400 },
        deliveryTimeMins: { type: Number, default: 30 },

        fssaiLicense: { type: String, default: '' },
        openingTime: { type: String, default: '10:00' },
        closingTime: { type: String, default: '23:00' },

        isActive: { type: Boolean, default: true }
    },
    { timestamps: true, collection: 'partners' }
);

PartnerSchema.index({ name: 1, city: 1 });

module.exports = mongoose.model('partner', PartnerSchema);
module.exports.PARTNER_TYPES = PARTNER_TYPES;
