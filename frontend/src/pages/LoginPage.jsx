import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
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

        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          background-color: #ffffff;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        /* Desktop Split Layout (50% left, 50% right) */
        .brand-section {
          width: 50%;
          height: 100vh;
          background-color: #B77D56;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          flex-shrink: 0;
        }

        .logo-box {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.35);
          background-color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Desktop Organic Wave Boundary */
        .desktop-divider {
          position: absolute;
          top: 0;
          right: -1px;
          height: 100%;
          width: 140px;
          pointer-events: none;
          z-index: 1;
        }

        .mobile-wave {
          display: none;
        }

        .form-section {
          width: 50%;
          height: 100vh;
          background-color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 4rem;
          z-index: 2;
        }

        .form-content {
          width: 100%;
          max-width: 420px;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .welcome-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2.5rem;
          line-height: 1.4;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .underline-group {
          display: flex;
          flex-direction: column;
        }

        .underline-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
          font-weight: 400;
        }

        .underline-input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #111827;
          padding: 0.5rem 0;
          font-size: 1.05rem;
          color: #111827;
          background: transparent;
          outline: none;
          font-weight: 500;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .underline-input:focus {
          border-bottom-color: #B77D56;
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .eye-btn {
          position: absolute;
          right: 0;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-btn {
          width: 100%;
          height: 52px;
          background-color: #350505;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          box-shadow: 0 8px 20px rgba(53, 5, 5, 0.35);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(53, 5, 5, 0.45);
        }

        .error-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        /* Mobile Viewport Adaptations (< 768px) */
        @media (max-width: 767px) {
          .login-container {
            flex-direction: column;
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            overflow-x: hidden;
            background-color: #ffffff;
            background: #ffffff;
          }

          .brand-section {
            width: 100%;
            height: 44vh;
            min-height: 290px;
            max-height: 380px;
            background-color: #B77D56;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            flex-shrink: 0;
          }

          .logo-box {
            width: 105px;
            height: 105px;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            border: 2px solid rgba(255, 255, 255, 0.2);
            background-color: #000000;
            margin-top: -20px;
            z-index: 2;
          }

          .desktop-divider {
            display: none;
          }

          .mobile-wave {
            display: block;
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 95px;
            pointer-events: none;
            z-index: 1;
          }

          .form-section {
            width: 100%;
            height: auto;
            flex: 1;
            padding: 1.25rem 1.75rem calc(2.5rem + env(safe-area-inset-bottom, 0px)) 1.75rem;
            align-items: flex-start;
            background-color: #ffffff;
            background: #ffffff;
            z-index: 2;
          }

          .form-content {
            max-width: 100%;
          }

          .welcome-title {
            font-size: clamp(1.85rem, 7.5vw, 2.05rem);
            font-weight: 500;
            color: #1a1715;
            margin-bottom: 0.35rem;
            letter-spacing: -0.01em;
          }

          .welcome-subtitle {
            font-size: 0.95rem;
            color: #78716c;
            margin-bottom: 2rem;
            line-height: 1.35;
            font-weight: 400;
          }

          .login-form {
            gap: 1.5rem;
          }

          .underline-group {
            margin-bottom: 0.25rem;
          }

          .underline-label {
            font-size: 0.95rem;
            color: #78716c;
            margin-bottom: 0.2rem;
            font-weight: 400;
          }

          .underline-input {
            border-bottom: 1px solid #71717a;
            padding: 0.4rem 0;
            font-size: 1rem;
            color: #1c1917;
          }

          .eye-btn {
            color: #71717a;
            padding: 0.2rem;
          }

          .login-btn {
            height: 46px;
            background-color: #350505;
            border-radius: 9999px;
            font-size: 1rem;
            font-weight: 700;
            margin-top: 1.25rem;
            box-shadow: 0 8px 18px rgba(53, 5, 5, 0.25);
          }
        }
      `}</style>

      <div className="login-container">
        {/* Upper Section (Brown #B77D56) */}
        <div className="brand-section">
          <div className="logo-box">
            <img src="/logo.png" alt="T Clock Logo" className="logo-img" />
          </div>

          {/* Desktop Organic Boundary Wave (Right edge of left panel) */}
          <svg className="desktop-divider" viewBox="0 0 140 800" preserveAspectRatio="none">
            <path d="M 0 0 C 110 250, 10 550, 140 800 L 140 0 Z" fill="#ffffff" />
          </svg>

          {/* Mobile Organic Wave Transition (Bottom of brown section) */}
          <svg className="mobile-wave" viewBox="0 0 500 150" preserveAspectRatio="none">
            <path
              d="M 0 45 C 60 95, 120 115, 170 115 C 230 115, 280 50, 330 50 C 390 50, 440 115, 500 125 L 500 150 L 0 150 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Lower Section (White #ffffff Form) */}
        <div className="form-section">
          <div className="form-content">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Your floor. Your control. Sign in to T Clock.</p>

            {error && (
              <div className="error-badge">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* User Name Input */}
              <div className="underline-group">
                <label className="underline-label">User Name</label>
                <input
                  type="text"
                  className="underline-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password Input with Eye Icon */}
              <div className="underline-group">
                <label className="underline-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="underline-input"
                    style={{ paddingRight: '2.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

