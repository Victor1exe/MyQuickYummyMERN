import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useDarkMode from '../hooks/useDarkMode';

import '../styles/food-detail.css';

export default function NotFound() {
    const { darkMode } = useDarkMode();

    return (
        <div className={`food-detail-container ${darkMode ? 'dark' : ''}`}>
            <Navbar />

            <main className="food-detail-main" style={{ textAlign: 'center', paddingTop: '5rem' }}>
                <div style={{ fontSize: '6rem' }} role="img" aria-label="Empty plate">🍽️</div>
                <h1 style={{ fontSize: '2.2rem', margin: '1rem 0' }}>Nothing on this plate</h1>
                <p style={{ color: 'var(--dark-gray)', marginBottom: '2rem' }}>
                    That page doesn&apos;t exist. The menu, though, very much does.
                </p>
                <Link to="/" className="detail-back-btn">
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to home
                </Link>
            </main>

            <Footer />
        </div>
    );
}
