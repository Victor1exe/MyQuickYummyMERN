import React from 'react';
import { CUSTOMERS_COPY } from '../../data/homeContent';

export default function CustomersSection() {
    return (
        <section className="customers-description-section" id="customers">
            <div
                className="customers-background"
                style={{
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)'
                }}
            >
                <div className="customers-overlay">
                    <h2>Our Customers</h2>
                    <div className="customers-content">
                        {CUSTOMERS_COPY.map((paragraph, index) => (
                            // eslint-disable-next-line react/no-array-index-key -- static copy, order is fixed
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
