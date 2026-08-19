import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import '../styles/footer.css';

/**
 * Footer links used to point at routes that were never registered (/about,
 * /careers, /terms ...), so every one of them landed on a blank page. They now
 * either scroll to the matching home section or open a real route.
 */
export default function Footer() {
    const navigate = useNavigate();
    const location = useLocation();

    const goToSection = (sectionId) => {
        const scroll = () =>
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (location.pathname === '/') {
            scroll();
        } else {
            navigate('/');
            window.requestAnimationFrame(() => window.setTimeout(scroll, 120));
        }
    };

    return (
        <div className="footer-container">
            <footer className="footer">
                {/* Top Section (Company Info & Links) */}
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="brand-text">My Quick Yummy</span>
                            <div className="brand-underline"></div>
                        </Link>
                        <p className="footer-slogan">Order food from favourite restaurants near you.</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h5>Company</h5>
                            <ul>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('about')}>
                                        About Us
                                    </button>
                                </li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('riders')}>
                                        Careers
                                    </button>
                                </li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('plans')}>
                                        Future Plans
                                    </button>
                                </li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('updates')}>
                                        What&apos;s Next
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h5>Contact</h5>
                            <ul>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('faq')}>
                                        Help &amp; Support
                                    </button>
                                </li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('kitchens')}>
                                        Partner with us
                                    </button>
                                </li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('riders')}>
                                        Ride with us
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h5>Legal</h5>
                            <ul>
                                <li><Link to="/policies/terms-of-service">Terms &amp; Conditions</Link></li>
                                <li><Link to="/policies/privacy-policy">Privacy Policy</Link></li>
                                <li><Link to="/policies">All Policies</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h5>Internal</h5>
                            <ul>
                                <li><Link to="/admin">Admin Panel</Link></li>
                                <li>
                                    <button type="button" className="footer-link-button" onClick={() => goToSection('diet')}>
                                        Diet Calculator
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-app">
                        <h5>Download the App</h5>
                        <div className="app-stores">
                            <span className="app-link">
                                <img
                                    src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_200,h_65/icon-AppStore_lg30tv"
                                    alt="App Store"
                                />
                            </span>
                            <span className="app-link">
                                <img
                                    src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_200,h_65/icon-GooglePlay_1_zixjxl"
                                    alt="Play Store"
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Section (Copyright & Socials) */}
                <div className="footer-bottom">
                    <div className="copyright">
                        © {new Date().getFullYear()} My Quick Yummy, Inc. All rights reserved.
                    </div>
                    <div className="social-links">
                        <span className="social-icon"><i className="fab fa-instagram"></i></span>
                        <span className="social-icon"><i className="fab fa-facebook"></i></span>
                        <span className="social-icon"><i className="fab fa-twitter"></i></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
