import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiPost, getAuthToken } from '../../services/api';

const STORAGE_KEY = 'mqy-active-delivery';

const DeliveryContext = createContext(null);

const readStored = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

/**
 * Holds the one delivery currently in flight.
 *
 * It lives in localStorage rather than component state so the tracker survives
 * navigation and a page reload — the countdown is anchored to the server's
 * `etaAt` timestamp, not to a tick counter, so it stays correct across both.
 */
export function DeliveryProvider({ children }) {
    const [delivery, setDelivery] = useState(readStored);
    const [popupVisible, setPopupVisible] = useState(false);

    // Persist on every change, and clear the key when the delivery ends.
    useEffect(() => {
        if (delivery) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(delivery));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [delivery]);

    // A delivery belongs to a signed-in customer; dropping the session drops it.
    useEffect(() => {
        if (delivery && !getAuthToken()) {
            setDelivery(null);
        }
    }, [delivery]);

    const startDelivery = useCallback((receipt) => {
        setDelivery({
            receiptNo: receipt.receiptNo,
            placedAt: receipt.placedAt,
            etaAt: receipt.etaAt,
            etaMinutes: receipt.etaMinutes,
            total: receipt.total,
            itemCount: receipt.items?.length || 0,
            riderName: receipt.rider?.name || '',
            riderVehicle: receipt.rider?.vehicle || '',
            riderPhone: receipt.rider?.phone || '',
            riderRating: receipt.rider?.rating || 0,
            completed: false
        });
        setPopupVisible(true);

        // The confirmation popup shows for five seconds, then hands over to the
        // persistent progress bar.
        setTimeout(() => setPopupVisible(false), 5000);
    }, []);

    const dismissPopup = useCallback(() => setPopupVisible(false), []);

    const clearDelivery = useCallback(() => {
        setDelivery(null);
        setPopupVisible(false);
    }, []);

    /**
     * Called once when the countdown reaches zero. Tells the server the order
     * landed, which marks the receipt delivered and frees the rider — that is
     * what keeps the admin console's fleet board in step with the storefront.
     */
    const completeDelivery = useCallback(async () => {
        if (!delivery || delivery.completed) return;

        setDelivery((previous) => (previous ? { ...previous, completed: true } : previous));

        try {
            await apiPost(`/api/orders/${delivery.receiptNo}/complete`, {}, { auth: 'user' });
        } catch (error) {
            console.error('Could not mark the delivery complete:', error);
        }
    }, [delivery]);

    const value = useMemo(
        () => ({ delivery, popupVisible, startDelivery, dismissPopup, clearDelivery, completeDelivery }),
        [delivery, popupVisible, startDelivery, dismissPopup, clearDelivery, completeDelivery]
    );

    return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export const useDelivery = () => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used inside a DeliveryProvider');
    }
    return context;
};
