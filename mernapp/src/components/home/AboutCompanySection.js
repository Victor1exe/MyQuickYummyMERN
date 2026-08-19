import React from 'react';
import { COMPANY_INFO_CARDS, COMPANY_TIMELINE } from '../../data/homeContent';

export default function AboutCompanySection() {
    return (
        <section className="about-company-section" id="about">
            <h2>Know Your Quick Yummy</h2>

            <div className="company-timeline">
                <div className="timeline-track"></div>
                {COMPANY_TIMELINE.map((milestone) => (
                    <div key={milestone.year} className="milestone">
                        <div className="milestone-year">{milestone.year}</div>
                        <div className="milestone-event">{milestone.event}</div>
                    </div>
                ))}
            </div>

            <div className="company-info-container">
                {COMPANY_INFO_CARDS.map((card) => (
                    <div key={card.title} className={`info-card ${card.className}`}>
                        <div className="info-icon">
                            <i className={`fas fa-${card.icon}`} aria-hidden="true"></i>
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
