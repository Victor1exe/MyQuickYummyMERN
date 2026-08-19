/* eslint-disable no-console */
/**
 * Seeds the database with a complete, coherent catalogue:
 * categories -> partner kitchens -> food items (each attached to a kitchen and
 * given nutrition figures) -> riders -> policies -> FAQs.
 *
 * Run with:   npm run seed          (adds only what is missing)
 *             npm run seed -- --fresh   (wipes the seeded collections first)
 *
 * Customer accounts and orders are never touched by either mode.
 */
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Partner = require('../models/Partner');
const Rider = require('../models/Rider');
const FoodItem = require('../models/FoodItem');
const FoodCategory = require('../models/FoodCategory');
const Policy = require('../models/Policy');
const Faq = require('../models/Faq');

const categorySeed = require('./data/foodCategory.json');
const itemSeed = require('./data/foodItems.json');
const partnerSeed = require('./data/partners.json');
const policySeed = require('./data/policies.json');
const faqSeed = require('./data/faqs.json');

const FRESH = process.argv.includes('--fresh');

// --- Deterministic pseudo-randomness --------------------------------------
// Seeded from the item name so re-running the seed produces identical numbers
// instead of reshuffling every dish's calories and rating.
const hash = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
};

const pick = (text, salt, min, max) => min + (hash(`${text}:${salt}`) % (max - min + 1));

// --- Category presentation metadata ---------------------------------------
const CATEGORY_META = {
    'Biryani/Rice': { icon: 'bowl-rice', sortOrder: 1, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Dum-cooked biryanis and rice bowls, layered and sealed.' },
    Starter: { icon: 'drumstick-bite', sortOrder: 2, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Small plates and grills to open the meal with.' },
    Pizza: { icon: 'pizza-slice', sortOrder: 3, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Wood-fired and pan bases, stretched to order.' },
    Pasta: { icon: 'wheat-awn', sortOrder: 4, img: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Fresh sheets and shapes, finished in the pan.' },
    Burger: { icon: 'burger', sortOrder: 5, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Smashed, stacked and dressed within ninety seconds.' },
    Chinese: { icon: 'bowl-food', sortOrder: 6, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'High-heat wok cooking, plated straight off the burner.' },
    Japanese: { icon: 'fish', sortOrder: 7, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Counter sushi and donburi, cut to order.' },
    Sweets: { icon: 'candy-cane', sortOrder: 8, img: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Khoya, ghee and syrup, made the long way.' },
    Cakes: { icon: 'cake-candles', sortOrder: 9, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', description: 'Baked the morning they are delivered. Never frozen.' }
};

// --- Nutrition profiles per category (per full serving) --------------------
const NUTRITION = {
    'Biryani/Rice': { cal: [520, 880], p: [18, 38], c: [60, 105], f: [14, 34] },
    Starter: { cal: [220, 480], p: [12, 32], c: [12, 34], f: [10, 28] },
    Pizza: { cal: [640, 1080], p: [22, 44], c: [70, 120], f: [24, 48] },
    Pasta: { cal: [520, 860], p: [16, 34], c: [58, 96], f: [18, 40] },
    Burger: { cal: [480, 920], p: [20, 42], c: [42, 78], f: [22, 46] },
    Chinese: { cal: [380, 720], p: [14, 32], c: [44, 88], f: [12, 30] },
    Japanese: { cal: [280, 560], p: [16, 36], c: [34, 68], f: [6, 20] },
    Sweets: { cal: [300, 620], p: [4, 12], c: [46, 92], f: [10, 30] },
    Cakes: { cal: [340, 700], p: [4, 10], c: [44, 88], f: [16, 38] }
};

const VEG_HINTS = /paneer|veg|mushroom|corn|aloo|dal|cheese|margherita|jeera|gobi|palak|tofu|chana|rajma|idli|dosa|pav|cake|gulab|jalebi|rasgulla|halwa|barfi|ladoo|kheer|brownie|pastry|tiramisu|cheesecake|muffin|croissant/i;
const NONVEG_HINTS = /chicken|mutton|lamb|fish|prawn|shrimp|egg|beef|bacon|salmon|tuna|crab|keema|pepperoni/i;

const RIDER_FIRST = ['Arjun', 'Rahul', 'Imran', 'Sandeep', 'Vikram', 'Nikhil', 'Faisal', 'Manish', 'Ravi', 'Deepak', 'Karan', 'Sameer', 'Ashok', 'Joseph', 'Pratik', 'Suresh', 'Rohit', 'Anil', 'Tarun', 'Harsh', 'Zaid', 'Naveen', 'Gaurav', 'Mohit'];
const RIDER_LAST = ['Sharma', 'Verma', 'Khan', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Das', 'Singh', 'Kulkarni', 'Chauhan', 'Bose', 'Menon', 'Joshi', 'Pillai', 'Rana', 'Yadav', 'Ghosh', 'Rathore', 'Bhat'];
const RIDER_CITIES = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'New Delhi', state: 'Delhi' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Gurugram', state: 'Haryana' }
];
const VEHICLES = ['motorcycle', 'electric scooter', 'bicycle', 'electric bike', 'moped', 'car'];
const SHIFTS = ['morning', 'evening', 'night', 'flexible'];
// Roughly what a live fleet looks like mid-evening.
const STATUS_POOL = [
    'available', 'available', 'available', 'available', 'available',
    'busy', 'busy', 'busy', 'busy',
    'ready_to_go', 'ready_to_go', 'ready_to_go',
    'on_break',
    'offline', 'offline'
];

const buildRiders = (count = 48) =>
    Array.from({ length: count }, (_, i) => {
        const key = `rider-${i}`;
        const first = RIDER_FIRST[pick(key, 'f', 0, RIDER_FIRST.length - 1)];
        const last = RIDER_LAST[pick(key, 'l', 0, RIDER_LAST.length - 1)];
        const place = RIDER_CITIES[pick(key, 'c', 0, RIDER_CITIES.length - 1)];
        const deliveries = pick(key, 'd', 180, 6400);

        return {
            name: `${first} ${last}`,
            phone: `+91 9${pick(key, 'p', 100000000, 899999999)}`,
            email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@riders.myquickyummy.com`,
            city: place.city,
            state: place.state,
            zone: `${place.city} Zone ${pick(key, 'z', 1, 9)}`,
            vehicle: VEHICLES[pick(key, 'v', 0, VEHICLES.length - 1)],
            status: STATUS_POOL[pick(key, 's', 0, STATUS_POOL.length - 1)],
            shift: SHIFTS[pick(key, 'h', 0, SHIFTS.length - 1)],
            rating: Number((3.9 + pick(key, 'r', 0, 10) / 10).toFixed(1)),
            totalDeliveries: deliveries,
            isVerified: pick(key, 'ver', 0, 9) > 1
        };
    });

const seedCategories = async () => {
    const names = [...new Set(itemSeed.map((item) => item.CategoryName))];
    const fromFile = categorySeed.map((c) => c.CategoryName);
    const all = [...new Set([...fromFile, ...names])];

    await Promise.all(
        all.map((CategoryName) => {
            const meta = CATEGORY_META[CategoryName] || {};
            return FoodCategory.findOneAndUpdate(
                { CategoryName },
                {
                    $set: {
                        CategoryName,
                        icon: meta.icon || 'utensils',
                        img: meta.img || '',
                        description: meta.description || '',
                        sortOrder: meta.sortOrder || 99,
                        isActive: true
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        })
    );

    return all.length;
};

const seedPartners = async () => {
    const saved = [];

    for (const raw of partnerSeed) {
        const { categories, ...doc } = raw;
        const partner = await Partner.findOneAndUpdate(
            { name: doc.name },
            { $set: { ...doc, isActive: true } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        saved.push({ partner, categories });
    }

    return saved;
};

const seedItems = async (partners) => {
    // Which kitchens can cook a given category.
    const byCategory = {};
    partners.forEach(({ partner, categories }) => {
        categories.forEach((category) => {
            byCategory[category] = byCategory[category] || [];
            byCategory[category].push(partner);
        });
    });

    const fallback = partners.map((p) => p.partner);
    let count = 0;

    for (const raw of itemSeed) {
        const candidates = byCategory[raw.CategoryName] || fallback;
        const owner = candidates[hash(raw.name) % candidates.length];

        const profile = NUTRITION[raw.CategoryName] || NUTRITION.Starter;
        const isVeg = NONVEG_HINTS.test(raw.name) ? false : VEG_HINTS.test(raw.name);

        await FoodItem.findOneAndUpdate(
            { name: raw.name, CategoryName: raw.CategoryName },
            {
                $set: {
                    name: raw.name,
                    CategoryName: raw.CategoryName,
                    img: raw.img,
                    description: raw.description,
                    options: raw.options,
                    partner: owner._id,
                    partnerName: owner.name,
                    isVeg,
                    isBestseller: pick(raw.name, 'best', 0, 9) > 6,
                    rating: Number((3.8 + pick(raw.name, 'rate', 0, 12) / 10).toFixed(1)),
                    prepTimeMins: pick(raw.name, 'prep', 12, 40),
                    calories: pick(raw.name, 'cal', profile.cal[0], profile.cal[1]),
                    protein: pick(raw.name, 'pro', profile.p[0], profile.p[1]),
                    carbs: pick(raw.name, 'car', profile.c[0], profile.c[1]),
                    fat: pick(raw.name, 'fat', profile.f[0], profile.f[1]),
                    isAvailable: true
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        count += 1;
    }

    return count;
};

const seedRiders = async () => {
    const riders = buildRiders();
    for (const rider of riders) {
        await Rider.findOneAndUpdate(
            { email: rider.email },
            { $set: rider },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
    return riders.length;
};

const seedPolicies = async () => {
    for (const policy of policySeed) {
        await Policy.findOneAndUpdate(
            { slug: policy.slug },
            { $set: policy },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
    return policySeed.length;
};

const seedFaqs = async () => {
    for (const faq of faqSeed) {
        await Faq.findOneAndUpdate(
            { question: faq.question },
            { $set: { ...faq, isPublished: true } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
    return faqSeed.length;
};

const run = async () => {
    await connectDB();

    if (FRESH) {
        console.log('[seed] --fresh: clearing catalogue, fleet and content collections');
        await Promise.all([
            Partner.deleteMany({}),
            Rider.deleteMany({}),
            FoodItem.deleteMany({}),
            FoodCategory.deleteMany({}),
            Policy.deleteMany({}),
            Faq.deleteMany({})
        ]);
    }

    const categories = await seedCategories();
    const partners = await seedPartners();
    const items = await seedItems(partners);
    const riders = await seedRiders();
    const policies = await seedPolicies();
    const faqs = await seedFaqs();

    console.log('[seed] done');
    console.table({
        categories,
        partners: partners.length,
        foodItems: items,
        riders,
        policies,
        faqs
    });

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('[seed] failed:', error);
    process.exit(1);
});
