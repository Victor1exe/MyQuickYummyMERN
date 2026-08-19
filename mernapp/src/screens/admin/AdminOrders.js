import React, { useEffect, useState } from 'react';

import { apiGet } from '../../services/api';

/** Read-only view of every order placed through the platform. */
export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await apiGet('/api/admin/orders?limit=200', { auth: 'admin' });
                if (!cancelled) {
                    // Newest first; entries without a parseable date sink to the bottom.
                    const sorted = [...(response.orders || [])].sort((a, b) => {
                        const timeA = new Date(a.orderDate).getTime() || 0;
                        const timeB = new Date(b.orderDate).getTime() || 0;
                        return timeB - timeA;
                    });
                    setOrders(sorted);
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

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <>
            <header className="admin-topbar">
                <div>
                    <h1>Orders</h1>
                    <p className="admin-topbar-sub">
                        {orders.length} orders • ₹{revenue.toLocaleString()} total value
                    </p>
                </div>
            </header>

            <div className="admin-content">
                {loading && (
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i> Loading orders...
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        <i className="fas fa-circle-exclamation"></i> {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Placed</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>
                                            No orders have been placed yet.
                                        </td>
                                    </tr>
                                )}

                                {orders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr>
                                            <td>{order.email}</td>
                                            <td>
                                                {order.orderDate && !Number.isNaN(new Date(order.orderDate).getTime())
                                                    ? new Date(order.orderDate).toLocaleString()
                                                    : order.orderDate || '—'}
                                            </td>
                                            <td>{order.itemCount}</td>
                                            <td>₹{order.total.toLocaleString()}/-</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-btn ghost small"
                                                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                                >
                                                    {expanded === order.id ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>

                                        {expanded === order.id && (
                                            <tr>
                                                <td colSpan={5} style={{ background: 'var(--admin-bg)' }}>
                                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                                                        {order.items.map((item, index) => (
                                                            // eslint-disable-next-line react/no-array-index-key
                                                            <li key={`${order.id}-${index}`}>
                                                                {item.name} — {item.qty} × {item.size} — ₹{item.price}/-
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
