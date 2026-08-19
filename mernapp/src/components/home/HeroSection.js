import React from 'react';

/** Full-bleed hero image with the dish/restaurant search box. */
export default function HeroSection({ search, onSearchChange }) {
    return (
        <div className="hero-carousel">
            <div className="carousel-overlay">
                <h1 className="hero-title">Discover Your Favorite Meals</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for restaurants or dishes..."
                        value={search}
                        onChange={onSearchChange}
                        className="search-input"
                        aria-label="Search for restaurants or dishes"
                    />
                    <button className="search-button" aria-label="Search" type="button">
                        <i className="fas fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div className="carousel-images">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Delicious food"
                    loading="lazy"
                />
            </div>
        </div>
    );
}
