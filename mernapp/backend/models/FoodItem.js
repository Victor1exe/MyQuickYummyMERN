const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Mapped onto the existing `food_items` collection.
 *
 * `options` stays a Mixed array because the seeded shape is
 * `[{ half: "180", full: "320" }]` and the storefront reads `options[0]`.
 */
const FoodItemSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        CategoryName: { type: String, required: true, trim: true },
        img: { type: String, default: '' },
        description: { type: String, default: '' },

        options: {
            type: [Schema.Types.Mixed],
            default: () => [{ half: '100', full: '180' }]
        },

        // Which kitchen cooks this dish. Legacy rows have neither field set,
        // which is why `partnerName` is kept as a readable fallback.
        partner: { type: Schema.Types.ObjectId, ref: 'partner', default: null },
        partnerName: { type: String, default: '' },

        isVeg: { type: Boolean, default: false },
        isBestseller: { type: Boolean, default: false },
        rating: { type: Number, min: 0, max: 5, default: 4.1 },
        prepTimeMins: { type: Number, default: 20 },

        // Per full-size serving, used by the diet calculator.
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },

        isAvailable: { type: Boolean, default: true }
    },
    { timestamps: true, collection: 'food_items' }
);

FoodItemSchema.index({ CategoryName: 1 });
FoodItemSchema.index({ partner: 1 });

module.exports = mongoose.model('food_item', FoodItemSchema);
