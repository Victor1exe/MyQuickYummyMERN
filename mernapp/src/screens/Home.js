import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';

export default function Home() {
    const [search, setSearch] = useState('');
    const [foodCat, setFoodCat] = useState([]);
    const [foodItem, setFoodItem] = useState([]);
    const [currentPartner, setCurrentPartner] = useState(0);
    const [currentCustomer, setCurrentCustomer] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndices, setCurrentIndices] = useState({});

    // Real random names for delivery partners
    const partnerFirstNames = [
        'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Daniel',
        'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin'
    ];
    const partnerLastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];

    // Real random names for customers
    const customerFirstNames = [
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
        'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna'
    ];
    const customerLastNames = [
        'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
        'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
    ];

    // States for random selection
    const states = ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
    
    // Food items for customer favorites
    const favoriteFoods = [
        'Margherita Pizza', 'Cheeseburger', 'California Roll', 'Spaghetti Carbonara', 
        'Chicken Tikka Masala', 'Beef Pho', 'Caesar Salad', 'Chocolate Lava Cake',
        'Fish Tacos', 'Pad Thai', 'Mushroom Risotto', 'BBQ Ribs',
        'Avocado Toast', 'Chicken Wings', 'Shrimp Scampi'
    ];

    // Delivery vehicle types
    const vehicleTypes = [
        'bicycle', 'motorcycle', 'electric scooter', 'car', 'electric bike',
        'walking', 'public transit', 'hybrid vehicle', 'skateboard', 'moped'
    ];

    // Delivery partner specialties
    const partnerSpecialties = [
        'quick deliveries', 'careful handling', 'friendly service', 'late night runs',
        'large orders', 'hot food', 'cold items', 'fragile packages', 'multiple stops',
        'rush orders'
    ];

    // Generate random delivery partners data
    const deliveryPartners = Array(15).fill().map((_, i) => {
        const firstName = partnerFirstNames[Math.floor(Math.random() * partnerFirstNames.length)];
        const lastName = partnerLastNames[Math.floor(Math.random() * partnerLastNames.length)];
        const state = states[Math.floor(Math.random() * states.length)];
        const vehicle = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        const specialty = partnerSpecialties[Math.floor(Math.random() * partnerSpecialties.length)];
        
        return {
            id: i,
            name: `${firstName} ${lastName}`,
            age: Math.floor(Math.random() * 20) + 25,
            state: state,
            country: 'USA',
            vehicle: vehicle,
            deliveries: Math.floor(Math.random() * 5000) + 1000,
            rating: (Math.random() * 0.5 + 4.5).toFixed(1),
            experience: `As a delivery partner with Quick Yummy for ${Math.floor(Math.random() * 5) + 1} years, I've enjoyed the flexible hours and great support. 
            Delivering by ${vehicle}, I specialize in ${specialty}. The app makes navigation easy, and I've completed over ${Math.floor(Math.random() * 5000) + 1000} deliveries 
            with a ${(Math.random() * 0.5 + 4.5).toFixed(1)} star rating. My favorite part is seeing happy faces when I deliver their meals exactly when they want them.`
        };
    });

    // Generate random customers data
    const customers = Array(15).fill().map((_, i) => {
        const firstName = customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)];
        const lastName = customerLastNames[Math.floor(Math.random() * customerLastNames.length)];
        const state = states[Math.floor(Math.random() * states.length)];
        const favoriteFood = favoriteFoods[Math.floor(Math.random() * favoriteFoods.length)];
        const orders = Math.floor(Math.random() * 200) + 10;
        
        return {
            id: i,
            name: `${firstName} ${lastName}`,
            age: Math.floor(Math.random() * 30) + 20,
            state: state,
            country: 'USA',
            orders: orders,
            memberSince: 2023 - Math.floor(Math.random() * 5),
            experience: `Quick Yummy has transformed my dining experience! As a customer since ${2023 - Math.floor(Math.random() * 5)}, I've placed ${orders} orders 
            and the food always arrives hot and fresh. Living in ${state}, I especially love the variety and how easy it is to track my delivery. 
            The ${favoriteFood} is my absolute favorite - I order it at least once a week! The delivery partners are always so friendly and professional.`
        };
    });

    // Stats data
    const stats = [
        { title: "Total Customers", value: "10M+", icon: "users" },
        { title: "Active Users", value: `${Math.floor(Math.random() * 3) + 2}M+`, icon: "user-check" },
        { title: "Regions Covered", value: "150+", icon: "map-marked-alt" },
        { title: "Yearly Growth", value: "35%", icon: "chart-line" }
    ];

    // Future plans data
    const futurePlans = [
        {
            title: "Global Expansion",
            description: "Launch in 20+ new countries within the next 3 years, starting with European markets in Q1 2024.",
            icon: "globe-americas"
        },
        {
            title: "AI Integration",
            description: "Implement AI-powered recommendations and dynamic pricing to enhance customer experience.",
            icon: "robot"
        },
        {
            title: "Eco-Friendly Packaging",
            description: "Transition to 100% biodegradable packaging materials by 2025.",
            icon: "leaf"
        },
        {
            title: "Drone Deliveries",
            description: "Pilot drone delivery program in select urban areas by mid-2024.",
            icon: "drone-alt"
        },
        {
            title: "Subscription Model",
            description: "Introduce premium subscription with benefits like free deliveries and exclusive deals.",
            icon: "crown"
        },
        {
            title: "Virtual Restaurants",
            description: "Launch 50 cloud kitchens dedicated to Quick Yummy delivery-only brands.",
            icon: "utensils"
        }
    ];

    // Future updates data
    const futureUpdates = [
        {
            title: "Real-Time Tracking",
            description: "Enhanced live tracking with estimated bite-time prediction technology.",
            icon: "map-marker-alt"
        },
        {
            title: "Group Ordering",
            description: "New feature for offices and families to coordinate large orders easily.",
            icon: "users"
        },
        {
            title: "Health Scores",
            description: "Nutritional information and health ratings for all menu items.",
            icon: "heartbeat"
        },
        {
            title: "Voice Ordering",
            description: "Complete hands-free ordering through smart assistants.",
            icon: "microphone"
        },
        {
            title: "AR Menu Preview",
            description: "Augmented Reality preview of dishes before ordering.",
            icon: "vr-cardboard"
        },
        {
            title: "Smart Scheduling",
            description: "AI that learns your eating habits and suggests optimal ordering times.",
            icon: "clock"
        }
    ];

    // Company timeline data
    const companyTimeline = [
        { year: "2012", event: "Founded in San Francisco with 5 restaurants" },
        { year: "2014", event: "Expanded to 3 major US cities" },
        { year: "2016", event: "Launched mobile app with 1M downloads" },
        { year: "2018", event: "International expansion to Canada and UK" },
        { year: "2020", event: "Pandemic response: contactless delivery" },
        { year: "2022", event: "Reached 10M customers worldwide" },
        { year: "2023", event: "Sustainability initiatives launched" }
    ];

    // Auto-rotate testimonials
    useEffect(() => {
        const partnerInterval = setInterval(() => {
            setCurrentPartner((prev) => (prev + 1) % deliveryPartners.length);
        }, 8000);

        const customerInterval = setInterval(() => {
            setCurrentCustomer((prev) => (prev + 1) % customers.length);
        }, 8500);

        return () => {
            clearInterval(partnerInterval);
            clearInterval(customerInterval);
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/foodData", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data && Array.isArray(data) && data.length >= 2) {
                setFoodItem(data[0] || []);
                setFoodCat(data[1] || []);
                
                const indices = {};
                data[1].forEach(category => {
                    indices[category._id] = 0;
                });
                setCurrentIndices(indices);
            } else {
                throw new Error("Invalid data format received from API");
            }
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch food data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        let isMounted = true;
        
        loadData();
        
        const savedMode = localStorage.getItem('darkMode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(savedMode !== null ? JSON.parse(savedMode) : systemPrefersDark);
        
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[<>]/g, '');
        setSearch(sanitizedValue);
    }, []);

    const handleNext = (categoryId, itemCount) => {
        setCurrentIndices(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] + 2) % itemCount
        }));
    };

    const handlePrev = (categoryId, itemCount) => {
        setCurrentIndices(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] - 2 + itemCount) % itemCount
        }));
    };

    const filteredFoodItems = useMemo(() => {
        return foodCat.map(data => ({
            ...data,
            items: foodItem.filter(item => 
                item.CategoryName === data.CategoryName && 
                item.name.toLowerCase().includes(search.toLowerCase())
            )
        }));
    }, [foodCat, foodItem, search]);

    return (
        <div className={`home-container ${darkMode ? 'dark' : ''}`}>
            <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
            
            <a href="#main-content" className="skip-link">Skip to main content</a>
            
            {/* Hero Carousel */}
            <div className="hero-carousel">
                <div className="carousel-overlay">
                    <h1 className="hero-title">Discover Your Favorite Meals</h1>
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Search for restaurants or dishes..." 
                            value={search}
                            onChange={handleSearch}
                            className="search-input"
                            aria-label="Search for restaurants or dishes"
                        />
                        <button className="search-button" aria-label="Search">
                            <i className="fas fa-search" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div className="carousel-images">
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                        alt="Delicious food" 
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Main content */}
            <main id="main-content">
                {/* Food Categories */}
                <div className="food-categories">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i> Loading menu...
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    ) : (
                        filteredFoodItems.map((data) => {
                            const currentIndex = currentIndices[data._id] || 0;
                            const visibleItems = data.items.slice(currentIndex, currentIndex + 2);
                            const hasNext = currentIndex + 2 < data.items.length;
                            const hasPrev = currentIndex > 0;
                            
                            return (
                                <div key={data._id} className="category-section">
                                    <h2 className="category-title">{data.CategoryName}</h2>
                                    <div className="food-items-container">
                                        <button 
                                            className={`nav-button prev ${!hasPrev ? 'disabled' : ''}`}
                                            onClick={() => handlePrev(data._id, data.items.length)}
                                            disabled={!hasPrev}
                                            aria-label={`Previous ${data.CategoryName} items`}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        
                                        <div className="food-items-grid">
                                            {visibleItems.map((filterItems) => (
                                                <Card 
                                                    key={filterItems._id}
                                                    foodItem={filterItems}
                                                    options={filterItems.options[0]}
                                                    darkMode={darkMode}
                                                />
                                            ))}
                                        </div>
                                        
                                        <button 
                                            className={`nav-button next ${!hasNext ? 'disabled' : ''}`}
                                            onClick={() => handleNext(data._id, data.items.length)}
                                            disabled={!hasNext}
                                            aria-label={`Next ${data.CategoryName} items`}
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Delivery Partner Appreciation */}
                <div className="delivery-partners-section">
                    <div className="partners-background">
                        <div className="partners-content">
                            <h2>Our Delivery Heroes</h2>
                            <p>
                                At Quick Yummy, our delivery partners are the backbone of our service. 
                                These dedicated individuals work tirelessly to ensure your food arrives 
                                hot and fresh, rain or shine. They navigate through traffic, brave the 
                                elements, and always do it with a smile. We carefully select and train 
                                our partners to provide not just delivery, but an exceptional experience. 
                                Each partner undergoes rigorous training in food handling, customer service, 
                                and efficient route planning. Their commitment allows us to maintain our 
                                98% on-time delivery rate. We're proud to support their livelihoods while 
                                they support our mission to deliver happiness, one meal at a time.
                            </p>
                        </div>
                    </div>
                    
                    <div className="partner-features">
                        {[
                            "Instant Payouts", "Flexible Hours", "Best-in-Class Support", 
                            "Easy Navigation", "Safety First", "Customer Ratings",
                            "24/7 Availability", "Smart Routing", "Earn Bonuses",
                            "Zero Delivery Fees", "Insurance Coverage", "Free Meals",
                            "Community Events", "Training Programs", "Career Growth"
                        ].map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <i className={`fas fa-${
                                        ['money-bill-wave', 'clock', 'headset',
                                        'map-marked-alt', 'shield-alt', 'star',
                                        'sun', 'route', 'award',
                                        'times-circle', 'umbrella', 'utensils',
                                        'users', 'graduation-cap', 'chart-line'][index]
                                    }`}></i>
                                </div>
                                <h3>{feature}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Partner Stories */}
                <div className="testimonial-section partner-stories">
                    <div className="testimonial-background" style={{ 
                        backgroundImage: `url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)`
                    }}></div>
                    <div className="testimonial-content">
                        <h2>Delivery Partner Stories</h2>
                        <div className="testimonial-slider">
                            {deliveryPartners.map((partner, index) => (
                                <div 
                                    key={partner.id}
                                    className={`testimonial-slide ${index === currentPartner ? 'active' : ''}`}
                                    style={{ transform: `translateX(${(index - currentPartner) * 100}%)` }}
                                >
                                    <div className="testimonial-card">
                                        <p>"{partner.experience}"</p>
                                        <div className="testimonial-author">
                                            <h4>{partner.name}</h4>
                                            <span>{partner.age} • {partner.state}, {partner.country}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="testimonial-dots">
                            {deliveryPartners.map((_, index) => (
                                <button
                                    key={index}
                                    className={index === currentPartner ? 'active' : ''}
                                    onClick={() => setCurrentPartner(index)}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Our Customers Section */}
                <div className="customers-description-section">
                    <div className="customers-background" style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)`
                    }}>
                        <div className="customers-overlay">
                            <h2>Our Customers</h2>
                            <div className="customers-content">
                                <p>At Quick Yummy, our customers are at the heart of everything we do. Over the past decade, we've built relationships with millions of food lovers across the globe who trust us to deliver not just meals, but memorable dining experiences right to their doors.</p>
                                
                                <p>What sets our customers apart is their diverse palate and adventurous spirit. From busy professionals in New York ordering their weekly comfort food to families in Tokyo exploring international cuisines, our platform connects people with flavors that delight and surprise. We've seen customers' tastes evolve over time, from initial skepticism about food delivery to embracing it as an essential part of their lifestyle.</p>
                                
                                <p>The Quick Yummy experience begins long before the food arrives. Our app's intuitive design makes browsing menus effortless, with personalized recommendations that learn from each order. Customers particularly love our real-time tracking system that shows exactly when their food will arrive, complete with temperature monitoring to ensure optimal freshness.</p>
                                
                                <p>But beyond the technology, it's the human connection that matters most. Our customer service team (available 24/7 in 15 languages) builds genuine relationships, remembering regulars' preferences and special requests. Many customers tell us they feel like part of the Quick Yummy family, with some even naming their favorite delivery partners in reviews.</p>
                                
                                <p>We're proud that 78% of our customers have been with us for over two years, a testament to the consistent quality and service we provide. Their feedback drives our innovation, from introducing healthier options to expanding our late-night delivery for shift workers. Every feature we add, every restaurant we partner with, is guided by our customers' evolving needs and desires.</p>
                                
                                <p>Looking ahead, we're excited to deepen these relationships through our upcoming loyalty program and community events. Because at Quick Yummy, we don't just deliver food - we deliver connections, experiences, and moments of joy that turn first-time users into lifelong fans.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Stories */}
                <div className="testimonial-section customer-stories">
                    <div className="testimonial-background" style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)`
                    }}></div>
                    <div className="testimonial-content">
                        <h2>Customer Stories</h2>
                        <div className="testimonial-slider">
                            {customers.map((customer, index) => (
                                <div 
                                    key={customer.id}
                                    className={`testimonial-slide ${index === currentCustomer ? 'active' : ''}`}
                                    style={{ transform: `translateX(${(index - currentCustomer) * 100}%)` }}
                                >
                                    <div className="testimonial-card">
                                        <p>"{customer.experience}"</p>
                                        <div className="testimonial-author">
                                            <h4>{customer.name}</h4>
                                            <span>{customer.age} • {customer.state}, {customer.country}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="testimonial-dots">
                            {customers.map((_, index) => (
                                <button
                                    key={index}
                                    className={index === currentCustomer ? 'active' : ''}
                                    onClick={() => setCurrentCustomer(index)}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Stats Section */}
                <div className="customer-stats-section">
                    <div className="stats-container">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-icon">
                                    <i className={`fas fa-${stat.icon}`}></i>
                                </div>
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Future Plans Section */}
                <div className="future-plans-section">
                    <h2>Future Plans</h2>
                    <div className="plans-container">
                        {futurePlans.map((plan, index) => (
                            <div key={index} className="plan-card">
                                <div className="plan-icon">
                                    <i className={`fas fa-${plan.icon}`}></i>
                                </div>
                                <h3>{plan.title}</h3>
                                <p>{plan.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Future Updates Section */}
                <div className="future-updates-section">
                    <h2>Future Updates</h2>
                    <div className="updates-container">
                        {futureUpdates.map((update, index) => (
                            <div key={index} className="update-card">
                                <div className="update-icon">
                                    <i className={`fas fa-${update.icon}`}></i>
                                </div>
                                <h3>{update.title}</h3>
                                <p>{update.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Know Your Quick Yummy Section */}
                <div className="about-company-section">
                    <h2>Know Your Quick Yummy</h2>
                    
                    {/* Company Timeline */}
                    <div className="company-timeline">
                        <div className="timeline-track"></div>
                        {companyTimeline.map((milestone, index) => (
                            <div key={index} className="milestone">
                                <div className="milestone-year">{milestone.year}</div>
                                <div className="milestone-event">{milestone.event}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="company-info-container">
                        {/* Card 1 - Mission */}
                        <div className="info-card mission-card">
                            <div className="info-icon">
                                <i className="fas fa-bullseye"></i>
                            </div>
                            <h3>Our Mission</h3>
                            <p>To revolutionize food delivery by connecting people with their favorite meals in the fastest, most convenient way possible while supporting local restaurants and delivery partners.</p>
                        </div>
                        
                        {/* Card 2 - Values */}
                        <div className="info-card values-card">
                            <div className="info-icon">
                                <i className="fas fa-heart"></i>
                            </div>
                            <h3>Core Values</h3>
                            <p>Customer obsession, Speed & Efficiency, Community Support, Innovation, Transparency, and Sustainability guide every decision we make.</p>
                        </div>
                        
                        {/* Card 3 - Team */}
                        <div className="info-card team-card">
                            <div className="info-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3>Our Team</h3>
                            <p>A diverse group of food enthusiasts, tech experts, and logistics professionals working together to deliver exceptional experiences.</p>
                        </div>
                        
                        {/* Card 4 - Impact */}
                        <div className="info-card impact-card">
                            <div className="info-icon">
                                <i className="fas fa-globe"></i>
                            </div>
                            <h3>Social Impact</h3>
                            <p>We've created 50,000+ jobs, delivered 10M+ meals to those in need, and reduced our carbon footprint by 30% since 2020.</p>
                        </div>
                        
                        {/* Card 5 - Technology */}
                        <div className="info-card tech-card">
                            <div className="info-icon">
                                <i className="fas fa-microchip"></i>
                            </div>
                            <h3>Our Technology</h3>
                            <p>Using AI-driven logistics, real-time tracking, and predictive ordering to create seamless food delivery experiences.</p>
                        </div>
                        
                        {/* Card 6 - Growth */}
                        <div className="info-card growth-card">
                            <div className="info-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>Growth Story</h3>
                            <p>From a single city startup to serving 150+ cities across 3 countries, with 200% year-over-year growth.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer darkMode={darkMode} />

            <style jsx global>{`
                :root {
                    --bg-color: #ffffff;
                    --text-color: #333333;
                    --card-bg: #ffffff;
                    --primary-color: #fc8019;
                    --secondary-color: #f55d2c;
                    --accent-color: #ff6b6b;
                    --light-gray: #f8f9fa;
                    --dark-gray: #6c757d;
                    --shadow: 0 5px 15px rgba(0,0,0,0.1);
                    --transition: all 0.3s ease;
                    --search-text-color: #333333;
                    --search-placeholder-color: #6c757d;
                }

                .dark {
                    --bg-color: #121212;
                    --text-color: #f0f0f0;
                    --card-bg: #1e1e1e;
                    --light-gray: #2a2a2a;
                    --dark-gray: #aaaaaa;
                    --shadow: 0 5px 15px rgba(0,0,0,0.3);
                    --search-text-color: #ffffff;
                    --search-placeholder-color: #bbbbbb;
                }

                body {
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    transition: var(--transition);
                    margin: 0;
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                }

                a {
                    color: var(--primary-color);
                    text-decoration: none;
                }

                button {
                    cursor: pointer;
                    outline: none;
                }

                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    background: var(--primary-color);
                    color: white;
                    padding: 8px;
                    z-index: 100;
                    transition: top 0.3s;
                }

                .skip-link:focus {
                    top: 0;
                }
            `}</style>

            <style jsx>{`
                /* Base Styles */
                .home-container {
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: var(--text-color);
                    overflow-x: hidden;
                    background: var(--bg-color);
                    transition: var(--transition);
                }

                /* Hero Carousel */
                .hero-carousel {
                    position: relative;
                    height: 70vh;
                    overflow: hidden;
                }

                .carousel-images img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.7);
                    animation: zoomInOut 20s infinite alternate;
                }

                .carousel-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 2;
                    color: white;
                    text-align: center;
                    padding: 0 20px;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    animation: fadeInDown 1s ease-out;
                }

                .search-container {
                    display: flex;
                    width: 100%;
                    max-width: 600px;
                    animation: fadeInUp 1s ease-out 0.3s both;
                }

                .search-input {
                    flex: 1;
                    padding: 15px 20px;
                    border: none;
                    border-radius: 30px 0 0 30px;
                    font-size: 1.1rem;
                    outline: none;
                    background: rgba(255,255,255,0.9);
                    color: var(--search-text-color);
                }

                .search-input::placeholder {
                    color: var(--search-placeholder-color);
                    opacity: 0.8;
                }

                .search-button {
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    color: white;
                    border: none;
                    padding: 0 25px;
                    border-radius: 0 30px 30px 0;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .search-button:hover {
                    background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                    transform: scale(1.02);
                }

                /* Food Categories */
                .food-categories {
                    padding: 5rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .loading-spinner,
                .error-message {
                    text-align: center;
                    padding: 2rem;
                    font-size: 1.2rem;
                }

                .error-message {
                    color: #dc3545;
                }

                .category-section {
                    margin-bottom: 4rem;
                }

                .category-title {
                    font-size: 2rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: var(--text-color);
                    position: relative;
                    display: inline-block;
                }

                .category-title::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 3px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    transition: width 0.3s ease;
                }

                .category-title:hover::after {
                    width: 100%;
                }

                .food-items-container {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    position: relative;
                    margin: 2rem 0;
                }

                .nav-button {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition);
                    z-index: 2;
                    box-shadow: var(--shadow);
                }

                .nav-button:hover:not(.disabled) {
                    background: var(--secondary-color);
                    transform: scale(1.1);
                }

                .nav-button.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .food-items-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 3rem;
                    flex: 1;
                    overflow: hidden;
                }

                /* Delivery Partner Section */
                .delivery-partners-section {
                    margin: 4rem 0;
                }

                .partners-background {
                    background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                                url('https://images.unsplash.com/photo-1581349485608-9469926a8e5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    padding: 5rem 2rem;
                    text-align: center;
                }

                .partners-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .partners-content h2 {
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    color: #fff;
                }

                .partners-content p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    margin-bottom: 2rem;
                }

                .partner-features {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 2rem;
                    padding: 3rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .feature-card {
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                }

                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                }

                .feature-icon {
                    font-size: 2.5rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }

                .feature-card h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                /* Testimonial Sections */
                .testimonial-section {
                    position: relative;
                    min-height: 500px;
                    padding: 5rem 0;
                    overflow: hidden;
                }

                .testimonial-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.4);
                    z-index: 0;
                }

                .testimonial-content {
                    position: relative;
                    z-index: 1;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    color: white;
                    text-align: center;
                }

                .testimonial-content h2 {
                    font-size: 2.5rem;
                    margin-bottom: 3rem;
                    position: relative;
                    display: inline-block;
                }

                .testimonial-content h2::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 3px;
                    background: var(--primary-color);
                }

                .testimonial-slider {
                    display: flex;
                    overflow: hidden;
                    margin-bottom: 2rem;
                    height: 300px;
                    align-items: center;
                }

                .testimonial-slide {
                    min-width: 100%;
                    padding: 0 2rem;
                    transition: transform 0.5s ease-in-out;
                }

                .testimonial-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .testimonial-card p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    font-style: italic;
                }

                .testimonial-author h4 {
                    font-size: 1.3rem;
                    margin-bottom: 0.5rem;
                }

                .testimonial-author span {
                    opacity: 0.8;
                }

                .testimonial-dots {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .testimonial-dots button {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.3);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .testimonial-dots button.active {
                    background: var(--primary-color);
                    transform: scale(1.2);
                }

                /* Customer Stats Section */
                .customer-stats-section {
                    padding: 4rem 2rem;
                    background: var(--light-gray);
                    transition: background 0.3s ease;
                }

                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .stat-card {
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }

                .stat-icon {
                    font-size: 2.5rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }

                .stat-card p {
                    font-size: 1.1rem;
                    color: var(--dark-gray);
                }

                /* Our Customers Section */
                .customers-description-section {
                    position: relative;
                    margin: 4rem 0;
                }

                .customers-background {
                    background-size: cover;
                    background-position: center;
                    padding: 6rem 2rem;
                    position: relative;
                }

                .customers-overlay {
                    background: rgba(0,0,0,0.7);
                    padding: 3rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    border-radius: 15px;
                }

                .customers-overlay h2 {
                    font-size: 2.5rem;
                    color: #fff;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .customers-content p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    margin-bottom: 1.5rem;
                    color: #fff;
                }

                /* Future Plans Section */
                .future-plans-section,
                .future-updates-section {
                    padding: 5rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    text-align: center;
                }

                .future-plans-section h2,
                .future-updates-section h2 {
                    font-size: 2.5rem;
                    margin-bottom: 3rem;
                    color: var(--text-color);
                }

                .plans-container,
                .updates-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .plan-card,
                .update-card {
                    background: var(--card-bg);
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                }

                .plan-card:hover,
                .update-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                }

                .plan-icon,
                .update-icon {
                    font-size: 2.5rem;
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }

                .plan-card h3,
                .update-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--text-color);
                }

                .plan-card p,
                .update-card p {
                    font-size: 1.1rem;
                    color: var(--dark-gray);
                    line-height: 1.6;
                }

                /* About Company Section */
                .about-company-section {
                    padding: 5rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .about-company-section h2 {
                    font-size: 2.5rem;
                    text-align: center;
                    margin-bottom: 3rem;
                    color: var(--text-color);
                }

                .company-timeline {
                    position: relative;
                    padding: 3rem 0;
                    margin-bottom: 4rem;
                }

                .timeline-track {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 4px;
                    background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
                    transform: translateX(-50%);
                    z-index: 1;
                }

                .milestone {
                    position: relative;
                    width: 45%;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    background: var(--card-bg);
                    border-radius: 10px;
                    box-shadow: var(--shadow);
                    z-index: 2;
                }

                .milestone:nth-child(odd) {
                    left: 0;
                }

                .milestone:nth-child(even) {
                    left: 55%;
                }

                .milestone-year {
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                    font-size: 1.2rem;
                }

                .milestone-event {
                    color: var(--text-color);
                }

                .company-info-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .info-card {
                    padding: 2rem;
                    border-radius: 15px;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                    text-align: center;
                }

                .info-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }

                .info-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    color: var(--primary-color);
                }

                .info-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--text-color);
                    position: relative;
                }

                .info-card h3::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50px;
                    height: 3px;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                }

                .info-card p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: var(--dark-gray);
                }

                /* Card-specific styles */
                .mission-card { 
                    background: rgba(252, 128, 25, 0.05); 
                    border: 1px solid rgba(252, 128, 25, 0.2); 
                }
                .values-card { 
                    background: rgba(76, 175, 80, 0.05); 
                    border: 1px solid rgba(76, 175, 80, 0.2); 
                }
                .team-card { 
                    background: rgba(33, 150, 243, 0.05); 
                    border: 1px solid rgba(33, 150, 243, 0.2); 
                }
                .impact-card { 
                    background: rgba(156, 39, 176, 0.05); 
                    border: 1px solid rgba(156, 39, 176, 0.2); 
                }
                .tech-card { 
                    background: rgba(255, 193, 7, 0.05); 
                    border: 1px solid rgba(255, 193, 7, 0.2); 
                }
                .growth-card { 
                    background: rgba(233, 30, 99, 0.05); 
                    border: 1px solid rgba(233, 30, 99, 0.2); 
                }

                .dark .info-card {
                    background: rgba(30, 30, 30, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* Animations */
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes zoomInOut {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .hero-title {
                        font-size: 3rem;
                    }
                    
                    .partner-features {
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .food-items-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .partners-content h2,
                    .testimonial-content h2,
                    .future-plans-section h2,
                    .future-updates-section h2,
                    .about-company-section h2 {
                        font-size: 2rem;
                    }
                    
                    .milestone {
                        width: 85%;
                    }

                    .milestone:nth-child(even) {
                        left: 0;
                    }
                }

                @media (max-width: 480px) {
                    .hero-title {
                        font-size: 2rem;
                    }
                    
                    .search-container {
                        flex-direction: column;
                    }
                    
                    .search-input {
                        border-radius: 30px;
                        margin-bottom: 1rem;
                    }
                    
                    .search-button {
                        border-radius: 30px;
                        padding: 12px;
                    }
                    
                    .company-info-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}