import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
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
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/careers">Careers</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/press">Press</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h5>Contact</h5>
                            <ul>
                                <li><Link to="/help">Help & Support</Link></li>
                                <li><Link to="/partner">Partner with us</Link></li>
                                <li><Link to="/ride">Ride with us</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h5>Legal</h5>
                            <ul>
                                <li><Link to="/terms">Terms & Conditions</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/security">Security</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-app">
                        <h5>Download the App</h5>
                        <div className="app-stores">
                            <Link to="#" className="app-link">
                                <img src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_200,h_65/icon-AppStore_lg30tv" alt="App Store" />
                            </Link>
                            <Link to="#" className="app-link">
                                <img src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_200,h_65/icon-GooglePlay_1_zixjxl" alt="Play Store" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Section (Copyright & Socials) */}
                <div className="footer-bottom">
                    <div className="copyright">
                        © 2024 My Quick Yummy, Inc. All rights reserved.
                    </div>
                    <div className="social-links">
                        <Link to="#" className="social-icon"><i className="fab fa-instagram"></i></Link>
                        <Link to="#" className="social-icon"><i className="fab fa-facebook"></i></Link>
                        <Link to="#" className="social-icon"><i className="fab fa-twitter"></i></Link>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                .footer-container {
                    background: #000;
                    color: #fff;
                    font-family: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';
                    padding: 3rem 0 0;
                    border-top: 1px solid #333;
                }

                .footer {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                /* Top Section Styling */
                .footer-top {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #333;
                }

                .footer-brand {
                    flex: 1;
                    min-width: 250px;
                    margin-bottom: 2rem;
                }

                .footer-logo {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #fff !important;
                    text-decoration: none;
                    position: relative;
                    display: inline-block;
                }

                .brand-text {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }

                .footer-logo:hover .brand-text {
                    transform: scale(1.05);
                }

                .brand-underline {
                    height: 2px;
                    background: #fc8019;
                    margin-top: 2px;
                    width: 0;
                    transition: width 0.3s ease;
                }

                .footer-logo:hover .brand-underline {
                    width: 100%;
                }

                .footer-slogan {
                    color: #aaa;
                    margin-top: 0.5rem;
                    font-size: 1rem;
                }

                .footer-links {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 3rem;
                }

                .footer-column {
                    min-width: 150px;
                }

                .footer-column h5 {
                    color: #fc8019;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .footer-column ul {
                    list-style: none;
                    padding: 0;
                }

                .footer-column li {
                    margin-bottom: 0.8rem;
                }

                .footer-column a {
                    color: #fff;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                    position: relative;
                }

                .footer-column a:hover {
                    color: #fc8019;
                }

                .footer-column a::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 1px;
                    background: #fc8019;
                    transition: width 0.3s ease;
                }

                .footer-column a:hover::after {
                    width: 100%;
                }

                .footer-app {
                    min-width: 200px;
                }

                .footer-app h5 {
                    color: #fc8019;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .app-stores {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .app-link img {
                    height: 40px;
                    transition: transform 0.3s ease;
                }

                .app-link:hover img {
                    transform: scale(1.05);
                }

                /* Bottom Section Styling */
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 0;
                }

                .copyright {
                    color: #aaa;
                    font-size: 0.9rem;
                }

                .social-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .social-icon {
                    color: #fff;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                }

                .social-icon:hover {
                    color: #fc8019;
                    transform: scale(1.2);
                }

                /* Responsive Adjustments */
                @media (max-width: 768px) {
                    .footer-top {
                        flex-direction: column;
                    }
                    .footer-links {
                        margin-top: 2rem;
                        gap: 2rem;
                    }
                    .footer-app {
                        margin-top: 2rem;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
