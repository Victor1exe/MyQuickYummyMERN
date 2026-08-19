import React, { useMemo, useState } from 'react';

import { useCart, useDispatchCart } from './ContextReducer';

/**
 * One dish in a kitchen's menu, with a - / + quantity stepper and an add
 * button. Used by both the food detail view and the kitchen view.
 */
export default function MenuRow({ item, showKitchen = false }) {
    const dispatch = useDispatchCart();
    const cart = useCart();

    const options = useMemo(() => (item.options && item.options[0]) || {}, [item.options]);
    const sizes = useMemo(() => Object.keys(options), [options]);

    const [size, setSize] = useState(sizes[0] || '');
    const [qty, setQty] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    const unitPrice = parseInt(options[size] || 0, 10);
    const linePrice = unitPrice * qty;

    const inCart = cart
        .filter((line) => line.id === item._id)
        .reduce((sum, line) => sum + Number(line.qty), 0);

    const handleAdd = () => {
        if (!size) return;

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

    const kitchenName = item.partner?.name || item.partnerName;

    return (
        <article className="menu-row">
            <img className="menu-row-img" src={item.img} alt={item.name} loading="lazy" />

            <div className="menu-row-body">
                <h3>{item.name}</h3>

                <div className="card-meta" style={{ marginBottom: '0.4rem' }}>
                    <span
                        className={`veg-marker ${item.isVeg ? '' : 'non-veg'}`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                        aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                    ></span>
                    {item.rating > 0 && (
                        <span className="card-rating">
                            <i className="fas fa-star" aria-hidden="true"></i> {item.rating}
                        </span>
                    )}
                    {item.calories > 0 && <span>{item.calories} kcal</span>}
                    {showKitchen && kitchenName && (
                        <span>
                            <i className="fas fa-store" aria-hidden="true"></i> {kitchenName}
                        </span>
                    )}
                    {inCart > 0 && (
                        <span style={{ color: '#4CAF50', fontWeight: 600 }}>
                            <i className="fas fa-basket-shopping" aria-hidden="true"></i> {inCart} in cart
                        </span>
                    )}
                </div>

                <p>{item.description || 'A house favourite from this kitchen.'}</p>

                <div className="menu-row-foot">
                    {sizes.length > 1 && (
                        <select
                            className="menu-row-size"
                            value={size}
                            onChange={(event) => setSize(event.target.value)}
                            aria-label={`Portion size for ${item.name}`}
                        >
                            {sizes.map((option) => (
                                <option key={option} value={option}>
                                    {option} — ₹{options[option]}
                                </option>
                            ))}
                        </select>
                    )}

                    <span className="menu-row-price">₹{linePrice}/-</span>

                    <div className="stepper">
                        <button
                            type="button"
                            onClick={() => setQty((value) => Math.max(1, value - 1))}
                            disabled={qty <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                        >
                            −
                        </button>
                        <span className="stepper-value">{qty}</span>
                        <button
                            type="button"
                            onClick={() => setQty((value) => Math.min(20, value + 1))}
                            disabled={qty >= 20}
                            aria-label={`Increase quantity of ${item.name}`}
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`stepper-add ${justAdded ? 'added' : ''}`}
                        onClick={handleAdd}
                        disabled={!size}
                    >
                        <i className={`fas ${justAdded ? 'fa-check' : 'fa-cart-plus'}`} aria-hidden="true"></i>
                        {justAdded ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </article>
    );
}
