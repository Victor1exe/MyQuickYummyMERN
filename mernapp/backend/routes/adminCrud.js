const express = require('express');
const mongoose = require('mongoose');

const asyncHandler = require('../middleware/asyncHandler');

/**
 * Builds a list / read / create / update / delete router for one Mongoose
 * model. Every admin resource behaves the same way, so the six of them share
 * this factory instead of six near-identical route files.
 *
 * @param {object}   options
 * @param {Model}    options.model         Mongoose model to expose.
 * @param {string[]} options.searchFields  Fields matched by `?search=`.
 * @param {object}   options.defaultSort   Sort applied when listing.
 * @param {string[]} options.filterFields  Query params allowed as exact filters.
 * @param {Function} [options.beforeWrite] Normalises a payload before saving.
 * @param {Array}    [options.populate]    `[path, select]` pairs to populate on
 *   read, so a reference can be shown by name instead of by id.
 */
const buildCrudRouter = ({
    model,
    searchFields = ['name'],
    defaultSort = { createdAt: -1 },
    filterFields = [],
    populate = [],
    beforeWrite = (payload) => payload
}) => {
    const router = express.Router();

    const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const buildFilter = (query) => {
        const filter = {};

        if (query.search && searchFields.length) {
            const rx = new RegExp(escapeRegex(query.search), 'i');
            filter.$or = searchFields.map((field) => ({ [field]: rx }));
        }

        // Express parses `?status[$ne]=busy` into an OBJECT, which would land in
        // the filter as a Mongo operator. Coercing to a string keeps a query
        // parameter a value and never an operator. (These routes are behind
        // fetchAdmin, so the reach was limited, but a filter is not a place to
        // accept arbitrary query syntax.)
        filterFields.forEach((field) => {
            const raw = query[field];
            if (raw === undefined || raw === '' || typeof raw === 'object') return;

            const value = String(raw);
            filter[field] = value === 'true' ? true : value === 'false' ? false : value;
        });

        return filter;
    };

    /** Applies every configured populate to a query. */
    const withPopulate = (query) =>
        populate.reduce((q, [path, select]) => q.populate(path, select), query);

    const assertValidId = (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Invalid id');
            error.status = 400;
            throw error;
        }
    };

    router.get(
        '/',
        asyncHandler(async (req, res) => {
            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
            const filter = buildFilter(req.query);

            const [items, total] = await Promise.all([
                withPopulate(model.find(filter).sort(defaultSort).skip((page - 1) * limit).limit(limit)).lean(),
                model.countDocuments(filter)
            ]);

            res.json({ success: true, total, page, limit, items });
        })
    );

    router.get(
        '/:id',
        asyncHandler(async (req, res) => {
            assertValidId(req.params.id);
            const item = await withPopulate(model.findById(req.params.id)).lean();
            if (!item) {
                return res.status(404).json({ success: false, error: 'Not found' });
            }
            return res.json({ success: true, item });
        })
    );

    router.post(
        '/',
        asyncHandler(async (req, res) => {
            const item = await model.create(beforeWrite(req.body));
            res.status(201).json({ success: true, item });
        })
    );

    router.put(
        '/:id',
        asyncHandler(async (req, res) => {
            assertValidId(req.params.id);
            const item = await model.findByIdAndUpdate(
                req.params.id,
                beforeWrite(req.body),
                { new: true, runValidators: true }
            );
            if (!item) {
                return res.status(404).json({ success: false, error: 'Not found' });
            }
            return res.json({ success: true, item });
        })
    );

    router.delete(
        '/:id',
        asyncHandler(async (req, res) => {
            assertValidId(req.params.id);
            const item = await model.findByIdAndDelete(req.params.id);
            if (!item) {
                return res.status(404).json({ success: false, error: 'Not found' });
            }
            return res.json({ success: true, deletedId: req.params.id });
        })
    );

    return router;
};

module.exports = buildCrudRouter;
