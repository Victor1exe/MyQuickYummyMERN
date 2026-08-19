import React from 'react';

/**
 * Step one of the ordering flow: pick a category. Selecting one filters the
 * menu below it; selecting it again clears the filter.
 */
export default function CategoryChooser({ categories, counts, selected, onSelect }) {
    return (
        <section className="category-chooser" id="categories">
            <div className="section-heading">
                <h2>What are you in the mood for?</h2>
                <p>
                    Start with a category. We&apos;ll show you every dish in it, along with the
                    kitchen that cooks it.
                </p>
            </div>

            <div className="category-grid">
                {categories.map((category) => {
                    const isActive = selected === category.CategoryName;
                    return (
                        <button
                            key={category._id}
                            type="button"
                            className={`category-tile ${isActive ? 'active' : ''}`}
                            onClick={() => onSelect(isActive ? '' : category.CategoryName)}
                            aria-pressed={isActive}
                        >
                            {category.img && (
                                <img
                                    className="category-tile-img"
                                    src={category.img}
                                    alt={category.CategoryName}
                                    loading="lazy"
                                />
                            )}
                            <div className="category-tile-body">
                                <h3>
                                    <i className={`fas fa-${category.icon || 'utensils'}`} aria-hidden="true"></i>
                                    {category.CategoryName}
                                </h3>
                                {category.description && <p>{category.description}</p>}
                                <span className="category-tile-count">
                                    {counts[category.CategoryName] || 0} dishes
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selected && (
                <button type="button" className="category-reset" onClick={() => onSelect('')}>
                    <i className="fas fa-xmark" aria-hidden="true"></i> Clear &quot;{selected}&quot; filter
                </button>
            )}
        </section>
    );
}
