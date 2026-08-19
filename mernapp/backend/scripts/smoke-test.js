/* eslint-disable no-console */
/**
 * End-to-end smoke test.
 *
 * Boots the real Express app against the real database, then walks the whole
 * product: catalogue -> signup -> login -> checkout -> receipt PDF -> tracking
 * -> completion, plus the admin console and the sync between the two. It also
 * asserts the negative cases that matter (unauthenticated access, another
 * customer's data, bad admin credentials).
 *
 *   npm run smoke
 *
 * Test data it creates is removed at the end; seeded catalogue data is not
 * touched.
 */
const mongoose = require('mongoose');

const env = require('../config/env');
const connectDB = require('../config/db');
const { app } = require('../index');

const User = require('../models/User');
const Order = require('../models/Orders');
const Receipt = require('../models/Receipt');
const Rider = require('../models/Rider');
const FoodCategory = require('../models/FoodCategory');

let passed = 0;
let failed = 0;
const failures = [];

const check = (label, condition, detail = '') => {
    if (condition) {
        passed += 1;
        console.log(`  [32mPASS[0m  ${label}`);
    } else {
        failed += 1;
        failures.push(label + (detail ? ` — ${detail}` : ''));
        console.log(`  [31mFAIL[0m  ${label}${detail ? ` — ${detail}` : ''}`);
    }
};

const section = (title) => console.log(`\n[1m${title}[0m`);

const run = async () => {
    await connectDB();

    // Port 0 lets the OS pick a free one, so the test never collides with a
    // dev server already running on 5000.
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;

    const stamp = Date.now();
    const customer = {
        name: 'Smoke Test User',
        email: `smoke.${stamp}@example.com`,
        password: 'SmokeTest@123',
        location: '12 Test Lane, Testville'
    };
    const otherEmail = `other.${stamp}@example.com`;

    const call = async (path, { method = 'GET', body, token, adminToken, raw = false } = {}) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['auth-token'] = token;
        if (adminToken) headers['admin-token'] = adminToken;

        const response = await fetch(`${base}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (raw) return { status: response.status, buffer: Buffer.from(await response.arrayBuffer()) };

        const text = await response.text();
        let json = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch (error) {
            json = { raw: text };
        }
        return { status: response.status, json, headers: response.headers };
    };

    let authToken = '';
    let adminToken = '';
    let receiptNo = '';
    let createdCategoryId = '';

    try {
        // ------------------------------------------------------------------
        section('1. Service health');
        const health = await call('/api/health');
        check('GET /api/health returns 200', health.status === 200, `got ${health.status}`);
        check('health payload reports ok', health.json?.status === 'ok');

        const notFound = await call('/api/does-not-exist');
        check('unknown route returns a 404 JSON body', notFound.status === 404 && notFound.json?.success === false);

        // ------------------------------------------------------------------
        section('2. Public catalogue');
        const catalogue = await call('/api/foodData');
        const [items, categories] = catalogue.json || [];
        check('GET /api/foodData returns 200', catalogue.status === 200);
        check('catalogue is [items, categories]', Array.isArray(items) && Array.isArray(categories));
        check('catalogue has food items', (items || []).length > 0, `${(items || []).length} items — run "npm run seed"`);
        check('catalogue has categories', (categories || []).length > 0);

        const sample = (items || [])[0];
        check('items carry a description', Boolean(sample?.description));
        check('items are linked to a kitchen', Boolean(sample?.partner || sample?.partnerName));
        check('items carry nutrition for the diet calculator', typeof sample?.calories === 'number');

        if (sample) {
            const detail = await call(`/api/foodItems/${sample._id}`);
            check('GET /api/foodItems/:id returns 200', detail.status === 200);
            check('detail includes the dish', detail.json?.item?._id === sample._id);
            check('detail includes same-kitchen menu', Array.isArray(detail.json?.sameKitchen));
            check('detail includes similar dishes', Array.isArray(detail.json?.similar));
        }

        const partners = await call('/api/partners');
        check('GET /api/partners returns kitchens', partners.status === 200 && partners.json?.partners?.length > 0);

        if (partners.json?.partners?.length) {
            const one = await call(`/api/partners/${partners.json.partners[0]._id}`);
            check('GET /api/partners/:id returns a menu', one.status === 200 && Array.isArray(one.json?.menu));
        }

        const faqs = await call('/api/faqs');
        check('GET /api/faqs returns published FAQs', faqs.status === 200 && faqs.json?.faqs?.length > 0);

        const policies = await call('/api/policies');
        check('GET /api/policies returns published policies', policies.status === 200 && policies.json?.policies?.length > 0);
        check(
            'unpublished internal SOPs are NOT exposed publicly',
            !(policies.json?.policies || []).some((p) => p.slug === 'food-safety-and-cold-chain-sop')
        );

        const stats = await call('/api/riders/stats');
        check('GET /api/riders/stats returns fleet counters', stats.status === 200 && typeof stats.json?.stats?.total === 'number');
        check('fleet stats expose available/busy/ready',
            typeof stats.json?.stats?.available === 'number' &&
            typeof stats.json?.stats?.busy === 'number' &&
            typeof stats.json?.stats?.readyToGo === 'number');

        // ------------------------------------------------------------------
        section('3. Authentication');
        const badSignup = await call('/api/createuser', { method: 'POST', body: { email: 'nope', name: 'x', password: '1' } });
        check('signup rejects invalid input with 400', badSignup.status === 400);

        const signup = await call('/api/createuser', { method: 'POST', body: customer });
        check('POST /api/createuser creates an account', signup.status === 201, `got ${signup.status}`);

        const duplicate = await call('/api/createuser', { method: 'POST', body: customer });
        check('duplicate email is rejected with 409', duplicate.status === 409);

        const wrongPassword = await call('/api/loginuser', { method: 'POST', body: { email: customer.email, password: 'WrongPass1' } });
        check('login with a wrong password fails', wrongPassword.status === 400 && wrongPassword.json?.success !== true);

        const unknownUser = await call('/api/loginuser', { method: 'POST', body: { email: `ghost.${stamp}@example.com`, password: 'WrongPass1' } });
        check(
            'login does not leak whether an email exists',
            unknownUser.json?.error === wrongPassword.json?.error,
            'responses differ between unknown user and wrong password'
        );

        const login = await call('/api/loginuser', { method: 'POST', body: { email: customer.email, password: customer.password } });
        check('POST /api/loginuser returns a token', login.status === 200 && Boolean(login.json?.authToken));
        authToken = login.json?.authToken || '';

        const me = await call('/api/me', { token: authToken });
        check('GET /api/me resolves the token to the right user', me.json?.user?.email === customer.email);

        // ------------------------------------------------------------------
        section('4. Endpoint authorisation');
        const noToken = await call('/api/orderData', { method: 'POST', body: { order_data: [{ name: 'x', qty: 1, size: 'full', price: 10 }] } });
        check('POST /api/orderData without a token returns 401', noToken.status === 401, `got ${noToken.status}`);

        const noTokenHistory = await call('/api/myOrderData', { method: 'POST' });
        check('POST /api/myOrderData without a token returns 401', noTokenHistory.status === 401);

        const garbage = await call('/api/myOrderData', { method: 'POST', token: 'not-a-real-token' });
        check('a forged token is rejected with 401', garbage.status === 401);

        const adminWithCustomerToken = await call('/api/admin/overview', { adminToken: authToken });
        check(
            'a CUSTOMER token cannot reach an admin route',
            adminWithCustomerToken.status === 401 || adminWithCustomerToken.status === 403,
            `got ${adminWithCustomerToken.status}`
        );

        const adminNoToken = await call('/api/admin/partners');
        check('admin routes require a token', adminNoToken.status === 401);

        // ------------------------------------------------------------------
        section('5. Checkout, receipt and rider assignment');
        const availableBefore = await Rider.countDocuments({ status: { $in: ['available', 'ready_to_go'] } });

        // The client no longer supplies prices — the server reads them from the
        // catalogue — so this cart deliberately LIES about price, name and
        // kitchen, and the assertions below check that all three were ignored.
        //
        // This section used to assert subtotal === 730, a figure derived from the
        // cart's own "price" fields. That assertion encoded the bug: it passed
        // precisely because the server trusted the client.
        const dishA = sample;
        const dishB = (items || [])[1] || sample;

        const sizeFor = (dish) => {
            const opts = (dish?.options || [])[0] || {};
            return opts.full !== undefined ? 'full' : Object.keys(opts)[0];
        };
        const unitPriceFor = (dish, size) => Number(((dish?.options || [])[0] || {})[size]);

        const sizeA = sizeFor(dishA);
        const sizeB = sizeFor(dishB);
        const qtyA = 2;
        const qtyB = 1;

        const cart = [
            { id: dishA?._id, name: 'FREE SAMPLE', size: sizeA, qty: qtyA, price: 1, kitchen: 'Spoofed Kitchen' },
            { id: dishB?._id, name: dishB?.name, size: sizeB, qty: qtyB, price: 999999 }
        ];

        const expectedSubtotal = unitPriceFor(dishA, sizeA) * qtyA + unitPriceFor(dishB, sizeB) * qtyB;
        const expectedDeliveryFee = expectedSubtotal >= 499 ? 0 : 39;

        // The server must ignore an email supplied in the body.
        const checkout = await call('/api/orderData', {
            method: 'POST',
            token: authToken,
            body: { order_data: cart, order_date: new Date().toISOString(), email: otherEmail }
        });

        check('checkout succeeds with a valid token', checkout.status === 200, `got ${checkout.status}`);
        const receipt = checkout.json?.receipt;
        check('checkout returns a receipt', Boolean(receipt?.receiptNo));
        receiptNo = receipt?.receiptNo || '';

        check('receipt number is well formed', /^MQY-\d{8}-[0-9A-F]{6}$/.test(receiptNo), receiptNo);
        check(
            'a spoofed email in the body is ignored',
            receipt?.email === customer.email,
            `receipt was written for ${receipt?.email}`
        );
        check(
            'subtotal is priced from the catalogue, not from the cart',
            receipt?.subtotal === expectedSubtotal,
            `got ${receipt?.subtotal}, the catalogue says ${expectedSubtotal}`
        );
        check(
            'the tampered prices (1 and 999999) had no effect on the total',
            ![1, 999999, 1000000].includes(receipt?.subtotal),
            `subtotal is ${receipt?.subtotal}`
        );
        check(
            'the spoofed dish name was replaced with the catalogue name',
            receipt?.items?.[0]?.name === dishA?.name,
            `receipt says "${receipt?.items?.[0]?.name}"`
        );
        check(
            'the spoofed kitchen was not written to the receipt',
            receipt?.items?.[0]?.kitchen !== 'Spoofed Kitchen',
            `receipt says "${receipt?.items?.[0]?.kitchen}"`
        );
        check(
            'each line records the unit price the server charged',
            receipt?.items?.[0]?.unitPrice === unitPriceFor(dishA, sizeA) &&
                receipt?.items?.[0]?.price === unitPriceFor(dishA, sizeA) * qtyA,
            `unitPrice ${receipt?.items?.[0]?.unitPrice}, line price ${receipt?.items?.[0]?.price}`
        );
        check(
            'delivery fee follows the free-delivery threshold',
            receipt?.deliveryFee === expectedDeliveryFee,
            `got ${receipt?.deliveryFee}, expected ${expectedDeliveryFee} on a ${expectedSubtotal} subtotal`
        );
        check('GST is 5% of subtotal', receipt?.gst === Math.round(expectedSubtotal * 0.05), `got ${receipt?.gst}`);
        check(
            'total equals subtotal + fees + GST',
            receipt?.total === receipt?.subtotal + receipt?.deliveryFee + receipt?.packagingFee + receipt?.gst
        );
        check(
            'ETA is between 35 and 75 minutes',
            receipt?.etaMinutes >= 35 && receipt?.etaMinutes <= 75,
            `got ${receipt?.etaMinutes}`
        );
        check(
            'etaAt matches placedAt + etaMinutes',
            Math.abs(
                new Date(receipt.etaAt).getTime() - new Date(receipt.placedAt).getTime() - receipt.etaMinutes * 60000
            ) < 1500
        );

        const riderAssigned = Boolean(receipt?.rider?.name);
        check('a delivery partner was assigned', riderAssigned || availableBefore === 0,
            availableBefore === 0 ? 'no free riders (acceptable)' : 'expected an assignment');

        if (riderAssigned) {
            const rider = await Rider.findById(receipt.rider.riderId).lean();
            check('the assigned rider was flipped to busy', rider?.status === 'busy', `status is ${rider?.status}`);

            const availableAfter = await Rider.countDocuments({ status: { $in: ['available', 'ready_to_go'] } });
            check('the free-rider pool shrank by one', availableAfter === availableBefore - 1,
                `${availableBefore} -> ${availableAfter}`);
        }

        // ------------------------------------------------------------------
        section('6. Order history and the PDF receipt');
        const history = await call('/api/myOrderData', { method: 'POST', token: authToken });
        check('order history returns the order', history.json?.orderData?.order_data?.length === 1);
        check('order history returns the receipt', history.json?.receipts?.length === 1);
        check(
            'the legacy order row links to its receipt',
            history.json?.orderData?.order_data?.[0]?.[0]?.receiptNo === receiptNo
        );

        const pdf = await call(`/api/orders/${receiptNo}/receipt.pdf`, { token: authToken, raw: true });
        check('GET receipt.pdf returns 200', pdf.status === 200);
        check('the response is a real PDF', pdf.buffer?.slice(0, 5).toString() === '%PDF-', pdf.buffer?.slice(0, 8).toString());
        check('the PDF has content', pdf.buffer?.length > 1500, `${pdf.buffer?.length} bytes`);

        const pdfNoAuth = await call(`/api/orders/${receiptNo}/receipt.pdf`, { raw: false });
        check('receipt.pdf is not readable without a token', pdfNoAuth.status === 401);

        // ------------------------------------------------------------------
        section('7. Live tracking');
        const tracking = await call(`/api/orders/${receiptNo}`, { token: authToken });
        check('GET /api/orders/:receiptNo returns tracking state', tracking.status === 200);
        check('tracking reports minutes remaining', tracking.json?.tracking?.minutesRemaining > 0);
        check('a fresh order is not complete', tracking.json?.tracking?.isComplete === false);

        const complete = await call(`/api/orders/${receiptNo}/complete`, { method: 'POST', token: authToken });
        check('completing the delivery succeeds', complete.status === 200);
        check('the receipt is marked delivered', complete.json?.receipt?.status === 'delivered');

        if (riderAssigned) {
            const rider = await Rider.findById(receipt.rider.riderId).lean();
            check('the rider was released back to available', rider?.status === 'available', `status is ${rider?.status}`);
            check('the delivery was counted', rider?.totalDeliveries > 0);

            const deliveriesBefore = rider.totalDeliveries;
            await call(`/api/orders/${receiptNo}/complete`, { method: 'POST', token: authToken });
            const riderAgain = await Rider.findById(receipt.rider.riderId).lean();
            check(
                'completing twice does not double-count (idempotent)',
                riderAgain.totalDeliveries === deliveriesBefore,
                `${deliveriesBefore} -> ${riderAgain.totalDeliveries}`
            );
        }

        // ------------------------------------------------------------------
        section('8. Admin console');
        const badAdmin = await call('/api/admin/login', { method: 'POST', body: { email: env.adminEmail, password: 'definitely-wrong' } });
        check('admin login rejects a wrong password', badAdmin.status === 401);

        const adminLogin = await call('/api/admin/login', { method: 'POST', body: { email: env.adminEmail, password: env.adminPassword } });
        check('admin login succeeds with the .env credentials', adminLogin.status === 200 && Boolean(adminLogin.json?.adminToken));
        adminToken = adminLogin.json?.adminToken || '';

        const adminMe = await call('/api/admin/me', { adminToken });
        check('GET /api/admin/me confirms the admin session', adminMe.json?.admin?.role === 'admin');

        const customerWithAdminToken = await call('/api/me', { token: adminToken });
        check('an ADMIN token cannot reach a customer route', customerWithAdminToken.status === 401);

        const overview = await call('/api/admin/overview', { adminToken });
        check('GET /api/admin/overview returns 200', overview.status === 200);
        const ov = overview.json?.overview;
        check('overview counts kitchens', ov?.partners?.total > 0);
        check('overview counts riders by status', typeof ov?.riders?.available === 'number');
        check('overview counts the catalogue', ov?.catalog?.items > 0);
        check('overview counts content', ov?.content?.policies > 0 && ov?.content?.faqs > 0);
        check('overview reports receipt revenue', typeof ov?.commerce?.revenue === 'number');

        const adminReceipts = await call('/api/admin/receipts', { adminToken });
        check('admin sees the customer receipt',
            (adminReceipts.json?.receipts || []).some((r) => r.receiptNo === receiptNo));

        const adminPdf = await call(`/api/admin/receipts/${receiptNo}/receipt.pdf`, { adminToken, raw: true });
        check('admin can download the same PDF', adminPdf.status === 200 && adminPdf.buffer?.slice(0, 5).toString() === '%PDF-');

        const statusUpdate = await call(`/api/admin/receipts/${receiptNo}/status`, {
            method: 'PUT', adminToken, body: { status: 'out_for_delivery' }
        });
        check('admin can move an order along the pipeline', statusUpdate.json?.receipt?.status === 'out_for_delivery');

        const badStatus = await call(`/api/admin/receipts/${receiptNo}/status`, {
            method: 'PUT', adminToken, body: { status: 'teleported' }
        });
        check('an unknown status is rejected with 400', badStatus.status === 400);

        // ------------------------------------------------------------------
        section('9. Admin -> storefront sync');
        const created = await call('/api/admin/categories', {
            method: 'POST', adminToken,
            body: { CategoryName: `Smoke Test ${stamp}`, icon: 'flask', sortOrder: 999, isActive: true }
        });
        check('admin can create a category', created.status === 201, `got ${created.status}`);
        createdCategoryId = created.json?.item?._id || '';

        const publicAfterCreate = await call('/api/foodData');
        check(
            'the new category appears on the storefront with no restart',
            (publicAfterCreate.json?.[1] || []).some((c) => c._id === createdCategoryId)
        );

        await call(`/api/admin/categories/${createdCategoryId}`, {
            method: 'PUT', adminToken, body: { CategoryName: `Smoke Test ${stamp}`, isActive: false }
        });
        const publicAfterHide = await call('/api/foodData');
        check(
            'hiding a category removes it from the storefront',
            !(publicAfterHide.json?.[1] || []).some((c) => c._id === createdCategoryId)
        );

        const deleted = await call(`/api/admin/categories/${createdCategoryId}`, { method: 'DELETE', adminToken });
        check('admin can delete a category', deleted.status === 200);
        createdCategoryId = '';

        const searchable = await call('/api/admin/partners?search=Nizam', { adminToken });
        check('admin list search works', (searchable.json?.items || []).length >= 0 && searchable.status === 200);

        // ------------------------------------------------------------------
        section('10. Cross-customer isolation');
        const other = { name: 'Other Smoke User', email: otherEmail, password: 'OtherPass@123', location: '9 Other Road' };
        await call('/api/createuser', { method: 'POST', body: other });
        const otherLogin = await call('/api/loginuser', { method: 'POST', body: { email: other.email, password: other.password } });
        const otherToken = otherLogin.json?.authToken;

        const otherHistory = await call('/api/myOrderData', { method: 'POST', token: otherToken, body: { email: customer.email } });
        check(
            'a second customer cannot read the first customer\'s orders',
            !otherHistory.json?.orderData,
            'the other user received order data'
        );
        check('a second customer sees no receipts of the first', (otherHistory.json?.receipts || []).length === 0);

        const otherPdf = await call(`/api/orders/${receiptNo}/receipt.pdf`, { token: otherToken });
        check('a second customer cannot download the first\'s receipt', otherPdf.status === 404);
    } finally {
        // --------------------------------------------------------------
        section('11. Checkout input validation and rate limiting');

        const tamper = (body) => call('/api/orderData', { method: 'POST', token: authToken, body });

        const ghost = await tamper({ order_data: [{ id: '000000000000000000000000', name: 'Ghost Dish', size: 'full', qty: 1, price: 5 }] });
        check('a dish absent from the catalogue is rejected, not priced at 5', ghost.status === 400, `got ${ghost.status}`);

        const zeroQty = await tamper({ order_data: [{ id: dishA?._id, size: sizeA, qty: 0, price: 100 }] });
        check('a zero quantity is rejected', zeroQty.status === 400, `got ${zeroQty.status}`);

        const negativeQty = await tamper({ order_data: [{ id: dishA?._id, size: sizeA, qty: -3, price: 100 }] });
        check('a negative quantity is rejected', negativeQty.status === 400, `got ${negativeQty.status}`);

        const fractionalQty = await tamper({ order_data: [{ id: dishA?._id, size: sizeA, qty: 1.5, price: 100 }] });
        check('a fractional quantity is rejected', fractionalQty.status === 400, `got ${fractionalQty.status}`);

        const unknownSize = await tamper({ order_data: [{ id: dishA?._id, size: 'jumbo', qty: 1, price: 100 }] });
        check('an unknown portion size is rejected', unknownSize.status === 400, `got ${unknownSize.status}`);

        const emptyCart = await tamper({ order_data: [] });
        check('an empty cart is rejected', emptyCart.status === 400, `got ${emptyCart.status}`);

        // The customer limiter is checked by its advertised ceiling rather than
        // by exhausting it, so this stays independent of how many logins the
        // sections above happened to make.
        const loginProbe = await call('/api/loginuser', { method: 'POST', body: { email: customer.email, password: customer.password } });
        check(
            'customer login advertises a rate limit',
            loginProbe.headers?.get('x-ratelimit-limit') === '10',
            `X-RateLimit-Limit: ${loginProbe.headers?.get('x-ratelimit-limit')}`
        );

        // The admin credential is one shared secret, so exhaust that limiter for
        // real. This runs last because it deliberately locks the admin login out
        // for the rest of the window.
        let sawTooMany = false;
        let retryAfter = null;
        for (let attempt = 0; attempt < 8 && !sawTooMany; attempt += 1) {
            const guess = await call('/api/admin/login', {
                method: 'POST',
                body: { email: env.adminEmail, password: `wrong-guess-${attempt}` }
            });
            if (guess.status === 429) {
                sawTooMany = true;
                retryAfter = guess.json?.retryAfter;
            }
        }
        check('repeated admin login attempts are blocked with 429', sawTooMany);
        check('the 429 tells the caller when to retry', typeof retryAfter === 'number' && retryAfter > 0, `retryAfter=${retryAfter}`);

        // ------------------------------------------------------------------
        section('Cleanup');
        if (createdCategoryId) {
            await FoodCategory.findByIdAndDelete(createdCategoryId).catch(() => {});
        }
        const removedUsers = await User.deleteMany({ email: { $in: [customer.email, otherEmail] } });
        const removedOrders = await Order.deleteMany({ email: { $in: [customer.email, otherEmail] } });
        const removedReceipts = await Receipt.deleteMany({ email: { $in: [customer.email, otherEmail] } });
        await FoodCategory.deleteMany({ CategoryName: new RegExp(`^Smoke Test ${stamp}$`) }).catch(() => {});
        console.log(
            `  removed ${removedUsers.deletedCount} test users, ` +
            `${removedOrders.deletedCount} orders, ${removedReceipts.deletedCount} receipts`
        );

        server.close();
        await mongoose.disconnect();
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${passed} passed, ${failed} failed`);
    if (failures.length) {
        console.log('\n  Failures:');
        failures.forEach((f) => console.log(`    - ${f}`));
    }
    console.log(`${'='.repeat(60)}\n`);

    process.exit(failed === 0 ? 0 : 1);
};

run().catch((error) => {
    console.error('\nSmoke test crashed:', error);
    process.exit(1);
});
