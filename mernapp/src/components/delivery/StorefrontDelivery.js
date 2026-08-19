import React from 'react';
import { useLocation } from 'react-router-dom';

import OrderPlacedPopup from './OrderPlacedPopup';
import DeliveryTracker from './DeliveryTracker';

import '../../styles/delivery.css';

/**
 * Mounts the customer-facing delivery UI once, at app level, so the tracker
 * follows the customer across every storefront route. It is deliberately
 * hidden inside the admin console, which is a different persona.
 */
export default function StorefrontDelivery() {
    const { pathname } = useLocation();

    if (pathname.startsWith('/admin')) return null;

    return (
        <>
            <OrderPlacedPopup />
            <DeliveryTracker />
        </>
    );
}
