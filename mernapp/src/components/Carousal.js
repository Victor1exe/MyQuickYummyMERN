import React, { useEffect, useMemo, useState } from 'react';

import '../styles/carousel.css';

/**
 * Standalone image carousel. Not currently mounted by any route — the home
 * page uses HeroSection instead — but kept as a working component rather than
 * the block of commented-out code it previously carried alongside.
 */
export default function Carousel() {
    const slides = useMemo(
        () => [
            {
                img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
                alt: 'Burger'
            },
            {
                img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
                alt: 'Pizza'
            },
            {
                img: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
                alt: 'Pasta'
            }
        ],
        []
    );

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

    return (
        <div>
            <div id="carouselExampleFade" className="carousel slide carousel-fade" style={{ position: 'relative' }}>
                <div className="carousel-inner" id="carousel">
                    <div className="carousel-caption" style={{ zIndex: '9' }}>
                        <form className="d-flex justify-content-center" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="form-control me-2 w-75 bg-white text-dark"
                                type="search"
                                placeholder="Type in..."
                                aria-label="Search"
                            />
                            <button className="btn text-white bg-success" type="submit">Search</button>
                        </form>
                    </div>

                    {slides.map((slide, index) => (
                        <div
                            key={slide.alt}
                            className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
                            style={{
                                display: index === currentSlide ? 'block' : 'none',
                                transition: 'opacity 0.6s ease'
                            }}
                        >
                            <img
                                src={slide.img}
                                className="d-block w-100"
                                style={{ filter: 'brightness(80%)' }}
                                alt={slide.alt}
                            />
                        </div>
                    ))}
                </div>

                <button className="carousel-control-prev" type="button" onClick={goToPrev} style={{ cursor: 'pointer' }}>
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>

                <button className="carousel-control-next" type="button" onClick={goToNext} style={{ cursor: 'pointer' }}>
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    );
}
