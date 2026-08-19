const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Mapped onto the existing `foodCategory` collection so documents that were
 * already seeded keep working untouched. Everything beyond `CategoryName` is
 * optional and only used by the newer category-first browsing flow.
 */
const FoodCategorySchema = new Schema(
    {
        CategoryName: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        img: { type: String, default: '' },
        icon: { type: String, default: 'utensils' },
        sortOrder: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true, collection: 'foodCategory' }
);

FoodCategorySchema.index({ CategoryName: 1 }, { unique: true });

module.exports = mongoose.model('foodCategory', FoodCategorySchema);
