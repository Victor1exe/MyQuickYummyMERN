import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import HeroSection from '../components/home/HeroSection';
import CategoryChooser from '../components/home/CategoryChooser';
import FoodMenuSection from '../components/home/FoodMenuSection';
import KitchensSection from '../components/home/KitchensSection';
import DeliveryPartnersSection from '../components/home/DeliveryPartnersSection';
import TestimonialCarousel from '../components/home/TestimonialCarousel';
import CustomersSection from '../components/home/CustomersSection';
import StatsSection from '../components/home/StatsSection';
import FuturePlansSection from '../components/home/FuturePlansSection';
import FutureUpdatesSection from '../components/home/FutureUpdatesSection';
import DietCalculatorSection from '../components/home/DietCalculatorSection';
import FaqSection from '../components/home/FaqSection';
import AboutCompanySection from '../components/home/AboutCompanySection';

import useDarkMode from '../hooks/useDarkMode';
import { apiGet } from '../services/api';
import { DELIVERY_PARTNERS, CUSTOMERS } from '../data/testimonials';

import '../styles/home.css';

const PARTNER_STORY_BG =
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
const CUSTOMER_STORY_BG =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

/**
 * Home is now a composition root: it owns the page's data and state, and each
 * visual band lives in its own component under components/home/. Previously
 * all of it — markup, copy, fixtures and 700 lines of CSS — sat in this file.
 */
export default function Home() {
    const { darkMode, toggleTheme } = useDarkMode();

    // Catalogue
    const [foodCat, setFoodCat] = useState([]);
    const [foodItem, setFoodItem] = useState([]);
    const [partners, setPartners] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [riders, setRiders] = useState([]);
    const [riderStats, setRiderStats] = useState(null);

    // UI state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentIndices, setCurrentIndices] = useState({});
    const [currentPartner, setCurrentPartner] = useState(0);
    const [currentCustomer, setCurrentCustomer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const data = await apiGet('/api/foodData');

                if (cancelled) return;

                if (!Array.isArray(data) || data.length < 2) {
                    throw new Error('Invalid data format received from API');
                }

                const [items, categories] = data;
                setFoodItem(items || []);
                setFoodCat(categories || []);
                setCurrentIndices(
                    (categories || []).reduce((acc, category) => ({ ...acc, [category._id]: 0 }), {})
                );
                setError(null);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    console.error('Failed to fetch food data:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Supporting content. A failure here degrades one section rather than the
    // whole page, so each request is settled independently.
    useEffect(() => {
        let cancelled = false;

        const loadExtras = async () => {
            const [partnersRes, faqsRes, policiesRes, ridersRes, statsRes] = await Promise.allSettled([
                apiGet('/api/partners'),
                apiGet('/api/faqs'),
                apiGet('/api/policies'),
                apiGet('/api/riders?limit=8'),
                apiGet('/api/riders/stats')
            ]);

            if (cancelled) return;

            if (partnersRes.status === 'fulfilled') setPartners(partnersRes.value.partners || []);
            if (faqsRes.status === 'fulfilled') setFaqs(faqsRes.value.faqs || []);
            if (policiesRes.status === 'fulfilled') setPolicies(policiesRes.value.policies || []);
            if (ridersRes.status === 'fulfilled') setRiders(ridersRes.value.riders || []);
            if (statsRes.status === 'fulfilled') setRiderStats(statsRes.value.stats || null);
        };

        loadExtras();
        return () => {
            cancelled = true;
        };
    }, []);

    // Auto-rotate both story carousels.
    useEffect(() => {
        const partnerInterval = setInterval(
            () => setCurrentPartner((prev) => (prev + 1) % DELIVERY_PARTNERS.length),
            8000
        );
        const customerInterval = setInterval(
            () => setCurrentCustomer((prev) => (prev + 1) % CUSTOMERS.length),
            8500
        );

        return () => {
            clearInterval(partnerInterval);
            clearInterval(customerInterval);
        };
    }, []);

    const handleSearch = useCallback((event) => {
        setSearch(event.target.value.replace(/[<>]/g, ''));
    }, []);

    const handleSelectCategory = useCallback((categoryName) => {
        setSelectedCategory(categoryName);
        // Paging is per-category; reset it so a new selection starts at the top.
        setCurrentIndices((prev) => Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: 0 }), {}));

        if (categoryName) {
            document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    /**
     * Paging is two items per page. The section computes the target index from
     * the page it is actually displaying and only enables the arrow when that
     * page exists, so a plain clamp is all that is needed here.
     *
     * The previous version did modulo arithmetic on the item count, which would
     * have produced overlapping pages (index 4 of 5 items wrapping to 1) had
     * the disabled state not happened to mask it.
     */
    const handlePageChange = useCallback((categoryId, nextIndex) => {
        setCurrentIndices((prev) => ({ ...prev, [categoryId]: Math.max(0, nextIndex) }));
    }, []);

    const itemCountsByCategory = useMemo(
        () =>
            foodItem.reduce(
                (acc, item) => ({ ...acc, [item.CategoryName]: (acc[item.CategoryName] || 0) + 1 }),
                {}
            ),
        [foodItem]
    );

    const filteredFoodItems = useMemo(() => {
        const term = search.toLowerCase();

        return foodCat
            .filter((category) => !selectedCategory || category.CategoryName === selectedCategory)
            .map((category) => ({
                ...category,
                items: foodItem.filter(
                    (item) =>
                        item.CategoryName === category.CategoryName &&
                        (item.name.toLowerCase().includes(term) ||
                            (item.description || '').toLowerCase().includes(term))
                )
            }));
    }, [foodCat, foodItem, search, selectedCategory]);

    return (
        <div className={`home-container ${darkMode ? 'dark' : ''}`}>
            <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

            <a href="#main-content" className="skip-link">Skip to main content</a>

            <HeroSection search={search} onSearchChange={handleSearch} />

            <main id="main-content">
                <CategoryChooser
                    categories={foodCat}
                    counts={itemCountsByCategory}
                    selected={selectedCategory}
                    onSelect={handleSelectCategory}
                />

                <FoodMenuSection
                    loading={loading}
                    error={error}
                    categories={filteredFoodItems}
                    currentIndices={currentIndices}
                    onPageChange={handlePageChange}
                    darkMode={darkMode}
                />

                <KitchensSection partners={partners} />

                <DeliveryPartnersSection stats={riderStats} riders={riders} policies={policies} />

                <TestimonialCarousel
                    id="partner-stories"
                    title="Delivery Partner Stories"
                    sectionClass="partner-stories"
                    backgroundImage={PARTNER_STORY_BG}
                    entries={DELIVERY_PARTNERS}
                    current={currentPartner}
                    onSelect={setCurrentPartner}
                />

                <CustomersSection />

                <TestimonialCarousel
                    id="customer-stories"
                    title="Customer Stories"
                    sectionClass="customer-stories"
                    backgroundImage={CUSTOMER_STORY_BG}
                    entries={CUSTOMERS}
                    current={currentCustomer}
                    onSelect={setCurrentCustomer}
                />

                <StatsSection liveStats={riderStats} />

                <DietCalculatorSection foodItems={foodItem} />

                <FaqSection faqs={faqs} />

                <FuturePlansSection />

                <FutureUpdatesSection />

                <AboutCompanySection />
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}
