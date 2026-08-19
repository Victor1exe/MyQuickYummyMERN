import React from 'react';
import { FUTURE_UPDATES } from '../../data/homeContent';

export default function FutureUpdatesSection() {
    return (
        <section className="future-updates-section" id="updates">
            <h2>Future Updates</h2>
            <div className="updates-container">
                {FUTURE_UPDATES.map((update) => (
                    <div key={update.title} className="update-card">
                        <div className="update-icon">
                            <i className={`fas fa-${update.icon}`} aria-hidden="true"></i>
                        </div>
                        <h3>{update.title}</h3>
                        <p>{update.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
