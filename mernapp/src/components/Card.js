import React, { useEffect, useRef, useState } from 'react';
import { useDispatchCart, useCart } from './ContextReducer';

export default function Card(props) {
    let dispatch = useDispatchCart();
    let data = useCart();
    const priceRef = useRef();
    let options = props.options;
    let priceOptions = Object.keys(options);
    const [qty, setQty] = useState(1);
    const [size, setSize] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = async () => {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
        
        let food = [];
        for (const item of data) {
            if (item.id === props.foodItem._id) {
                food = item;
                break;
            }
        }

        if (food.length !== 0) {
            if (food.size === size) {
                await dispatch({ type: "UPDATE", id: props.foodItem._id, price: finalPrice, qty: qty });
                return;
            } else if (food.size !== size) {
                await dispatch({ type: "ADD", id: props.foodItem._id, name: props.foodItem.name, price: finalPrice, qty: qty, size: size });
                return;
            }
            return;
        }
        await dispatch({ type: "ADD", id: props.foodItem._id, name: props.foodItem.name, price: finalPrice, qty: qty, size: size });
    };

    let finalPrice = qty * parseInt(options[size]);

    useEffect(() => {
        setSize(priceRef.current.value);
    }, []);

    return (
        <div 
            className="card-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`card ${isHovered ? 'hovered' : ''} ${isAdded ? 'added' : ''}`}>
                <div className="card-img-container">
                    <img 
                        src={props.foodItem.img} 
                        className="card-img" 
                        alt={props.foodItem.name} 
                    />
                    <div className={`card-img-overlay ${isHovered ? 'visible' : ''}`}></div>
                    {isAdded && (
                        <div className="added-confirmation">
                            <span className="checkmark">✓</span>
                            <span className="added-text">Added!</span>
                        </div>
                    )}
                </div>
                <div className="card-content">
                    <h3 className="card-title">{props.foodItem.name}</h3>
                    
                    <div className="card-options">
                        <div className="option-group">
                            <label htmlFor="quantity-select" className="option-label">Qty:</label>
                            <select 
                                id="quantity-select"
                                className="option-select"
                                onChange={(e) => setQty(e.target.value)}
                                value={qty}
                            >
                                {Array.from(Array(6), (e, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="option-group">
                            <label htmlFor="size-select" className="option-label">Size:</label>
                            <select 
                                id="size-select"
                                className="option-select"
                                ref={priceRef}
                                onChange={(e) => setSize(e.target.value)}
                                value={size}
                            >
                                {priceOptions.map((data) => (
                                    <option key={data} value={data}>{data}</option>
                                ))}
                            </select>
                        </div>
                        
                        <span className="card-price">₹{finalPrice}/-</span>
                    </div>

                    <button 
                        className={`add-to-cart-btn ${isButtonHovered ? 'btn-hovered' : ''} ${isAdded ? 'btn-added' : ''}`}
                        onClick={handleAddToCart}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                        disabled={isAdded}
                    >
                        <span className="btn-text">
                            {isAdded ? 'Added!' : 'Add to Cart'}
                        </span>
                        {!isAdded && <span className="btn-icon">→</span>}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .card-container {
                    font-family: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';
                    perspective: 1000px;
                    margin: 1.5rem;
                    width: 22rem;
                }

                .card {
                    width: 100%;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
                    transform: translateZ(0);
                    position: relative;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .card.hovered {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .card.added {
                    animation: bounce 0.5s ease;
                }

                .card-img-container {
                    position: relative;
                    overflow: hidden;
                    height: 220px;
                }

                .card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                    display: block;
                }

                .card.hovered .card-img {
                    transform: scale(1.05);
                }

                .card-img-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(to top, rgba(252, 128, 25, 0.3), transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .card-img-overlay.visible {
                    opacity: 1;
                }

                .added-confirmation {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.9);
                    padding: 1rem 1.5rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    animation: fadeIn 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .checkmark {
                    color: #4CAF50;
                    font-size: 1.2rem;
                    font-weight: bold;
                }

                .added-text {
                    color: #333;
                    font-weight: 600;
                }

                .card-content {
                    padding: 1.8rem;
                }

                .card-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin-bottom: 1.2rem;
                    color: #333;
                    transition: color 0.3s ease;
                    height: 3.6rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card.hovered .card-title {
                    color: #fc8019;
                }

                .card-options {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    background: rgba(0,0,0,0.02);
                    padding: 1rem;
                    border-radius: 12px;
                }

                .option-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    flex: 1;
                    min-width: 100px;
                }

                .option-label {
                    font-size: 0.8rem;
                    color: #666;
                    font-weight: 500;
                }

                .option-select {
                    padding: 0.6rem 2rem 0.6rem 0.9rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    background: white;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    width: 100%;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 0.7rem center;
                    background-size: 1rem;
                    color: #333;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .option-select::-ms-expand {
                    display: none;
                }

                .option-select:hover {
                    border-color: #fc8019;
                    box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.1);
                }

                .option-select:focus {
                    outline: none;
                    border-color: #fc8019;
                    box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.2);
                }

                .option-select option {
                    padding: 0.5rem;
                    background: white;
                    color: #333;
                }

                .card-price {
                    font-weight: 700;
                    color: #fc8019;
                    margin-left: auto;
                    font-size: 1.2rem;
                    transition: transform 0.3s ease;
                    white-space: nowrap;
                    background: rgba(252,128,25,0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    text-align: center;
                    flex: 1;
                }

                .add-to-cart-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #fc8019 0%, #f55d2c 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 500;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    overflow: hidden;
                    position: relative;
                }

                .add-to-cart-btn.btn-hovered {
                    background: linear-gradient(135deg, #f55d2c 0%, #fc8019 100%);
                }

                .add-to-cart-btn.btn-added {
                    background: #4CAF50;
                }

                .add-to-cart-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.9;
                }

                .btn-text {
                    transition: transform 0.3s ease;
                }

                .btn-icon {
                    transform: translateX(10px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .add-to-cart-btn.btn-hovered .btn-text {
                    transform: translateX(-5px);
                }

                .add-to-cart-btn.btn-hovered .btn-icon {
                    transform: translateX(0);
                    opacity: 1;
                }

                .add-to-cart-btn:active:not(:disabled) {
                    transform: scale(0.96);
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    30% { transform: translateY(-15px) scale(1.05); }
                    60% { transform: translateY(0) scale(1); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -40%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }

                @media (max-width: 768px) {
                    .card-container {
                        width: 20rem;
                        margin: 1rem;
                    }

                    .card-img-container {
                        height: 200px;
                    }

                    .card-content {
                        padding: 1.5rem;
                    }

                    .card-options {
                        flex-direction: row;
                        justify-content: space-between;
                        gap: 0.8rem;
                    }

                    .option-group {
                        min-width: auto;
                    }
                }

                @media (max-width: 480px) {
                    .card-container {
                        width: 100%;
                        margin: 1rem 0;
                    }

                    .card-options {
                        flex-direction: column;
                        gap: 0.8rem;
                    }

                    .option-group {
                        width: 100%;
                    }

                    .card-price {
                        margin-left: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}