import React from 'react';
import { DELIVERY_HEROES_COPY, PARTNER_FEATURES } from '../../data/homeContent';

const STATUS_CARDS = [
    { key: 'available', className: 'available', label: 'Available now' },
    { key: 'readyToGo', className: 'ready', label: 'Ready to go' },
    { key: 'busy', className: 'busy', label: 'On a delivery' },
    { key: 'onBreak', className: 'break', label: 'On a break' },
    { key: 'offline', className: 'offline', label: 'Off shift' }
];

const STATUS_LABELS = {
    available: 'Available',
    ready_to_go: 'Ready to go',
    busy: 'Busy',
    on_break: 'On break',
    offline: 'Offline'
};

/**
 * The delivery partner ("delivery boys") section: what the rider policy is,
 * how many riders we are in touch with, and how many are available, busy or
 * ready to go right now. Counts come live from the riders collection, so the
 * admin panel and this board never disagree.
 */
export default function DeliveryPartnersSection({ stats, riders, policies }) {
    const riderPolicies = policies.filter(
        (policy) => policy.category === 'Rider Policy' || policy.category === 'Partner Policy'
    );

    return (
        <section className="delivery-partners-section" id="riders">
            <div className="partners-background">
                <div className="partners-content">
                    <h2>Our Delivery Heroes</h2>
                    <p>{DELIVERY_HEROES_COPY}</p>
                </div>
            </div>

            {stats && (
                <div className="fleet-board">
                    <div className="section-heading" style={{ marginTop: '3rem' }}>
                        <h2>Fleet Status, Live</h2>
                        <p>
                            We are in touch with <strong>{stats.total}</strong> delivery partners across{' '}
                            <strong>{stats.cities}</strong> cities. {stats.verified} are verified, and
                            together they have completed {stats.totalDeliveries.toLocaleString()}{' '}
                            deliveries at an average rating of {stats.avgRating}.
                        </p>
                    </div>

                    <div className="fleet-status-grid">
                        {STATUS_CARDS.map((card) => (
                            <div key={card.key} className={`fleet-status-card ${card.className}`}>
                                <h3>{stats[card.key] ?? 0}</h3>
                                <p>
                                    <span className="fleet-dot" aria-hidden="true"></span>
                                    {card.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {riders.length > 0 && (
                        <div className="riders-roster">
                            {riders.map((rider) => (
                                <div key={rider._id} className="rider-card">
                                    <div className="rider-card-head">
                                        <h3>{rider.name}</h3>
                                        <span className={`rider-status ${rider.status}`}>
                                            {STATUS_LABELS[rider.status] || rider.status}
                                        </span>
                                    </div>
                                    <div className="rider-meta">
                                        <div>
                                            <i className="fas fa-location-dot" aria-hidden="true"></i>
                                            {rider.city}, {rider.state}
                                        </div>
                                        <div>
                                            <i className="fas fa-motorcycle" aria-hidden="true"></i>
                                            {rider.vehicle}
                                        </div>
                                        <div>
                                            <i className="fas fa-star" aria-hidden="true"></i>
                                            {rider.rating} • {rider.totalDeliveries.toLocaleString()} deliveries
                                        </div>
                                        {rider.isVerified && (
                                            <div className="rider-verified">
                                                <i className="fas fa-circle-check" aria-hidden="true"></i>{' '}
                                                Verified partner
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {riderPolicies.length > 0 && (
                        <div className="policy-callout">
                            <h3>
                                <i className="fas fa-file-shield" aria-hidden="true"></i> The policy we
                                work under
                            </h3>
                            <ul className="policy-list">
                                {riderPolicies.map((policy) => (
                                    <li key={policy._id}>
                                        <strong>
                                            {policy.title} <small>v{policy.version}</small>
                                        </strong>
                                        {policy.summary}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="partner-features">
                {PARTNER_FEATURES.map((feature) => (
                    <div key={feature.label} className="feature-card">
                        <div className="feature-icon">
                            <i className={`fas fa-${feature.icon}`} aria-hidden="true"></i>
                        </div>
                        <h3>{feature.label}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
}
