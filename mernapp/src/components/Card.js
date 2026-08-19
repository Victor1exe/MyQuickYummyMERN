import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart, useDispatchCart } from './ContextReducer';
import '../styles/card.css';

export default function Card(props) {
    const dispatch = useDispatchCart();
    const data = useCart();
    const navigate = useNavigate();

    const priceRef = useRef();
    const options = props.options || {};
    const priceOptions = Object.keys(options);

    const [qty, setQty] = useState(1);
    const [size, setSize] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const foodItem = props.foodItem;
    const finalPrice = qty * parseInt(options[size] || 0, 10);

    useEffect(() => {
        if (priceRef.current) {
            setSize(priceRef.current.value);
        }
    }, []);

    /**
     * The original checked `food.length !== 0` on an object, which is always
     * true, so the merge branch ran even when nothing matched. Matching on
     * (id, size) makes the intent explicit.
     */
    const handleAddToCart = () => {
        if (!size) return;

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);

        const existing = data.find((item) => item.id === foodItem._id && item.size === size);

        if (existing) {
            dispatch({ type: 'UPDATE', id: foodItem._id, size, price: finalPrice, qty });
            return;
        }

        dispatch({
            type: 'ADD',
            id: foodItem._id,
            name: foodItem.name,
            price: finalPrice,
            qty,
            size,
            img: foodItem.img
        });
    };

    const openDetail = () => navigate(`/food/${foodItem._id}`);

    const kitchenName = foodItem.partner?.name || foodItem.partnerName;

    return (
        <div
            className="card-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`card ${isHovered ? 'hovered' : ''} ${isAdded ? 'added' : ''}`}>
                <div
                    className="card-img-container"
                    onClick={openDetail}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') openDetail();
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${foodItem.name} and the rest of this kitchen's menu`}
                >
                    <img src={foodItem.img} className="card-img" alt={foodItem.name} loading="lazy" />
                    <div className={`card-img-overlay ${isHovered ? 'visible' : ''}`}></div>
                    <span className="card-open-hint">
                        <i className="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        View kitchen &amp; full menu
                    </span>
                    {isAdded && (
                        <div className="added-confirmation">
                            <span className="checkmark">✓</span>
                            <span className="added-text">Added!</span>
                        </div>
                    )}
                </div>

                <div className="card-content">
                    <h3
                        className="card-title"
                        onClick={openDetail}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') openDetail();
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        {foodItem.name}
                    </h3>

                    {kitchenName && (
                        <div className="card-kitchen">
                            <i className="fas fa-store" aria-hidden="true"></i>
                            {kitchenName}
                        </div>
                    )}

                    {foodItem.description && <p className="card-description">{foodItem.description}</p>}

                    <div className="card-meta">
                        <span
                            className={`veg-marker ${foodItem.isVeg ? '' : 'non-veg'}`}
                            title={foodItem.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                            aria-label={foodItem.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                        ></span>
                        {foodItem.rating > 0 && (
                            <span className="card-rating">
                                <i className="fas fa-star" aria-hidden="true"></i> {foodItem.rating}
                            </span>
                        )}
                        {foodItem.prepTimeMins > 0 && (
                            <span>
                                <i className="fas fa-clock" aria-hidden="true"></i> {foodItem.prepTimeMins} mins
                            </span>
                        )}
                        {foodItem.calories > 0 && (
                            <span>
                                <i className="fas fa-fire" aria-hidden="true"></i> {foodItem.calories} kcal
                            </span>
                        )}
                    </div>

                    <div className="card-options">
                        <div className="option-group">
                            <label htmlFor={`quantity-${foodItem._id}`} className="option-label">Qty:</label>
                            <select
                                id={`quantity-${foodItem._id}`}
                                className="option-select"
                                onChange={(event) => setQty(Number(event.target.value))}
                                value={qty}
                            >
                                {Array.from(Array(6), (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="option-group">
                            <label htmlFor={`size-${foodItem._id}`} className="option-label">Size:</label>
                            <select
                                id={`size-${foodItem._id}`}
                                className="option-select"
                                ref={priceRef}
                                onChange={(event) => setSize(event.target.value)}
                                value={size}
                            >
                                {priceOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <span className="card-price">₹{finalPrice}/-</span>
                    </div>

                    <button
                        type="button"
                        className={`add-to-cart-btn ${isButtonHovered ? 'btn-hovered' : ''} ${isAdded ? 'btn-added' : ''}`}
                        onClick={handleAddToCart}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                        disabled={isAdded}
                    >
                        <span className="btn-text">{isAdded ? 'Added!' : 'Add to Cart'}</span>
                        {!isAdded && <span className="btn-icon">→</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
