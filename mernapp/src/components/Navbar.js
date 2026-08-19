import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';

import Modal from '../Modal';
import Cart from '../screens/Cart';
import { useCart } from './ContextReducer';
import useDarkMode from '../hooks/useDarkMode';
import { SECTIONS } from '../data/homeContent';
import { clearCustomerSession, getAuthToken } from '../services/api';

import '../styles/navbar.css';

export default function Navbar() {
    const data = useCart();
    const [cartView, setCartView] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);

    // Shared with Home through a window event, so the whole page re-themes at
    // once instead of only the bar.
    const { darkMode, toggleTheme } = useDarkMode();

    // Read once per render rather than calling localStorage four times inline
    // the way the original did.
    const [isSignedIn, setIsSignedIn] = useState(() => Boolean(getAuthToken()));

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // The token can change from another tab, or from this one after login.
    useEffect(() => {
        setIsSignedIn(Boolean(getAuthToken()));
        const sync = () => setIsSignedIn(Boolean(getAuthToken()));
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [location.pathname]);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setExploreOpen(false);
            }
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    const handleLogout = () => {
        clearCustomerSession();
        setIsSignedIn(false);
        navigate('/login');
    };

    /**
     * Section links only make sense on the home page. From anywhere else,
     * navigate home first and scroll once the section has mounted.
     */
    const goToSection = (sectionId) => {
        setExploreOpen(false);
        setIsMenuOpen(false);

        const scroll = () =>
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (location.pathname === '/') {
            scroll();
        } else {
            navigate('/');
            // One frame after the route change so the target exists.
            window.requestAnimationFrame(() => window.setTimeout(scroll, 120));
        }
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
                        aria-expanded={isMenuOpen}
                    >
                        <span className={`navbar-toggler-icon ${isMenuOpen ? 'open' : ''}`}></span>
                    </button>

                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/" onClick={() => setIsMenuOpen(false)}>
                                    Home
                                </Link>
                            </li>

                            <li className="nav-item">
                                <button type="button" className="nav-link" onClick={() => goToSection('categories')}>
                                    Categories
                                </button>
                            </li>

                            <li className="nav-item">
                                <button type="button" className="nav-link" onClick={() => goToSection('kitchens')}>
                                    Our Kitchens
                                </button>
                            </li>

                            <li className="nav-item">
                                <button type="button" className="nav-link" onClick={() => goToSection('riders')}>
                                    Delivery Partners
                                </button>
                            </li>

                            <li className="nav-item nav-dropdown" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="nav-link"
                                    onClick={() => setExploreOpen((open) => !open)}
                                    aria-expanded={exploreOpen}
                                    aria-haspopup="true"
                                >
                                    Explore <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
                                </button>

                                {exploreOpen && (
                                    <ul className="nav-dropdown-menu">
                                        {SECTIONS.map((section) => (
                                            <li key={section.id}>
                                                <button type="button" onClick={() => goToSection(section.id)}>
                                                    <i className={`fas fa-${section.icon}`} aria-hidden="true"></i>
                                                    {section.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>

                            {isSignedIn && (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/myOrder" onClick={() => setIsMenuOpen(false)}>
                                        My Orders
                                    </Link>
                                </li>
                            )}
                        </ul>

                        <div className="d-flex align-items-center">
                            <button
                                type="button"
                                className="dark-mode-toggle"
                                onClick={toggleTheme}
                                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
                            </button>

                            {!isSignedIn ? (
                                <>
                                    <Link className="btn login-btn" to="/login">Login</Link>
                                    <Link className="btn signup-btn" to="/createuser">SignUp</Link>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="cart-btn"
                                        onClick={() => setCartView(true)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') setCartView(true);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        My Cart
                                        <Badge pill bg="danger" className={data.length > 0 ? 'pulse' : ''}>
                                            {data.length}
                                        </Badge>
                                    </div>

                                    {cartView && (
                                        <Modal onClose={() => setCartView(false)}>
                                            <Cart darkMode={darkMode} onClose={() => setCartView(false)} />
                                        </Modal>
                                    )}

                                    <div
                                        className="logout-btn"
                                        onClick={handleLogout}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') handleLogout();
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        Logout
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
