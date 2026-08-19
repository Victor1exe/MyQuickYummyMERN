import React, { useMemo, useState } from 'react';

/**
 * FAQ accordion. Questions come from the `faqs` collection, so anything the
 * admin publishes appears here on the next load without a code change.
 */
export default function FaqSection({ faqs }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [openId, setOpenId] = useState(null);

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(faqs.map((faq) => faq.category)))],
        [faqs]
    );

    const visible = useMemo(
        () => (activeCategory === 'All' ? faqs : faqs.filter((faq) => faq.category === activeCategory)),
        [faqs, activeCategory]
    );

    if (faqs.length === 0) {
        return null;
    }

    return (
        <section className="faq-section" id="faq">
            <div className="section-heading">
                <h2>Frequently Asked Questions</h2>
                <p>Ordering, payments, delivery, partner kitchens and riding with us.</p>
            </div>

            <div className="faq-tabs">
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        className={`faq-tab ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => {
                            setActiveCategory(category);
                            setOpenId(null);
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="faq-list">
                {visible.map((faq) => {
                    const isOpen = openId === faq._id;
                    return (
                        <div key={faq._id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                            <button
                                type="button"
                                className="faq-question"
                                onClick={() => setOpenId(isOpen ? null : faq._id)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${faq._id}`}
                            >
                                <span>{faq.question}</span>
                                <i className="fas fa-chevron-down" aria-hidden="true"></i>
                            </button>
                            {isOpen && (
                                <div className="faq-answer" id={`faq-answer-${faq._id}`}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
