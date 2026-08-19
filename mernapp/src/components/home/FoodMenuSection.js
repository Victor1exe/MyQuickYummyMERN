import React from 'react';
import Card from '../Card';

/**
 * Step two: the dishes themselves, paged two at a time per category exactly as
 * the original did. Clicking a card opens the kitchen behind it.
 */
export default function FoodMenuSection({
    loading,
    error,
    categories,
    currentIndices,
    onPageChange,
    darkMode
}) {
    if (loading) {
        return (
            <div className="food-categories" id="menu">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i> Loading menu...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="food-categories" id="menu">
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            </div>
        );
    }

    const withItems = categories.filter((category) => category.items.length > 0);

    return (
        <div className="food-categories" id="menu">
            {withItems.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-utensils" aria-hidden="true"></i>{' '}
                    Nothing matches that search yet. Try another dish or clear the filters.
                </div>
            ) : (
                withItems.map((category) => {
                    // Clamp the page to what is actually in this category now.
                    // A search that narrows the results can leave the stored
                    // index past the end, which rendered a category heading
                    // with an empty row beneath it.
                    const lastPageStart = Math.max(0, (Math.ceil(category.items.length / 2) - 1) * 2);
                    const currentIndex = Math.min(currentIndices[category._id] || 0, lastPageStart);

                    const visibleItems = category.items.slice(currentIndex, currentIndex + 2);
                    const hasNext = currentIndex + 2 < category.items.length;
                    const hasPrev = currentIndex > 0;

                    return (
                        <div key={category._id} className="category-section">
                            <h2 className="category-title">{category.CategoryName}</h2>
                            <div className="food-items-container">
                                <button
                                    type="button"
                                    className={`nav-button prev ${!hasPrev ? 'disabled' : ''}`}
                                    onClick={() => onPageChange(category._id, currentIndex - 2)}
                                    disabled={!hasPrev}
                                    aria-label={`Previous ${category.CategoryName} items`}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                <div className="food-items-grid">
                                    {visibleItems.map((item) => (
                                        <Card
                                            key={item._id}
                                            foodItem={item}
                                            options={item.options[0]}
                                            darkMode={darkMode}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className={`nav-button next ${!hasNext ? 'disabled' : ''}`}
                                    onClick={() => onPageChange(category._id, currentIndex + 2)}
                                    disabled={!hasNext}
                                    aria-label={`Next ${category.CategoryName} items`}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
