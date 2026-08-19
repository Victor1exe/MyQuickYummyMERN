import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MenuRow from '../components/MenuRow';
import useDarkMode from '../hooks/useDarkMode';
import { apiGet } from '../services/api';

import '../styles/food-detail.css';

/** A single kitchen and its complete menu, grouped by category. */
export default function KitchenView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useDarkMode();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const response = await apiGet(`/api/partners/${id}`);
                if (!cancelled) {
                    setData(response);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const menuByCategory = useMemo(() => {
        if (!data?.menu) return [];

        const grouped = data.menu.reduce((acc, item) => {
            (acc[item.CategoryName] = acc[item.CategoryName] || []).push(item);
            return acc;
        }, {});

        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [data]);

    const partner = data?.partner;

    return (
        <div className={`food-detail-container ${darkMode ? 'dark' : ''}`}>
            <Navbar />

            <main className="food-detail-main">
                <button type="button" className="detail-back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Back
                </button>

                {loading && (
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i> Loading kitchen...
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}

                {!loading && !error && partner && (
                    <>
                        <section className="kitchen-banner">
                            {partner.img && <img src={partner.img} alt={partner.name} />}
                            <div className="kitchen-banner-body">
                                <span className="kitchen-type">{partner.type}</span>
                                <h2>{partner.name}</h2>
                                <p>{partner.description}</p>
                                <div className="kitchen-banner-meta">
                                    <span>
                                        <i className="fas fa-star" aria-hidden="true"></i>{' '}
                                        <strong>{partner.rating}</strong> ({partner.ratingCount} ratings)
                                    </span>
                                    <span>
                                        <i className="fas fa-location-dot" aria-hidden="true"></i>{' '}
                                        {partner.address}, {partner.city}
                                    </span>
                                    <span>
                                        <i className="fas fa-clock" aria-hidden="true"></i>{' '}
                                        {partner.openingTime} – {partner.closingTime}
                                    </span>
                                    <span>
                                        <i className="fas fa-truck-fast" aria-hidden="true"></i>{' '}
                                        {partner.deliveryTimeMins} min delivery
                                    </span>
                                    {partner.cuisines?.length > 0 && (
                                        <span>
                                            <i className="fas fa-utensils" aria-hidden="true"></i>{' '}
                                            {partner.cuisines.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {menuByCategory.length === 0 ? (
                            <div className="detail-empty">This kitchen has no dishes listed right now.</div>
                        ) : (
                            menuByCategory.map(([category, items]) => (
                                <section key={category} className="detail-section">
                                    <h2>{category}</h2>
                                    <p className="detail-section-hint">
                                        {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                                    </p>
                                    <div className="menu-list">
                                        {items.map((item) => (
                                            <MenuRow key={item._id} item={item} />
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
