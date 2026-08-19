const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connects to MongoDB.
 *
 * The previous implementation passed a callback to `mongoose.connect` (removed
 * in Mongoose 7) and cached the whole catalogue on `global` exactly once at
 * boot, so anything the admin panel changed stayed invisible until a restart.
 * Reads now go straight through the models, which keeps the storefront and the
 * admin panel in sync.
 */
const connectDB = async () => {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 15000
    });

    console.log(`[db] connected to ${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
        console.error('[db] connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('[db] disconnected');
    });

    return mongoose.connection;
};

module.exports = connectDB;
