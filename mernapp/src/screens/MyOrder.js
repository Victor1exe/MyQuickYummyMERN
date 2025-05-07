import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function MyOrder({ darkMode }) {
    const [orderData, setOrderData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodFacts, setFoodFacts] = useState([]);
    const [currentFact, setCurrentFact] = useState(0);

    const fetchMyOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/myOrderData", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: localStorage.getItem('userEmail')
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setOrderData(data);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch order data:", err);
        } finally {
            setLoading(false);
        }
    };

    const facts = [
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
        "The world's most expensive pizza costs $12,000 and takes 72 hours to make.",
        "Bananas are berries, but strawberries aren't.",
        "The fear of cooking is known as Mageirocophobia.",
        "Apples float because 25% of their volume is air.",
        "The world's largest chocolate bar weighed 12,770 pounds.",
        "Peanuts are not nuts - they're legumes.",
        "The most stolen food in the world is cheese.",
        "The color of a chili pepper is no indication of its spiciness.",
        "The average person eats about 35 tons of food in their lifetime."
    ];

    useEffect(() => {
        fetchMyOrder();
        
        setFoodFacts(facts);
        const factInterval = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % facts.length);
        }, 5000);

        return () => clearInterval(factInterval);
    }, []);

    const hasOrders = orderData.orderData && orderData.orderData.order_data && orderData.orderData.order_data.length > 0;

    const formatOrderDateTime = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        
        // First try to parse as ISO string
        let date = new Date(dateString);
        
        // If invalid, try parsing as custom format
        if (isNaN(date.getTime())) {
            // Try custom parsing if your backend uses a specific format
            const customParsed = tryCustomParse(dateString);
            if (customParsed) {
                date = customParsed;
            } else {
                console.error('Invalid date string:', dateString);
                return { date: 'Invalid date', time: '' };
            }
        }

        // Manual formatting to avoid timezone issues
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const weekday = weekdays[date.getDay()];
        
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return {
            date: `${weekday}, ${month} ${day}, ${year}`,
            time: `${hours}:${minutes} ${ampm}`
        };
    };

    const tryCustomParse = (dateString) => {
        // Add your specific date format parsing logic here if needed
        // Example: "2023-05-15T14:30:00.000Z" or "15/05/2023 14:30"
        return null; // Return null if parsing fails
    };

    return (
        <div className={`my-orders-container ${darkMode ? 'dark-mode' : ''}`}>
            <Navbar darkMode={darkMode} />
            
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
                                {orderData.orderData.order_data
                                    .slice(0)
                                    .reverse()
                                    .map((orderGroup, index) => {
                                        const dateItem = orderGroup.find(item => item.Order_date);
                                        const foodItems = orderGroup.filter(item => !item.Order_date);
                                        
                                        if (!dateItem) return null;

                                        const { date, time } = formatOrderDateTime(dateItem.Order_date);

                                        return (
                                            <React.Fragment key={`order-group-${index}`}>
                                                <div className="order-date-divider">
                                                    <h2>
                                                        {date}
                                                        <span className="order-time">{time}</span>
                                                    </h2>
                                                    <hr className="divider-line" />
                                                </div>
                                                
                                                {foodItems.map((item, itemIndex) => (
                                                    <div key={`item-${index}-${itemIndex}`} className="order-card">
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
                                    <p>{foodFacts[currentFact]}</p>
                                </div>
                                <div className="happy-emoji" role="img" aria-label="Happy emoji">
                                    😋
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-orders-container">
                            <h1 className="no-orders-title">Buy something to eat</h1>
                            <div className="crying-emoji" role="img" aria-label="Crying emoji">
                                😭
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer darkMode={darkMode} />

            <style jsx>{`
                .my-orders-container {
                    --bg-color: #ffffff;
                    --text-color: #333333;
                    --primary-color: #1a73e8;
                    --card-bg: rgba(255, 255, 255, 0.9);
                    --hover-bg: rgba(0, 0, 0, 0.02);
                    --border-color: rgba(0, 0, 0, 0.1);
                    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --dark-gray: #666666;
                    --transition: all 0.3s ease;
                }

                .my-orders-container.dark-mode {
                    --bg-color: #121212;
                    --text-color: #ffffff;
                    --primary-color: #4CAF50;
                    --card-bg: rgba(30, 30, 30, 0.8);
                    --hover-bg: rgba(255, 255, 255, 0.05);
                    --border-color: rgba(255, 255, 255, 0.1);
                    --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    --dark-gray: #b0b0b0;
                }

                .my-orders-container {
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    min-height: 100vh;
                    transition: var(--transition);
                }

                .orders-main-content {
                    padding: 2rem 0;
                    min-height: calc(100vh - 120px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .loading-spinner,
                .error-message {
                    text-align: center;
                    padding: 3rem;
                    font-size: 1.2rem;
                }

                .error-message {
                    color: #dc3545;
                }

                .orders-title {
                    font-size: 2.5rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--primary-color);
                    animation: fadeInDown 1s ease-out;
                }

                .no-orders-container {
                    text-align: center;
                    padding: 2rem;
                    animation: fadeIn 1s ease-out;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                }

                .no-orders-title {
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    color: var(--text-color);
                }

                .crying-emoji {
                    font-size: 10rem;
                    animation: shakeHead 2s infinite, bounce 2s infinite;
                }

                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .order-date-divider {
                    grid-column: 1 / -1;
                    margin-top: 3rem;
                    margin-bottom: 1rem;
                    animation: fadeIn 0.5s ease-out;
                }

                .order-date-divider h2 {
                    font-size: 1.5rem;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .order-time {
                    font-size: 1rem;
                    color: var(--dark-gray);
                    margin-top: 0.3rem;
                }

                .divider-line {
                    border: none;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
                    margin: 0;
                }

                .order-card {
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                    animation: fadeInUp 0.5s ease-out;
                    border: 1px solid var(--border-color);
                }

                .order-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    background: var(--hover-bg);
                }

                .card-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .food-name {
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                    color: var(--text-color);
                }

                .order-details {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto;
                    font-size: 0.9rem;
                    color: var(--dark-gray);
                }

                .price {
                    font-weight: bold;
                    color: var(--primary-color);
                    font-size: 1.1rem;
                }

                .food-facts-section {
                    margin-top: 4rem;
                    text-align: center;
                    animation: fadeIn 1s ease-out;
                }

                .food-facts-section h2 {
                    font-size: 2rem;
                    margin-bottom: 1.5rem;
                    color: var(--primary-color);
                }

                .food-fact-card {
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    box-shadow: var(--shadow);
                    font-size: 1.2rem;
                    line-height: 1.6;
                    transition: var(--transition);
                    border: 1px solid var(--border-color);
                }

                .happy-emoji {
                    font-size: 5rem;
                    margin-top: 2rem;
                    display: inline-block;
                    animation: jump 2s infinite, rotate 5s infinite;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes shakeHead {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes jump {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    50% { transform: rotate(0deg); }
                    75% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .orders-title, .no-orders-title {
                        font-size: 2rem;
                    }
                    
                    .orders-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .crying-emoji {
                        font-size: 8rem;
                    }
                }

                @media (max-width: 480px) {
                    .orders-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .orders-title, .no-orders-title {
                        font-size: 1.8rem;
                    }
                    
                    .crying-emoji {
                        font-size: 6rem;
                    }
                }
            `}</style>
        </div>
    );
}