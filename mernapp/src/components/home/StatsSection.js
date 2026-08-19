import React from 'react';
import { CUSTOMER_STATS } from '../../data/homeContent';

export default function StatsSection({ liveStats }) {
    // Where real numbers exist in the database, show them instead of the
    // marketing placeholders.
    const stats = CUSTOMER_STATS.map((stat) => {
        if (stat.title === 'Regions Covered' && liveStats?.cities) {
            return { ...stat, value: `${liveStats.cities}+` };
        }
        return stat;
    });

    return (
        <section className="customer-stats-section" id="stats">
            <div className="stats-container">
                {stats.map((stat) => (
                    <div key={stat.title} className="stat-card">
                        <div className="stat-icon">
                            <i className={`fas fa-${stat.icon}`} aria-hidden="true"></i>
                        </div>
                        <h3>{stat.value}</h3>
                        <p>{stat.title}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
