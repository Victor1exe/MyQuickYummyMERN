const mongoose = require('mongoose');

const { Schema } = mongoose;

const RIDER_STATUSES = ['available', 'busy', 'ready_to_go', 'on_break', 'offline'];

const VEHICLE_TYPES = [
    'bicycle',
    'motorcycle',
    'electric scooter',
    'electric bike',
    'car',
    'moped',
    'walking'
];

/**
 * A delivery partner ("rider"). `status` is what the storefront's fleet counter
 * and the admin dashboard both read from.
 */
const RiderSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, default: '' },
        email: { type: String, default: '', lowercase: true, trim: true },

        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zone: { type: String, default: '' },

        vehicle: { type: String, enum: VEHICLE_TYPES, default: 'motorcycle' },
        status: { type: String, enum: RIDER_STATUSES, default: 'offline' },
        shift: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], default: 'flexible' },

        rating: { type: Number, min: 0, max: 5, default: 4.5 },
        totalDeliveries: { type: Number, default: 0 },

        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        joinedAt: { type: Date, default: Date.now }
    },
    { timestamps: true, collection: 'riders' }
);

RiderSchema.index({ status: 1 });
RiderSchema.index({ city: 1 });

module.exports = mongoose.model('rider', RiderSchema);
module.exports.RIDER_STATUSES = RIDER_STATUSES;
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
