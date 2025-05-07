import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    // Validate email in real-time
    if (credentials.email && !emailRegex.test(credentials.email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email format" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }

    // Clear login error when user types
    if (loginError && (credentials.email || credentials.password)) {
      setLoginError("");
    }
  }, [credentials.email, credentials.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");
    
    // Final validation before submit
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!credentials.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(credentials.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/loginuser", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: credentials.email, 
          password: credentials.password 
        })
      });
      
      const json = await response.json();
      
      if (!json.success) {
        setLoginError("Invalid credentials. Please try again.");
        return;
      }
      
      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("authToken", json.authToken);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {/* Skip to content link for accessibility */}
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
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  value={credentials.password} 
                  onChange={onChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  className="form-input"
                  placeholder="Enter your password"
                  aria-describedby="passwordError"
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                disabled={isSubmitting || errors.email || errors.password}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
            
            <div className="login-footer">
              <p className="signup-text">New here? <Link to="/createuser" className="signup-link">Create an account</Link></p>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        
        :root {
          --bg-color: #ffffff;
          --text-color: #1d1d1f;
          --primary-color: #ff7b00;
          --primary-light: #ff9a3c;
          --secondary-color: #ff5e1a;
          --light-gray: #f5f5f7;
          --dark-gray: #86868b;
          --border-color: #d2d2d7;
          --error-color: #ff3b30;
          --success-color: #34c759;
          --shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          --transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 0;
          background-color: var(--bg-color);
          color: var(--text-color);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: var(--primary-color);
          color: white;
          padding: 8px;
          z-index: 100;
          transition: top 0.3s;
        }

        .skip-link:focus {
          top: 0;
        }
      `}</style>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          z-index: 0;
          animation: gradientShift 8s ease infinite;
          background-size: 200% 200%;
        }

        .login-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 600px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.8s ease-out;
        }

        .app-title {
          font-size: 3.2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 30px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          letter-spacing: -0.5px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 60px;
          width: 100%;
          box-shadow: var(--shadow);
          transform: translateY(0);
          transition: var(--transition);
          animation: cardAppear 0.6s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .login-card:hover {
          box-shadow: 0 8px 50px rgba(0, 0, 0, 0.2);
          transform: translateY(-5px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 12px;
          color: var(--text-color);
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 1.2rem;
          color: var(--dark-gray);
          margin: 0;
          font-weight: 400;
        }

        .login-error-message {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--error-color);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          animation: fadeIn 0.3s ease-out;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-title {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 8px;
          padding-left: 5px;
        }

        .form-group {
          position: relative;
          transition: var(--transition);
        }

        .form-group.has-error .form-input {
          border-color: var(--error-color);
        }

        .form-input {
          width: 100%;
          padding: 18px 22px;
          font-size: 1.2rem;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background-color: rgba(255, 255, 255, 0.95);
          transition: var(--transition);
          font-family: 'SF Pro Display', sans-serif;
          color: var(--text-color);
        }

        .form-input::placeholder {
          color: var(--dark-gray);
          opacity: 0.7;
          font-weight: 400;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(255, 123, 0, 0.2);
        }

        .form-group.focused .form-input {
          border-color: var(--primary-color);
        }

        .error-message {
          color: var(--error-color);
          font-size: 1rem;
          margin-top: 10px;
          padding-left: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.3s ease;
        }

        .error-message i {
          font-size: 1rem;
        }

        .password-input-container {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--dark-gray);
          cursor: pointer;
          transition: var(--transition);
          padding: 6px;
          font-size: 1.1rem;
        }

        .toggle-password:hover {
          color: var(--primary-color);
        }

        .form-actions {
          margin-top: 25px;
        }

        .login-button {
          width: 100%;
          padding: 20px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          font-family: 'SF Pro Display', sans-serif;
        }

        .login-button:hover:not(:disabled) {
          background-color: var(--secondary-color);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 26, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background-color: var(--dark-gray);
        }

        .login-button.submitting {
          pointer-events: none;
        }

        .spinner {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .login-footer {
          text-align: center;
          margin-top: 35px;
          font-size: 1.1rem;
        }

        .signup-text {
          color: var(--dark-gray);
          margin-bottom: 18px;
        }

        .signup-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
        }

        .signup-link:hover {
          color: var(--secondary-color);
          text-decoration: underline;
        }

        .forgot-password {
          color: var(--dark-gray);
          text-decoration: none;
          transition: var(--transition);
          font-weight: 500;
        }

        .forgot-password:hover {
          color: var(--primary-color);
          text-decoration: underline;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          20%, 60% {
            transform: translateX(-5px);
          }
          40%, 80% {
            transform: translateX(5px);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-card {
            padding: 50px 40px;
          }

          .app-title {
            font-size: 2.8rem;
          }

          .login-title {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 40px 30px;
            border-radius: 24px;
          }

          .app-title {
            font-size: 2.4rem;
          }

          .login-title {
            font-size: 2rem;
          }

          .login-subtitle {
            font-size: 1.1rem;
          }

          .form-input {
            padding: 16px 20px;
            font-size: 1.1rem;
          }

          .login-button {
            padding: 18px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}