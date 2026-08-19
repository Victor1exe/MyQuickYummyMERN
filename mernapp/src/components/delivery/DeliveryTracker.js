import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDelivery } from './DeliveryContext';

const STAGES = [
    { at: 0, label: 'Order placed', icon: 'receipt' },
    { at: 0.15, label: 'Kitchen is cooking', icon: 'fire-burner' },
    { at: 0.45, label: 'Picked up', icon: 'bag-shopping' },
    { at: 0.7, label: 'Out for delivery', icon: 'road' },
    { at: 0.95, label: 'Arriving now', icon: 'location-dot' }
];

const stageFor = (progress) =>
    STAGES.reduce((current, stage) => (progress >= stage.at ? stage : current), STAGES[0]);

/**
 * The persistent progress bar that takes over when the confirmation popup
 * closes: a rectangular block that a bike fills from left to right as the
 * remaining time counts down to zero.
 *
 * Progress is derived from the server's `placedAt`/`etaAt` timestamps on every
 * tick rather than accumulated locally, so it stays accurate through a reload
 * or a backgrounded tab.
 */
export default function DeliveryTracker() {
    const { delivery, popupVisible, clearDelivery, completeDelivery } = useDelivery();
    const [now, setNow] = useState(() => Date.now());
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!delivery) return undefined;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [delivery]);

    const state = useMemo(() => {
        if (!delivery) return null;

        const start = new Date(delivery.placedAt).getTime();
        const end = new Date(delivery.etaAt).getTime();
        const span = Math.max(end - start, 1);

        const progress = Math.min(Math.max((now - start) / span, 0), 1);
        const secondsLeft = Math.max(0, Math.ceil((end - now) / 1000));

        return {
            progress,
            secondsLeft,
            minutesLeft: Math.ceil(secondsLeft / 60),
            arrived: secondsLeft <= 0
        };
    }, [delivery, now]);

    // Fire the completion call exactly once, when the countdown first hits zero.
    useEffect(() => {
        if (state?.arrived && delivery && !delivery.completed) {
            completeDelivery();
        }
    }, [state?.arrived, delivery, completeDelivery]);

    if (!delivery || !state || popupVisible) return null;

    const { progress, secondsLeft, minutesLeft, arrived } = state;
    const stage = stageFor(progress);
    const percent = Math.round(progress * 100);

    const countdown = arrived
        ? 'Delivered'
        : secondsLeft < 60
            ? `${secondsLeft} sec away`
            : `${minutesLeft} min away`;

    if (collapsed) {
        return (
            <button
                type="button"
                className="tracker-pill"
                onClick={() => setCollapsed(false)}
                aria-label="Show delivery tracker"
            >
                <span className="tracker-pill-bike" aria-hidden="true">🛵</span>
                {countdown}
            </button>
        );
    }

    return (
        <aside
            className={`delivery-tracker ${arrived ? 'arrived' : ''}`}
            aria-live="polite"
            aria-label="Delivery progress"
        >
            <div className="tracker-head">
                <div className="tracker-head-main">
                    <span className={`tracker-stage-icon ${arrived ? 'done' : ''}`} aria-hidden="true">
                        <i className={`fas fa-${arrived ? 'circle-check' : stage.icon}`}></i>
                    </span>
                    <div>
                        <strong>{arrived ? 'Delivered — enjoy your meal!' : stage.label}</strong>
                        <span className="tracker-sub">
                            {delivery.receiptNo}
                            {delivery.riderName ? ` • ${delivery.riderName}` : ''}
                            {delivery.riderVehicle ? ` (${delivery.riderVehicle})` : ''}
                        </span>
                    </div>
                </div>

                <div className="tracker-head-actions">
                    <span className={`tracker-countdown ${arrived ? 'done' : ''}`}>{countdown}</span>
                    <Link to="/myOrder" className="tracker-link">Receipt</Link>
                    <button
                        type="button"
                        className="tracker-icon-btn"
                        onClick={() => setCollapsed(true)}
                        aria-label="Minimise delivery tracker"
                    >
                        <i className="fas fa-minus"></i>
                    </button>
                    {arrived && (
                        <button
                            type="button"
                            className="tracker-icon-btn"
                            onClick={clearDelivery}
                            aria-label="Dismiss delivery tracker"
                        >
                            <i className="fas fa-xmark"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* The rectangular block the bike fills as the clock runs down. */}
            <div
                className="tracker-track"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Delivery progress"
            >
                <div className="tracker-fill" style={{ width: `${percent}%` }}>
                    <span className="tracker-bike" aria-hidden="true">🛵</span>
                </div>
                <span className="tracker-destination" aria-hidden="true">🏠</span>
                <span className="tracker-percent">{percent}%</span>
            </div>
        </aside>
    );
}
