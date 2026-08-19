import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiPost, setCustomerSession } from '../services/api';
import '../styles/login.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Live validation for a field that has content. An empty field returns '' —
 * "this is required" is only raised by handleSubmit, so the form does not
 * scold the user before they have typed anything.
 */
const liveErrors = ({ email }) => ({
  email: !email ? '' : EMAIL_REGEX.test(email) ? '' : 'Invalid email format',
  // Login does not enforce a password shape; only that one was supplied.
  password: ''
});

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  /**
   * Re-validates on every keystroke.
   *
   * A field that now has content takes the live result, which is what clears a
   * "required" error raised by a previous submit; a field still empty keeps the
   * existing message. Without this, submitting an empty form set
   * `errors.password` and nothing ever cleared it — and because the submit
   * button is disabled while that error exists, the form locked up for good.
   */
  useEffect(() => {
    const live = liveErrors(credentials);

    setErrors((prev) => ({
      email: credentials.email ? live.email : prev.email,
      password: credentials.password ? live.password : prev.password
    }));

    if (loginError && (credentials.email || credentials.password)) {
      setLoginError('');
    }
    // `loginError` is deliberately not a dependency: including it would clear
    // the message on the same render that sets it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials.email, credentials.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    // Same rule set the live validation uses, plus the required checks that
    // only apply on submit.
    const newErrors = { ...liveErrors(credentials) };

    if (!credentials.email) newErrors.email = 'Email is required';
    if (!credentials.password) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const json = await apiPost('/api/loginuser', {
        email: credentials.email,
        password: credentials.password
      });

      setCustomerSession(json.authToken, credentials.email);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleFocus = (field) => setIsFocused({ ...isFocused, [field]: true });
  const handleBlur = (field) => setIsFocused({ ...isFocused, [field]: false });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="login-container">
      <a href="#login-form" className="skip-link">Skip to login form</a>

      <div className="login-background"></div>

      <div className="login-content">
        <h1 className="app-title">My Quick Yummy</h1>
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome</h2>
            <p className="login-subtitle">Sign in to access your account</p>
          </div>

          {loginError && (
            <div className="login-error-message" aria-live="assertive">
              <i className="fas fa-exclamation-circle"></i> {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form" className="login-form" noValidate>
            <div className="input-title">Email</div>
            <div className={`form-group ${isFocused.email ? 'focused' : ''} ${credentials.email ? 'has-value' : ''} ${errors.email ? 'has-error' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                className="form-input"
                placeholder="Enter your email"
                aria-describedby="emailError"
                autoComplete="email"
                required
              />
              {errors.email && (
                <div id="emailError" className="error-message" aria-live="polite">
                  <i className="fas fa-exclamation-circle"></i> {errors.email}
                </div>
              )}
            </div>

            <div className="input-title">Password</div>
            <div className={`form-group ${isFocused.password ? 'focused' : ''} ${credentials.password ? 'has-value' : ''} ${errors.password ? 'has-error' : ''}`}>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  className="form-input"
                  placeholder="Enter your password"
                  aria-describedby="passwordError"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <div id="passwordError" className="error-message" aria-live="polite">
                  <i className="fas fa-exclamation-circle"></i> {errors.password}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`login-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting || Boolean(errors.email) || Boolean(errors.password)}
              >
                {isSubmitting ? <span className="spinner"></span> : 'Continue'}
              </button>
            </div>

            <div className="login-footer">
              <p className="signup-text">
                New here? <Link to="/createuser" className="signup-link">Create an account</Link>
              </p>
              <Link to="/" className="forgot-password">Back to home</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
