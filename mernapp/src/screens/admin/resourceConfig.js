/**
 * Declarative description of each admin resource: what its table shows, and
 * what its create/edit form asks for. AdminResource renders all six from this,
 * so adding a field is a one-line change rather than a new screen.
 *
 * Field types: text | textarea | number | select | checkbox | csv | ref
 */

const PARTNER_TYPES = ['Restaurant', 'Hotel', 'Cloud Kitchen', 'Food Stall', 'Bakery', 'Cafe'];
const RIDER_STATUSES = ['available', 'ready_to_go', 'busy', 'on_break', 'offline'];
const VEHICLES = ['bicycle', 'motorcycle', 'electric scooter', 'electric bike', 'car', 'moped', 'walking'];
const SHIFTS = ['morning', 'evening', 'night', 'flexible'];
const POLICY_CATEGORIES = ['Rider Policy', 'Partner Policy', 'Customer Policy', 'Internal SOP', 'Legal'];
const FAQ_CATEGORIES = ['Ordering', 'Payments', 'Delivery', 'Account', 'Partners', 'Riders'];

export const RESOURCES = {
    partners: {
        endpoint: '/api/admin/partners',
        title: 'Kitchens & Partners',
        subtitle:
            'Every restaurant, hotel kitchen, cloud kitchen, food stall, bakery and cafe selling through the platform.',
        singular: 'kitchen',
        searchPlaceholder: 'Search by name, city or email…',
        columns: [
            { key: 'name', label: 'Name' },
            { key: 'type', label: 'Type', render: (row) => <span className="admin-pill">{row.type}</span> },
            { key: 'city', label: 'City' },
            { key: 'rating', label: 'Rating' },
            { key: 'deliveryTimeMins', label: 'Delivery', render: (row) => `${row.deliveryTimeMins} min` },
            {
                key: 'isActive',
                label: 'Status',
                render: (row) => (
                    <span className={`admin-pill ${row.isActive ? 'on' : 'off'}`}>
                        {row.isActive ? 'Active' : 'Paused'}
                    </span>
                )
            }
        ],
        fields: [
            { name: 'name', label: 'Kitchen name', type: 'text', required: true },
            { name: 'type', label: 'Type', type: 'select', options: PARTNER_TYPES },
            { name: 'description', label: 'Description', type: 'textarea', full: true },
            { name: 'img', label: 'Image URL', type: 'text', full: true },
            { name: 'cuisines', label: 'Cuisines', type: 'csv', hint: 'Comma separated, e.g. Italian, Pizza' },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'city', label: 'City', type: 'text' },
            { name: 'state', label: 'State', type: 'text' },
            { name: 'phone', label: 'Phone', type: 'text' },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'rating', label: 'Rating (0-5)', type: 'number', step: '0.1', min: 0, max: 5 },
            { name: 'ratingCount', label: 'Number of ratings', type: 'number' },
            { name: 'avgCostForTwo', label: 'Avg cost for two (₹)', type: 'number' },
            { name: 'deliveryTimeMins', label: 'Delivery time (mins)', type: 'number' },
            { name: 'fssaiLicense', label: 'FSSAI licence', type: 'text' },
            { name: 'openingTime', label: 'Opens at', type: 'text', hint: '24h, e.g. 11:00' },
            { name: 'closingTime', label: 'Closes at', type: 'text', hint: '24h, e.g. 23:30' },
            { name: 'isActive', label: 'Listed on the storefront', type: 'checkbox', defaultValue: true }
        ]
    },

    riders: {
        endpoint: '/api/admin/riders',
        title: 'Delivery Riders',
        subtitle:
            'The fleet. Status changes here immediately drive the live availability board on the storefront.',
        singular: 'rider',
        searchPlaceholder: 'Search by name, city or phone…',
        columns: [
            { key: 'name', label: 'Name' },
            {
                key: 'status',
                label: 'Status',
                render: (row) => (
                    <span className={`admin-pill ${row.status}`}>{row.status.replace(/_/g, ' ')}</span>
                )
            },
            { key: 'city', label: 'City' },
            { key: 'vehicle', label: 'Vehicle' },
            { key: 'rating', label: 'Rating' },
            { key: 'totalDeliveries', label: 'Deliveries', render: (row) => row.totalDeliveries.toLocaleString() },
            {
                key: 'isVerified',
                label: 'Verified',
                render: (row) => (
                    <span className={`admin-pill ${row.isVerified ? 'on' : 'off'}`}>
                        {row.isVerified ? 'Yes' : 'No'}
                    </span>
                )
            }
        ],
        fields: [
            { name: 'name', label: 'Full name', type: 'text', required: true },
            { name: 'phone', label: 'Phone', type: 'text' },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'city', label: 'City', type: 'text' },
            { name: 'state', label: 'State', type: 'text' },
            { name: 'zone', label: 'Zone', type: 'text' },
            { name: 'vehicle', label: 'Vehicle', type: 'select', options: VEHICLES },
            { name: 'status', label: 'Current status', type: 'select', options: RIDER_STATUSES },
            { name: 'shift', label: 'Shift', type: 'select', options: SHIFTS },
            { name: 'rating', label: 'Rating (0-5)', type: 'number', step: '0.1', min: 0, max: 5 },
            { name: 'totalDeliveries', label: 'Total deliveries', type: 'number' },
            { name: 'isVerified', label: 'Verified (background check passed)', type: 'checkbox' },
            { name: 'isActive', label: 'On the roster', type: 'checkbox', defaultValue: true }
        ]
    },

    categories: {
        endpoint: '/api/admin/categories',
        title: 'Food Categories',
        subtitle: 'The categories customers choose from first. Order and artwork are set here.',
        singular: 'category',
        searchPlaceholder: 'Search categories…',
        columns: [
            { key: 'CategoryName', label: 'Category' },
            { key: 'icon', label: 'Icon', render: (row) => <><i className={`fas fa-${row.icon}`}></i> {row.icon}</> },
            { key: 'sortOrder', label: 'Order' },
            {
                key: 'isActive',
                label: 'Status',
                render: (row) => (
                    <span className={`admin-pill ${row.isActive ? 'on' : 'off'}`}>
                        {row.isActive ? 'Visible' : 'Hidden'}
                    </span>
                )
            }
        ],
        fields: [
            { name: 'CategoryName', label: 'Category name', type: 'text', required: true },
            { name: 'icon', label: 'Font Awesome icon', type: 'text', hint: 'Name only, e.g. pizza-slice' },
            { name: 'description', label: 'Description', type: 'textarea', full: true },
            { name: 'img', label: 'Image URL', type: 'text', full: true },
            { name: 'sortOrder', label: 'Sort order', type: 'number' },
            { name: 'isActive', label: 'Visible on the storefront', type: 'checkbox', defaultValue: true }
        ]
    },

    items: {
        endpoint: '/api/admin/items',
        title: 'Food Items',
        subtitle:
            'The menu. Each dish belongs to a category and to the kitchen that cooks it, which is what the customer sees when they open a food card.',
        singular: 'dish',
        searchPlaceholder: 'Search by dish, category or kitchen…',
        columns: [
            { key: 'name', label: 'Dish' },
            { key: 'CategoryName', label: 'Category' },
            { key: 'partnerName', label: 'Kitchen', render: (row) => row.partner?.name || row.partnerName || '—' },
            {
                key: 'options',
                label: 'Price',
                render: (row) => {
                    const opts = (row.options && row.options[0]) || {};
                    return Object.entries(opts).map(([size, price]) => `${size} ₹${price}`).join(' · ') || '—';
                }
            },
            {
                key: 'isVeg',
                label: 'Diet',
                render: (row) => (
                    <span className={`admin-pill ${row.isVeg ? 'on' : 'off'}`}>{row.isVeg ? 'Veg' : 'Non-veg'}</span>
                )
            },
            { key: 'calories', label: 'kcal' },
            {
                key: 'isAvailable',
                label: 'Status',
                render: (row) => (
                    <span className={`admin-pill ${row.isAvailable ? 'on' : 'off'}`}>
                        {row.isAvailable ? 'Available' : 'Off menu'}
                    </span>
                )
            }
        ],
        fields: [
            { name: 'name', label: 'Dish name', type: 'text', required: true },
            { name: 'CategoryName', label: 'Category', type: 'ref', refKey: 'categories', required: true },
            { name: 'description', label: 'Description', type: 'textarea', full: true },
            { name: 'img', label: 'Image URL', type: 'text', full: true },
            { name: 'partner', label: 'Kitchen', type: 'ref', refKey: 'partners' },
            { name: 'half', label: 'Half portion price (₹)', type: 'number' },
            { name: 'full', label: 'Full portion price (₹)', type: 'number' },
            { name: 'isVeg', label: 'Vegetarian', type: 'checkbox' },
            { name: 'isBestseller', label: 'Bestseller', type: 'checkbox' },
            { name: 'rating', label: 'Rating (0-5)', type: 'number', step: '0.1', min: 0, max: 5 },
            { name: 'prepTimeMins', label: 'Prep time (mins)', type: 'number' },
            { name: 'calories', label: 'Calories (kcal)', type: 'number' },
            { name: 'protein', label: 'Protein (g)', type: 'number' },
            { name: 'carbs', label: 'Carbs (g)', type: 'number' },
            { name: 'fat', label: 'Fat (g)', type: 'number' },
            { name: 'isAvailable', label: 'Available to order', type: 'checkbox', defaultValue: true }
        ]
    },

    policies: {
        endpoint: '/api/admin/policies',
        title: 'Policies & Internal Documents',
        subtitle:
            'Rider and partner policies, internal SOPs and legal pages. Publishing one makes it readable on the storefront immediately.',
        singular: 'document',
        searchPlaceholder: 'Search documents…',
        columns: [
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category', render: (row) => <span className="admin-pill">{row.category}</span> },
            { key: 'version', label: 'Version' },
            {
                key: 'isPublished',
                label: 'Visibility',
                render: (row) => (
                    <span className={`admin-pill ${row.isPublished ? 'on' : 'off'}`}>
                        {row.isPublished ? 'Published' : 'Internal only'}
                    </span>
                )
            },
            {
                key: 'updatedAt',
                label: 'Updated',
                render: (row) => new Date(row.updatedAt).toLocaleDateString()
            }
        ],
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'category', label: 'Category', type: 'select', options: POLICY_CATEGORIES },
            { name: 'version', label: 'Version', type: 'text', defaultValue: '1.0' },
            { name: 'slug', label: 'URL slug', type: 'text', hint: 'Leave blank to derive it from the title' },
            { name: 'summary', label: 'Summary', type: 'textarea', full: true },
            { name: 'content', label: 'Document body', type: 'textarea', full: true, required: true, rows: 16 },
            { name: 'isPublished', label: 'Publish on the storefront', type: 'checkbox' }
        ]
    },

    faqs: {
        endpoint: '/api/admin/faqs',
        title: 'FAQs',
        subtitle: 'Questions shown in the FAQ section on the home page.',
        singular: 'question',
        searchPlaceholder: 'Search questions…',
        columns: [
            { key: 'question', label: 'Question' },
            { key: 'category', label: 'Category', render: (row) => <span className="admin-pill">{row.category}</span> },
            { key: 'sortOrder', label: 'Order' },
            {
                key: 'isPublished',
                label: 'Visibility',
                render: (row) => (
                    <span className={`admin-pill ${row.isPublished ? 'on' : 'off'}`}>
                        {row.isPublished ? 'Published' : 'Hidden'}
                    </span>
                )
            }
        ],
        fields: [
            { name: 'question', label: 'Question', type: 'text', required: true, full: true },
            { name: 'answer', label: 'Answer', type: 'textarea', required: true, full: true },
            { name: 'category', label: 'Category', type: 'select', options: FAQ_CATEGORIES },
            { name: 'sortOrder', label: 'Sort order', type: 'number' },
            { name: 'isPublished', label: 'Published', type: 'checkbox', defaultValue: true }
        ]
    }
};

/**
 * Which lookup lists a resource's form needs, and how each option is labelled.
 * `partners` maps to an ObjectId, `categories` maps to the category *name*
 * because that is what a food item stores.
 */
export const REF_SOURCES = {
    partners: {
        endpoint: '/api/admin/partners?limit=500',
        valueOf: (row) => row._id,
        labelOf: (row) => `${row.name} (${row.type})`
    },
    categories: {
        endpoint: '/api/admin/categories?limit=500',
        valueOf: (row) => row.CategoryName,
        labelOf: (row) => row.CategoryName
    }
};
