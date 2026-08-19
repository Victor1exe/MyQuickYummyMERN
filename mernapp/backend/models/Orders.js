const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * One document per customer; `order_data` is an array of orders and each order
 * is itself an array whose first entry carries `{ Order_date }`. That shape is
 * kept as-is so previously placed orders still render.
 */
const OrderSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        order_data: {
            type: Array,
            required: true,
            default: []
        }
    },
    { collection: 'orders' }
);

module.exports = mongoose.model('order', OrderSchema);
