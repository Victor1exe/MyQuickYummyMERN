/**
 * Static marketing copy for the home page.
 *
 * This used to sit inline at the top of screens/Home.js, which is a large part
 * of why that file reached 1,400 lines. None of it depends on component state.
 */

export const SECTIONS = [
    { id: 'categories', label: 'Categories', icon: 'th-large' },
    { id: 'menu', label: 'Menu', icon: 'utensils' },
    { id: 'kitchens', label: 'Our Kitchens', icon: 'store' },
    { id: 'riders', label: 'Delivery Partners', icon: 'motorcycle' },
    { id: 'diet', label: 'Diet Calculator', icon: 'calculator' },
    { id: 'faq', label: 'FAQ', icon: 'circle-question' },
    { id: 'about', label: 'About Us', icon: 'circle-info' }
];

export const PARTNER_FEATURES = [
    { label: 'Instant Payouts', icon: 'money-bill-wave' },
    { label: 'Flexible Hours', icon: 'clock' },
    { label: 'Best-in-Class Support', icon: 'headset' },
    { label: 'Easy Navigation', icon: 'map-marked-alt' },
    { label: 'Safety First', icon: 'shield-alt' },
    { label: 'Customer Ratings', icon: 'star' },
    { label: '24/7 Availability', icon: 'sun' },
    { label: 'Smart Routing', icon: 'route' },
    { label: 'Earn Bonuses', icon: 'award' },
    { label: 'Zero Delivery Fees', icon: 'times-circle' },
    { label: 'Insurance Coverage', icon: 'umbrella' },
    { label: 'Free Meals', icon: 'utensils' },
    { label: 'Community Events', icon: 'users' },
    { label: 'Training Programs', icon: 'graduation-cap' },
    { label: 'Career Growth', icon: 'chart-line' }
];

export const CUSTOMER_STATS = [
    { title: 'Total Customers', value: '10M+', icon: 'users' },
    { title: 'Active Users', value: '3M+', icon: 'user-check' },
    { title: 'Regions Covered', value: '150+', icon: 'map-marked-alt' },
    { title: 'Yearly Growth', value: '35%', icon: 'chart-line' }
];

export const FUTURE_PLANS = [
    {
        title: 'Global Expansion',
        description: 'Launch in 20+ new countries within the next 3 years, starting with European markets.',
        icon: 'globe-americas'
    },
    {
        title: 'AI Integration',
        description: 'Implement AI-powered recommendations and dynamic pricing to enhance customer experience.',
        icon: 'robot'
    },
    {
        title: 'Eco-Friendly Packaging',
        description: 'Transition to 100% biodegradable packaging materials.',
        icon: 'leaf'
    },
    {
        title: 'Drone Deliveries',
        description: 'Pilot drone delivery program in select urban areas.',
        icon: 'helicopter'
    },
    {
        title: 'Subscription Model',
        description: 'Introduce premium subscription with benefits like free deliveries and exclusive deals.',
        icon: 'crown'
    },
    {
        title: 'Virtual Restaurants',
        description: 'Launch 50 cloud kitchens dedicated to Quick Yummy delivery-only brands.',
        icon: 'utensils'
    }
];

export const FUTURE_UPDATES = [
    {
        title: 'Real-Time Tracking',
        description: 'Enhanced live tracking with estimated bite-time prediction technology.',
        icon: 'map-marker-alt'
    },
    {
        title: 'Group Ordering',
        description: 'New feature for offices and families to coordinate large orders easily.',
        icon: 'users'
    },
    {
        title: 'Health Scores',
        description: 'Nutritional information and health ratings for all menu items.',
        icon: 'heartbeat'
    },
    {
        title: 'Voice Ordering',
        description: 'Complete hands-free ordering through smart assistants.',
        icon: 'microphone'
    },
    {
        title: 'AR Menu Preview',
        description: 'Augmented Reality preview of dishes before ordering.',
        icon: 'vr-cardboard'
    },
    {
        title: 'Smart Scheduling',
        description: 'AI that learns your eating habits and suggests optimal ordering times.',
        icon: 'clock'
    }
];

export const COMPANY_TIMELINE = [
    { year: '2012', event: 'Founded in San Francisco with 5 restaurants' },
    { year: '2014', event: 'Expanded to 3 major US cities' },
    { year: '2016', event: 'Launched mobile app with 1M downloads' },
    { year: '2018', event: 'International expansion to Canada and UK' },
    { year: '2020', event: 'Pandemic response: contactless delivery' },
    { year: '2022', event: 'Reached 10M customers worldwide' },
    { year: '2023', event: 'Sustainability initiatives launched' }
];

export const COMPANY_INFO_CARDS = [
    {
        className: 'mission-card',
        icon: 'bullseye',
        title: 'Our Mission',
        body: 'To revolutionize food delivery by connecting people with their favorite meals in the fastest, most convenient way possible while supporting local restaurants and delivery partners.'
    },
    {
        className: 'values-card',
        icon: 'heart',
        title: 'Core Values',
        body: 'Customer obsession, Speed & Efficiency, Community Support, Innovation, Transparency, and Sustainability guide every decision we make.'
    },
    {
        className: 'team-card',
        icon: 'users',
        title: 'Our Team',
        body: 'A diverse group of food enthusiasts, tech experts, and logistics professionals working together to deliver exceptional experiences.'
    },
    {
        className: 'impact-card',
        icon: 'globe',
        title: 'Social Impact',
        body: "We've created 50,000+ jobs, delivered 10M+ meals to those in need, and reduced our carbon footprint by 30% since 2020."
    },
    {
        className: 'tech-card',
        icon: 'microchip',
        title: 'Our Technology',
        body: 'Using AI-driven logistics, real-time tracking, and predictive ordering to create seamless food delivery experiences.'
    },
    {
        className: 'growth-card',
        icon: 'chart-line',
        title: 'Growth Story',
        body: 'From a single city startup to serving 150+ cities across 3 countries, with 200% year-over-year growth.'
    }
];

export const CUSTOMERS_COPY = [
    'At Quick Yummy, our customers are at the heart of everything we do. Over the past decade, we\'ve built relationships with millions of food lovers across the globe who trust us to deliver not just meals, but memorable dining experiences right to their doors.',
    'What sets our customers apart is their diverse palate and adventurous spirit. From busy professionals in New York ordering their weekly comfort food to families in Tokyo exploring international cuisines, our platform connects people with flavors that delight and surprise. We\'ve seen customers\' tastes evolve over time, from initial skepticism about food delivery to embracing it as an essential part of their lifestyle.',
    'The Quick Yummy experience begins long before the food arrives. Our app\'s intuitive design makes browsing menus effortless, with personalized recommendations that learn from each order. Customers particularly love our real-time tracking system that shows exactly when their food will arrive, complete with temperature monitoring to ensure optimal freshness.',
    'But beyond the technology, it\'s the human connection that matters most. Our customer service team (available 24/7 in 15 languages) builds genuine relationships, remembering regulars\' preferences and special requests. Many customers tell us they feel like part of the Quick Yummy family, with some even naming their favorite delivery partners in reviews.',
    'We\'re proud that 78% of our customers have been with us for over two years, a testament to the consistent quality and service we provide. Their feedback drives our innovation, from introducing healthier options to expanding our late-night delivery for shift workers. Every feature we add, every restaurant we partner with, is guided by our customers\' evolving needs and desires.',
    'Looking ahead, we\'re excited to deepen these relationships through our upcoming loyalty program and community events. Because at Quick Yummy, we don\'t just deliver food - we deliver connections, experiences, and moments of joy that turn first-time users into lifelong fans.'
];

export const DELIVERY_HEROES_COPY =
    'At Quick Yummy, our delivery partners are the backbone of our service. These dedicated individuals work tirelessly to ensure your food arrives hot and fresh, rain or shine. They navigate through traffic, brave the elements, and always do it with a smile. We carefully select and train our partners to provide not just delivery, but an exceptional experience. Each partner undergoes rigorous training in food handling, customer service, and efficient route planning. Their commitment allows us to maintain our 98% on-time delivery rate. We\'re proud to support their livelihoods while they support our mission to deliver happiness, one meal at a time.';

export const FOOD_FACTS = [
    'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.',
    "The world's most expensive pizza costs $12,000 and takes 72 hours to make.",
    "Bananas are berries, but strawberries aren't.",
    'The fear of cooking is known as Mageirocophobia.',
    'Apples float because 25% of their volume is air.',
    "The world's largest chocolate bar weighed 12,770 pounds.",
    "Peanuts are not nuts - they're legumes.",
    'The most stolen food in the world is cheese.',
    'The color of a chili pepper is no indication of its spiciness.',
    'The average person eats about 35 tons of food in their lifetime.'
];
