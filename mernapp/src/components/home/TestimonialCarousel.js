import React from 'react';

/**
 * One reusable carousel. The original shipped this markup twice — once for
 * delivery partner stories and once for customer stories — with the class
 * names being the only difference.
 */
export default function TestimonialCarousel({
    id,
    title,
    backgroundImage,
    sectionClass,
    entries,
    current,
    onSelect
}) {
    return (
        <section className={`testimonial-section ${sectionClass}`} id={id}>
            <div className="testimonial-background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
            <div className="testimonial-content">
                <h2>{title}</h2>
                <div className="testimonial-slider">
                    {entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            className={`testimonial-slide ${index === current ? 'active' : ''}`}
                            style={{ transform: `translateX(${(index - current) * 100}%)` }}
                        >
                            <div className="testimonial-card">
                                <p>&quot;{entry.experience}&quot;</p>
                                <div className="testimonial-author">
                                    <h4>{entry.name}</h4>
                                    <span>
                                        {entry.age} • {entry.state}, {entry.country}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="testimonial-dots">
                    {entries.map((entry, index) => (
                        <button
                            key={entry.id}
                            type="button"
                            className={index === current ? 'active' : ''}
                            onClick={() => onSelect(index)}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
