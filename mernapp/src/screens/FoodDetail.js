import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MenuRow from '../components/MenuRow';
import useDarkMode from '../hooks/useDarkMode';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import { apiGet } from '../services/api';

import '../styles/food-detail.css';

/**
 * Step three of the ordering flow. Opened by clicking a food card: shows the
 * dish in full, the kitchen that cooks it, everything else on that kitchen's
 * menu, and similar dishes from other kitchens.
 */
export default function FoodDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useDarkMode();

    const dispatch = useDispatchCart();
    const cart = useCart();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [size, setSize] = useState('');
    const [qty, setQty] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const response = await apiGet(`/api/foodItems/${id}`);
                if (cancelled) return;

                setData(response);
                const firstSize = Object.keys((response.item.options && response.item.options[0]) || {})[0];
                setSize(firstSize || '');
                setQty(1);
                setError(null);
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

    const item = data?.item;
    const partner = item?.partner;

    const options = useMemo(() => (item?.options && item.options[0]) || {}, [item]);
    const sizes = useMemo(() => Object.keys(options), [options]);
    const linePrice = parseInt(options[size] || 0, 10) * qty;

    const handleAdd = () => {
        if (!size || !item) return;

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1200);

        const existing = cart.find((line) => line.id === item._id && line.size === size);

        if (existing) {
            dispatch({ type: 'UPDATE', id: item._id, size, price: linePrice, qty });
            return;
        }

        dispatch({
            type: 'ADD',
            id: item._id,
            name: item.name,
            price: linePrice,
            qty,
            size,
            img: item.img
        });
    };

    return (
        <div className={`food-detail-container ${darkMode ? 'dark' : ''}`}>
            <Navbar />

            <main className="food-detail-main">
                <button type="button" className="detail-back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Back
                </button>

                {loading && (
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i> Loading dish...
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}

                {!loading && !error && item && (
                    <>
                        <section className="detail-hero">
                            <img className="detail-hero-img" src={item.img} alt={item.name} />

                            <div className="detail-summary">
                                <h1>{item.name}</h1>

                                <div className="detail-badges">
                                    <span
                                        className={`veg-marker ${item.isVeg ? '' : 'non-veg'}`}
                                        title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                                        aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                                    ></span>
                                    <span className="detail-badge">{item.CategoryName}</span>
                                    {item.rating > 0 && (
                                        <span className="detail-badge rating">
                                            <i className="fas fa-star" aria-hidden="true"></i> {item.rating}
                                        </span>
                                    )}
                                    {item.isBestseller && <span className="detail-badge bestseller">Bestseller</span>}
                                    {item.prepTimeMins > 0 && (
                                        <span className="detail-badge">{item.prepTimeMins} min prep</span>
                                    )}
                                </div>

                                <p className="detail-description">
                                    {item.description || 'A house favourite from this kitchen.'}
                                </p>

                                {item.calories > 0 && (
                                    <div className="detail-nutrition">
                                        <div className="detail-nutrition-cell">
                                            <strong>{item.calories}</strong>
                                            <span>kcal</span>
                                        </div>
                                        <div className="detail-nutrition-cell">
                                            <strong>{item.protein}g</strong>
                                            <span>Protein</span>
                                        </div>
                                        <div className="detail-nutrition-cell">
                                            <strong>{item.carbs}g</strong>
                                            <span>Carbs</span>
                                        </div>
                                        <div className="detail-nutrition-cell">
                                            <strong>{item.fat}g</strong>
                                            <span>Fat</span>
                                        </div>
                                    </div>
                                )}

                                <div className="detail-order-box">
                                    <div className="detail-order-row">
                                        {sizes.length > 0 && (
                                            <div className="option-group">
                                                <label htmlFor="detail-size" className="option-label">Size</label>
                                                <select
                                                    id="detail-size"
                                                    className="option-select"
                                                    value={size}
                                                    onChange={(event) => setSize(event.target.value)}
                                                >
                                                    {sizes.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option} — ₹{options[option]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="option-group">
                                            <span className="option-label">Quantity</span>
                                            <div className="stepper">
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((value) => Math.max(1, value - 1))}
                                                    disabled={qty <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <span className="stepper-value">{qty}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((value) => Math.min(20, value + 1))}
                                                    disabled={qty >= 20}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <span className="detail-price">₹{linePrice}/-</span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`add-to-cart-btn ${justAdded ? 'btn-added' : ''}`}
                                        onClick={handleAdd}
                                        disabled={!size}
                                    >
                                        <span className="btn-text">{justAdded ? 'Added to cart!' : 'Add to Cart'}</span>
                                        <span className="btn-icon">→</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {partner && (
                            <section className="kitchen-banner">
                                {partner.img && <img src={partner.img} alt={partner.name} loading="lazy" />}
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
                                            {partner.city}, {partner.state}
                                        </span>
                                        <span>
                                            <i className="fas fa-clock" aria-hidden="true"></i>{' '}
                                            {partner.deliveryTimeMins} min delivery
                                        </span>
                                        <span>
                                            <i className="fas fa-indian-rupee-sign" aria-hidden="true"></i>{' '}
                                            {partner.avgCostForTwo} for two
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="detail-back-btn"
                                    style={{ margin: 0 }}
                                    onClick={() => navigate(`/kitchen/${partner._id}`)}
                                >
                                    Full menu <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                </button>
                            </section>
                        )}

                        <section className="detail-section">
                            <h2>More from {partner ? partner.name : 'this kitchen'}</h2>
                            <p className="detail-section-hint">
                                Add anything else from the same kitchen with the − and + buttons — it all
                                travels in one delivery.
                            </p>

                            {data.sameKitchen.length === 0 ? (
                                <div className="detail-empty">
                                    This kitchen has no other dishes listed right now.
                                </div>
                            ) : (
                                <div className="menu-list">
                                    {data.sameKitchen.map((menuItem) => (
                                        <MenuRow key={menuItem._id} item={menuItem} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {data.similar.length > 0 && (
                            <section className="detail-section">
                                <h2>Similar {item.CategoryName} elsewhere</h2>
                                <p className="detail-section-hint">
                                    The same category, cooked by other kitchens on the platform.
                                </p>
                                <div className="menu-list">
                                    {data.similar.map((similarItem) => (
                                        <MenuRow key={similarItem._id} item={similarItem} showKitchen />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
