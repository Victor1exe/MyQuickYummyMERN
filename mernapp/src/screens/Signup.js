import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiPost } from '../services/api';
import '../styles/signup.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z ]{2,30}$/;
const PASSWORD_PATTERNS = {
  good: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
  strong: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/
};

/**
 * Live validation for fields that have content. Empty fields return '' —
 * "this is required" is raised only by handleSubmit.
 */
const liveErrors = ({ name, email, password }) => ({
  name: !name
    ? ''
    : !NAME_REGEX.test(name)
      ? 'Name should be 2-30 letters only'
      // The API requires at least 5 characters; surface it here rather than
      // letting the request come back with a server-side validation error.
      : name.trim().length < 5
        ? 'Name must be at least 5 characters'
        : '',
  email: !email ? '' : EMAIL_REGEX.test(email) ? '' : 'Invalid email format',
  password: !password ? '' : password.length < 8 ? 'Password must be at least 8 characters' : '',
  geolocation: ''
});

export default function Signup() {
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
    geolocation: ''
  });

  const [errors, setErrors] = useState({ name: '', email: '', password: '', geolocation: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupMessage, setSignupMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  /**
   * Re-validates every field on every keystroke.
   *
   * A field with content takes the live result, which clears any "required"
   * error a previous submit raised; a still-empty field keeps its message.
   * Previously this only recomputed `name` and `email`, so a failed submit left
   * `password` and `geolocation` errors set forever — and since the button is
   * disabled while *any* error exists, the form could never be submitted.
   * `geolocation` also has to be in the dependency list for that to work.
   */
  useEffect(() => {
    const live = liveErrors(credentials);

    setErrors((prev) => ({
      name: credentials.name ? live.name : prev.name,
      email: credentials.email ? live.email : prev.email,
      password: credentials.password ? live.password : prev.password,
      geolocation: credentials.geolocation ? live.geolocation : prev.geolocation
    }));

    if (signupMessage.text && signupMessage.type === 'error') {
      setSignupMessage({ text: '', type: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials.name, credentials.email, credentials.password, credentials.geolocation]);

  const getPasswordStrength = () => {
    if (!credentials.password) return '';
    if (PASSWORD_PATTERNS.strong.test(credentials.password)) return 'strong';
    if (PASSWORD_PATTERNS.good.test(credentials.password)) return 'good';
    return 'weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignupMessage({ text: '', type: '' });

    // Same rule set the live validation uses, plus the required checks that
    // only apply on submit. Sharing `liveErrors` keeps the two from drifting.
    const newErrors = { ...liveErrors(credentials) };

    if (!credentials.name) newErrors.name = 'Name is required';
    if (!credentials.email) newErrors.email = 'Email is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    if (!credentials.geolocation) newErrors.geolocation = 'Address is required';

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await apiPost('/api/createuser', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        location: credentials.geolocation
      });

      setSignupMessage({
        text: 'Account created successfully! Redirecting to login...',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/login', { state: { fromSignup: true, email: credentials.email } });
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setSignupMessage({ text: error.message || 'An error occurred during signup', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="signup-container">
      <div className="signup-background"></div>

      <div className="signup-content">
        <h1 className="app-title">My Quick Yummy</h1>
        <div className="signup-card">
          <div className="signup-header">
            <h2 className="signup-title">Create Account</h2>
            <p className="signup-subtitle">Join us to start ordering delicious food</p>
          </div>

          {signupMessage.text && (
            <div className={`signup-message ${signupMessage.type}`} aria-live="assertive">
              <i className={`fas ${signupMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {signupMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} id="signup-form" className="signup-form" noValidate>
            <div className="form-field">
              <label htmlFor="name" className="field-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={credentials.name}
                onChange={onChange}
                className="form-input"
                placeholder="John Doe"
                autoComplete="name"
                required
              />
              {errors.name && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.name}
                </div>
              )}
              <div className="field-hint">5-30 letters only, no numbers or special characters</div>
            </div>

            <div className="form-field">
              <label htmlFor="email" className="field-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
              {errors.email && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.email}
                </div>
              )}
              <div className="field-hint">We&apos;ll never share your email with anyone else</div>
            </div>

            <div className="form-field">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  className="form-input"
                  placeholder="Create a password"
                  autoComplete="new-password"
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
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.password}
                </div>
              )}
              <div className="password-strength-container">
                <div className="password-strength-bars">
                  <div className={`strength-bar ${credentials.password.length >= 1 ? 'active' : ''} ${getPasswordStrength()}`}></div>
                  <div className={`strength-bar ${credentials.password.length >= 4 ? 'active' : ''} ${getPasswordStrength()}`}></div>
                  <div className={`strength-bar ${credentials.password.length >= 8 ? 'active' : ''} ${getPasswordStrength()}`}></div>
                </div>
                <div className="password-strength-text">
                  {credentials.password ? (
                    <>
                      Password strength:
                      <span className={`strength ${getPasswordStrength()}`}>
                        {getPasswordStrength() === 'strong'
                          ? ' Strong'
                          : getPasswordStrength() === 'good'
                            ? ' Good'
                            : ' Weak'}
                      </span>
                    </>
                  ) : (
                    'Enter a password to check strength'
                  )}
                </div>
              </div>
              <div className="password-tips">
                <p>Password should contain:</p>
                <ul>
                  <li className={credentials.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                  <li className={/\d/.test(credentials.password) ? 'valid' : ''}>At least one number</li>
                  <li className={/[A-Z]/.test(credentials.password) ? 'valid' : ''}>At least one uppercase letter</li>
                  <li className={/[@$!%*#?&]/.test(credentials.password) ? 'valid' : ''}>At least one special character</li>
                </ul>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="geolocation" className="field-label">Delivery Address</label>
              <input
                type="text"
                id="geolocation"
                name="geolocation"
                value={credentials.geolocation}
                onChange={onChange}
                className="form-input"
                placeholder="123 Main St, City"
                autoComplete="street-address"
                required
              />
              {errors.geolocation && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.geolocation}
                </div>
              )}
              <div className="field-hint">We&apos;ll use this to deliver your orders</div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`signup-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting || Object.values(errors).some((error) => error)}
              >
                {isSubmitting ? <span className="spinner"></span> : 'Create Account'}
              </button>
            </div>

            <div className="signup-footer">
              <p className="login-text">
                Already have an account? <Link to="/login" className="login-link">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
