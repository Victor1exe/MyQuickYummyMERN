import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: ""
  });
  
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupMessage, setSignupMessage] = useState({ text: "", type: "" }); // 'error' or 'success'
  const navigate = useNavigate();

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z ]{2,30}$/;
  const passwordRegex = {
    weak: /^.{1,7}$/,
    good: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
    strong: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/
  };

  useEffect(() => {
    // Validate name in real-time
    if (credentials.name && !nameRegex.test(credentials.name)) {
      setErrors(prev => ({ ...prev, name: "Name should be 2-30 letters only" }));
    } else {
      setErrors(prev => ({ ...prev, name: "" }));
    }

    // Validate email in real-time
    if (credentials.email && !emailRegex.test(credentials.email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email format" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }

    // Clear signup message when user types
    if (signupMessage.text && (credentials.email || credentials.password)) {
      setSignupMessage({ text: "", type: "" });
    }
  }, [credentials.name, credentials.email, credentials.password]);

  const getPasswordStrength = () => {
    if (!credentials.password) return "";
    if (passwordRegex.strong.test(credentials.password)) return "strong";
    if (passwordRegex.good.test(credentials.password)) return "good";
    return "weak";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignupMessage({ text: "", type: "" });
    
    // Final validation before submit
    let valid = true;
    const newErrors = { name: "", email: "", password: "", geolocation: "" };

    if (!credentials.name) {
      newErrors.name = "Name is required";
      valid = false;
    } else if (!nameRegex.test(credentials.name)) {
      newErrors.name = "Name should be 2-30 letters only";
      valid = false;
    }

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
    } else if (credentials.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!credentials.geolocation) {
      newErrors.geolocation = "Address is required";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/createuser", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: credentials.name,
          email: credentials.email, 
          password: credentials.password,
          location: credentials.geolocation
        })
      });
      
      const json = await response.json();
      
      if (!json.success) {
        setSignupMessage({ text: json.error || "Signup failed. Please try again.", type: "error" });
        return;
      }
      
      // Show success message
      setSignupMessage({ 
        text: "Account created successfully! Redirecting to login...", 
        type: "success" 
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login", {
          state: { 
            fromSignup: true,
            email: credentials.email 
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error("Signup error:", error);
      setSignupMessage({ text: "An error occurred during signup", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
                required
              />
              {errors.name && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.name}
                </div>
              )}
              <div className="field-hint">2-30 letters only, no numbers or special characters</div>
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
                required
              />
              {errors.email && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.email}
                </div>
              )}
              <div className="field-hint">We'll never share your email with anyone else</div>
            </div>
            
            <div className="form-field">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  value={credentials.password} 
                  onChange={onChange}
                  className="form-input"
                  placeholder="Create a password"
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
                        {getPasswordStrength() === "strong" ? " Strong" : 
                         getPasswordStrength() === "good" ? " Good" : " Weak"}
                      </span>
                    </>
                  ) : "Enter a password to check strength"}
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
                required
              />
              {errors.geolocation && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.geolocation}
                </div>
              )}
              <div className="field-hint">We'll use this to deliver your orders</div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className={`signup-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting || Object.values(errors).some(error => error)}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
            
            <div className="signup-footer">
              <p className="login-text">Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
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
          --warning-color: #ffcc00;
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
      `}</style>

      <style jsx>{`
        .signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .signup-background {
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

        .signup-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 650px;
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

        .signup-card {
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

        .signup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .signup-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 12px;
          color: var(--text-color);
          letter-spacing: -0.5px;
        }

        .signup-subtitle {
          font-size: 1.2rem;
          color: var(--dark-gray);
          margin: 0;
          font-weight: 400;
        }

        .signup-message {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          animation: fadeIn 0.3s ease-out;
        }

        .signup-message.error {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--error-color);
        }

        .signup-message.success {
          background-color: rgba(52, 199, 89, 0.1);
          color: var(--success-color);
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 4px;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          font-size: 1.1rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
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

        .error-message {
          color: var(--error-color);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.3s ease;
        }

        .error-message i {
          font-size: 0.95rem;
        }

        .field-hint {
          font-size: 0.9rem;
          color: var(--dark-gray);
          margin-top: 4px;
        }

        .password-input-container {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--dark-gray);
          cursor: pointer;
          transition: var(--transition);
          padding: 5px;
          font-size: 1rem;
        }

        .toggle-password:hover {
          color: var(--primary-color);
        }

        .password-strength-container {
          margin-top: 12px;
        }

        .password-strength-bars {
          display: flex;
          gap: 5px;
          margin-bottom: 6px;
        }

        .strength-bar {
          height: 4px;
          flex: 1;
          background: var(--light-gray);
          border-radius: 2px;
          transition: var(--transition);
        }

        .strength-bar.active {
          background: var(--warning-color);
        }

        .strength-bar.active.weak {
          background: var(--error-color);
        }

        .strength-bar.active.good {
          background: var(--warning-color);
        }

        .strength-bar.active.strong {
          background: var(--success-color);
        }

        .password-strength-text {
          font-size: 0.9rem;
          color: var(--dark-gray);
        }

        .strength {
          font-weight: 600;
          margin-left: 5px;
        }

        .strength.weak {
          color: var(--error-color);
        }

        .strength.good {
          color: var(--warning-color);
        }

        .strength.strong {
          color: var(--success-color);
        }

        .password-tips {
          margin-top: 12px;
        }

        .password-tips p {
          font-size: 0.9rem;
          color: var(--dark-gray);
          margin-bottom: 6px;
        }

        .password-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .password-tips li {
          font-size: 0.85rem;
          color: var(--dark-gray);
          position: relative;
          padding-left: 18px;
        }

        .password-tips li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--error-color);
        }

        .password-tips li.valid:before {
          content: "✓";
          color: var(--success-color);
        }

        .form-actions {
          margin-top: 20px;
        }

        .signup-button {
          width: 100%;
          padding: 18px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          font-family: 'SF Pro Display', sans-serif;
        }

        .signup-button:hover:not(:disabled) {
          background-color: var(--secondary-color);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 26, 0.3);
        }

        .signup-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .signup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background-color: var(--dark-gray);
        }

        .signup-button.submitting {
          pointer-events: none;
        }

        .spinner {
          display: inline-block;
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .signup-footer {
          text-align: center;
          margin-top: 30px;
          font-size: 1rem;
        }

        .login-text {
          color: var(--dark-gray);
        }

        .login-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
        }

        .login-link:hover {
          color: var(--secondary-color);
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
          .signup-card {
            padding: 50px 40px;
          }

          .app-title {
            font-size: 2.8rem;
          }

          .signup-title {
            font-size: 2.2rem;
          }

          .password-tips ul {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 40px 30px;
            border-radius: 24px;
          }

          .app-title {
            font-size: 2.4rem;
          }

          .signup-title {
            font-size: 2rem;
          }

          .signup-subtitle {
            font-size: 1.1rem;
          }

          .form-input {
            padding: 14px 16px;
            font-size: 1rem;
          }

          .signup-button {
            padding: 16px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}