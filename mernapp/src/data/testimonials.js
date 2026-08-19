/**
 * Testimonial fixtures for the two story carousels.
 *
 * The original built these with `Math.random()` in the component body, so every
 * render produced brand new people — the slide you were reading changed name
 * mid-sentence whenever any unrelated state updated. These are generated once,
 * deterministically, at module load.
 */

const PARTNER_FIRST = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin'];
const PARTNER_LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const CUSTOMER_FIRST = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna'];
const CUSTOMER_LAST = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

const STATES = ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];

const FAVOURITE_FOODS = ['Margherita Pizza', 'Cheeseburger', 'California Roll', 'Spaghetti Carbonara', 'Chicken Tikka Masala', 'Beef Pho', 'Caesar Salad', 'Chocolate Lava Cake', 'Fish Tacos', 'Pad Thai', 'Mushroom Risotto', 'BBQ Ribs', 'Avocado Toast', 'Chicken Wings', 'Shrimp Scampi'];

const VEHICLES = ['bicycle', 'motorcycle', 'electric scooter', 'car', 'electric bike', 'walking', 'public transit', 'hybrid vehicle', 'skateboard', 'moped'];

const SPECIALTIES = ['quick deliveries', 'careful handling', 'friendly service', 'late night runs', 'large orders', 'hot food', 'cold items', 'fragile packages', 'multiple stops', 'rush orders'];

/** Small integer hash so each slot always resolves to the same person. */
const at = (list, seed, salt) => list[(seed * 31 + salt * 17) % list.length];

const COUNT = 15;
const CURRENT_YEAR = new Date().getFullYear();

export const DELIVERY_PARTNERS = Array.from({ length: COUNT }, (_, i) => {
    const name = `${at(PARTNER_FIRST, i, 1)} ${at(PARTNER_LAST, i, 2)}`;
    const state = at(STATES, i, 3);
    const vehicle = at(VEHICLES, i, 4);
    const specialty = at(SPECIALTIES, i, 5);
    const years = (i % 5) + 1;
    const deliveries = 1000 + i * 271;
    const rating = (4.5 + (i % 5) / 10).toFixed(1);

    return {
        id: i,
        name,
        age: 25 + (i % 20),
        state,
        country: 'USA',
        vehicle,
        deliveries,
        rating,
        experience: `As a delivery partner with Quick Yummy for ${years} years, I've enjoyed the flexible hours and great support. Delivering by ${vehicle}, I specialize in ${specialty}. The app makes navigation easy, and I've completed over ${deliveries} deliveries with a ${rating} star rating. My favorite part is seeing happy faces when I deliver their meals exactly when they want them.`
    };
});

export const CUSTOMERS = Array.from({ length: COUNT }, (_, i) => {
    const name = `${at(CUSTOMER_FIRST, i, 1)} ${at(CUSTOMER_LAST, i, 2)}`;
    const state = at(STATES, i, 6);
    const favouriteFood = at(FAVOURITE_FOODS, i, 7);
    const orders = 10 + i * 13;
    const memberSince = CURRENT_YEAR - 2 - (i % 5);

    return {
        id: i,
        name,
        age: 20 + (i % 30),
        state,
        country: 'USA',
        orders,
        memberSince,
        experience: `Quick Yummy has transformed my dining experience! As a customer since ${memberSince}, I've placed ${orders} orders and the food always arrives hot and fresh. Living in ${state}, I especially love the variety and how easy it is to track my delivery. The ${favouriteFood} is my absolute favorite - I order it at least once a week! The delivery partners are always so friendly and professional.`
    };
});
