import React from 'react';

import { useDelivery } from './DeliveryContext';

/**
 * The five-second confirmation shown the moment payment goes through: the
 * promised delivery window and the partner who took the job.
 */
export default function OrderPlacedPopup() {
    const { delivery, popupVisible, dismissPopup } = useDelivery();

    if (!delivery || !popupVisible) return null;

    return (
        <div className="order-popup-overlay" role="presentation" onClick={dismissPopup}>
            <div
                className="order-popup"
                role="alertdialog"
                aria-live="assertive"
                aria-label="Order confirmed"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="order-popup-check" aria-hidden="true">
                    <i className="fas fa-check"></i>
                </div>

                <h2>Order confirmed</h2>
                <p className="order-popup-receipt">{delivery.receiptNo}</p>

                <div className="order-popup-eta">
                    <span className="order-popup-eta-value">{delivery.etaMinutes}</span>
                    <span className="order-popup-eta-unit">minutes</span>
                </div>
                <p className="order-popup-eta-label">Estimated delivery time</p>

                {delivery.riderName ? (
                    <div className="order-popup-rider">
                        <div className="order-popup-rider-avatar" aria-hidden="true">
                            {delivery.riderName.charAt(0)}
                        </div>
                        <div className="order-popup-rider-body">
                            <strong>{delivery.riderName}</strong>
                            <span>
                                is picking up your order
                                {delivery.riderVehicle ? ` • ${delivery.riderVehicle}` : ''}
                                {delivery.riderRating ? ` • ★ ${delivery.riderRating}` : ''}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="order-popup-rider">
                        <div className="order-popup-rider-body">
                            <strong>Finding you a delivery partner</strong>
                            <span>Every rider in your zone is on a run — we&apos;ll assign one shortly.</span>
                        </div>
                    </div>
                )}

                <p className="order-popup-foot">
                    Your receipt is in <strong>My Orders</strong>. This closes on its own.
                </p>

                <div className="order-popup-timer" aria-hidden="true">
                    <div className="order-popup-timer-fill"></div>
                </div>
            </div>
        </div>
    );
}
