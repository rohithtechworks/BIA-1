import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onBack?: () => void;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onBack, showBack = true }) => {
  const { user, openLoginModal, openSignupModal, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className="navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        width: '100%',
        flexWrap: 'nowrap',
        gap: '8px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Left Section: Back Button (if showBack) */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {showBack && (
          <button
            type="button"
            className="back"
            style={{ margin: 0, flexShrink: 0 }}
            onClick={handleBack}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Center Section: Centered Logo & Brilliant IAS Academy Brand */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden',
          padding: '0 4px'
        }}
      >
        {showBack && (
          <>
            <img
              src="/images/logo.webp"
              alt="Brilliant IAS Academy Logo"
              style={{
                width: '30px',
                height: '30px',
                objectFit: 'contain',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: 'clamp(9px, 1.4vw, 13px)',
                color: '#103665',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}
            >
              BRILLIANT IAS ACADEMY
            </span>
          </>
        )}
      </div>

      {/* Right Section: Auth Action Buttons */}
      <div
        className="nav-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}
      >
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="nav-btn nav-btn-admin"
                style={{
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  lineHeight: 1.2
                }}
              >
                Admin Portal
              </Link>
            )}
            <button
              type="button"
              className="nav-btn nav-btn-logout"
              style={{
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '8px',
                lineHeight: 1.2
              }}
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#103665',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onClick={openLoginModal}
            >
              Login
            </button>
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#d6a64b',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onClick={openSignupModal}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
