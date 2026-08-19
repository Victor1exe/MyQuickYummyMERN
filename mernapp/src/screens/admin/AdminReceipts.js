import React, { useCallback, useEffect, useState } from 'react';

import { apiDownload, apiGet, apiPut } from '../../services/api';

const STATUSES = ['placed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_LABELS = {
    placed: 'Order placed',
    preparing: 'Being prepared',
    picked_up: 'Picked up',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

const formatEta = (receipt) => {
    if (receipt.status === 'delivered') {
        return receipt.deliveredAt ? new Date(receipt.deliveredAt).toLocaleTimeString() : 'Delivered';
    }
    if (receipt.status === 'cancelled') return '—';

    const minutes = Math.ceil((new Date(receipt.etaAt).getTime() - Date.now()) / 60000);
    return minutes > 0 ? `${minutes} min left` : 'Overdue';
};

/**
 * The operator's view of every receipt: the same records the customer sees,
 * the identical PDF, and the controls that move an order along the pipeline.
 * Setting an order to delivered or cancelled frees its rider, which is what
 * keeps this console and the storefront's fleet board in agreement.
 */
export default function AdminReceipts() {
    const [receipts, setReceipts] = useState([]);
    const [byStatus, setByStatus] = useState({});
    const [revenue, setRevenue] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState('');
    const [expanded, setExpanded] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);

            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await apiGet(`/api/admin/receipts${query}`, { auth: 'admin' });

            setReceipts(response.receipts || []);
            setByStatus(response.byStatus || {});
            setRevenue(response.revenue || 0);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(load, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [load, search]);

    const handleStatusChange = async (receiptNo, status) => {
        try {
            setBusy(receiptNo);
            await apiPut(`/api/admin/receipts/${receiptNo}/status`, { status }, { auth: 'admin' });
            setNotice(`${receiptNo} is now "${STATUS_LABELS[status]}".`);
            await load();
            setTimeout(() => setNotice(''), 4000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleDownload = async (receiptNo) => {
        try {
            setBusy(receiptNo);
            await apiDownload(`/api/admin/receipts/${receiptNo}/receipt.pdf`, `${receiptNo}.pdf`, 'admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const liveCount =
        (byStatus.placed || 0) +
        (byStatus.preparing || 0) +
        (byStatus.picked_up || 0) +
        (byStatus.out_for_delivery || 0);

    return (
        <>
            <header className="admin-topbar">
                <div>
                    <h1>Receipts &amp; Deliveries</h1>
                    <p className="admin-topbar-sub">
                        {liveCount} in flight • {byStatus.delivered || 0} delivered • ₹
                        {revenue.toLocaleString()} billed
                    </p>
                </div>
                <div className="admin-topbar-actions">
                    <button type="button" className="admin-btn ghost" onClick={load}>
                        <i className="fas fa-rotate" aria-hidden="true"></i> Refresh
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {notice && (
                    <div className="admin-alert success">
                        <i className="fas fa-circle-check"></i> {notice}
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        <i className="fas fa-circle-exclamation"></i> {error}
                    </div>
                )}

                <div className="admin-stat-grid">
                    {/* A div rather than a button: a <button>'s content model is
                        phrasing content, so headings and paragraphs inside one
                        are invalid HTML. */}
                    {STATUSES.map((status) => {
                        const isActive = statusFilter === status;
                        const toggle = () => setStatusFilter(isActive ? '' : status);

                        return (
                            <div
                                key={status}
                                className="admin-stat-card clickable"
                                role="button"
                                tabIndex={0}
                                aria-pressed={isActive}
                                onClick={toggle}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        toggle();
                                    }
                                }}
                            >
                                <h3>{byStatus[status] || 0}</h3>
                                <p>
                                    <span className={`admin-pill ${status}`}>{STATUS_LABELS[status]}</span>
                                </p>
                                {isActive && (
                                    <div className="admin-stat-detail">
                                        <span>Filtering by this — click to clear</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="admin-toolbar">
                    <input
                        className="admin-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by receipt number, customer email or rider…"
                        aria-label="Search receipts"
                    />
                    <span className="admin-field-hint">
                        {loading ? 'Loading…' : `${receipts.length} shown`}
                    </span>
                </div>

                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Receipt</th>
                                <th>Customer</th>
                                <th>Rider</th>
                                <th>Placed</th>
                                <th>ETA</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>
                                        No receipts match this view.
                                    </td>
                                </tr>
                            )}

                            {receipts.map((receipt) => (
                                <React.Fragment key={receipt.receiptNo}>
                                    <tr>
                                        <td>
                                            <button
                                                type="button"
                                                className="admin-btn ghost small"
                                                onClick={() =>
                                                    setExpanded(expanded === receipt.receiptNo ? null : receipt.receiptNo)
                                                }
                                            >
                                                {receipt.receiptNo}
                                            </button>
                                        </td>
                                        <td>{receipt.email}</td>
                                        <td>{receipt.rider?.name || <em>unassigned</em>}</td>
                                        <td>{new Date(receipt.placedAt).toLocaleString()}</td>
                                        <td>{formatEta(receipt)}</td>
                                        <td>₹{receipt.total.toLocaleString()}/-</td>
                                        <td>
                                            <select
                                                className="admin-inline-select"
                                                value={receipt.status}
                                                disabled={busy === receipt.receiptNo}
                                                onChange={(event) =>
                                                    handleStatusChange(receipt.receiptNo, event.target.value)
                                                }
                                                aria-label={`Status for ${receipt.receiptNo}`}
                                            >
                                                {STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {STATUS_LABELS[status]}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button
                                                    type="button"
                                                    className="admin-btn small"
                                                    onClick={() => handleDownload(receipt.receiptNo)}
                                                    disabled={busy === receipt.receiptNo}
                                                >
                                                    <i className="fas fa-file-pdf" aria-hidden="true"></i> PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expanded === receipt.receiptNo && (
                                        <tr>
                                            <td colSpan={8} style={{ background: 'var(--admin-bg)' }}>
                                                <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <strong>Items</strong>
                                                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 2 }}>
                                                            {receipt.items.map((item, index) => (
                                                                // eslint-disable-next-line react/no-array-index-key
                                                                <li key={`${receipt.receiptNo}-${index}`}>
                                                                    {item.name} — {item.qty} × {item.size} — ₹{item.price}
                                                                    {item.kitchen ? ` — ${item.kitchen}` : ''}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong>Billing</strong>
                                                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 2 }}>
                                                            <li>Subtotal ₹{receipt.subtotal}</li>
                                                            <li>Delivery ₹{receipt.deliveryFee}</li>
                                                            <li>Packaging ₹{receipt.packagingFee}</li>
                                                            <li>GST ₹{receipt.gst}</li>
                                                            <li><strong>Total ₹{receipt.total}</strong></li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong>Delivery</strong>
                                                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 2 }}>
                                                            <li>Promised in {receipt.etaMinutes} min</li>
                                                            <li>ETA {new Date(receipt.etaAt).toLocaleString()}</li>
                                                            <li>
                                                                Rider {receipt.rider?.name || 'unassigned'}
                                                                {receipt.rider?.phone ? ` — ${receipt.rider.phone}` : ''}
                                                            </li>
                                                            <li>Address: {receipt.customerAddress || '—'}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
