import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiGet } from '../../services/api';

const RIDER_STATUS_ROWS = [
    { key: 'available', label: 'Available' },
    { key: 'readyToGo', label: 'Ready to go' },
    { key: 'busy', label: 'On a delivery' },
    { key: 'onBreak', label: 'On a break' },
    { key: 'offline', label: 'Off shift' }
];

/**
 * The console landing page: one glance at every part of the operation —
 * kitchens by type, fleet availability, catalogue size, published documents
 * and commerce totals.
 */
export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await apiGet('/api/admin/overview', { auth: 'admin' });
                if (!cancelled) {
                    setOverview(response.overview);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const riderTotal = overview?.riders.total || 1;
    const maxCategoryCount = Math.max(1, ...(overview?.catalog.byCategory || []).map((row) => row.count));

    return (
        <>
            <header className="admin-topbar">
                <div>
                    <h1>Operations Overview</h1>
                    <p className="admin-topbar-sub">
                        Everything working together — kitchens, riders, the menu and internal documents.
                    </p>
                </div>
            </header>

            <div className="admin-content">
                {loading && (
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i> Loading overview...
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        <i className="fas fa-circle-exclamation"></i> {error}
                    </div>
                )}

                {overview && (
                    <>
                        <div className="admin-stat-grid">
                            <Link to="/admin/partners" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-store"></i></div>
                                <h3>{overview.partners.total}</h3>
                                <p>Partner kitchens</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.partners.active} active</span>
                                    {Object.entries(overview.partners.byType).map(([type, count]) => (
                                        <span key={type}>{count} {type}</span>
                                    ))}
                                </div>
                            </Link>

                            <Link to="/admin/riders" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-motorcycle"></i></div>
                                <h3>{overview.riders.total}</h3>
                                <p>Delivery riders</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.riders.available} available</span>
                                    <span>{overview.riders.busy} busy</span>
                                    <span>{overview.riders.verified} verified</span>
                                </div>
                            </Link>

                            <Link to="/admin/items" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-utensils"></i></div>
                                <h3>{overview.catalog.items}</h3>
                                <p>Food items listed</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.catalog.categories} categories</span>
                                    <span>{overview.catalog.unavailable} unavailable</span>
                                </div>
                            </Link>

                            <Link to="/admin/policies" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-file-shield"></i></div>
                                <h3>{overview.content.policies}</h3>
                                <p>Policies &amp; documents</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.content.publishedPolicies} published</span>
                                    <span>{overview.content.faqs} FAQs</span>
                                </div>
                            </Link>

                            <Link to="/admin/orders" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-receipt"></i></div>
                                <h3>{overview.commerce.orders}</h3>
                                <p>Orders placed</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.commerce.customers} registered customers</span>
                                </div>
                            </Link>

                            <Link to="/admin/receipts" className="admin-stat-card">
                                <div className="admin-stat-icon"><i className="fas fa-file-invoice-dollar"></i></div>
                                <h3>₹{(overview.commerce.revenue || 0).toLocaleString()}</h3>
                                <p>Billed across {overview.commerce.receipts || 0} receipts</p>
                                <div className="admin-stat-detail">
                                    <span>{overview.commerce.byStatus?.delivered || 0} delivered</span>
                                    <span>{overview.liveDeliveries?.length || 0} in flight</span>
                                </div>
                            </Link>
                        </div>

                        {overview.liveDeliveries?.length > 0 && (
                            <section className="admin-card" style={{ marginBottom: '1.5rem' }}>
                                <h2>Deliveries in flight</h2>
                                <div className="admin-table-wrap" style={{ boxShadow: 'none', border: 'none' }}>
                                    <table className="admin-table" style={{ minWidth: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Receipt</th>
                                                <th>Customer</th>
                                                <th>Rider</th>
                                                <th>Status</th>
                                                <th>ETA</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overview.liveDeliveries.map((delivery) => {
                                                const minutes = Math.ceil(
                                                    (new Date(delivery.etaAt).getTime() - Date.now()) / 60000
                                                );
                                                return (
                                                    <tr key={delivery.receiptNo}>
                                                        <td>{delivery.receiptNo}</td>
                                                        <td>{delivery.email}</td>
                                                        <td>{delivery.rider?.name || <em>unassigned</em>}</td>
                                                        <td>
                                                            <span className={`admin-pill ${delivery.status}`}>
                                                                {delivery.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td>{minutes > 0 ? `${minutes} min` : 'Overdue'}</td>
                                                        <td>₹{delivery.total.toLocaleString()}/-</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        <div className="admin-panel-grid">
                            <section className="admin-card">
                                <h2>Fleet availability right now</h2>
                                {RIDER_STATUS_ROWS.map((row) => {
                                    const count = overview.riders[row.key] || 0;
                                    return (
                                        <div key={row.key} className="admin-bar-row">
                                            <div className="admin-bar-label">
                                                <span>{row.label}</span>
                                                <strong>{count}</strong>
                                            </div>
                                            <div className="admin-bar-track">
                                                <div
                                                    className="admin-bar-fill"
                                                    style={{ width: `${(count / riderTotal) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>

                            <section className="admin-card">
                                <h2>Menu depth by category</h2>
                                {overview.catalog.byCategory.map((row) => (
                                    <div key={row.category} className="admin-bar-row">
                                        <div className="admin-bar-label">
                                            <span>{row.category}</span>
                                            <strong>{row.count}</strong>
                                        </div>
                                        <div className="admin-bar-track">
                                            <div
                                                className="admin-bar-fill"
                                                style={{ width: `${(row.count / maxCategoryCount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            <section className="admin-card">
                                <h2>Top rated kitchens</h2>
                                <div className="admin-table-wrap" style={{ boxShadow: 'none', border: 'none' }}>
                                    <table className="admin-table" style={{ minWidth: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Kitchen</th>
                                                <th>Type</th>
                                                <th>City</th>
                                                <th>Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overview.topPartners.map((partner) => (
                                                <tr key={partner._id}>
                                                    <td>{partner.name}</td>
                                                    <td><span className="admin-pill">{partner.type}</span></td>
                                                    <td>{partner.city}</td>
                                                    <td>{partner.rating}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="admin-card">
                                <h2>Recently added dishes</h2>
                                <div className="admin-table-wrap" style={{ boxShadow: 'none', border: 'none' }}>
                                    <table className="admin-table" style={{ minWidth: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Dish</th>
                                                <th>Category</th>
                                                <th>Kitchen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overview.recentItems.map((item) => (
                                                <tr key={item._id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.CategoryName}</td>
                                                    <td>{item.partnerName || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
