/**
 * Minimal fixed-window rate limiter for the authentication endpoints.
 *
 * Neither login route was throttled, so both the customer login and — worse —
 * the single shared admin password could be brute-forced at network speed.
 *
 * In-memory and dependency-free on purpose: this app runs as one Node process,
 * and the project convention is not to add a package for something small enough
 * to own (see CLAUDE.md). The trade-off is real and worth knowing:
 *
 *   * It does NOT coordinate across instances. Run two containers and each gets
 *     its own allowance. Behind a load balancer or in a cluster, enforce this at
 *     the proxy or move the counter to a shared store.
 *   * It keys on `req.ip`, which behind a reverse proxy is the proxy unless
 *     Express is told to trust it (`app.set('trust proxy', 1)`). Set that where
 *     you deploy, or every client will share one bucket.
 *
 * Counters are swept lazily on each call rather than on a timer: a setInterval
 * here would hold the event loop open and stop the smoke test from exiting.
 */
const rateLimit = ({
    windowMs = 15 * 60 * 1000,
    max = 10,
    message = 'Too many attempts. Please try again later.'
} = {}) => {
    const buckets = new Map();

    const sweep = (now) => {
        for (const [key, bucket] of buckets) {
            if (bucket.resetAt <= now) buckets.delete(key);
        }
    };

    return (req, res, next) => {
        const now = Date.now();

        // Bound the map. Without this a spray of forged X-Forwarded-For values,
        // or simply a long uptime, would grow it indefinitely.
        if (buckets.size > 10000) sweep(now);

        const key = req.ip || req.connection?.remoteAddress || 'unknown';
        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;

        const remaining = Math.max(0, max - bucket.count);
        res.set('X-RateLimit-Limit', String(max));
        res.set('X-RateLimit-Remaining', String(remaining));

        if (bucket.count > max) {
            const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({ success: false, error: message, retryAfter });
        }

        return next();
    };
};

module.exports = rateLimit;
