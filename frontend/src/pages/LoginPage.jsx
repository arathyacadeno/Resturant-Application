import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    if (isCreateAccount) {
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('Account created successfully! Please login.');
        setIsCreateAccount(false);
      }, 600);
      return;
    }

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (createAccState) => {
    setError('');
    setSuccessMsg('');
    setIsCreateAccount(createAccState);
  };

  return (
    <>
      <style>{`
        /* Hide browser default password reveal & autofill icons */
        input::-ms-reveal,
        input::-ms-clear,
        input::-webkit-contacts-auto-fill-button,
        input::-webkit-credentials-auto-fill-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Root Page Wrapper */
        .auth-page-wrapper {
          min-height: 100vh;
          width: 100vw;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* Common Underline Field */
        .underline-input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #A39386;
          padding: 0.5rem 0;
          font-size: 0.95rem;
          color: #1C1917;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-weight: 400;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .underline-input::placeholder {
          color: #9C8E84;
          font-size: 0.925rem;
        }

        .underline-input:focus {
          border-bottom-color: #B77D56;
        }

        .password-relative-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .eye-toggle-button {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #78716C;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .eye-toggle-button:hover {
          color: #1C1917;
        }

        .alert-badge-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.55rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          box-sizing: border-box;
        }

        .alert-badge-error {
          background-color: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #DC2626;
        }

        .alert-badge-success {
          background-color: #ECFDF5;
          border: 1px solid #D1FAE5;
          color: #059669;
        }

        /* ------------------------------------------------------------- */
        /* 📱 MOBILE LAYOUT (< 768px)                                    */
        /* ------------------------------------------------------------- */
        @media (max-width: 767px) {
          .desktop-only-container {
            display: none !important;
          }

          .mobile-only-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            background-color: #FFFFFF;
            position: relative;
          }

          /* Brown Top Hero Section (Top ~42% of Screen) */
          .mobile-brown-hero {
            width: 100%;
            height: 42vh;
            min-height: 270px;
            max-height: 360px;
            background-color: #B77D56;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* Centered Circular Logo inside Hero */
          .mobile-logo-circle {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            overflow: hidden;
            background-color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            border: 2px solid rgba(255, 255, 255, 0.3);
            z-index: 2;
            margin-top: -15px;
          }

          .mobile-logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Smooth Organic Wave Transition SVG at Bottom of Hero */
          .mobile-smooth-wave {
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 90px;
            pointer-events: none;
            z-index: 1;
          }

          /* White Form Container */
          .mobile-form-section {
            width: 100%;
            flex: 1;
            padding: 1.5rem 1.5rem calc(2.5rem + env(safe-area-inset-bottom, 0px)) 1.5rem;
            background-color: #FFFFFF;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            z-index: 2;
          }

          .mobile-title {
            font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
            font-size: 2.1rem;
            font-weight: 500;
            color: #1A1715;
            margin: 0 0 0.35rem 0;
            letter-spacing: -0.01em;
          }

          .mobile-subtitle {
            font-size: 0.925rem;
            color: #78716C;
            margin: 0 0 1.75rem 0;
            line-height: 1.35;
            font-weight: 400;
          }

          .mobile-form {
            display: flex;
            flex-direction: column;
            gap: 1.35rem;
            width: 100%;
          }

          .mobile-field-group {
            display: flex;
            flex-direction: column;
          }

          .mobile-login-btn {
            width: 100%;
            height: 46px;
            background-color: #350505;
            color: #FFFFFF;
            border: none;
            border-radius: 9999px;
            font-size: 1.025rem;
            font-weight: 700;
            cursor: pointer;
            margin-top: 1.5rem;
            box-shadow: 0 8px 20px rgba(53, 5, 5, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .mobile-login-btn:active {
            transform: scale(0.99);
          }

          .mobile-footer-nav {
            font-size: 0.875rem;
            color: #78716C;
            text-align: center;
            margin-top: 1.5rem;
          }

          .mobile-footer-link {
            color: #B77D56;
            font-weight: 700;
            background: none;
            border: none;
            cursor: pointer;
            margin-left: 0.35rem;
            font-size: inherit;
            font-family: inherit;
          }
        }

        /* ------------------------------------------------------------- */
        /* 🖥️ DESKTOP LAYOUT (≥ 768px)                                   */
        /* ------------------------------------------------------------- */
        @media (min-width: 768px) {
          .mobile-only-container {
            display: none !important;
          }

          .desktop-only-container {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            position: relative;
            background-color: #B77D56; 
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .desktop-bg-curve-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .desktop-login-card {
            position: relative;
            z-index: 10;
            width: 450px;
            min-height: 678px;
            background-color: #FFFFFF;
            border-radius: 20px;
            padding: 2.25rem 2rem 2rem 2rem;
            box-shadow: 0 10px 32px rgba(45, 25, 10, 0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .desktop-card-top {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .desktop-logo-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            background-color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
            margin-bottom: 1.15rem;
            border: 2px solid rgba(255, 255, 255, 0.8);
            flex-shrink: 0;
          }

          .desktop-logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .desktop-title {
            font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
            font-size: 1.45rem;
            font-weight: 700;
            color: #2A1A10;
            margin: 0 0 0.25rem 0;
            text-align: center;
          }

          .desktop-subtitle {
            font-size: 0.825rem;
            color: #8C7D73;
            margin: 0 0 1.5rem 0;
            text-align: center;
          }

          .desktop-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .desktop-field-group {
            display: flex;
            flex-direction: column;
          }

          .desktop-field-label {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: #6B5C52;
            text-transform: uppercase;
            margin-bottom: 0.2rem;
          }

          .desktop-forgot-row {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: -0.35rem;
            margin-bottom: 0.25rem;
          }

          .desktop-forgot-btn {
            font-size: 0.78rem;
            color: #B77D56;
            font-weight: 500;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
          }

          .desktop-login-btn {
            width: 100%;
            height: 46px;
            background-color: #350505;
            color: #FFFFFF;
            border: none;
            border-radius: 9999px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            margin-top: 0.5rem;
          }

          .desktop-footer-text {
            font-size: 0.8rem;
            color: #7A6C62;
            text-align: center;
            margin-top: 1.25rem;
          }

          .desktop-footer-action {
            color: #B77D56;
            font-weight: 700;
            cursor: pointer;
            margin-left: 0.25rem;
            background: none;
            border: none;
            font-size: inherit;
            font-family: inherit;
          }
        }
      `}</style>

      <div className="auth-page-wrapper">
        <div className="mobile-only-container">
          <div className="mobile-brown-hero">
            <div className="mobile-logo-circle">
              <img src="/logo.png" alt="Restaurant Logo" className="mobile-logo-img" />
            </div>

            <svg
              className="mobile-smooth-wave"
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 35 C 130 90, 230 20, 340 55 C 420 80, 470 105, 500 120 L 500 150 L 0 150 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          <div className="mobile-form-section">
            <h1 className="mobile-title">
              {isCreateAccount ? 'Create Account' : 'Welcome back'}
            </h1>
            <p className="mobile-subtitle">
              {isCreateAccount
                ? 'A Taste of Tradition'
                : ''}
            </p>

            {error && (
              <div className="alert-badge-box alert-badge-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="alert-badge-box alert-badge-success">
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mobile-form">
              <div className="mobile-field-group">
                <input
                  type="text"
                  className="underline-input"
                  placeholder={isCreateAccount ? "Create Username" : "User Name"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {isCreateAccount && (
                <div className="mobile-field-group">
                  <input
                    type="email"
                    className="underline-input"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mobile-field-group">
                <div className="password-relative-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="underline-input"
                    placeholder={isCreateAccount ? "Create Password" : "Password"}
                    style={{ paddingRight: '2.25rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="mobile-login-btn" disabled={loading}>
                {loading
                  ? isCreateAccount
                    ? 'Creating Account...'
                    : 'Logging in...'
                  : isCreateAccount
                  ? 'Create Account'
                  : 'Login'}
              </button>
            </form>

            <div className="mobile-footer-nav">
              {isCreateAccount ? (
                <>
                  Already have an account?
                  <button type="button" className="mobile-footer-link" onClick={() => toggleMode(false)}>Login</button>
                </>
              ) : (
                <>
                  Don't have an account?
                  <button type="button" className="mobile-footer-link" onClick={() => toggleMode(true)}>Create Account</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="desktop-only-container">
          <svg className="desktop-bg-curve-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 450 C 420 280, 920 640, 1440 380 L 1440 900 L 0 900 Z" fill="#FCE4D0" />
          </svg>

          <div className="desktop-login-card">
            <div className="desktop-card-top">
              <div className="desktop-logo-circle">
                <img src="/logo.png" alt="Restaurant Logo" className="desktop-logo-img" />
              </div>

              <h1 className="desktop-title">
                {isCreateAccount ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="desktop-subtitle">
                {isCreateAccount ? 'A Taste of Tradition' : ''}
              </p>

              {error && (
                <div className="alert-badge-box alert-badge-error">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="alert-badge-box alert-badge-success">
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="desktop-form">
                <div className="desktop-field-group">
                  <input
                    type="text"
                    className="underline-input"
                    placeholder={isCreateAccount ? "Create Username" : "Enter your Username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {isCreateAccount && (
                  <div className="desktop-field-group">
                    <input
                      type="email"
                      className="underline-input"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="desktop-field-group">
                  <label className="desktop-field-label">PASSWORD</label>
                  <div className="password-relative-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="underline-input"
                      placeholder={isCreateAccount ? "Create Password" : "Enter Password"}
                      style={{ paddingRight: '2rem' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isCreateAccount && (
                  <div className="desktop-forgot-row">
                    <button type="button" className="desktop-forgot-btn" onClick={() => alert('Reset requested.')}>
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button type="submit" className="desktop-login-btn" disabled={loading}>
                  {loading ? (isCreateAccount ? 'Creating...' : 'Logging in...') : (isCreateAccount ? 'Create Account' : 'Login')}
                </button>
              </form>
            </div>

            <div className="desktop-footer-text">
              {isCreateAccount ? (
                <>Already have an account? <button type="button" className="desktop-footer-action" onClick={() => toggleMode(false)}>Login</button></>
              ) : (
                <>New here? <button type="button" className="desktop-footer-action" onClick={() => toggleMode(true)}>create your account</button></>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
