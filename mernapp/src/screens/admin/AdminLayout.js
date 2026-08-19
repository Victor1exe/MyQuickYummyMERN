import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import useDarkMode from '../../hooks/useDarkMode';
import { apiGet, clearAdminSession, getAdminToken } from '../../services/api';

import '../../styles/admin.css';

const NAV_ITEMS = [
    { to: '/admin', end: true, icon: 'gauge-high', label: 'Overview' },
    { to: '/admin/partners', icon: 'store', label: 'Kitchens & Partners' },
    { to: '/admin/riders', icon: 'motorcycle', label: 'Delivery Riders' },
    { to: '/admin/categories', icon: 'th-large', label: 'Food Categories' },
    { to: '/admin/items', icon: 'utensils', label: 'Food Items' },
    { to: '/admin/policies', icon: 'file-shield', label: 'Policies & Docs' },
    { to: '/admin/faqs', icon: 'circle-question', label: 'FAQs' },
    { to: '/admin/receipts', icon: 'file-invoice-dollar', label: 'Receipts & Deliveries' },
    { to: '/admin/orders', icon: 'receipt', label: 'Order History' }
];

/**
 * Shell for every admin page: the sidebar, and the guard that bounces an
 * unauthenticated visitor to /admin/login. The token is verified against the
 * server rather than merely checked for presence, so an expired token does not
 * leave the console half-rendering with failing requests.
 */
export default function AdminLayout() {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useDarkMode();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            if (!getAdminToken()) {
                navigate('/admin/login', { replace: true });
                return;
            }

            try {
                await apiGet('/api/admin/me', { auth: 'admin' });
                if (!cancelled) setChecking(false);
            } catch (error) {
                if (!cancelled) {
                    clearAdminSession();
                    navigate('/admin/login', { replace: true });
                }
            }
        };

        verify();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const handleLogout = () => {
        clearAdminSession();
        navigate('/admin/login', { replace: true });
    };

    if (checking) {
        return (
            <div className={`admin-root ${darkMode ? 'dark' : ''}`}>
                <div className="admin-loading" style={{ margin: 'auto' }}>
                    <i className="fas fa-spinner fa-spin"></i> Checking your session...
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-root ${darkMode ? 'dark' : ''}`}>
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="admin-brand-title">My Quick Yummy</span>
                    <span className="admin-brand-sub">Admin Console</span>
                </div>

                <nav className="admin-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <i className={`fas fa-${item.icon}`} aria-hidden="true"></i>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-foot">
                    <button type="button" onClick={toggleTheme}>
                        <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'} aria-hidden="true"></i>{' '}
                        {darkMode ? 'Light mode' : 'Dark mode'}
                    </button>
                    <Link to="/">View storefront</Link>
                    <button type="button" onClick={handleLogout}>Sign out</button>
                </div>
            </aside>

            <div className="admin-main">
                <Outlet />
            </div>
        </div>
    );
}
