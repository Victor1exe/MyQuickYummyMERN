const mongoose = require('mongoose');

const { Schema } = mongoose;

const POLICY_CATEGORIES = [
    'Rider Policy',
    'Partner Policy',
    'Customer Policy',
    'Internal SOP',
    'Legal'
];

/**
 * Internal documents and public policies managed from the admin panel.
 * Only `isPublished` documents are exposed on the public API, which is how
 * an admin edit shows up in the storefront without a redeploy.
 */
const PolicySchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true },
        category: { type: String, enum: POLICY_CATEGORIES, default: 'Internal SOP' },
        summary: { type: String, default: '' },
        content: { type: String, required: true },
        version: { type: String, default: '1.0' },
        isPublished: { type: Boolean, default: false },
        updatedBy: { type: String, default: 'admin' }
    },
    { timestamps: true, collection: 'policies' }
);

PolicySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('policy', PolicySchema);
module.exports.POLICY_CATEGORIES = POLICY_CATEGORIES;
