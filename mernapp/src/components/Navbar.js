import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Modal from '../Modal';
import Cart from '../screens/Cart';
import { useCart } from './ContextReducer';

export default function Navbar() {
    const data = useCart();
    const [cartView, setCartView] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage or prefer-color-scheme
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) return JSON.parse(savedMode);
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Apply dark mode class to body and save preference
        if (darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={`navbar-container ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <Link 
                        className="navbar-brand" 
                        to="/"
                        style={{ 
                            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            fontSize: '1.8rem'
                        }}
                    >
                        <span className="brand-text">My Quick Yummy</span>
                        <div className="brand-underline"></div>
                    </Link>

                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className={`navbar-toggler-icon ${isMenuOpen ? 'open' : ''}`}></span>
                    </button>

                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>

                            {localStorage.getItem("authToken") && (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/myOrder">My Orders</Link>
                                </li>
                            )}
                        </ul>

                        <div className="d-flex align-items-center">
                            <button 
                                className="dark-mode-toggle"
                                onClick={toggleDarkMode}
                                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {darkMode ? (
                                    <i className="fas fa-sun"></i>
                                ) : (
                                    <i className="fas fa-moon"></i>
                                )}
                            </button>

                            {!localStorage.getItem("authToken") ? (
                                <>
                                    <Link className="btn login-btn" to="/login">Login</Link>
                                    <Link className="btn signup-btn" to="/Createuser">SignUp</Link>
                                </>
                            ) : (
                                <>
                                    <div 
                                        className="cart-btn"
                                        onClick={() => setCartView(true)}
                                    >
                                        My Cart
                                        <Badge 
                                            pill 
                                            bg="danger" 
                                            className={data.length > 0 ? 'pulse' : ''}
                                        >
                                            {data.length}
                                        </Badge>
                                    </div>

                                    {cartView && (
                                        <Modal onClose={() => setCartView(false)}>
                                            <Cart />
                                        </Modal>
                                    )}

                                    <div 
                                        className="logout-btn"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <style jsx>{`
                .navbar-container {
                    background: linear-gradient(135deg, #fc8019 0%, #f55d2c 100%);
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    animation: fadeIn 0.5s ease-out;
                }
                
                /* Dark mode base styles */
                .navbar-container.dark-mode {
                    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                }
                
                .navbar-container.dark-mode.scrolled {
                    background: #1a1a1a;
                }
                
                /* Dark mode toggle button */
                .dark-mode-toggle {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-right: 1rem;
                    padding: 0.5rem;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .dark-mode-toggle:hover {
                    transform: scale(1.1);
                    color: ${darkMode ? '#ffcc00' : '#fc8019'};
                }
                
                .scrolled .dark-mode-toggle {
                    color: #fc8019;
                }
                
                .dark-mode.scrolled .dark-mode-toggle {
                    color: #fc8019;
                }
                
                /* Original animations preserved */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .navbar-container.scrolled {
                    background: #fff;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .navbar-brand {
                    color: #fff !important;
                    letter-spacing: -0.5px;
                    position: relative;
                    display: inline-block;
                }
                
                .scrolled .navbar-brand {
                    color: #fc8019 !important;
                }
                
                .dark-mode .navbar-brand {
                    color: #fff !important;
                }
                
                .dark-mode.scrolled .navbar-brand {
                    color: #fc8019 !important;
                }
                
                .brand-text {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }
                
                .brand-underline {
                    height: 2px;
                    background: #fff;
                    margin-top: 2px;
                    width: 0;
                    transition: width 0.3s ease;
                }
                
                .navbar-brand:hover .brand-underline {
                    width: 100%;
                }
                
                .navbar-brand:hover .brand-text {
                    transform: scale(1.05);
                }
                
                .scrolled .brand-underline {
                    background: #fc8019;
                }
                
                .dark-mode .brand-underline {
                    background: #fff;
                }
                
                .dark-mode.scrolled .brand-underline {
                    background: #fc8019;
                }
                
                /* Nav links */
                .nav-link {
                    font-weight: 500;
                    font-size: 1.1rem;
                    color: #fff !important;
                    padding: 0.5rem 1rem !important;
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .scrolled .nav-link {
                    color: #333 !important;
                }
                
                .dark-mode .nav-link {
                    color: #fff !important;
                }
                
                .dark-mode.scrolled .nav-link {
                    color: #fff !important;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 1rem;
                    width: 0;
                    height: 2px;
                    background: #fff;
                    transition: width 0.3s ease;
                }
                
                .scrolled .nav-link::after {
                    background: #fc8019;
                }
                
                .dark-mode .nav-link::after {
                    background: #fff;
                }
                
                .dark-mode.scrolled .nav-link::after {
                    background: #fc8019;
                }
                
                .nav-link:hover::after {
                    width: calc(100% - 2rem);
                }
                
                .nav-item {
                    transition: transform 0.3s ease;
                }
                
                .nav-item:hover {
                    transform: scale(1.05);
                }
                
                /* Buttons */
                .btn {
                    font-weight: 500;
                    border-radius: 8px !important;
                    padding: 0.5rem 1.5rem !important;
                    margin: 0 0.5rem;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .login-btn {
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff !important;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .login-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                }
                
                .login-btn:active {
                    transform: scale(0.95);
                }
                
                .signup-btn {
                    background: #fff;
                    color: #fc8019 !important;
                }
                
                .signup-btn:hover {
                    transform: scale(1.05);
                }
                
                .signup-btn:active {
                    transform: scale(0.95);
                }
                
                /* Cart button */
                .cart-btn {
                    background: #fff;
                    color: #fc8019 !important;
                    border-radius: 8px;
                    padding: 0.5rem 1.5rem;
                    margin: 0 0.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .cart-btn:hover {
                    transform: scale(1.05);
                }
                
                .cart-btn:active {
                    transform: scale(0.95);
                }
                
                /* Logout button */
                .logout-btn {
                    background: transparent;
                    color: #fff !important;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    padding: 0.5rem 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .logout-btn:hover {
                    transform: scale(1.05);
                }
                
                .logout-btn:active {
                    transform: scale(0.95);
                }
                
                .scrolled .logout-btn {
                    color: #fc8019 !important;
                    border-color: #fc8019;
                }
                
                .dark-mode .logout-btn {
                    color: #fff !important;
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                .dark-mode.scrolled .logout-btn {
                    color: #fc8019 !important;
                    border-color: #fc8019;
                }
                
                /* Toggler icon */
                .navbar-toggler-icon {
                    transition: transform 0.3s ease;
                }
                
                .navbar-toggler-icon.open {
                    transform: rotate(90deg);
                }
                
                /* Pulse animation */
                .pulse {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}