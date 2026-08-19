import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { getAuthToken } from '../services/api';

/**
 * Guards a customer route. Without this, /myOrder rendered for signed-out
 * visitors and simply failed its request.
 */
export default function RequireAuth({ children }) {
    const location = useLocation();

    if (!getAuthToken()) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}
