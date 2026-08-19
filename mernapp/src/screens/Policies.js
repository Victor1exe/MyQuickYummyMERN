import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDarkMode from '../hooks/useDarkMode';
import { apiGet } from '../services/api';

import '../styles/food-detail.css';

/**
 * Public policy reader. Content is served from the `policies` collection, so
 * an admin edit is visible here without a code change or a redeploy — the
 * footer's Terms and Privacy links point straight at it.
 */
export default function Policies() {
    const { slug } = useParams();
    const { darkMode } = useDarkMode();

    const [policies, setPolicies] = useState([]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                if (slug) {
                    const response = await apiGet(`/api/policies/${slug}`);
                    if (!cancelled) setPolicy(response.policy);
                } else {
                    const response = await apiGet('/api/policies');
                    if (!cancelled) setPolicies(response.policies || []);
                }
                if (!cancelled) setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        window.scrollTo({ top: 0 });

        return () => {
            cancelled = true;
        };
    }, [slug]);

    const grouped = policies.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {});

    return (
        <div className={`food-detail-container ${darkMode ? 'dark' : ''}`}>
            <Navbar />

            <main className="food-detail-main">
                <Link to="/" className="detail-back-btn">
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to home
                </Link>

                {loading && (
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}

                {!loading && !error && slug && policy && (
                    <article className="detail-section">
                        <h2>{policy.title}</h2>
                        <p className="detail-section-hint">
                            {policy.category} • Version {policy.version} • Last updated{' '}
                            {new Date(policy.updatedAt).toLocaleDateString()}
                        </p>
                        {/* `policy-body` lives in food-detail.css; the previous
                            version borrowed the admin panel's `.admin-card`
                            class plus a pile of inline overrides. */}
                        <div className="policy-body">{policy.content}</div>
                    </article>
                )}

                {!loading && !error && !slug && (
                    <>
                        <section className="detail-section">
                            <h2>Policies &amp; Documents</h2>
                            <p className="detail-section-hint">
                                Everything we publish about how the platform, its partner kitchens and its
                                delivery partners operate.
                            </p>
                        </section>

                        {Object.entries(grouped).map(([category, items]) => (
                            <section key={category} className="detail-section">
                                <h2>{category}</h2>
                                <div className="menu-list">
                                    {items.map((item) => (
                                        <Link
                                            key={item._id}
                                            to={`/policies/${item.slug}`}
                                            className="menu-row"
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <div className="menu-row-body">
                                                <h3>{item.title}</h3>
                                                <p>{item.summary}</p>
                                                <div className="menu-row-foot">
                                                    <span className="detail-badge">v{item.version}</span>
                                                    <span className="menu-row-price">Read →</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {policies.length === 0 && (
                            <div className="detail-empty">No policies have been published yet.</div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
