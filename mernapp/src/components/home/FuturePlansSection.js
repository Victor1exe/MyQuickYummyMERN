import React from 'react';
import { FUTURE_PLANS } from '../../data/homeContent';

export default function FuturePlansSection() {
    return (
        <section className="future-plans-section" id="plans">
            <h2>Future Plans</h2>
            <div className="plans-container">
                {FUTURE_PLANS.map((plan) => (
                    <div key={plan.title} className="plan-card">
                        <div className="plan-icon">
                            <i className={`fas fa-${plan.icon}`} aria-hidden="true"></i>
                        </div>
                        <h3>{plan.title}</h3>
                        <p>{plan.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
