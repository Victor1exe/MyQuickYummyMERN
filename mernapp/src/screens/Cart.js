import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCart, useDispatchCart } from '../components/ContextReducer';
import { useDelivery } from '../components/delivery/DeliveryContext';
import { FOOD_FACTS } from '../data/homeContent';
import { apiPost } from '../services/api';

import '../styles/cart.css';

export default function Cart({ darkMode, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [currentFact, setCurrentFact] = useState(0);

    const data = useCart();
    const dispatch = useDispatchCart();
    const { startDelivery } = useDelivery();

    useEffect(() => {
        const factInterval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % FOOD_FACTS.length);
        }, 5000);

        return () => clearInterval(factInterval);
    }, []);

    /**
     * The email is no longer sent from the client — the server takes it from
     * the verified token, so a caller cannot write into someone else's order
     * history by changing a field.
     *
     * The response carries the created receipt: its number, the priced total,
     * the ETA and the rider the dispatcher claimed. That is what feeds the
     * confirmation popup and the live tracker.
     */
    const handleCheckOut = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiPost(
                '/api/orderData',
                { order_data: data, order_date: new Date().toISOString() },
                { auth: 'user' }
            );

            dispatch({ type: 'DROP' });
            setSuccess(true);

            if (response.receipt) {
                startDelivery(response.receipt);
            }

            // Close the cart modal so the confirmation popup is not stacked
            // behind it.
            setTimeout(() => {
                setSuccess(false);
                if (onClose) onClose();
            }, 300);
        } catch (err) {
            setError(err.message);
            console.error('Checkout failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = data.reduce((total, food) => total + Number(food.price), 0);

    if (data.length === 0) {
        return (
            <div className={`cart-container ${darkMode ? 'dark' : ''}`}>
                <div className="no-items-container">
                    <h1 className="no-items-title">
                        {success ? 'Order placed. Enjoy your meal!' : 'Your cart is empty'}
                    </h1>
                    <div className="crying-emoji" role="img" aria-label={success ? 'Party emoji' : 'Crying emoji'}>
                        {success ? '🎉' : '😭'}
                    </div>
                    <div className="food-facts-section">
                        <h2>Did You Know?</h2>
                        <div className="food-fact-card">
                            <p>{FOOD_FACTS[currentFact]}</p>
                        </div>
                        <div className="happy-emoji" role="img" aria-label="Happy emoji">😋</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`cart-container ${darkMode ? 'dark' : ''}`}>
            <div className="container cart-content">
                {loading ? (
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i> Processing your order...
                    </div>
                ) : (
                    <>
                        <h1 className="cart-title">Your Shopping Cart</h1>

                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-triangle"></i> {error}
                            </div>
                        )}

                        <div className="cart-table-container">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Size</th>
                                        <th scope="col">Price</th>
                                        <th scope="col"><span className="visually-hidden">Remove</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((food, index) => (
                                        <tr key={`${food.id}-${food.size}`} className="cart-item">
                                            <td>{index + 1}</td>
                                            <td className="food-name">{food.name}</td>
                                            <td>{food.qty}</td>
                                            <td>{food.size}</td>
                                            <td className="price">₹{food.price}/-</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() => dispatch({ type: 'REMOVE', index })}
                                                    aria-label={`Remove ${food.name}`}
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="cart-summary">
                            <div className="total-price">
                                <h2>Total: ₹{totalPrice}/-</h2>
                            </div>
                            <button
                                type="button"
                                className="checkout-btn"
                                onClick={handleCheckOut}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        </div>

                        <div className="food-facts-section">
                            <h2>Did You Know?</h2>
                            <div className="food-fact-card">
                                <p>{FOOD_FACTS[currentFact]}</p>
                            </div>
                            <div className="happy-emoji" role="img" aria-label="Happy emoji">😋</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
