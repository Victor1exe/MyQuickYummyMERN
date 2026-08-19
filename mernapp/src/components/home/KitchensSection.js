import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

/**
 * Every kitchen selling through the platform — restaurants, hotels, cloud
 * kitchens, food stalls, bakeries and cafes — filterable by type.
 */
export default function KitchensSection({ partners }) {
    const [type, setType] = useState('All');
    const navigate = useNavigate();

    const types = useMemo(
        () => ['All', ...Array.from(new Set(partners.map((p) => p.type))).sort()],
        [partners]
    );

    const visible = useMemo(
        () => (type === 'All' ? partners : partners.filter((p) => p.type === type)),
        [partners, type]
    );

    if (partners.length === 0) {
        return null;
    }

    return (
        <section className="kitchens-section" id="kitchens">
            <div className="section-heading">
                <h2>Our Kitchens</h2>
                <p>
                    {partners.length} partner kitchens cook for My Quick Yummy — from five-star hotel
                    kitchens to a pavement stall that has not changed its chutney recipe since 1994.
                </p>
            </div>

            <div className="kitchen-filters">
                {types.map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={`kitchen-filter ${type === option ? 'active' : ''}`}
                        onClick={() => setType(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="kitchens-grid">
                {visible.map((partner) => (
                    <article
                        key={partner._id}
                        className="kitchen-card"
                        onClick={() => navigate(`/kitchen/${partner._id}`)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                navigate(`/kitchen/${partner._id}`);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            className="kitchen-card-img"
                            src={partner.img || FALLBACK_IMG}
                            alt={partner.name}
                            loading="lazy"
                        />
                        <div className="kitchen-card-body">
                            <span className="kitchen-type">{partner.type}</span>
                            <h3>{partner.name}</h3>
                            <p>{partner.description}</p>
                            <div className="kitchen-meta">
                                <span className="rating-pill">
                                    <i className="fas fa-star" aria-hidden="true"></i> {partner.rating}
                                </span>
                                <span>
                                    <i className="fas fa-location-dot" aria-hidden="true"></i>{' '}
                                    <strong>{partner.city}</strong>
                                </span>
                                <span>
                                    <i className="fas fa-clock" aria-hidden="true"></i>{' '}
                                    {partner.deliveryTimeMins} mins
                                </span>
                                <span>
                                    <i className="fas fa-indian-rupee-sign" aria-hidden="true"></i>{' '}
                                    {partner.avgCostForTwo} for two
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
