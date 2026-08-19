import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiPost, setAdminSession } from '../../services/api';
import '../../styles/admin.css';

/**
 * Admin sign-in. Credentials live in backend/.env (ADMIN_EMAIL /
 * ADMIN_PASSWORD) and are checked server side; the browser only ever holds the
 * returned token.
 */
export default function AdminLogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await apiPost('/api/admin/login', form);
            setAdminSession(response.adminToken);
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Could not sign in');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-bg"></div>

            <div className="admin-login-content">
                <h1 className="admin-login-title">My Quick Yummy</h1>
                <p className="admin-login-tag">Admin Console</p>

                <div className="admin-login-card">
                    <h2>Sign in</h2>
                    <p>Manage kitchens, riders, the menu and internal documents.</p>

                    {error && (
                        <div className="admin-alert error">
                            <i className="fas fa-circle-exclamation" aria-hidden="true"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="admin-field">
                            <label htmlFor="admin-email">Admin email</label>
                            <input
                                id="admin-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                                placeholder="admin@myquickyummy.com"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="admin-password">Password</label>
                            <input
                                id="admin-password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button type="submit" className="admin-btn admin-login-submit" disabled={submitting}>
                            {submitting ? <span className="admin-spinner"></span> : 'Sign in to console'}
                        </button>
                    </form>

                    <Link to="/" className="admin-login-back">← Back to the storefront</Link>
                </div>
            </div>
        </div>
    );
}
