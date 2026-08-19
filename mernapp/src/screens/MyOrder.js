import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import useDarkMode from '../hooks/useDarkMode';
import { FOOD_FACTS } from '../data/homeContent';
import { apiDownload, apiPost, getAuthToken } from '../services/api';

import '../styles/myorder.css';
import '../styles/delivery.css';

const STATUS_LABELS = {
    placed: 'Order placed',
    preparing: 'Being prepared',
    picked_up: 'Picked up',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

/** Formats a stored order date, falling back gracefully on unparseable input. */
const formatOrderDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return { date: String(dateString), time: '' };
    }

    return {
        date: date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    };
};

export default function MyOrder() {
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();

    const [orderData, setOrderData] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState('');
    const [currentFact, setCurrentFact] = useState(0);

    useEffect(() => {
        // The route is private; without a token there is nothing to fetch.
        if (!getAuthToken()) {
            navigate('/login');
            return undefined;
        }

        let cancelled = false;

        const fetchMyOrder = async () => {
            try {
                setLoading(true);
                // Route casing previously mismatched the backend (`myOrderData`
                // vs `myorderData`), so this request always 404'd.
                const response = await apiPost('/api/myOrderData', {}, { auth: 'user' });
                if (!cancelled) {
                    setOrderData(response.orderData);
                    setReceipts(response.receipts || []);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    console.error('Failed to fetch order data:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchMyOrder();

        const factInterval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % FOOD_FACTS.length);
        }, 5000);

        return () => {
            cancelled = true;
            clearInterval(factInterval);
        };
    }, [navigate]);

    const handleDownload = async (receiptNo) => {
        try {
            setDownloading(receiptNo);
            await apiDownload(`/api/orders/${receiptNo}/receipt.pdf`, `${receiptNo}.pdf`, 'user');
        } catch (err) {
            setError(`Could not download the receipt: ${err.message}`);
        } finally {
            setDownloading('');
        }
    };

    const orders = orderData?.order_data || [];
    const hasOrders = orders.length > 0;

    // Receipts are keyed by number so an order group can find its own.
    const receiptsByNo = receipts.reduce((acc, receipt) => ({ ...acc, [receipt.receiptNo]: receipt }), {});

    return (
        <div className={`my-orders-container ${darkMode ? 'dark-mode' : ''}`}>
            <Navbar />

            <main className="orders-main-content">
                <div className="container">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i> Loading your orders...
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    ) : hasOrders ? (
                        <>
                            <h1 className="orders-title">Here Are Your Orders</h1>
                            <div className="orders-grid">
                                {orders
                                    .slice(0)
                                    .reverse()
                                    .map((orderGroup, index) => {
                                        const dateItem = orderGroup.find((entry) => entry && entry.Order_date);
                                        const foodItems = orderGroup.filter((entry) => entry && !entry.Order_date);

                                        if (!dateItem) return null;

                                        const { date, time } = formatOrderDateTime(dateItem.Order_date);
                                        const receipt = dateItem.receiptNo ? receiptsByNo[dateItem.receiptNo] : null;

                                        return (
                                            // eslint-disable-next-line react/no-array-index-key -- orders have no id of their own
                                            <React.Fragment key={`order-group-${index}`}>
                                                <div className="order-date-divider">
                                                    <h2>
                                                        {date}
                                                        <span className="order-time">{time}</span>
                                                    </h2>
                                                    <hr className="divider-line" />
                                                </div>

                                                {/* Orders placed before receipts existed simply have no
                                                    receipt card; their items still render below. */}
                                                {receipt && (
                                                    <div className="receipt-card">
                                                        <div className="receipt-card-head">
                                                            <div>
                                                                <p className="receipt-no">{receipt.receiptNo}</p>
                                                                <span className={`receipt-status ${receipt.status}`}>
                                                                    {STATUS_LABELS[receipt.status] || receipt.status}
                                                                </span>
                                                            </div>
                                                            <span className="receipt-total">
                                                                ₹{receipt.total.toLocaleString()}/-
                                                            </span>
                                                        </div>

                                                        <div className="receipt-meta">
                                                            <span>
                                                                Items <strong>{receipt.items.length}</strong>
                                                            </span>
                                                            <span>
                                                                Subtotal <strong>₹{receipt.subtotal}</strong>
                                                            </span>
                                                            <span>
                                                                Delivery <strong>₹{receipt.deliveryFee}</strong>
                                                            </span>
                                                            <span>
                                                                Packaging <strong>₹{receipt.packagingFee}</strong>
                                                            </span>
                                                            <span>
                                                                GST <strong>₹{receipt.gst}</strong>
                                                            </span>
                                                            <span>
                                                                Promised in <strong>{receipt.etaMinutes} min</strong>
                                                            </span>
                                                            {receipt.rider?.name && (
                                                                <span>
                                                                    Rider <strong>{receipt.rider.name}</strong>
                                                                    {receipt.rider.vehicle ? ` (${receipt.rider.vehicle})` : ''}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="receipt-actions">
                                                            <button
                                                                type="button"
                                                                className="receipt-download-btn"
                                                                onClick={() => handleDownload(receipt.receiptNo)}
                                                                disabled={downloading === receipt.receiptNo}
                                                            >
                                                                <i className="fas fa-file-pdf" aria-hidden="true"></i>
                                                                {downloading === receipt.receiptNo
                                                                    ? 'Preparing…'
                                                                    : 'Download receipt (PDF)'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {foodItems.map((item, itemIndex) => (
                                                    <div
                                                        // eslint-disable-next-line react/no-array-index-key
                                                        key={`item-${index}-${itemIndex}`}
                                                        className="order-card"
                                                    >
                                                        <div className="card-content">
                                                            <h3 className="food-name">{item.name}</h3>
                                                            <div className="order-details">
                                                                <span className="quantity">Qty: {item.qty}</span>
                                                                <span className="size">Size: {item.size}</span>
                                                                <span className="price">₹{item.price}/-</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                            </div>

                            <div className="food-facts-section">
                                <h2>Did You Know?</h2>
                                <div className="food-fact-card">
                                    <p>{FOOD_FACTS[currentFact]}</p>
                                </div>
                                <div className="happy-emoji" role="img" aria-label="Happy emoji">😋</div>
                            </div>
                        </>
                    ) : (
                        <div className="no-orders-container">
                            <h1 className="no-orders-title">Buy something to eat</h1>
                            <div className="crying-emoji" role="img" aria-label="Crying emoji">😭</div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
